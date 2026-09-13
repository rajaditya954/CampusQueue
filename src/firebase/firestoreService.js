/**
 * Firestore Service Layer
 * 
 * Centralized Firestore write operations for the Campus Queue System.
 * Reuses the existing db instance from firebase/config.js and
 * collection names from firebase/collections.js.
 * 
 * All read operations remain in the hooks (useQueue, useServices, useCounters)
 * via onSnapshot listeners. This module provides the write counterparts.
 */

import {
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  collection,
  serverTimestamp,
  Timestamp,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { db, auth, isDemoMode } from './config';
import { COLLECTIONS } from './collections';
import { QUEUE_STATUS, COUNTER_STATUS } from '../utils/constants';
import { updateRollingAverage, calculateActualProcessingTime } from '../features/queue/historicalCalc';
import { getCounterPrefix } from '../utils/seedData';

// ─── Token Generation ───────────────────────────────────────────────

/**
 * Get and increment the next token number for a counter atomically.
 * Uses a `config/tokenCounters` document to track per-counter token sequences.
 */
async function getNextTokenNumber(counterId) {
  const tokenDocRef = doc(db, 'config', 'tokenCounters');

  try {
    const nextNum = await runTransaction(db, async (transaction) => {
      const tokenDoc = await transaction.get(tokenDocRef);
      const counters = tokenDoc.exists() ? tokenDoc.data() : {};
      const currentNum = counters[counterId] || 0;
      const newNum = currentNum + 1;

      transaction.set(tokenDocRef, { ...counters, [counterId]: newNum }, { merge: true });
      return newNum;
    });

    const prefix = getCounterPrefix(counterId);
    return `${prefix}-${nextNum}`;
  } catch (error) {
    // Fallback: timestamp-based token if transaction fails
    console.warn('Token counter transaction failed, using fallback:', error);
    const prefix = getCounterPrefix(counterId);
    const fallback = Date.now() % 10000;
    return `${prefix}-${fallback}`;
  }
}

// ─── Queue Operations ───────────────────────────────────────────────

/**
 * Join the queue — creates a new queueEntries document.
 * Students can create entries without authentication (per firestore.rules).
 */
/**
 * Join the queue — creates a new queueEntries document.
 */
export async function firestoreJoinQueue(studentId, studentName, serviceId, counterId, studentUid = null) {
  // ── Authentication Guard ──────────────────────────────────────────
  // Ensure the student is actually authenticated with Firebase before writing
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Please sign in again before joining the queue.');
  }

  // Always use the real Firebase Auth UID — never trust caller-provided UIDs
  const verifiedUid = currentUser.uid;

  // Check for duplicate active entry for this student across ALL services
  if (studentId || verifiedUid) {
    const qDuplicate = query(
      collection(db, COLLECTIONS.QUEUE_ENTRIES),
      where('status', 'in', [QUEUE_STATUS.WAITING, QUEUE_STATUS.CALLED, QUEUE_STATUS.IN_SERVICE])
    );
    try {
      const dupSnapshot = await getDocs(qDuplicate);
      const activeDoc = dupSnapshot.docs.find(docSnap => {
        const data = docSnap.data();
        return (studentId && data.studentId === studentId) || (verifiedUid && data.studentUid === verifiedUid);
      });

      if (activeDoc) {
        const data = activeDoc.data();
        throw new Error(`You already have an active queue token (${data.tokenNumber || 'active'}). You cannot generate another token until your current token is completed or cancelled.`);
      }
    } catch (dupErr) {
      if (dupErr.message?.includes('already have an active')) throw dupErr;
      console.warn('Duplicate check notice:', dupErr);
    }
  }

  // Check that the counter exists and is not CLOSED
  const counterDoc = await getDoc(doc(db, COLLECTIONS.COUNTERS, counterId));
  if (!counterDoc.exists()) {
    throw new Error('Selected counter not found in database.');
  }

  const counterData = counterDoc.data();
  if (counterData && counterData.status === COUNTER_STATUS.CLOSED) {
    throw new Error('Counter is closed');
  }

  const tokenNumber = await getNextTokenNumber(counterId);

  const entryData = {
    tokenNumber,
    studentId: studentId || 'N/A',
    studentName: studentName || 'Student',
    studentUid: verifiedUid,
    serviceId,
    counterId,
    status: QUEUE_STATUS.WAITING,
    joinedAt: serverTimestamp(),
    calledAt: null,
    serviceStartedAt: null,
    completedAt: null,
    estimatedWaitTime: null,
    actualProcessingTime: null,
    isDemo: false,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.QUEUE_ENTRIES), entryData);
  return { id: docRef.id, ...entryData, tokenNumber };
}

/**
 * Call the next waiting student at a specific counter.
 * Finds the oldest WAITING entry and updates its status to CALLED.
 */
export async function firestoreCallNext(counterId) {
  const isGlobal = !counterId || counterId === 'ALL';
  try {
    const queryConstraints = [
      where('status', '==', QUEUE_STATUS.WAITING),
      orderBy('joinedAt', 'asc'),
      limit(1)
    ];
    if (!isGlobal) {
      queryConstraints.unshift(where('counterId', '==', counterId));
    }
    const q = query(collection(db, COLLECTIONS.QUEUE_ENTRIES), ...queryConstraints);

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null; // No one waiting
    }

    const nextEntry = snapshot.docs[0];
    await updateDoc(nextEntry.ref, {
      status: QUEUE_STATUS.CALLED,
      calledAt: serverTimestamp(),
    });

    return { id: nextEntry.id, ...nextEntry.data(), status: QUEUE_STATUS.CALLED };
  } catch (err) {
    if (err.code === 'failed-precondition' || err.message?.includes('index')) {
      console.warn('Composite index notice for firestoreCallNext. Using in-memory sorting fallback:', err.message);
      let qFallback;
      if (!isGlobal) {
        qFallback = query(
          collection(db, COLLECTIONS.QUEUE_ENTRIES),
          where('counterId', '==', counterId)
        );
      } else {
        qFallback = query(collection(db, COLLECTIONS.QUEUE_ENTRIES));
      }
      const snapshot = await getDocs(qFallback);
      const waitingDocs = snapshot.docs
        .map(d => ({ ref: d.ref, id: d.id, ...d.data() }))
        .filter(d => d.status === QUEUE_STATUS.WAITING)
        .sort((a, b) => {
          const getMs = (val) => {
            if (!val) return 0;
            if (typeof val.toMillis === 'function') return val.toMillis();
            if (val.seconds) return val.seconds * 1000;
            return new Date(val).getTime() || 0;
          };
          return getMs(a.joinedAt) - getMs(b.joinedAt);
        });

      if (waitingDocs.length === 0) return null;

      const { ref, ...data } = waitingDocs[0];
      await updateDoc(ref, {
        status: QUEUE_STATUS.CALLED,
        calledAt: serverTimestamp(),
      });

      return { ...data, status: QUEUE_STATUS.CALLED };
    }
    throw err;
  }
}

/**
 * Start service for a called entry.
 */
export async function firestoreStartService(entryId) {
  const entryRef = doc(db, COLLECTIONS.QUEUE_ENTRIES, entryId);
  await updateDoc(entryRef, {
    status: QUEUE_STATUS.IN_SERVICE,
    serviceStartedAt: serverTimestamp(),
  });
}

/**
 * Complete service for an entry.
 * Also updates the service's rolling average processing time.
 */
export async function firestoreCompleteService(entryId) {
  const entryRef = doc(db, COLLECTIONS.QUEUE_ENTRIES, entryId);
  const entrySnap = await getDoc(entryRef);

  if (!entrySnap.exists()) {
    throw new Error('Queue entry not found');
  }

  const entryData = entrySnap.data();
  const completedAt = new Date();

  // Calculate actual processing time
  let actualProcessingTime = null;
  if (entryData.serviceStartedAt) {
    const startTime = entryData.serviceStartedAt.toDate
      ? entryData.serviceStartedAt.toDate()
      : new Date(entryData.serviceStartedAt);
    actualProcessingTime = calculateActualProcessingTime(startTime, completedAt);
  }

  // Update queue entry
  await updateDoc(entryRef, {
    status: QUEUE_STATUS.COMPLETED,
    completedAt: Timestamp.fromDate(completedAt),
    actualProcessingTime,
  });

  // Update service rolling average if we have actual timing data
  if (actualProcessingTime != null && entryData.serviceId) {
    try {
      const serviceRef = doc(db, COLLECTIONS.SERVICES, entryData.serviceId);
      const serviceSnap = await getDoc(serviceRef);

      if (serviceSnap.exists()) {
        const serviceData = serviceSnap.data();
        const currentAvg = serviceData.averageProcessingTime || 5;
        const completedCount = serviceData.completedCount || 0;
        const newAvg = updateRollingAverage(currentAvg, actualProcessingTime, completedCount);

        await updateDoc(serviceRef, {
          averageProcessingTime: Math.round(newAvg * 10) / 10,
          completedCount: completedCount + 1,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('Failed to update service rolling average:', err);
    }
  }

  // Optionally write to serviceHistory for audit
  try {
    await addDoc(collection(db, COLLECTIONS.SERVICE_HISTORY), {
      queueEntryId: entryId,
      serviceId: entryData.serviceId,
      counterId: entryData.counterId,
      studentId: entryData.studentId,
      actualProcessingTime,
      completedAt: Timestamp.fromDate(completedAt),
    });
  } catch (err) {
    console.warn('Failed to write service history:', err);
  }
}

/**
 * Skip a queue entry.
 */
export async function firestoreSkipEntry(entryId) {
  const entryRef = doc(db, COLLECTIONS.QUEUE_ENTRIES, entryId);
  await updateDoc(entryRef, {
    status: QUEUE_STATUS.SKIPPED,
  });
}

/**
 * Cancel a queue entry (student-initiated).
 */
export async function firestoreCancelEntry(entryId) {
  const entryRef = doc(db, COLLECTIONS.QUEUE_ENTRIES, entryId);
  await updateDoc(entryRef, {
    status: QUEUE_STATUS.CANCELLED,
  });
}

/**
 * Mark a queue entry as no-show.
 */
export async function firestoreMarkNoShow(entryId) {
  const entryRef = doc(db, COLLECTIONS.QUEUE_ENTRIES, entryId);
  await updateDoc(entryRef, {
    status: QUEUE_STATUS.NO_SHOW,
  });
}

// ─── Service Operations ─────────────────────────────────────────────

/**
 * Add a new service.
 */
export async function firestoreAddService(serviceData) {
  const data = {
    ...serviceData,
    completedCount: serviceData.completedCount || 0,
    isActive: serviceData.isActive !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // If a custom id is provided, use setDoc; otherwise addDoc
  if (serviceData.id) {
    const { id, ...rest } = data;
    const docRef = doc(db, COLLECTIONS.SERVICES, id);
    const { setDoc } = await import('firebase/firestore');
    await setDoc(docRef, rest);
    return { id, ...rest };
  }

  const docRef = await addDoc(collection(db, COLLECTIONS.SERVICES), data);
  return { id: docRef.id, ...data };
}

/**
 * Update an existing service.
 */
export async function firestoreUpdateService(serviceId, updates) {
  const serviceRef = doc(db, COLLECTIONS.SERVICES, serviceId);
  await updateDoc(serviceRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a service.
 */
export async function firestoreDeleteService(serviceId) {
  const serviceRef = doc(db, COLLECTIONS.SERVICES, serviceId);
  await deleteDoc(serviceRef);
}

// ─── Counter Operations ─────────────────────────────────────────────

/**
 * Add a new counter.
 */
export async function firestoreAddCounter(counterData) {
  const data = {
    ...counterData,
    currentToken: null,
    isActive: counterData.isActive !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (counterData.id) {
    const { id, ...rest } = data;
    const docRef = doc(db, COLLECTIONS.COUNTERS, id);
    const { setDoc } = await import('firebase/firestore');
    await setDoc(docRef, rest);
    return { id, ...rest };
  }

  const docRef = await addDoc(collection(db, COLLECTIONS.COUNTERS), data);
  return { id: docRef.id, ...data };
}

/**
 * Update an existing counter.
 */
export async function firestoreUpdateCounter(counterId, updates) {
  const counterRef = doc(db, COLLECTIONS.COUNTERS, counterId);
  await updateDoc(counterRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Set counter operational status (OPEN / PAUSED / CLOSED).
 */
export async function firestoreSetCounterStatus(counterId, status) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Unauthenticated: You must be logged in as staff/admin to change counter status.');
  }

  const counterRef = doc(db, COLLECTIONS.COUNTERS, counterId);
  try {
    await updateDoc(counterRef, {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: currentUser.uid,
    });
  } catch (err) {
    console.error('firestoreSetCounterStatus error:', err);
    if (err.code === 'permission-denied' || err.message?.includes('permissions')) {
      throw new Error("You don't have permission to change this counter.");
    }
    throw err;
  }
}


// ─── Student Operations ─────────────────────────────────────────────

/**
 * Add a new student record to Firestore.
 */
export async function firestoreAddStudent(studentData) {
  const formattedId = (studentData.studentId || '').trim().toUpperCase();
  if (!formattedId) throw new Error('Student ID is required.');
  if (!studentData.name?.trim()) throw new Error('Student name is required.');

  const studentRef = doc(db, COLLECTIONS.STUDENTS, formattedId);
  const existingSnap = await getDoc(studentRef);

  if (existingSnap.exists()) {
    throw new Error(`Student ID '${formattedId}' already exists in database.`);
  }

  const payload = {
    studentId: formattedId,
    name: studentData.name.trim(),
    role: 'student',
    active: studentData.active !== false,
    isDemo: studentData.isDemo || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(studentRef, payload);
  return { id: formattedId, ...payload };
}

/**
 * Update an existing student record.
 */
export async function firestoreUpdateStudent(studentId, updates) {
  const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
  await updateDoc(studentRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Toggle active/inactive status of a student.
 */
export async function firestoreSetStudentActiveStatus(studentId, active) {
  const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
  await updateDoc(studentRef, {
    active,
    updatedAt: serverTimestamp(),
  });
}

// ─── Queue Configuration Settings ───────────────────────────────────

/**
 * Save global queue configuration settings to Firestore (config/settings).
 */
export async function firestoreSaveQueueSettings(settings) {
  const configRef = doc(db, 'config', 'settings');
  await setDoc(configRef, {
    ...settings,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Fetch global queue configuration settings from Firestore.
 */
export async function firestoreGetQueueSettings() {
  const configRef = doc(db, 'config', 'settings');
  const snap = await getDoc(configRef);
  if (snap.exists()) {
    return snap.data();
  }
  return {
    queueEnabled: true,
    maxQueueSize: 100,
    allowSkip: true,
    allowRejoin: true,
    skipRejoinPolicy: 'MOVE_TO_END',
    defaultConfidence: 'BASELINE',
  };
}

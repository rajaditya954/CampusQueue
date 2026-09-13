/**
 * Firestore Seed Utility
 * 
 * Seeds Firestore with demo data from the existing SEED_SERVICES,
 * SEED_COUNTERS, and SEED_QUEUE_ENTRIES in seedData.js.
 * 
 * Safety: Checks if collections already have data before inserting.
 * Tags all seed data with `isDemo: true` for easy identification.
 */

import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db, auth, isDemoMode } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import { SEED_SERVICES, SEED_COUNTERS, SEED_QUEUE_ENTRIES, SEED_STUDENTS } from './seedData';

/**
 * Verify that the currently authenticated user is an administrator
 * with a valid document in `users/{uid}` having `role == 'admin'`.
 * Throws a descriptive admin error if unauthorized before attempting writes.
 */
export async function verifyAdminAuthorization() {
  if (isDemoMode) return true;

  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Please sign in as an administrator to initialize database.');
  }

  const userDocRef = doc(db, 'users', currentUser.uid);
  let userSnap = null;
  try {
    userSnap = await getDoc(userDocRef);
  } catch (err) {
    if (err.message?.includes('permission') || err.code === 'permission-denied') {
      throw new Error(`Your account (UID: ${currentUser.uid}) does not have permission to access users/${currentUser.uid}. Please check users/{your UID}.role in Cloud Firestore.`);
    }
    throw err;
  }

  if (!userSnap || !userSnap.exists()) {
    throw new Error(`Your account is authenticated (UID: ${currentUser.uid}) but does not have admin permissions. Check users/${currentUser.uid}.role.`);
  }

  const role = userSnap.data()?.role;
  if (role !== 'admin') {
    throw new Error(`Your account is authenticated (UID: ${currentUser.uid}) but does not have admin permissions (Current role: "${role || 'none'}"). Check users/${currentUser.uid}.role.`);
  }

  if (import.meta.env?.DEV) {
    console.log(`[Admin Authorization Verified] Auth UID: ${currentUser.uid} | Role: ${role}`);
  }

  return true;
}

/**
 * Convert a Date or date-like value to a Firestore Timestamp.
 */
function toTimestamp(val) {
  if (!val) return null;
  if (val instanceof Date) return Timestamp.fromDate(val);
  if (val.toDate) return val; // already a Timestamp
  return Timestamp.fromDate(new Date(val));
}

/**
 * Check if a collection already has documents.
 */
async function isCollectionEmpty(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.empty;
}

/**
 * Check if demo seed data already exists in a collection.
 */
async function hasDemoData(collectionName) {
  try {
    const q = query(
      collection(db, collectionName),
      where('isDemo', '==', true)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch {
    // If the query fails (e.g. index not ready), fall back to checking if empty
    return !(await isCollectionEmpty(collectionName));
  }
}

/**
 * Seed Firestore with demo services, counters, and queue entries.
 * 
 * Returns a summary of what was seeded.
 */
export async function seedFirestore() {
  await verifyAdminAuthorization();

  const results = {
    services: { seeded: 0, skipped: false },
    counters: { seeded: 0, skipped: false },
    queueEntries: { seeded: 0, skipped: false },
    tokenCounters: false,
    errors: [],
  };

  // ─── Seed Services ─────────────────────────────────────────────
  try {
    const servicesExist = await hasDemoData(COLLECTIONS.SERVICES);
    if (servicesExist) {
      results.services.skipped = true;
      console.log('⏭️ Services: Demo data already exists, skipping.');
    } else {
      const batch = writeBatch(db);
      for (const service of SEED_SERVICES) {
        const { id, createdAt, updatedAt, ...data } = service;
        batch.set(doc(db, COLLECTIONS.SERVICES, id), {
          ...data,
          isDemo: true,
          createdAt: toTimestamp(createdAt),
          updatedAt: toTimestamp(updatedAt),
        });
      }
      await batch.commit();
      results.services.seeded = SEED_SERVICES.length;
      console.log(`✅ Services: Seeded ${SEED_SERVICES.length} services.`);
    }
  } catch (err) {
    results.errors.push(`Services: ${err.message}`);
    console.error('❌ Error seeding services:', err);
  }

  // ─── Seed Counters ─────────────────────────────────────────────
  try {
    const countersExist = await hasDemoData(COLLECTIONS.COUNTERS);
    if (countersExist) {
      results.counters.skipped = true;
      console.log('⏭️ Counters: Demo data already exists, skipping.');
    } else {
      const batch = writeBatch(db);
      for (const counter of SEED_COUNTERS) {
        const { id, ...data } = counter;
        batch.set(doc(db, COLLECTIONS.COUNTERS, id), {
          ...data,
          isDemo: true,
        });
      }
      await batch.commit();
      results.counters.seeded = SEED_COUNTERS.length;
      console.log(`✅ Counters: Seeded ${SEED_COUNTERS.length} counters.`);
    }
  } catch (err) {
    results.errors.push(`Counters: ${err.message}`);
    console.error('❌ Error seeding counters:', err);
  }

  // ─── Seed Queue Entries ────────────────────────────────────────
  // Skipped: No fake queue entries are seeded so queue is strictly live/real-time
  results.queueEntries.skipped = true;

  // ─── Seed Students ─────────────────────────────────────────────
  try {
    const batch = writeBatch(db);
    let seededCount = 0;
    for (const student of SEED_STUDENTS) {
      const studentRef = doc(db, COLLECTIONS.STUDENTS, student.studentId);
      batch.set(studentRef, {
        studentId: student.studentId,
        name: student.name,
        role: 'student',
        active: student.active,
        isDemo: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }, { merge: true });
      seededCount++;
    }
    await batch.commit();
    results.students = { seeded: seededCount, skipped: false };
    console.log(`✅ Students: Seeded ${seededCount} demo students.`);
  } catch (err) {
    results.errors.push(`Students: ${err.message}`);
    console.error('❌ Error seeding students:', err);
  }

  // ─── Seed Token Counters ───────────────────────────────────────
  try {
    const tokenData = {
      'ctr-accounts': 0,
      'ctr-academic': 0,
      'ctr-student-services': 0,
    };
    await setDoc(doc(db, 'config', 'tokenCounters'), tokenData, { merge: true });
    results.tokenCounters = true;
    console.log('✅ Token counters initialized.');
  } catch (err) {
    results.errors.push(`Token Counters: ${err.message}`);
    console.error('❌ Error setting token counters:', err);
  }

  return results;
}

/**
 * Clear all demo data from Firestore.
 */
export async function clearDemoData() {
  return await clearAllQueueEntries();
}

/**
 * Clear all queue entries from Firestore and reset sequence counters.
 */
export async function clearAllQueueEntries() {
  let totalDeleted = 0;
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.QUEUE_ENTRIES));
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      totalDeleted = snapshot.size;
    }
  } catch (err) {
    console.error('Error deleting queue entries:', err);
  }

  try {
    const tokenData = {
      'ctr-accounts': 0,
      'ctr-academic': 0,
      'ctr-student-services': 0,
    };
    await setDoc(doc(db, 'config', 'tokenCounters'), tokenData, { merge: true });
  } catch (err) {
    console.warn('Error resetting token counters:', err);
  }

  console.log(`🗑️ Total queue documents removed: ${totalDeleted}`);
  return totalDeleted;
}

/**
 * Check if Firestore has any data at all (useful for showing seed button).
 */
export async function isFirestoreEmpty() {
  try {
    const servicesEmpty = await isCollectionEmpty(COLLECTIONS.SERVICES);
    const countersEmpty = await isCollectionEmpty(COLLECTIONS.COUNTERS);
    return servicesEmpty && countersEmpty;
  } catch {
    return true; // Assume empty if we can't read
  }
}

/**
 * Ensure Firestore has initial data seeded into the database.
 */
/**
 * Perform complete, idempotent database initialization for Cloud Firestore.
 * 
 * Creates exact services, demo students, queue configuration, and counter setup documents.
 * Safe to call multiple times without creating duplicate records.
 */
export async function initializeFirestoreDatabase(onProgress = () => {}) {
  // Step 1: Pre-verify Admin Authorization per requirements 1, 14, 16
  onProgress('Verifying admin authorization');
  await verifyAdminAuthorization();

  const summary = {
    servicesCreated: 0,
    servicesVerified: 0,
    studentsCreated: 0,
    studentsVerified: 0,
    configCreated: 0,
    countersCreated: 0,
    countersVerified: 0,
    alreadyInitialized: false,
  };

  const now = Timestamp.now();

  // 2. Initial Services Setup
  onProgress('Checking services');
  const initialServices = [
    {
      id: 'cash-payment',
      serviceId: 'cash-payment',
      name: 'Cash Payment',
      description: 'Fee and cash payment service',
      estimatedDuration: 2,
      averageProcessingTime: 2,
      minimumProcessingTime: 1,
      maximumProcessingTime: 5,
      requiredDocuments: ['Fee Challan', 'Student ID Card'],
      active: true,
      isActive: true,
      isDemo: false,
    },
    {
      id: 'document-verification',
      serviceId: 'document-verification',
      name: 'Document Verification',
      description: 'Verification of student documents',
      estimatedDuration: 8,
      averageProcessingTime: 8,
      minimumProcessingTime: 3,
      maximumProcessingTime: 15,
      requiredDocuments: ['Original Marksheets', 'ID Proof'],
      active: true,
      isActive: true,
      isDemo: false,
    },
    {
      id: 'certificate-request',
      serviceId: 'certificate-request',
      name: 'Certificate Request',
      description: 'Request and processing of certificates',
      estimatedDuration: 5,
      averageProcessingTime: 5,
      minimumProcessingTime: 2,
      maximumProcessingTime: 10,
      requiredDocuments: ['Application Form', 'Clearance Slip'],
      active: true,
      isActive: true,
      isDemo: false,
    },
    {
      id: 'admission-enquiry',
      serviceId: 'admission-enquiry',
      name: 'Admission Enquiry',
      description: 'General admission-related enquiry',
      estimatedDuration: 10,
      averageProcessingTime: 10,
      minimumProcessingTime: 5,
      maximumProcessingTime: 20,
      requiredDocuments: ['Enquiry Form'],
      active: true,
      isActive: true,
      isDemo: false,
    },
    {
      id: 'id-card-service',
      serviceId: 'id-card-service',
      name: 'ID Card Service',
      description: 'Student ID card related service',
      estimatedDuration: 6,
      averageProcessingTime: 6,
      minimumProcessingTime: 2,
      maximumProcessingTime: 10,
      requiredDocuments: ['Passport Photograph', 'Admission Slip'],
      active: true,
      isActive: true,
      isDemo: false,
    },
  ];

  for (const service of initialServices) {
    const { id, ...data } = service;
    const ref = doc(db, COLLECTIONS.SERVICES, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      summary.servicesCreated++;
    } else {
      summary.servicesVerified++;
    }
  }

  // 2. Initial Demo Students Setup
  onProgress('Checking students');
  const initialStudents = [
    { studentId: '23CSE1001', name: 'Rahul Sharma', role: 'student', active: true, isDemo: true },
    { studentId: '23CSE1002', name: 'Priya Singh', role: 'student', active: true, isDemo: true },
    { studentId: '23CSE1003', name: 'Aman Verma', role: 'student', active: true, isDemo: true },
    { studentId: '23CSE1004', name: 'Sneha Patel', role: 'student', active: true, isDemo: true },
    { studentId: '23CSE1005', name: 'Demo Student', role: 'student', active: true, isDemo: true },
  ];

  for (const student of initialStudents) {
    const ref = doc(db, COLLECTIONS.STUDENTS, student.studentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ...student,
        createdAt: now,
        updatedAt: now,
      });
      summary.studentsCreated++;
    } else {
      summary.studentsVerified++;
    }
  }

  // 3. Queue Configuration Setup
  onProgress('Checking configuration');
  const configQueueRef = doc(db, 'config', 'queue');
  const configQueueSnap = await getDoc(configQueueRef);
  if (!configQueueSnap.exists()) {
    await setDoc(configQueueRef, {
      queueEnabled: true,
      allowSkip: true,
      allowRejoin: true,
      maxQueueSize: 100,
      defaultServiceDuration: 5,
      createdAt: now,
      updatedAt: now,
    });
    summary.configCreated++;
  }

  const configSettingsRef = doc(db, 'config', 'settings');
  const configSettingsSnap = await getDoc(configSettingsRef);
  if (!configSettingsSnap.exists()) {
    await setDoc(configSettingsRef, {
      queueEnabled: true,
      maxQueueSize: 100,
      allowSkip: true,
      allowRejoin: true,
      skipRejoinPolicy: 'MOVE_TO_END',
      createdAt: now,
      updatedAt: now,
    });
    summary.configCreated++;
  }

  // 4. Counter Initialization Setup (Exactly 3 Counters)
  onProgress('Checking counters');
  const initialCounters = [
    {
      id: 'ctr-accounts',
      code: 'CTR-A',
      name: 'Accounts Counter',
      location: 'Admin Block Room 101',
      supportedServices: ['cash-payment'],
      status: 'OPEN',
      operatingHours: { open: '09:00', close: '17:00' },
      isDemo: false,
    },
    {
      id: 'ctr-academic',
      code: 'CTR-B',
      name: 'Academic Counter',
      location: 'Admin Block Room 102',
      supportedServices: ['document-verification', 'certificate-request'],
      status: 'OPEN',
      operatingHours: { open: '09:00', close: '17:00' },
      isDemo: false,
    },
    {
      id: 'ctr-student-services',
      code: 'CTR-C',
      name: 'Student Services Counter',
      location: 'Student Activity Center',
      supportedServices: ['id-card-service', 'admission-enquiry'],
      status: 'OPEN',
      operatingHours: { open: '09:00', close: '17:00' },
      isDemo: false,
    },
  ];

  for (const counter of initialCounters) {
    const { id, ...data } = counter;
    const ref = doc(db, COLLECTIONS.COUNTERS, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      summary.countersCreated++;
    } else {
      summary.countersVerified++;
    }
  }

  // Initialize token sequence counters in config/tokenCounters
  const tokenCountersRef = doc(db, 'config', 'tokenCounters');
  await setDoc(tokenCountersRef, {
    'ctr-accounts': 24,
    'ctr-academic': 14,
    'ctr-student-services': 7,
  }, { merge: true });

  // If nothing new was created, flag already initialized
  if (
    summary.servicesCreated === 0 &&
    summary.studentsCreated === 0 &&
    summary.configCreated === 0 &&
    summary.countersCreated === 0
  ) {
    summary.alreadyInitialized = true;
  }

  return summary;
}


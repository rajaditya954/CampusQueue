import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, isDemoMode } from '../firebase/config';
import { useDemo } from '../features/demo/DemoContext';
import {
  firestoreJoinQueue,
  firestoreCallNext,
  firestoreStartService,
  firestoreCompleteService,
  firestoreSkipEntry,
  firestoreCancelEntry,
  firestoreMarkNoShow,
} from '../firebase/firestoreService';
import { QUEUE_STATUS } from '../utils/constants';

const ACTIVE_STATUSES = [QUEUE_STATUS.WAITING, QUEUE_STATUS.CALLED, QUEUE_STATUS.IN_SERVICE];

export function useQueue() {
  const demo = useDemo();
  const [firebaseQueue, setFirebaseQueue] = useState([]);
  const [loading, setLoading] = useState(!isDemoMode);
  const [error, setError] = useState(null);

  // Real-time listener
  useEffect(() => {
    if (isDemoMode) return;

    const q = query(collection(db, 'queueEntries'), orderBy('joinedAt', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }));
        setFirebaseQueue(entries);
        setLoading(false);
      },
      (err) => {
        console.warn('Error fetching queue from Firestore:', err);
        setError('Unable to load queue entries. Please try again.');
        setFirebaseQueue([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ─── Firestore write wrappers ──────────────────────────────────
  const joinQueue = useCallback(async (studentId, studentName, serviceId, counterId, studentUid = null) => {
    try {
      return await firestoreJoinQueue(studentId, studentName, serviceId, counterId, studentUid);
    } catch (err) {
      console.error('joinQueue error:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const formatQueueError = (actionName, err) => {
    if (err?.message?.includes('permission') || err?.code === 'permission-denied') {
      return `Permission denied for ${actionName}: Your account is authenticated but does not have staff or admin role in Cloud Firestore. Please ensure users/{your_uid} has { role: "admin" } or { role: "staff" } in Cloud Firestore Console.`;
    }
    return err?.message || `Failed to execute ${actionName}`;
  };

  const callNext = useCallback(async (counterId) => {
    try {
      setError(null);
      return await firestoreCallNext(counterId);
    } catch (err) {
      console.error('callNext error:', err);
      setError(formatQueueError('Call Next', err));
    }
  }, []);

  const startService = useCallback(async (entryId) => {
    try {
      setError(null);
      await firestoreStartService(entryId);
    } catch (err) {
      console.error('startService error:', err);
      setError(formatQueueError('Start Service', err));
    }
  }, []);

  const completeService = useCallback(async (entryId) => {
    try {
      setError(null);
      await firestoreCompleteService(entryId);
    } catch (err) {
      console.error('completeService error:', err);
      setError(formatQueueError('Complete Service', err));
    }
  }, []);

  const skipEntry = useCallback(async (entryId) => {
    try {
      setError(null);
      await firestoreSkipEntry(entryId);
    } catch (err) {
      console.error('skipEntry error:', err);
      setError(formatQueueError('Skip Entry', err));
    }
  }, []);

  const cancelEntry = useCallback(async (entryId) => {
    try {
      setError(null);
      await firestoreCancelEntry(entryId);
    } catch (err) {
      console.error('cancelEntry error:', err);
      setError(formatQueueError('Cancel Entry', err));
    }
  }, []);

  const markNoShow = useCallback(async (entryId) => {
    try {
      setError(null);
      await firestoreMarkNoShow(entryId);
    } catch (err) {
      console.error('markNoShow error:', err);
      setError(formatQueueError('Mark No-Show', err));
    }
  }, []);

  // ─── Query helpers (computed from live snapshot data) ───────────
  const getQueueForCounter = useCallback(
    (counterId) => firebaseQueue.filter(e => e.counterId === counterId),
    [firebaseQueue]
  );
  const getActiveQueueForCounter = useCallback(
    (counterId) => firebaseQueue.filter(e => e.counterId === counterId && ACTIVE_STATUSES.includes(e.status)),
    [firebaseQueue]
  );
  const getActiveQueueForService = useCallback(
    (serviceId) => firebaseQueue.filter(e => e.serviceId === serviceId && ACTIVE_STATUSES.includes(e.status)),
    [firebaseQueue]
  );
  const getWaitingCountForService = useCallback(
    (serviceId) => firebaseQueue.filter(e => e.serviceId === serviceId && e.status === QUEUE_STATUS.WAITING).length,
    [firebaseQueue]
  );
  const getStudentEntries = useCallback(
    (id) => firebaseQueue.filter(e => e.studentId === id || e.studentUid === id),
    [firebaseQueue]
  );
  const getStudentActiveEntry = useCallback(
    (id, secondaryId = null) => firebaseQueue.find(e =>
      ACTIVE_STATUSES.includes(e.status) && (
        (id && (e.studentId === id || e.studentUid === id)) ||
        (secondaryId && (e.studentId === secondaryId || e.studentUid === secondaryId))
      )
    ),
    [firebaseQueue]
  );
  const getCurrentlyServing = useCallback(
    (counterId) => firebaseQueue.find(e => e.counterId === counterId && e.status === QUEUE_STATUS.IN_SERVICE),
    [firebaseQueue]
  );
  const getCalledEntry = useCallback(
    (counterId) => firebaseQueue.find(e => e.counterId === counterId && e.status === QUEUE_STATUS.CALLED),
    [firebaseQueue]
  );

  if (isDemoMode) {
    return {
      queueEntries: demo.queueEntries,
      loading: false,
      error: null,
      joinQueue: demo.joinQueue,
      callNext: demo.callNext,
      startService: demo.startService,
      completeService: demo.completeService,
      skipEntry: demo.skipEntry,
      cancelEntry: demo.cancelEntry,
      markNoShow: demo.markNoShow,
      getQueueForCounter: demo.getQueueForCounter,
      getActiveQueueForCounter: demo.getActiveQueueForCounter,
      getActiveQueueForService: demo.getActiveQueueForService,
      getWaitingCountForService: demo.getWaitingCountForService,
      getStudentEntries: demo.getStudentEntries,
      getStudentActiveEntry: demo.getStudentActiveEntry,
      getCurrentlyServing: demo.getCurrentlyServing,
      getCalledEntry: demo.getCalledEntry,
    };
  }

  return {
    queueEntries: firebaseQueue,
    loading,
    error,
    clearError: () => setError(null),
    joinQueue,
    callNext,
    startService,
    completeService,
    skipEntry,
    cancelEntry,
    markNoShow,
    getQueueForCounter,
    getActiveQueueForCounter,
    getActiveQueueForService,
    getWaitingCountForService,
    getStudentEntries,
    getStudentActiveEntry,
    getCurrentlyServing,
    getCalledEntry,
  };
}


export default useQueue;

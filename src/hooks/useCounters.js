import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, isDemoMode } from '../firebase/config';
import { useDemo } from '../features/demo/DemoContext';
import {
  firestoreAddCounter,
  firestoreUpdateCounter,
  firestoreSetCounterStatus,
} from '../firebase/firestoreService';
import { COUNTER_STATUS } from '../utils/constants';

export function useCounters() {
  const demo = useDemo();
  const [firebaseCounters, setFirebaseCounters] = useState([]);
  const [loading, setLoading] = useState(!isDemoMode);
  const [error, setError] = useState(null);

  // Real-time listener
  useEffect(() => {
    if (isDemoMode) return;

    const unsubscribe = onSnapshot(
      collection(db, 'counters'),
      (snapshot) => {
        const ctrs = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }));
        setFirebaseCounters(ctrs);
        setLoading(false);
      },
      (err) => {
        console.warn('Error fetching counters from Firestore:', err);
        setError('Unable to load counters. Please try again.');
        setFirebaseCounters([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ─── Firestore write wrappers ──────────────────────────────────
  const addCounter = useCallback(async (counterData) => {
    try {
      return await firestoreAddCounter(counterData);
    } catch (err) {
      console.error('addCounter error:', err);
      setError(err.message);
    }
  }, []);

  const updateCounter = useCallback(async (counterId, updates) => {
    try {
      await firestoreUpdateCounter(counterId, updates);
    } catch (err) {
      console.error('updateCounter error:', err);
      setError(err.message);
    }
  }, []);

  const setCounterStatus = useCallback(async (counterId, status) => {
    try {
      setError(null);
      await firestoreSetCounterStatus(counterId, status);
    } catch (err) {
      console.error('setCounterStatus error:', err);
      const userFriendlyMsg = err.message?.includes('permission')
        ? "You don't have permission to change this counter."
        : err.message || 'Failed to update counter status.';
      setError(userFriendlyMsg);
      throw err;
    }
  }, []);


  // ─── Query helpers (computed from live snapshot data) ───────────
  const getCountersForService = useCallback(
    (serviceId) => firebaseCounters.filter(c => c.supportedServices?.includes(serviceId)),
    [firebaseCounters]
  );
  const getActiveCountersForService = useCallback(
    (serviceId) => firebaseCounters.filter(c => c.supportedServices?.includes(serviceId) && c.status === COUNTER_STATUS.OPEN),
    [firebaseCounters]
  );

  if (isDemoMode) {
    return {
      counters: demo.counters,
      loading: false,
      error: null,
      addCounter: demo.addCounter,
      updateCounter: demo.updateCounter,
      setCounterStatus: demo.setCounterStatus,
      getCountersForService: demo.getCountersForService,
      getActiveCountersForService: demo.getActiveCountersForService,
    };
  }

  return {
    counters: firebaseCounters,
    loading,
    error,
    addCounter,
    updateCounter,
    setCounterStatus,
    getCountersForService,
    getActiveCountersForService,
  };
}

export default useCounters;


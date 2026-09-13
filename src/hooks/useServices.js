import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, isDemoMode } from '../firebase/config';
import { useDemo } from '../features/demo/DemoContext';
import {
  firestoreAddService,
  firestoreUpdateService,
  firestoreDeleteService,
} from '../firebase/firestoreService';

export function useServices() {
  const demo = useDemo();
  const [firebaseServices, setFirebaseServices] = useState([]);
  const [loading, setLoading] = useState(!isDemoMode);
  const [error, setError] = useState(null);

  // Real-time listener
  useEffect(() => {
    if (isDemoMode) return;

    const unsubscribe = onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        const svcs = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }));
        setFirebaseServices(svcs);
        setLoading(false);
      },
      (err) => {
        console.warn('Error fetching services from Firestore:', err);
        setError('Unable to load services. Please try again.');
        setFirebaseServices([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Build servicesMap from live Firestore data
  const firebaseServicesMap = useMemo(() => {
    const map = {};
    firebaseServices.forEach(s => { map[s.id] = s; });
    return map;
  }, [firebaseServices]);

  // ─── Firestore write wrappers ──────────────────────────────────
  const addService = useCallback(async (serviceData) => {
    try {
      return await firestoreAddService(serviceData);
    } catch (err) {
      console.error('addService error:', err);
      setError(err.message);
    }
  }, []);

  const updateService = useCallback(async (serviceId, updates) => {
    try {
      await firestoreUpdateService(serviceId, updates);
    } catch (err) {
      console.error('updateService error:', err);
      setError(err.message);
    }
  }, []);

  const deleteService = useCallback(async (serviceId) => {
    try {
      await firestoreDeleteService(serviceId);
    } catch (err) {
      console.error('deleteService error:', err);
      setError(err.message);
    }
  }, []);

  if (isDemoMode) {
    return {
      services: demo.services,
      servicesMap: demo.servicesMap,
      loading: false,
      error: null,
      addService: demo.addService,
      updateService: demo.updateService,
      deleteService: demo.deleteService,
    };
  }

  return {
    services: firebaseServices,
    servicesMap: firebaseServicesMap,
    loading,
    error,
    clearError: () => setError(null),
    addService,
    updateService,
    deleteService,
  };
}

export default useServices;


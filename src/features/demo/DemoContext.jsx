/**
 * Demo Context
 * 
 * Provides a fully-functional in-memory data layer for demo mode.
 * This allows the app to work without Firebase configuration.
 * All state operations happen in-memory with React state.
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  SEED_SERVICES,
  SEED_COUNTERS,
  SEED_QUEUE_ENTRIES,
  buildServicesMap,
  getCounterPrefix,
} from '../../utils/seedData';
import { QUEUE_STATUS, COUNTER_STATUS } from '../../utils/constants';
import { updateRollingAverage, calculateActualProcessingTime } from '../queue/historicalCalc';

const DemoContext = createContext(null);

export function DemoProvider({ children }) {
  const [services, setServices] = useState([...SEED_SERVICES]);
  const [counters, setCounters] = useState([...SEED_COUNTERS]);
  const [queueEntries, setQueueEntries] = useState([...SEED_QUEUE_ENTRIES]);
  const [tokenCounters, setTokenCounters] = useState({
    'ctr-accounts': 24,
    'ctr-academic': 14,
    'ctr-student-services': 7,
    'ctr-examination': 1,
  });

  const servicesMap = useMemo(() => buildServicesMap(services), [services]);

  // ─── Service Operations ──────────────────────────────────────────

  const addService = useCallback((service) => {
    const newService = {
      ...service,
      id: service.id || `svc-${Date.now()}`,
      completedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setServices(prev => [...prev, newService]);
    return newService;
  }, []);

  const updateService = useCallback((serviceId, updates) => {
    setServices(prev => prev.map(s =>
      s.id === serviceId ? { ...s, ...updates, updatedAt: new Date() } : s
    ));
  }, []);

  const deleteService = useCallback((serviceId) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
  }, []);

  // ─── Counter Operations ──────────────────────────────────────────

  const addCounter = useCallback((counter) => {
    const newCounter = {
      ...counter,
      id: counter.id || `ctr-${Date.now()}`,
      currentToken: null,
      isActive: true,
    };
    setCounters(prev => [...prev, newCounter]);
    setTokenCounters(prev => ({ ...prev, [newCounter.id]: 1 }));
    return newCounter;
  }, []);

  const updateCounter = useCallback((counterId, updates) => {
    setCounters(prev => prev.map(c =>
      c.id === counterId ? { ...c, ...updates } : c
    ));
  }, []);

  const setCounterStatus = useCallback((counterId, status) => {
    setCounters(prev => prev.map(c =>
      c.id === counterId ? { ...c, status } : c
    ));
  }, []);

  // ─── Queue Operations ────────────────────────────────────────────

  const joinQueue = useCallback((studentId, studentName, serviceId, counterId) => {
    const activeDoc = queueEntries.find(e =>
      (e.studentId === studentId || e.studentUid === studentId) &&
      [QUEUE_STATUS.WAITING, QUEUE_STATUS.CALLED, QUEUE_STATUS.IN_SERVICE].includes(e.status)
    );
    if (activeDoc) {
      throw new Error(`You already have an active queue token (${activeDoc.tokenNumber}). You cannot generate another token until your current token is completed or cancelled.`);
    }

    const counter = counters.find(c => c.id === counterId);
    if (!counter || counter.status === COUNTER_STATUS.CLOSED) return null;

    const prefix = getCounterPrefix(counterId);
    const nextNum = (tokenCounters[counterId] || 0) + 1;

    const newEntry = {
      id: `qe-${Date.now()}`,
      tokenNumber: `${prefix}-${nextNum}`,
      studentId,
      studentName,
      serviceId,
      counterId,
      status: QUEUE_STATUS.WAITING,
      joinedAt: new Date(),
      calledAt: null,
      serviceStartedAt: null,
      completedAt: null,
      estimatedWaitTime: null,
      actualProcessingTime: null,
    };

    setQueueEntries(prev => [...prev, newEntry]);
    setTokenCounters(prev => ({ ...prev, [counterId]: nextNum }));
    return newEntry;
  }, [counters, tokenCounters, queueEntries]);

  const callNext = useCallback((counterId) => {
    setQueueEntries(prev => {
      const waiting = prev
        .filter(e => (!counterId || counterId === 'ALL' || e.counterId === counterId) && e.status === QUEUE_STATUS.WAITING)
        .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));

      if (waiting.length === 0) return prev;

      const nextEntry = waiting[0];
      return prev.map(e =>
        e.id === nextEntry.id
          ? { ...e, status: QUEUE_STATUS.CALLED, calledAt: new Date() }
          : e
      );
    });
  }, []);

  const startService = useCallback((entryId) => {
    setQueueEntries(prev => prev.map(e =>
      e.id === entryId
        ? { ...e, status: QUEUE_STATUS.IN_SERVICE, serviceStartedAt: new Date() }
        : e
    ));
  }, []);

  const completeService = useCallback((entryId) => {
    setQueueEntries(prev => {
      const entry = prev.find(e => e.id === entryId);
      if (!entry) return prev;

      const completedAt = new Date();
      const actualTime = entry.serviceStartedAt
        ? calculateActualProcessingTime(entry.serviceStartedAt, completedAt)
        : null;

      // Update service average
      if (actualTime && entry.serviceId) {
        setServices(svcPrev => svcPrev.map(s => {
          if (s.id !== entry.serviceId) return s;
          const newAvg = updateRollingAverage(s.averageProcessingTime, actualTime, s.completedCount);
          return {
            ...s,
            averageProcessingTime: Math.round(newAvg * 10) / 10,
            completedCount: (s.completedCount || 0) + 1,
            updatedAt: new Date(),
          };
        }));
      }

      return prev.map(e =>
        e.id === entryId
          ? { ...e, status: QUEUE_STATUS.COMPLETED, completedAt, actualProcessingTime: actualTime }
          : e
      );
    });
  }, []);

  const skipEntry = useCallback((entryId) => {
    setQueueEntries(prev => prev.map(e =>
      e.id === entryId
        ? { ...e, status: QUEUE_STATUS.SKIPPED }
        : e
    ));
  }, []);

  const cancelEntry = useCallback((entryId) => {
    setQueueEntries(prev => prev.map(e =>
      e.id === entryId
        ? { ...e, status: QUEUE_STATUS.CANCELLED }
        : e
    ));
  }, []);

  const markNoShow = useCallback((entryId) => {
    setQueueEntries(prev => prev.map(e =>
      e.id === entryId
        ? { ...e, status: QUEUE_STATUS.NO_SHOW }
        : e
    ));
  }, []);

  // ─── Query Helpers ───────────────────────────────────────────────

  const getQueueForCounter = useCallback((counterId) => {
    return queueEntries.filter(e => e.counterId === counterId);
  }, [queueEntries]);

  const getActiveQueueForCounter = useCallback((counterId) => {
    return queueEntries
      .filter(e =>
        e.counterId === counterId &&
        [QUEUE_STATUS.WAITING, QUEUE_STATUS.CALLED, QUEUE_STATUS.IN_SERVICE].includes(e.status)
      )
      .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));
  }, [queueEntries]);

  const getActiveQueueForService = useCallback((serviceId) => {
    return queueEntries
      .filter(e =>
        e.serviceId === serviceId &&
        [QUEUE_STATUS.WAITING, QUEUE_STATUS.CALLED, QUEUE_STATUS.IN_SERVICE].includes(e.status)
      )
      .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));
  }, [queueEntries]);

  const getWaitingCountForService = useCallback((serviceId) => {
    return queueEntries.filter(
      e => e.serviceId === serviceId && e.status === QUEUE_STATUS.WAITING
    ).length;
  }, [queueEntries]);

  const getStudentEntries = useCallback((studentId) => {
    return queueEntries
      .filter(e => e.studentId === studentId)
      .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
  }, [queueEntries]);

  const getStudentActiveEntry = useCallback((studentId) => {
    return queueEntries.find(
      e => e.studentId === studentId &&
      [QUEUE_STATUS.WAITING, QUEUE_STATUS.CALLED, QUEUE_STATUS.IN_SERVICE].includes(e.status)
    );
  }, [queueEntries]);

  const getCountersForService = useCallback((serviceId) => {
    return counters.filter(c => c.supportedServices?.includes(serviceId));
  }, [counters]);

  const getActiveCountersForService = useCallback((serviceId) => {
    return counters.filter(
      c => c.supportedServices?.includes(serviceId) && c.status === COUNTER_STATUS.OPEN
    );
  }, [counters]);

  const getCurrentlyServing = useCallback((counterId) => {
    return queueEntries.find(
      e => e.counterId === counterId && e.status === QUEUE_STATUS.IN_SERVICE
    );
  }, [queueEntries]);

  const getCalledEntry = useCallback((counterId) => {
    return queueEntries.find(
      e => e.counterId === counterId && e.status === QUEUE_STATUS.CALLED
    );
  }, [queueEntries]);

  const value = {
    // Data
    services,
    counters,
    queueEntries,
    servicesMap,

    // Service operations
    addService,
    updateService,
    deleteService,

    // Counter operations
    addCounter,
    updateCounter,
    setCounterStatus,

    // Queue operations
    joinQueue,
    callNext,
    startService,
    completeService,
    skipEntry,
    cancelEntry,
    markNoShow,

    // Query helpers
    getQueueForCounter,
    getActiveQueueForCounter,
    getActiveQueueForService,
    getWaitingCountForService,
    getStudentEntries,
    getStudentActiveEntry,
    getCountersForService,
    getActiveCountersForService,
    getCurrentlyServing,
    getCalledEntry,
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

export default DemoContext;

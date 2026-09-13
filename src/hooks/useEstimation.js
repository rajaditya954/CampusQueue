import { useMemo } from 'react';
import { useServices } from './useServices';
import { useCounters } from './useCounters';
import { useQueue } from './useQueue';
import {
  calculateEstimatedWait,
  calculateEstimatedCompletion,
  calculateQueueFeasibility,
  getConfidenceLevel,
  calculatePosition,
} from '../features/queue/queueEstimator';
import { FEASIBILITY } from '../utils/constants';

export function useEstimation(serviceId, counterId = null, targetEntryId = null) {
  const { services, servicesMap } = useServices();
  const { counters, getActiveCountersForService } = useCounters();
  const { queueEntries, getActiveQueueForService, getActiveQueueForCounter } = useQueue();

  return useMemo(() => {
    const service = services.find(s => s.id === serviceId);
    if (!service) {
      return {
        estimatedWaitMinutes: 0,
        estimatedCompletionTime: new Date(),
        feasibility: FEASIBILITY.SAFE,
        feasibilityMessage: 'Service not found',
        confidence: 'INITIAL',
        peopleAheadCount: 0,
        breakdown: [],
        activeCountersCount: 0,
      };
    }

    // Determine relevant active queue entries
    let activeEntries = [];
    if (counterId) {
      activeEntries = getActiveQueueForCounter(counterId);
    } else {
      activeEntries = getActiveQueueForService(serviceId);
    }

    // Filter queue up to targetEntryId if specified
    let queueAhead = activeEntries;
    if (targetEntryId) {
      const idx = activeEntries.findIndex(e => e.id === targetEntryId);
      if (idx !== -1) {
        queueAhead = activeEntries.slice(0, idx);
      }
    }

    // Get active counters supporting this service
    const activeCounters = counterId
      ? counters.filter(c => c.id === counterId && c.status === 'OPEN')
      : getActiveCountersForService(serviceId);

    const activeCountersCount = activeCounters.length || 1;

    // Calculate sum of processing times of all entries ahead
    let totalWaitRaw = 0;
    const breakdown = queueAhead.map(entry => {
      const entryService = servicesMap[entry.serviceId] || service;
      const svcTime = entryService.averageProcessingTime || 5;
      totalWaitRaw += svcTime;
      return {
        entryId: entry.id,
        serviceName: entryService.name || 'Service',
        processingTime: svcTime,
      };
    });

    // Distribute wait time across active parallel counters
    const estimatedWaitMinutes = Math.max(1, Math.ceil(totalWaitRaw / activeCountersCount));

    const now = new Date();
    const serviceDuration = service.averageProcessingTime || 5;
    const estimatedCompletionTime = calculateEstimatedCompletion(now, estimatedWaitMinutes, serviceDuration);

    // Closing time calculation
    let closingTime = null;
    if (counterId) {
      const counter = counters.find(c => c.id === counterId);
      const closeStr = counter?.operatingHours?.close || counter?.closingTime;
      if (closeStr && typeof closeStr === 'string' && closeStr.includes(':')) {
        const [h, m] = closeStr.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          closingTime = new Date();
          closingTime.setHours(h, m, 0, 0);
        }
      }
    }

    if (!closingTime) {
      // Default 5:00 PM closing
      closingTime = new Date();
      closingTime.setHours(17, 0, 0, 0);
    }

    const feasibility = calculateQueueFeasibility(estimatedCompletionTime, closingTime);
    const confidence = getConfidenceLevel(service.completedCount || 0);

    return {
      service,
      estimatedWaitMinutes,
      estimatedCompletionTime,
      feasibility,
      confidence,
      peopleAheadCount: queueAhead.length,
      breakdown,
      activeCountersCount,
      closingTime,
    };
  }, [serviceId, counterId, targetEntryId, services, servicesMap, counters, queueEntries, getActiveCountersForService, getActiveQueueForCounter, getActiveQueueForService]);
}

export default useEstimation;

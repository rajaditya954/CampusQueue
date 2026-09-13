/**
 * Queue Estimation Engine
 * 
 * Core module for calculating service-aware wait times.
 * This is the heart of the system — it calculates waiting time based on
 * the ACTUAL SERVICES of people ahead, not just token count.
 * 
 * All functions are pure and independently testable.
 */

import { QUEUE_STATUS, FEASIBILITY, CONFIDENCE, TIGHT_BUFFER_MINUTES, CONFIDENCE_THRESHOLDS } from '../../utils/constants';

/**
 * Calculate estimated wait time for a student based on the queue ahead.
 * 
 * Instead of: peopleAhead × fixedAverageTime
 * We calculate: sum of estimated processing time for each person ahead
 * 
 * @param {Array} queueAhead - Queue entries ahead of the student, each with { serviceId, status }
 * @param {Object} servicesMap - Map of serviceId → service object with averageProcessingTime
 * @param {number} activeCounterCount - Number of active counters serving this service
 * @returns {number} Estimated wait time in minutes
 */
export function calculateEstimatedWait(queueAhead, servicesMap, activeCounterCount = 1) {
  if (!queueAhead || queueAhead.length === 0) return 0;
  if (activeCounterCount <= 0) return Infinity;

  // Filter only WAITING and CALLED entries (not completed/cancelled/etc.)
  const activeEntries = queueAhead.filter(
    entry => entry.status === QUEUE_STATUS.WAITING || entry.status === QUEUE_STATUS.CALLED
  );

  if (activeEntries.length === 0) return 0;

  // Sum up the estimated processing time for each person ahead
  const totalProcessingTime = activeEntries.reduce((total, entry) => {
    const service = servicesMap[entry.serviceId];
    return total + (service?.averageProcessingTime || 10);
  }, 0);

  // For multiple counters, divide total time by counter count
  // This is a simplified model — in reality, work distribution isn't perfectly even
  if (activeCounterCount > 1) {
    return Math.ceil(totalProcessingTime / activeCounterCount);
  }

  return Math.ceil(totalProcessingTime);
}

/**
 * Calculate estimated completion time for a student.
 * 
 * completionTime = currentTime + waitTime + studentServiceTime
 * 
 * @param {Date} currentTime - Current timestamp
 * @param {number} waitTimeMinutes - Estimated wait in minutes
 * @param {number} serviceTimeMinutes - Estimated service processing time in minutes
 * @returns {Date} Estimated completion timestamp
 */
export function calculateEstimatedCompletion(currentTime, waitTimeMinutes, serviceTimeMinutes) {
  const completionMs = currentTime.getTime() + (waitTimeMinutes + serviceTimeMinutes) * 60 * 1000;
  return new Date(completionMs);
}

/**
 * Calculate estimated service start time.
 * 
 * serviceStart = currentTime + waitTime
 * 
 * @param {Date} currentTime 
 * @param {number} waitTimeMinutes 
 * @returns {Date}
 */
export function calculateEstimatedServiceStart(currentTime, waitTimeMinutes) {
  return new Date(currentTime.getTime() + waitTimeMinutes * 60 * 1000);
}

/**
 * Determine queue feasibility relative to counter closing time.
 * 
 * Compares estimated completion against closing time and returns:
 * - SAFE: More than TIGHT_BUFFER_MINUTES before closing
 * - TIGHT: Within TIGHT_BUFFER_MINUTES of closing
 * - TOO_LATE: After closing time
 * 
 * @param {Date} estimatedCompletion - When the student's service would finish
 * @param {Date} closingTime - When the counter closes
 * @returns {string} One of FEASIBILITY.SAFE, .TIGHT, .TOO_LATE
 */
export function calculateQueueFeasibility(estimatedCompletion, closingTime) {
  if (!estimatedCompletion || !closingTime) return FEASIBILITY.SAFE;

  const completionMs = estimatedCompletion.getTime();
  const closingMs = closingTime.getTime();
  const bufferMs = TIGHT_BUFFER_MINUTES * 60 * 1000;

  if (completionMs > closingMs) {
    return FEASIBILITY.TOO_LATE;
  }

  if (completionMs > closingMs - bufferMs) {
    return FEASIBILITY.TIGHT;
  }

  return FEASIBILITY.SAFE;
}

/**
 * Get confidence level based on historical data count.
 * 
 * @param {number} completedCount - Number of completed services used for the estimate
 * @returns {string} One of CONFIDENCE.HIGH, .MODERATE, .INITIAL
 */
export function getConfidenceLevel(completedCount) {
  if (completedCount >= CONFIDENCE_THRESHOLDS.HIGH) return CONFIDENCE.HIGH;
  if (completedCount >= CONFIDENCE_THRESHOLDS.MODERATE) return CONFIDENCE.MODERATE;
  return CONFIDENCE.INITIAL;
}

/**
 * Calculate the position of a student in the queue.
 * 
 * @param {string} entryId - The student's queue entry ID
 * @param {Array} allEntries - All queue entries sorted by joinedAt
 * @returns {number} Position (1-based), or 0 if not found
 */
export function calculatePosition(entryId, allEntries) {
  const activeEntries = allEntries.filter(
    e => e.status === QUEUE_STATUS.WAITING || e.status === QUEUE_STATUS.CALLED
  );
  const index = activeEntries.findIndex(e => e.id === entryId);
  return index >= 0 ? index + 1 : 0;
}

/**
 * Get the entries ahead of a specific entry in the queue.
 * 
 * @param {string} entryId - The student's queue entry ID
 * @param {Array} allEntries - All queue entries sorted by joinedAt
 * @returns {Array} Entries ahead of the student
 */
export function getEntriesAhead(entryId, allEntries) {
  const activeEntries = allEntries.filter(
    e => e.status === QUEUE_STATUS.WAITING || e.status === QUEUE_STATUS.CALLED
  );
  const index = activeEntries.findIndex(e => e.id === entryId);
  if (index <= 0) return [];
  return activeEntries.slice(0, index);
}

/**
 * Calculate the total remaining workload for a counter (in minutes).
 * 
 * @param {Array} queueEntries - Active queue entries for a counter
 * @param {Object} servicesMap - Map of serviceId → service object
 * @returns {number} Total workload in minutes
 */
export function calculateRemainingWorkload(queueEntries, servicesMap) {
  const activeEntries = queueEntries.filter(
    e => e.status === QUEUE_STATUS.WAITING || e.status === QUEUE_STATUS.CALLED
  );

  return activeEntries.reduce((total, entry) => {
    const service = servicesMap[entry.serviceId];
    return total + (service?.averageProcessingTime || 10);
  }, 0);
}

/**
 * Calculate a full estimation for a student considering a specific service.
 * This is the primary function used by the UI.
 * 
 * @param {Object} params
 * @param {Array} params.queueEntries - All active entries for the service/counter
 * @param {Object} params.servicesMap - Map of serviceId → service
 * @param {string} params.serviceId - The service the student wants
 * @param {Date} params.closingTime - Counter closing time
 * @param {number} params.activeCounterCount - Number of active counters
 * @param {string} [params.studentEntryId] - Student's entry ID (if already in queue)
 * @returns {Object} Full estimation result
 */
export function calculateFullEstimation({
  queueEntries,
  servicesMap,
  serviceId,
  closingTime,
  activeCounterCount = 1,
  studentEntryId = null,
}) {
  const now = new Date();
  const service = servicesMap[serviceId];
  
  if (!service) {
    return {
      peopleAhead: 0,
      estimatedWaitMinutes: 0,
      estimatedServiceMinutes: 10,
      estimatedServiceStart: now,
      estimatedCompletion: now,
      feasibility: FEASIBILITY.SAFE,
      confidence: CONFIDENCE.INITIAL,
      closingTime,
    };
  }

  // Get entries ahead
  let entriesAhead;
  if (studentEntryId) {
    entriesAhead = getEntriesAhead(studentEntryId, queueEntries);
  } else {
    // Student hasn't joined yet — all active entries are ahead
    entriesAhead = queueEntries.filter(
      e => e.status === QUEUE_STATUS.WAITING || e.status === QUEUE_STATUS.CALLED
    );
  }

  const peopleAhead = entriesAhead.length;
  const estimatedWaitMinutes = calculateEstimatedWait(entriesAhead, servicesMap, activeCounterCount);
  const estimatedServiceMinutes = service.averageProcessingTime || 10;
  const estimatedServiceStart = calculateEstimatedServiceStart(now, estimatedWaitMinutes);
  const estimatedCompletion = calculateEstimatedCompletion(now, estimatedWaitMinutes, estimatedServiceMinutes);
  const feasibility = calculateQueueFeasibility(estimatedCompletion, closingTime);
  const confidence = getConfidenceLevel(service.completedCount || 0);

  return {
    peopleAhead,
    estimatedWaitMinutes,
    estimatedServiceMinutes,
    estimatedServiceStart,
    estimatedCompletion,
    feasibility,
    confidence,
    closingTime,
  };
}

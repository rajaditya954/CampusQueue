/**
 * Historical Processing Time Calculator
 * 
 * Maintains and updates rolling averages for service processing times.
 * Uses a weighted approach: 70% recent data, 30% historical baseline.
 * 
 * No ML needed — simple, explainable, debuggable statistics.
 */

import { ROLLING_AVERAGE_WEIGHTS } from '../../utils/constants';

/**
 * Update the rolling average processing time for a service.
 * 
 * Formula:
 *   newAverage = (RECENT_WEIGHT × recentAverage) + (HISTORICAL_WEIGHT × historicalBaseline)
 * 
 * Where recentAverage is calculated from the most recent N observations.
 * 
 * @param {number} currentAverage - Current stored average processing time (minutes)
 * @param {number} newActualTime - New observed processing time (minutes)
 * @param {number} completedCount - Total completed count so far
 * @returns {number} Updated average processing time
 */
export function updateRollingAverage(currentAverage, newActualTime, completedCount) {
  if (completedCount <= 0 || !currentAverage) {
    // First observation: use the actual time directly
    return newActualTime;
  }

  // Weighted combination: recent observations have more influence
  const recentWeight = ROLLING_AVERAGE_WEIGHTS.RECENT;
  const historicalWeight = ROLLING_AVERAGE_WEIGHTS.HISTORICAL;

  // For the first few observations, use simple averaging to stabilize
  if (completedCount < 5) {
    return ((currentAverage * completedCount) + newActualTime) / (completedCount + 1);
  }

  // Weighted rolling average
  return (recentWeight * newActualTime) + (historicalWeight * currentAverage);
}

/**
 * Calculate comprehensive service statistics from historical data.
 * 
 * @param {Array<number>} processingTimes - Array of historical processing times (minutes)
 * @returns {{ avg: number, min: number, max: number, count: number, stdDev: number }}
 */
export function calculateServiceStats(processingTimes) {
  if (!processingTimes || processingTimes.length === 0) {
    return { avg: 0, min: 0, max: 0, count: 0, stdDev: 0 };
  }

  const count = processingTimes.length;
  const sum = processingTimes.reduce((a, b) => a + b, 0);
  const avg = sum / count;
  const min = Math.min(...processingTimes);
  const max = Math.max(...processingTimes);

  // Standard deviation
  const squaredDiffs = processingTimes.map(t => Math.pow(t - avg, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / count;
  const stdDev = Math.sqrt(avgSquaredDiff);

  return {
    avg: Math.round(avg * 10) / 10,
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    count,
    stdDev: Math.round(stdDev * 10) / 10,
  };
}

/**
 * Calculate the actual processing time from timestamps.
 * 
 * @param {Date} serviceStartedAt - When service started
 * @param {Date} completedAt - When service completed
 * @returns {number} Processing time in minutes
 */
export function calculateActualProcessingTime(serviceStartedAt, completedAt) {
  if (!serviceStartedAt || !completedAt) return null;

  const start = serviceStartedAt instanceof Date ? serviceStartedAt : new Date(serviceStartedAt);
  const end = completedAt instanceof Date ? completedAt : new Date(completedAt);

  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (60 * 1000)));
}

/**
 * Get the processing time range display string.
 * 
 * @param {Object} service - Service object
 * @returns {string} e.g., "3–5 min" or "Usually ~5 min"
 */
export function getProcessingTimeRange(service) {
  if (!service) return 'Unknown';

  const min = service.minimumProcessingTime;
  const max = service.maximumProcessingTime;
  const avg = service.averageProcessingTime;

  if (min && max && min !== max) {
    return `${min}–${max} min`;
  }

  if (avg) {
    return `~${avg} min`;
  }

  return 'Unknown';
}

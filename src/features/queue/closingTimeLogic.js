/**
 * Closing Time Logic
 * 
 * Functions for determining whether a student's service
 * can be completed before the counter closes.
 */

import { FEASIBILITY, TIGHT_BUFFER_MINUTES } from '../../utils/constants';

/**
 * Get remaining time until closing in minutes.
 * 
 * @param {Date} closingTime - Counter closing time
 * @param {Date} [currentTime] - Current time (defaults to now)
 * @returns {number} Minutes remaining, or 0 if already past
 */
export function getTimeRemaining(closingTime, currentTime = new Date()) {
  if (!closingTime) return Infinity;
  const diff = closingTime.getTime() - currentTime.getTime();
  return Math.max(0, Math.round(diff / (60 * 1000)));
}

/**
 * Check if service can be completed before closing.
 * 
 * @param {Date} estimatedCompletion 
 * @param {Date} closingTime 
 * @returns {boolean}
 */
export function canCompleteBeforeClosing(estimatedCompletion, closingTime) {
  if (!estimatedCompletion || !closingTime) return true;
  return estimatedCompletion.getTime() <= closingTime.getTime();
}

/**
 * Get feasibility status with buffer consideration.
 * 
 * @param {Date} estimatedCompletion 
 * @param {Date} closingTime 
 * @param {number} [bufferMinutes] - Buffer for "TIGHT" status
 * @returns {{ status: string, minutesBeforeClosing: number, message: string }}
 */
export function getFeasibilityStatus(estimatedCompletion, closingTime, bufferMinutes = TIGHT_BUFFER_MINUTES) {
  if (!estimatedCompletion || !closingTime) {
    return {
      status: FEASIBILITY.SAFE,
      minutesBeforeClosing: Infinity,
      message: 'Counter hours not available.',
    };
  }

  const completionMs = estimatedCompletion.getTime();
  const closingMs = closingTime.getTime();
  const minutesBeforeClosing = Math.round((closingMs - completionMs) / (60 * 1000));

  if (minutesBeforeClosing < 0) {
    return {
      status: FEASIBILITY.TOO_LATE,
      minutesBeforeClosing,
      message: `You are unlikely to complete this request before closing. Estimated completion is ${Math.abs(minutesBeforeClosing)} minutes after the counter closes.`,
    };
  }

  if (minutesBeforeClosing < bufferMinutes) {
    const completionTime = estimatedCompletion.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const closeTime = closingTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return {
      status: FEASIBILITY.TIGHT,
      minutesBeforeClosing,
      message: `This may be close. Estimated completion is ${completionTime} and the counter closes at ${closeTime}.`,
    };
  }

  return {
    status: FEASIBILITY.SAFE,
    minutesBeforeClosing,
    message: 'You are likely to finish before the counter closes.',
  };
}

/**
 * Check if a counter is currently within operating hours.
 * 
 * @param {string} openingTime - "HH:mm" format
 * @param {string} closingTime - "HH:mm" format
 * @param {Date} [currentTime] - Current time (defaults to now)
 * @returns {boolean}
 */
export function isWithinOperatingHours(openingTime, closingTime, currentTime = new Date()) {
  if (!openingTime || !closingTime) return true;

  const [openH, openM] = openingTime.split(':').map(Number);
  const [closeH, closeM] = closingTime.split(':').map(Number);

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

/**
 * Get the counter closing time as a Date object for today.
 * 
 * @param {string} closingTimeStr - "HH:mm" format
 * @returns {Date}
 */
export function getClosingTimeToday(closingTimeStr) {
  if (!closingTimeStr) return null;
  const [hours, minutes] = closingTimeStr.split(':').map(Number);
  const today = new Date();
  today.setHours(hours, minutes, 0, 0);
  return today;
}

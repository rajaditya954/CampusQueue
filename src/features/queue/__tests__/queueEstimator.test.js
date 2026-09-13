import { describe, it, expect } from 'vitest';
import {
  calculateEstimatedWait,
  calculateEstimatedCompletion,
  calculateQueueFeasibility,
  getConfidenceLevel,
  calculatePosition,
  getEntriesAhead,
} from '../queueEstimator';
import { updateRollingAverage } from '../historicalCalc';
import { QUEUE_STATUS, FEASIBILITY, CONFIDENCE } from '../../../utils/constants';

describe('Queue Estimation Engine', () => {

  describe('calculateEstimatedWait', () => {
    it('returns 0 for empty queue ahead', () => {
      const wait = calculateEstimatedWait([], {});
      expect(wait).toBe(0);
    });

    it('sums processing times of services ahead correctly', () => {
      const queueAhead = [
        { serviceId: 'svc-fee', status: QUEUE_STATUS.WAITING },
        { serviceId: 'svc-cert', status: QUEUE_STATUS.WAITING },
      ];
      const servicesMap = {
        'svc-fee': { averageProcessingTime: 10 },
        'svc-cert': { averageProcessingTime: 15 },
      };
      const wait = calculateEstimatedWait(queueAhead, servicesMap);
      expect(wait).toBe(25);
    });

    it('falls back to default 10 mins when service time is missing in map', () => {
      const queueAhead = [{ serviceId: 'svc-unknown', status: QUEUE_STATUS.WAITING }];
      const wait = calculateEstimatedWait(queueAhead, {});
      expect(wait).toBe(10);
    });
  });

  describe('calculateEstimatedCompletion', () => {
    it('adds waiting time and service time to current time', () => {
      const now = new Date('2026-09-13T10:00:00Z');
      const completion = calculateEstimatedCompletion(now, 20, 10);
      expect(completion.toISOString()).toBe('2026-09-13T10:30:00.000Z');
    });
  });

  describe('calculateQueueFeasibility', () => {
    it('returns SAFE when completion is well before closing time', () => {
      const completion = new Date('2026-09-13T15:00:00Z');
      const closing = new Date('2026-09-13T17:00:00Z');
      const result = calculateQueueFeasibility(completion, closing);
      expect(result).toBe(FEASIBILITY.SAFE);
    });

    it('returns TIGHT when completion is within buffer window before closing', () => {
      const completion = new Date('2026-09-13T16:50:00Z');
      const closing = new Date('2026-09-13T17:00:00Z');
      const result = calculateQueueFeasibility(completion, closing);
      expect(result).toBe(FEASIBILITY.TIGHT);
    });

    it('returns TOO_LATE when completion is after closing time', () => {
      const completion = new Date('2026-09-13T17:15:00Z');
      const closing = new Date('2026-09-13T17:00:00Z');
      const result = calculateQueueFeasibility(completion, closing);
      expect(result).toBe(FEASIBILITY.TOO_LATE);
    });
  });

  describe('getConfidenceLevel', () => {
    it('returns INITIAL for < 10 completed entries', () => {
      expect(getConfidenceLevel(5)).toBe(CONFIDENCE.INITIAL);
    });

    it('returns MODERATE for 10-49 completed entries', () => {
      expect(getConfidenceLevel(25)).toBe(CONFIDENCE.MODERATE);
    });

    it('returns HIGH for >= 50 completed entries', () => {
      expect(getConfidenceLevel(60)).toBe(CONFIDENCE.HIGH);
    });
  });

  describe('updateRollingAverage', () => {
    it('calculates weighted rolling average (70% recent + 30% historical)', () => {
      const currentAvg = 10;
      const actualTime = 20;
      const newAvg = updateRollingAverage(currentAvg, actualTime, 10);
      expect(newAvg).toBe(17); // 10*0.3 + 20*0.7 = 3 + 14 = 17
    });
  });

  describe('Multi-counter parallel wait distribution', () => {
    it('divides total queue workload across available active counters', () => {
      const queueAhead = [
        { serviceId: 'svc-1', status: QUEUE_STATUS.WAITING },
        { serviceId: 'svc-1', status: QUEUE_STATUS.WAITING },
        { serviceId: 'svc-1', status: QUEUE_STATUS.WAITING },
        { serviceId: 'svc-1', status: QUEUE_STATUS.WAITING },
      ];
      const servicesMap = { 'svc-1': { averageProcessingTime: 10 } };
      // Total workload = 40 mins. With 2 counters -> 20 mins wait.
      const wait = calculateEstimatedWait(queueAhead, servicesMap, 2);
      expect(wait).toBe(20);
    });
  });
});

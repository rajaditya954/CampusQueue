/**
 * Seed Data Generator
 * 
 * Creates realistic demo data for the Campus Service Queue System.
 * Used in demo mode and for initial Firestore seeding.
 */

import { QUEUE_STATUS, COUNTER_STATUS } from './constants';

// ─── Services ────────────────────────────────────────────────────────

export const SEED_SERVICES = [
  {
    id: 'svc-fee-payment',
    name: 'Fee Payment',
    description: 'Pay tuition fees, hostel fees, examination fees, and other charges.',
    category: 'Accounts',
    averageProcessingTime: 4,
    minimumProcessingTime: 2,
    maximumProcessingTime: 8,
    isActive: true,
    requiresDocuments: false,
    canBePostponed: true,
    completedCount: 184,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-09-10'),
  },
  {
    id: 'svc-doc-verification',
    name: 'Document Verification',
    description: 'Verify academic documents, certificates, and identification records.',
    category: 'Academic',
    averageProcessingTime: 12,
    minimumProcessingTime: 8,
    maximumProcessingTime: 20,
    isActive: true,
    requiresDocuments: true,
    canBePostponed: true,
    completedCount: 97,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-09-10'),
  },
  {
    id: 'svc-bonafide',
    name: 'Bonafide Certificate',
    description: 'Request a bonafide certificate for educational or official purposes.',
    category: 'Academic',
    averageProcessingTime: 8,
    minimumProcessingTime: 5,
    maximumProcessingTime: 12,
    isActive: true,
    requiresDocuments: true,
    canBePostponed: true,
    completedCount: 63,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-09-10'),
  },
  {
    id: 'svc-scholarship',
    name: 'Scholarship Verification',
    description: 'Submit or verify scholarship application documents.',
    category: 'Accounts',
    averageProcessingTime: 15,
    minimumProcessingTime: 10,
    maximumProcessingTime: 25,
    isActive: true,
    requiresDocuments: true,
    canBePostponed: false,
    completedCount: 42,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-09-10'),
  },
  {
    id: 'svc-id-card',
    name: 'ID Card Issue',
    description: 'Apply for a new student ID card or request a replacement.',
    category: 'Student Services',
    averageProcessingTime: 6,
    minimumProcessingTime: 3,
    maximumProcessingTime: 10,
    isActive: true,
    requiresDocuments: true,
    canBePostponed: true,
    completedCount: 28,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-09-10'),
  },
  {
    id: 'svc-exam-form',
    name: 'Examination Form Submission',
    description: 'Submit examination registration forms and related documents.',
    category: 'Examinations',
    averageProcessingTime: 5,
    minimumProcessingTime: 3,
    maximumProcessingTime: 8,
    isActive: true,
    requiresDocuments: true,
    canBePostponed: false,
    completedCount: 156,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-09-10'),
  },
  {
    id: 'svc-transcript',
    name: 'Transcript Request',
    description: 'Request official academic transcripts for applications or records.',
    category: 'Academic',
    averageProcessingTime: 7,
    minimumProcessingTime: 5,
    maximumProcessingTime: 12,
    isActive: true,
    requiresDocuments: false,
    canBePostponed: true,
    completedCount: 71,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-09-10'),
  },
  {
    id: 'svc-general',
    name: 'General Enquiry',
    description: 'General questions about admissions, courses, or campus services.',
    category: 'Student Services',
    averageProcessingTime: 3,
    minimumProcessingTime: 1,
    maximumProcessingTime: 8,
    isActive: true,
    requiresDocuments: false,
    canBePostponed: true,
    completedCount: 245,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-09-10'),
  },
];

// ─── Counters ────────────────────────────────────────────────────────

export const SEED_COUNTERS = [
  {
    id: 'ctr-accounts',
    name: 'Accounts Counter',
    location: 'Admin Block, Ground Floor, Room 102',
    status: COUNTER_STATUS.OPEN,
    openingTime: '09:00',
    closingTime: '16:00',
    supportedServices: ['svc-fee-payment', 'svc-scholarship'],
    currentToken: null,
    isActive: true,
  },
  {
    id: 'ctr-academic',
    name: 'Academic Counter',
    location: 'Admin Block, First Floor, Room 201',
    status: COUNTER_STATUS.OPEN,
    openingTime: '09:30',
    closingTime: '16:30',
    supportedServices: ['svc-doc-verification', 'svc-bonafide', 'svc-transcript', 'svc-exam-form'],
    currentToken: null,
    isActive: true,
  },
  {
    id: 'ctr-student-services',
    name: 'Student Services Counter',
    location: 'Student Center, Ground Floor',
    status: COUNTER_STATUS.OPEN,
    openingTime: '10:00',
    closingTime: '17:00',
    supportedServices: ['svc-id-card', 'svc-general'],
    currentToken: null,
    isActive: true,
  },
];

// ─── Queue Entries ───────────────────────────────────────────────────

const now = new Date();

function minutesAgo(min) {
  return new Date(now.getTime() - min * 60 * 1000);
}

export const SEED_QUEUE_ENTRIES = [];

// ─── Students ────────────────────────────────────────────────────────

export const SEED_STUDENTS = [
  { studentId: '23CSE1001', name: 'Rahul Sharma', role: 'student', active: true },
  { studentId: '23CSE1002', name: 'Priya Singh', role: 'student', active: true },
  { studentId: '23CSE1003', name: 'Aman Verma', role: 'student', active: true },
  { studentId: '23CSE1004', name: 'Sneha Patel', role: 'student', active: true },
  { studentId: '23CSE1005', name: 'Demo Student', role: 'student', active: true },
];

// ─── Helper Functions ────────────────────────────────────────────────

/**
 * Build a services map from the seed services array
 */
export function buildServicesMap(services = SEED_SERVICES) {
  const map = {};
  services.forEach(s => { map[s.id] = s; });
  return map;
}

/**
 * Build a counters map from the seed counters array
 */
export function buildCountersMap(counters = SEED_COUNTERS) {
  const map = {};
  counters.forEach(c => { map[c.id] = c; });
  return map;
}

/**
 * Get queue entries for a specific counter
 */
export function getQueueForCounter(counterId, entries = SEED_QUEUE_ENTRIES) {
  return entries.filter(e => e.counterId === counterId);
}

/**
 * Get active (waiting) queue entries for a specific service
 */
export function getActiveQueueForService(serviceId, entries = SEED_QUEUE_ENTRIES) {
  return entries.filter(
    e => e.serviceId === serviceId &&
    (e.status === QUEUE_STATUS.WAITING || e.status === QUEUE_STATUS.CALLED || e.status === QUEUE_STATUS.IN_SERVICE)
  );
}

/**
 * Get the counter prefix for token generation
 */
export function getCounterPrefix(counterId) {
  const prefixes = {
    'ctr-accounts': 'A',
    'ctr-academic': 'B',
    'ctr-student-services': 'C',
    'ctr-examination': 'D',
  };
  return prefixes[counterId] || 'X';
}

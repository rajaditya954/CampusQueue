// Queue Entry Statuses
export const QUEUE_STATUS = {
  WAITING: 'WAITING',
  CALLED: 'CALLED',
  IN_SERVICE: 'IN_SERVICE',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
};

// Counter Statuses
export const COUNTER_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  PAUSED: 'PAUSED',
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  STAFF: 'staff',
  ADMIN: 'admin',
};

// Feasibility Statuses
export const FEASIBILITY = {
  SAFE: 'SAFE',
  TIGHT: 'TIGHT',
  TOO_LATE: 'TOO_LATE',
};

// Confidence Levels
export const CONFIDENCE = {
  HIGH: 'HIGH',
  MODERATE: 'MODERATE',
  INITIAL: 'INITIAL',
};

// Feasibility display config
export const FEASIBILITY_CONFIG = {
  [FEASIBILITY.SAFE]: {
    label: 'Likely to complete before closing',
    icon: '🟢',
    color: 'success',
    description: 'You are likely to finish before the counter closes.',
  },
  [FEASIBILITY.TIGHT]: {
    label: 'Tight timing',
    icon: '🟡',
    color: 'warning',
    description: 'This may be close to the counter closing time.',
  },
  [FEASIBILITY.TOO_LATE]: {
    label: 'Unlikely to complete today',
    icon: '🔴',
    color: 'error',
    description: 'You are unlikely to complete this request before closing.',
  },
};

// Confidence display config
export const CONFIDENCE_CONFIG = {
  [CONFIDENCE.HIGH]: {
    label: 'High confidence',
    icon: '🟢',
    color: 'success',
    description: 'Based on extensive historical data',
  },
  [CONFIDENCE.MODERATE]: {
    label: 'Moderate confidence',
    icon: '🟡',
    color: 'warning',
    description: 'Based on limited historical data',
  },
  [CONFIDENCE.INITIAL]: {
    label: 'Initial estimate',
    icon: '⚪',
    color: 'default',
    description: 'Using baseline estimates, limited historical data',
  },
};

// Counter status display config
export const COUNTER_STATUS_CONFIG = {
  [COUNTER_STATUS.OPEN]: {
    label: 'Open',
    color: 'success',
    dotClass: 'open',
  },
  [COUNTER_STATUS.CLOSED]: {
    label: 'Closed',
    color: 'error',
    dotClass: 'closed',
  },
  [COUNTER_STATUS.PAUSED]: {
    label: 'Paused',
    color: 'warning',
    dotClass: 'paused',
  },
};

// Queue status display config
export const QUEUE_STATUS_CONFIG = {
  [QUEUE_STATUS.WAITING]: { label: 'Waiting', color: 'info' },
  [QUEUE_STATUS.CALLED]: { label: 'Called', color: 'warning' },
  [QUEUE_STATUS.IN_SERVICE]: { label: 'In Service', color: 'primary' },
  [QUEUE_STATUS.COMPLETED]: { label: 'Completed', color: 'success' },
  [QUEUE_STATUS.SKIPPED]: { label: 'Skipped', color: 'default' },
  [QUEUE_STATUS.CANCELLED]: { label: 'Cancelled', color: 'error' },
  [QUEUE_STATUS.NO_SHOW]: { label: 'No Show', color: 'default' },
};

// Service category icons
export const SERVICE_ICONS = {
  'Fee Payment': '💳',
  'Document Verification': '📄',
  'Bonafide Certificate': '🎓',
  'Scholarship Verification': '🏆',
  'ID Card Issue': '🪪',
  'Examination Form Submission': '📝',
  'Transcript Request': '📜',
  'General Enquiry': '❓',
  default: '📋',
};

// Tight timing buffer (minutes)
export const TIGHT_BUFFER_MINUTES = 15;

// Historical data thresholds
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 50,
  MODERATE: 10,
};

// Rolling average weights
export const ROLLING_AVERAGE_WEIGHTS = {
  RECENT: 0.7,
  HISTORICAL: 0.3,
};

// Demo mode flag
export const DEMO_MODE_KEY = 'campusQueue_demoMode';

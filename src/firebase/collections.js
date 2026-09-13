import { collection } from 'firebase/firestore';
import { db } from './config';

// Collection references
export const usersRef = () => collection(db, 'users');
export const studentsRef = () => collection(db, 'students');
export const servicesRef = () => collection(db, 'services');
export const countersRef = () => collection(db, 'counters');
export const queueEntriesRef = () => collection(db, 'queueEntries');
export const serviceHistoryRef = () => collection(db, 'serviceHistory');

// Collection names (for dynamic references)
export const COLLECTIONS = {
  USERS: 'users',
  STUDENTS: 'students',
  SERVICES: 'services',
  COUNTERS: 'counters',
  QUEUE_ENTRIES: 'queueEntries',
  SERVICE_HISTORY: 'serviceHistory',
};

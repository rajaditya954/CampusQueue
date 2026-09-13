/**
 * Firestore Database Seed Script
 * 
 * Run with: node scripts/seed-firestore.mjs
 * 
 * Populates Cloud Firestore with:
 * - 5 services
 * - 3 counters  
 * - 5 demo students
 * - Queue configuration
 * - Token counters
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

// ─── Firebase Config (from .env) ─────────────────────────────────────
const firebaseConfig = {
  apiKey: 'AIzaSyApbhbmAY7Iz_ad7I1hY9xBgDlgKRCFuNY',
  authDomain: 'gdsc-7721e.firebaseapp.com',
  projectId: 'gdsc-7721e',
  storageBucket: 'gdsc-7721e.firebasestorage.app',
  messagingSenderId: '1058654325183',
  appId: '1:1058654325183:web:301cf17cbaf5f9f770f90a',
  measurementId: 'G-88R8812BC5',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const now = Timestamp.now();

console.log('🔥 Connected to Firestore project:', firebaseConfig.projectId);
console.log('');

// ─── 1. SERVICES ─────────────────────────────────────────────────────
const services = [
  {
    id: 'cash-payment',
    serviceId: 'cash-payment',
    name: 'Cash Payment',
    description: 'Fee and cash payment service',
    category: 'Accounts',
    estimatedDuration: 2,
    averageProcessingTime: 2,
    minimumProcessingTime: 1,
    maximumProcessingTime: 5,
    requiredDocuments: ['Fee Challan', 'Student ID Card'],
    active: true,
    isActive: true,
    isDemo: false,
    completedCount: 0,
  },
  {
    id: 'document-verification',
    serviceId: 'document-verification',
    name: 'Document Verification',
    description: 'Verification of student documents',
    category: 'Academic',
    estimatedDuration: 8,
    averageProcessingTime: 8,
    minimumProcessingTime: 3,
    maximumProcessingTime: 15,
    requiredDocuments: ['Original Marksheets', 'ID Proof'],
    active: true,
    isActive: true,
    isDemo: false,
    completedCount: 0,
  },
  {
    id: 'certificate-request',
    serviceId: 'certificate-request',
    name: 'Certificate Request',
    description: 'Request and processing of certificates',
    category: 'Academic',
    estimatedDuration: 5,
    averageProcessingTime: 5,
    minimumProcessingTime: 2,
    maximumProcessingTime: 10,
    requiredDocuments: ['Application Form', 'Clearance Slip'],
    active: true,
    isActive: true,
    isDemo: false,
    completedCount: 0,
  },
  {
    id: 'admission-enquiry',
    serviceId: 'admission-enquiry',
    name: 'Admission Enquiry',
    description: 'General admission-related enquiry',
    category: 'Student Services',
    estimatedDuration: 10,
    averageProcessingTime: 10,
    minimumProcessingTime: 5,
    maximumProcessingTime: 20,
    requiredDocuments: ['Enquiry Form'],
    active: true,
    isActive: true,
    isDemo: false,
    completedCount: 0,
  },
  {
    id: 'id-card-service',
    serviceId: 'id-card-service',
    name: 'ID Card Service',
    description: 'Student ID card related service',
    category: 'Student Services',
    estimatedDuration: 6,
    averageProcessingTime: 6,
    minimumProcessingTime: 2,
    maximumProcessingTime: 10,
    requiredDocuments: ['Passport Photograph', 'Admission Slip'],
    active: true,
    isActive: true,
    isDemo: false,
    completedCount: 0,
  },
];

console.log('📋 Seeding SERVICES...');
for (const service of services) {
  const { id, ...data } = service;
  const ref = doc(db, 'services', id);
  await setDoc(ref, { ...data, createdAt: now, updatedAt: now });
  console.log(`   ✅ services/${id} — ${data.name}`);
}
console.log(`   → ${services.length} services written.\n`);

// ─── 2. COUNTERS ─────────────────────────────────────────────────────
const counters = [
  {
    id: 'ctr-accounts',
    code: 'CTR-A',
    name: 'Accounts Counter',
    location: 'Admin Block Room 101',
    supportedServices: ['cash-payment'],
    status: 'OPEN',
    operatingHours: { open: '09:00', close: '17:00' },
    isActive: true,
    isDemo: false,
    currentToken: null,
  },
  {
    id: 'ctr-academic',
    code: 'CTR-B',
    name: 'Academic Counter',
    location: 'Admin Block Room 102',
    supportedServices: ['document-verification', 'certificate-request'],
    status: 'OPEN',
    operatingHours: { open: '09:00', close: '17:00' },
    isActive: true,
    isDemo: false,
    currentToken: null,
  },
  {
    id: 'ctr-student-services',
    code: 'CTR-C',
    name: 'Student Services Counter',
    location: 'Student Activity Center',
    supportedServices: ['id-card-service', 'admission-enquiry'],
    status: 'OPEN',
    operatingHours: { open: '09:00', close: '17:00' },
    isActive: true,
    isDemo: false,
    currentToken: null,
  },
];

console.log('🏢 Seeding COUNTERS...');
for (const counter of counters) {
  const { id, ...data } = counter;
  const ref = doc(db, 'counters', id);
  await setDoc(ref, { ...data, createdAt: now, updatedAt: now });
  console.log(`   ✅ counters/${id} — ${data.name}`);
}
console.log(`   → ${counters.length} counters written.\n`);

// ─── 3. STUDENTS ─────────────────────────────────────────────────────
const students = [
  { studentId: '23CSE1001', name: 'Rahul Sharma' },
  { studentId: '23CSE1002', name: 'Priya Singh' },
  { studentId: '23CSE1003', name: 'Aman Verma' },
  { studentId: '23CSE1004', name: 'Sneha Patel' },
  { studentId: '23CSE1005', name: 'Demo Student' },
];

console.log('🎓 Seeding STUDENTS...');
for (const student of students) {
  const ref = doc(db, 'students', student.studentId);
  await setDoc(ref, {
    studentId: student.studentId,
    name: student.name,
    role: 'student',
    active: true,
    isDemo: true,
    createdAt: now,
    updatedAt: now,
  }, { merge: true });
  console.log(`   ✅ students/${student.studentId} — ${student.name}`);
}
console.log(`   → ${students.length} students written.\n`);

// ─── 4. CONFIG ───────────────────────────────────────────────────────
console.log('⚙️  Seeding CONFIG...');

await setDoc(doc(db, 'config', 'queue'), {
  queueEnabled: true,
  allowSkip: true,
  allowRejoin: true,
  maxQueueSize: 100,
  defaultServiceDuration: 5,
  createdAt: now,
  updatedAt: now,
}, { merge: true });
console.log('   ✅ config/queue');

await setDoc(doc(db, 'config', 'settings'), {
  queueEnabled: true,
  maxQueueSize: 100,
  allowSkip: true,
  allowRejoin: true,
  skipRejoinPolicy: 'MOVE_TO_END',
  createdAt: now,
  updatedAt: now,
}, { merge: true });
console.log('   ✅ config/settings');

await setDoc(doc(db, 'config', 'tokenCounters'), {
  'ctr-accounts': 0,
  'ctr-academic': 0,
  'ctr-student-services': 0,
}, { merge: true });
console.log('   ✅ config/tokenCounters');
console.log('   → Config documents written.\n');

// ─── SUMMARY ─────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════');
console.log('✅ DATABASE FULLY POPULATED');
console.log('═══════════════════════════════════════════');
console.log(`   Services:  ${services.length}`);
console.log(`   Counters:  ${counters.length}`);
console.log(`   Students:  ${students.length}`);
console.log(`   Config:    3 documents`);
console.log('═══════════════════════════════════════════');
console.log('');
console.log('Refresh your app to see the data!');

process.exit(0);

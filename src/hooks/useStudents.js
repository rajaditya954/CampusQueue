import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, isDemoMode } from '../firebase/config';
import {
  firestoreAddStudent,
  firestoreUpdateStudent,
  firestoreSetStudentActiveStatus,
} from '../firebase/firestoreService';
import { SEED_STUDENTS } from '../utils/seedData';

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time listener
  useEffect(() => {
    if (isDemoMode) {
      setStudents(SEED_STUDENTS);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        const list = snapshot.docs.map(d => ({
          id: d.id,
          studentId: d.id,
          ...d.data(),
        }));
        setStudents(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Error fetching students from Firestore:', err);
        setError('Unable to load students from Firestore. Please try again.');
        setStudents([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addStudent = useCallback(async (studentData) => {
    try {
      setError(null);
      return await firestoreAddStudent(studentData);
    } catch (err) {
      console.error('addStudent error:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const updateStudent = useCallback(async (studentId, updates) => {
    try {
      setError(null);
      await firestoreUpdateStudent(studentId, updates);
    } catch (err) {
      console.error('updateStudent error:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const setStudentActiveStatus = useCallback(async (studentId, active) => {
    try {
      setError(null);
      await firestoreSetStudentActiveStatus(studentId, active);
    } catch (err) {
      console.error('setStudentActiveStatus error:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    students,
    loading,
    error,
    addStudent,
    updateStudent,
    setStudentActiveStatus,
    clearError: () => setError(null),
  };
}

export default useStudents;

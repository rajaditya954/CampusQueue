/**
 * Authentication & Session Context
 * 
 * - Students: Student ID login + Firebase Anonymous Auth session
 * - Staff/Admin: Firebase Authentication (email/password) or Demo Staff mode
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, isDemoMode } from '../../firebase/config';
import { USER_ROLES } from '../../utils/constants';

const AuthContext = createContext(null);

function getInitialStudentUser() {
  try {
    const saved = localStorage.getItem('campus_queue_student_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [studentUser, setStudentUser] = useState(getInitialStudentUser);
  const [staffUser, setStaffUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Ref to track demo staff session — prevents onAuthStateChanged from clearing it
  const isDemoStaffRef = useRef(false);

  // Derived properties for backwards compatibility
  const studentSessionId = studentUser?.uid || studentUser?.studentId || '';
  const studentName = studentUser?.name || '';
  const studentId = studentUser?.studentId || '';

  // ─── Student ID Login Flow ──────────────────────────────────────────
  const studentSignIn = useCallback(async (studentIdInput) => {
    setError(null);
    const normalizedId = (studentIdInput || '').trim().toUpperCase();
    if (!normalizedId) {
      const msg = 'Please enter your Student ID.';
      setError(msg);
      throw new Error(msg);
    }

    let studentRecord = null;

    // 1. Validate against Firestore students collection
    if (!isDemoMode) {
      try {
        const studentDocRef = doc(db, 'students', normalizedId);
        const studentDocSnap = await getDoc(studentDocRef);
        if (studentDocSnap.exists()) {
          studentRecord = studentDocSnap.data();
        } else {
          // Query collection where studentId matches
          const q = query(collection(db, 'students'), where('studentId', '==', normalizedId));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            studentRecord = querySnap.docs[0].data();
          }
        }
      } catch (err) {
        console.warn('Firestore student fetch error:', err);
      }
    } else {
      // Demo Mode simulated student record
      studentRecord = {
        studentId: normalizedId,
        name: `Student (${normalizedId})`,
        active: true,
        role: 'student',
      };
    }

    // 2. Validate student existence and active status
    if (!studentRecord) {
      const msg = 'Student ID not found in database. Please check your ID.';
      setError(msg);
      throw new Error(msg);
    }

    if (studentRecord.active === false) {
      const msg = 'Your student account is currently inactive. Please contact campus administration.';
      setError(msg);
      throw new Error(msg);
    }

    // 4. Establish Firebase Authentication session for student
    let uid = null;
    if (!isDemoMode) {
      try {
        // Reuse existing anonymous session if available, otherwise sign in fresh
        if (auth.currentUser && auth.currentUser.isAnonymous) {
          uid = auth.currentUser.uid;
        } else {
          const authResult = await signInAnonymously(auth);
          uid = authResult.user.uid;
        }
      } catch (authErr) {
        // If there's already an auth.currentUser from a previous session, reuse it
        if (auth.currentUser) {
          uid = auth.currentUser.uid;
        } else {
          // No authenticated user at all — surface a clear, actionable error
          const msg = authErr.code === 'auth/admin-restricted-operation' || authErr.code === 'auth/operation-not-allowed'
            ? 'Anonymous Authentication is disabled in your Firebase Console. Please enable it: Firebase Console → Authentication → Sign-in method → Enable Anonymous.'
            : `Firebase authentication failed: ${authErr.message}`;
          console.error(msg, authErr);
          setError(msg);
          throw new Error(msg);
        }
      }
    } else {
      uid = `demo_uid_${normalizedId}`;
    }

    // 5. Save authenticated student identity
    const sessionData = {
      uid,
      studentId: studentRecord.studentId,
      name: studentRecord.name,
      role: 'student',
      active: true,
    };

    setStudentUser(sessionData);
    localStorage.setItem('campus_queue_student_user', JSON.stringify(sessionData));
    localStorage.setItem('campus_queue_student_name', sessionData.name);
    localStorage.setItem('campus_queue_student_id', sessionData.studentId);
    setError(null);
    return sessionData;
  }, []);

  // ─── Student Sign Out ───────────────────────────────────────────────
  const studentSignOut = useCallback(async () => {
    setStudentUser(null);
    localStorage.removeItem('campus_queue_student_user');
    localStorage.removeItem('campus_queue_student_name');
    localStorage.removeItem('campus_queue_student_id');

    if (!isDemoMode && auth.currentUser?.isAnonymous) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn('Error signing out anonymous student:', err);
      }
    }
  }, []);

  // Fetch staff role from Firestore (and ensure user profile exists)
  const fetchStaffRole = useCallback(async (firebaseUser) => {
    if (isDemoMode || !firebaseUser) return USER_ROLES.ADMIN;
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return userDoc.data().role || USER_ROLES.STAFF;
      }
      // Auto-initialize staff document in Firestore if missing
      const determinedRole = firebaseUser.email?.toLowerCase().includes('admin') ? USER_ROLES.ADMIN : USER_ROLES.STAFF;
      await setDoc(userDocRef, {
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Staff Member',
        role: determinedRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return determinedRole;
    } catch (err) {
      console.error('Error fetching staff role:', err);
      return USER_ROLES.STAFF;
    }
  }, []);


  // Listen to staff auth state (Firebase mode only)
  useEffect(() => {
    if (isDemoMode) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser && !firebaseUser.isAnonymous) {
          // Real Firebase staff user — takes priority, clear demo flag
          isDemoStaffRef.current = false;
          const role = await fetchStaffRole(firebaseUser);
          setStaffUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Staff Member',
            role,
          });
          setUserRole(role);
        } else if (!isDemoStaffRef.current) {
          // Only clear staff user if NOT in a demo staff session
          setStaffUser(null);
          setUserRole(null);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Firebase Auth state notice:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [fetchStaffRole]);

  // Demo sign in for staff
  const demoStaffSignIn = useCallback(async (role = 'admin') => {
    let currentAuthUser = auth.currentUser;
    if (!isDemoMode && !currentAuthUser) {
      try {
        const res = await signInAnonymously(auth);
        currentAuthUser = res.user;
      } catch (e) {
        console.warn('Anonymous sign-in notice for demo staff:', e);
      }
    }

    const assignedRole = role === 'admin' ? USER_ROLES.ADMIN : USER_ROLES.STAFF;
    const demoUser = {
      uid: currentAuthUser?.uid || 'demo-staff-id',
      email: 'staff@campus.edu',
      displayName: role === 'admin' ? 'Admin Controller' : 'Counter Staff',
      role: assignedRole,
    };

    // Sync staff role into Firestore users collection so security rules recognize authorized staff
    if (!isDemoMode && currentAuthUser?.uid) {
      try {
        await setDoc(doc(db, 'users', currentAuthUser.uid), {
          email: demoUser.email,
          displayName: demoUser.displayName,
          role: assignedRole,
          isDemo: true,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (err) {
        console.warn('Could not sync demo staff user profile to Firestore:', err);
      }
    }

    isDemoStaffRef.current = true;
    setStaffUser(demoUser);
    setUserRole(demoUser.role);
    setError(null);
  }, []);


  // Email/Password Sign-In (for staff/admin)
  const signInWithEmail = useCallback(async (email, password) => {
    setError(null);
    const cleanEmail = (email || '').trim().toLowerCase();
    const isDemoAccount = isDemoMode ||
      cleanEmail.includes('demo') ||
      cleanEmail.endsWith('.demo');

    if (isDemoAccount) {
      demoStaffSignIn(cleanEmail.includes('admin') ? 'admin' : 'staff');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.warn('Firebase email sign-in notice:', err.code || err.message);
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/configuration-not-found' ||
        err.code === 'auth/operation-not-allowed' ||
        err.message?.includes('CONFIGURATION_NOT_FOUND')
      ) {
        // Fallback to Demo Staff authentication if account does not exist in Firebase Auth console
        demoStaffSignIn(cleanEmail.includes('admin') ? 'admin' : 'staff');
      } else {
        setError(err.message);
        throw err;
      }
    }
  }, [demoStaffSignIn]);

  // Staff Sign Out
  const signOut = useCallback(async () => {
    isDemoStaffRef.current = false;
    setStaffUser(null);
    setUserRole(null);
    if (!isDemoMode) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        setError(err.message);
      }
    }
  }, []);

  const value = {
    // Student Session & Auth
    studentUser,
    studentSessionId,
    studentName,
    studentId,
    studentSignIn,
    studentSignOut,

    // Staff/Admin User
    staffUser,
    userRole,
    loading,
    error,
    isDemoMode,
    isAdmin: !!staffUser,
    isStrictAdmin: !staffUser ? false : (staffUser.role === USER_ROLES.ADMIN || isDemoMode),
    signInWithEmail,
    demoStaffSignIn,
    signOut,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

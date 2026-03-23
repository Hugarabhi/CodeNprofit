//  codenprofit — Firebase Configuration (compat SDK)
//  Project: codenprofit-17152
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyC1Ps2vP8ilQNPp9zeaxP9sGBglGVKBSPM",
  authDomain: "codenprofit-17152.firebaseapp.com",
  projectId: "codenprofit-17152",
  storageBucket: "codenprofit-17152.firebasestorage.app",
  messagingSenderId: "340619486766",
  appId: "1:340619486766:web:4600dd0ce05467c46ba1bf",
  measurementId: "G-0KMHJ2Z0PP"
};

let _app, _auth, _db;
let _initialized = false;

// ── Initialize ────────────────────────────────────────────────
function initializeFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK not loaded');
    return false;
  }
  try {
    _app  = firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(firebaseConfig);
    _auth = firebase.auth();
    _db   = firebase.firestore();

    // Enable offline persistence (single tab only to avoid multi-tab index conflicts)
    _db.enablePersistence()
       .catch(err => {
         if (err.code === 'failed-precondition') {
           console.warn('Persistence disabled: multiple tabs open');
         } else if (err.code === 'unimplemented') {
           console.warn('Persistence not supported in this browser');
         } else {
           console.warn('Persistence error:', err.code);
         }
       });

    // Analytics (optional, won't crash if blocked)
    if (typeof firebase.analytics === 'function') {
      try { firebase.analytics(); } catch(e) {}
    }

    _initialized = true;
    console.log('✅ Firebase ready — project:', firebaseConfig.projectId);
    return true;
  } catch (err) {
    console.error('❌ Firebase init failed:', err);
    return false;
  }
}

// ── Helpers ───────────────────────────────────────────────────
const ts = () => firebase.firestore.FieldValue.serverTimestamp();
const guard = () => { if (!_initialized) throw new Error('Firebase not initialized'); };

// ── FirebaseService ───────────────────────────────────────────
const FirebaseService = {

  isInitialized: () => _initialized,
  getAuth: () => _auth,
  getDb:   () => _db,

  // ── AUTH ──────────────────────────────────────────────────

  signUp: async (email, password, userData) => {
    try {
      guard();
      const cred = await _auth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: userData.displayName });

      const col = userData.userType === 'developer' ? 'developers' : 'hosts';
      await _db.collection(col).doc(cred.user.uid).set({
        ...userData,
        uid: cred.user.uid,
        email,
        createdAt: ts(),
        updatedAt: ts()
      });
      return { success: true, user: cred.user };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  signIn: async (email, password) => {
    try {
      guard();
      const cred = await _auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: cred.user };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  signOut: async () => {
    try {
      const currentUser = _auth.currentUser;
      await _auth.signOut();
      // Only clear app-specific items, not all localStorage
      if (currentUser) {
        localStorage.removeItem('cnp_subscription_' + currentUser.uid);
        localStorage.removeItem('cnp_stars_' + currentUser.uid);
        localStorage.removeItem('cnp_steps_' + currentUser.uid);
        localStorage.removeItem('cnp_referrals_' + currentUser.uid);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  resetPassword: async (email) => {
    try {
      guard();
      await _auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // ── USER DATA ─────────────────────────────────────────────

  getUserType: async (uid) => {
    try {
      guard();
      let doc = await _db.collection('developers').doc(uid).get();
      if (doc.exists) return { success: true, type: 'developer', data: doc.data() };
      doc = await _db.collection('hosts').doc(uid).get();
      if (doc.exists) return { success: true, type: 'host', data: doc.data() };
      return { success: false, error: 'User record not found' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  updateProfile: async (userType, uid, data) => {
    try {
      guard();
      const col = userType === 'developer' ? 'developers' : 'hosts';
      await _db.collection(col).doc(uid).update({ ...data, updatedAt: ts() });
      // Also update auth display name if provided
      if (data.displayName && _auth.currentUser) {
        await _auth.currentUser.updateProfile({ displayName: data.displayName });
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // ── DEVELOPERS ────────────────────────────────────────────

  getDevelopers: async (filters = {}) => {
    try {
      guard();
      let q = _db.collection('developers');
      if (filters.available) q = q.where('available', '==', true);
      if (filters.skill) q = q.where('primarySkill', '==', filters.skill);
      const snap = await q.get();
      return { success: true, developers: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // ── PROJECTS ──────────────────────────────────────────────

  getProjects: async (hostId = null) => {
    try {
      guard();
      let q = _db.collection('projects').orderBy('createdAt', 'desc');
      if (hostId) q = _db.collection('projects').where('hostId', '==', hostId).orderBy('createdAt', 'desc');
      const snap = await q.get();
      return { success: true, projects: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (e) {
      // Fallback without orderBy if index missing
      try {
        let q2 = _db.collection('projects');
        if (hostId) q2 = q2.where('hostId', '==', hostId);
        const snap2 = await q2.get();
        return { success: true, projects: snap2.docs.map(d => ({ id: d.id, ...d.data() })) };
      } catch(e2) {
        return { success: false, error: e2.message };
      }
    }
  },

  createProject: async (data) => {
    try {
      guard();
      // Sanitize: remove undefined values before writing to Firestore
      const safe = {};
      Object.keys(data).forEach(k => { if (data[k] !== undefined) safe[k] = data[k]; });
      const ref = await _db.collection('projects').add({ ...safe, status: 'open', createdAt: ts() });
      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  updateProject: async (projectId, data) => {
    try {
      guard();
      await _db.collection('projects').doc(projectId).update({ ...data, updatedAt: ts() });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  deleteProject: async (projectId) => {
    try {
      guard();
      await _db.collection('projects').doc(projectId).delete();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // ── HIRE REQUESTS ─────────────────────────────────────────

  sendHireRequest: async (data) => {
    try {
      guard();
      // Sanitize: replace undefined with empty string
      const safe = {
        hostId:         data.hostId         || '',
        hostName:       data.hostName       || '',
        companyName:    data.companyName    || '',
        developerId:    data.developerId    || '',
        message:        data.message        || '',
        projectId:      data.projectId      || null,
        projectTitle:   data.projectTitle   || '',
        proposedBudget: data.proposedBudget || ''
      };
      if (!safe.hostId || !safe.developerId) return { success: false, error: 'Missing required fields' };
      const existing = await _db.collection('hireRequests')
        .where('hostId', '==', safe.hostId)
        .where('developerId', '==', safe.developerId).get();
      if (!existing.empty) return { success: false, error: 'Request already sent to this developer' };
      const ref = await _db.collection('hireRequests').add({ ...safe, status: 'pending', createdAt: ts() });
      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getHireRequests: async (developerId) => {
    try {
      guard();
      const snap = await _db.collection('hireRequests').where('developerId', '==', developerId).get();
      return { success: true, requests: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getSentHireRequests: async (hostId) => {
    try {
      guard();
      const snap = await _db.collection('hireRequests').where('hostId', '==', hostId).get();
      return { success: true, requests: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Get hire requests received by a developer
  getHireRequests: async (developerId) => {
    try {
      guard();
      const snap = await _db.collection('hireRequests').where('developerId', '==', developerId).get();
      return { success: true, requests: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // ── APPLICATIONS ──────────────────────────────────────────

  applyToProject: async (data) => {
    try {
      guard();
      // Sanitize all fields - Firestore rejects undefined values
      const safe = {
        developerId:    data.developerId    || '',
        developerName:  data.developerName  || '',
        developerSkill: data.developerSkill || '',
        projectId:      data.projectId      || '',
        hostId:         data.hostId         || '',
        projectTitle:   data.projectTitle   || '',
        hostName:       data.hostName       || ''
      };
      if (!safe.developerId || !safe.projectId) return { success: false, error: 'Missing required fields' };
      const existing = await _db.collection('applications')
        .where('developerId', '==', safe.developerId)
        .where('projectId',   '==', safe.projectId).get();
      if (!existing.empty) return { success: false, error: 'Already applied to this project' };
      const ref = await _db.collection('applications').add({ ...safe, status: 'pending', createdAt: ts() });
      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getApplications: async (hostId) => {
    try {
      guard();
      const snap = await _db.collection('applications').where('hostId', '==', hostId).get();
      return { success: true, applications: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getDevApplications: async (developerId) => {
    try {
      guard();
      const snap = await _db.collection('applications').where('developerId', '==', developerId).get();
      return { success: true, applications: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // ── STATUS UPDATES ────────────────────────────────────────

  updateStatus: async (collection, docId, status) => {
    try {
      guard();
      await _db.collection(collection).doc(docId).update({ status, updatedAt: ts() });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // ── MESSAGES ──────────────────────────────────────────────

  sendMessage: async (data) => {
    try {
      guard();
      const ref = await _db.collection('messages').add({ ...data, read: false, createdAt: ts() });
      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getMessages: async (userId) => {
    try {
      guard();
      const snap = await _db.collection('messages')
        .where('toId', '==', userId)
        .orderBy('createdAt', 'desc').get();
      return { success: true, messages: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // ── SUBSCRIPTION MANAGEMENT ─────────────────────────────────

  saveSubscription: async (userId, subscriptionData) => {
    try {
      guard();
      await _db.collection('subscriptions').doc(userId).set({
        ...subscriptionData,
        updatedAt: ts()
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getSubscription: async (userId) => {
    try {
      guard();
      const doc = await _db.collection('subscriptions').doc(userId).get();
      if (doc.exists) {
        return { success: true, data: doc.data() };
      }
      return { success: true, data: null };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Helper to check and update subscription status
  checkAndUpdateSubscription: async (userId) => {
    try {
      guard();
      const result = await FirebaseService.getSubscription(userId);
      if (!result.success || !result.data) {
        return { success: true, isActive: false };
      }
      
      const subData = result.data;
      const now = Date.now();
      
      // Check if subscription is expired
      if (now > subData.endDate) {
        // Subscription expired, delete it
        await _db.collection('subscriptions').doc(userId).delete();
        return { success: true, isActive: false };
      }
      
      return { success: true, isActive: true, data: subData };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  // 🔹 Get Course (Learning Path)
  async getCourse(courseId) {
    try {
      const doc = await _db.collection("courses").doc(courseId).get();

      if (!doc.exists) {
        return { success: false, error: "Course not found" };
      }

      return { success: true, data: doc.data() };

    } catch (err) {
      console.error(err);
      return { success: false, error: err.message };
    }
  },

  // 🔹 Get Module Content — see arrow function below
  getModule: async (moduleId) => {
    try {
      guard();
      // Fetch the main module document
      const doc = await _db.collection('modules').doc(moduleId).get();
      if (!doc.exists) {
        return { success: false, error: "Module not found" };
      }
      const moduleData = doc.data();
      // Fetch chapters subcollection, ordered by 'order' field
      try {
        const chaptersSnap = await _db
          .collection('modules').doc(moduleId)
          .collection('chapters').orderBy('order').get();
        moduleData.chapters = chaptersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {
        // Fallback without orderBy if index missing
        const chaptersSnap = await _db
          .collection('modules').doc(moduleId)
          .collection('chapters').get();
        moduleData.chapters = chaptersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      return { success: true, data: moduleData };
    } catch (err) {
      console.error('Error fetching module:', err);
      return { success: false, error: err.message };
    }
  },

  // ── MODULE COMPLETION ─────────────────────────────────────────

  // Save that a user completed a module
  saveModuleCompletion: async (userId, skill, moduleId, badge) => {
    try {
      guard();
      const key = skill + '_' + moduleId;
      await _db.collection('userProgress').doc(userId).set({
        completedModules: {
          [key]: {
            skill,
            moduleId,
            badge,
            completedAt: ts()
          }
        }
      }, { merge: true });
      return { success: true };
    } catch (err) {
      console.error('Error saving module completion:', err);
      return { success: false, error: err.message };
    }
  },

  // Get all completed modules for a user
  getModuleCompletions: async (userId) => {
    try {
      guard();
      const doc = await _db.collection('userProgress').doc(userId).get();
      if (!doc.exists) return { success: true, completedModules: {} };
      const data = doc.data();
      return { success: true, completedModules: data.completedModules || {} };
    } catch (err) {
      console.error('Error fetching module completions:', err);
      return { success: false, error: err.message };
    }
  }
};

window.FirebaseService    = FirebaseService;
window.initializeFirebase = initializeFirebase;
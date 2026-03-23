// ==================== GLOBAL VARIABLES ====================
let isSubscribed = false;
let subscriptionStartDate = null;
let subscriptionEndDate = null;
let earnedStars = 0;
let completedSteps = {}; // For backward compatibility
let completedTopics = {}; // New for module-based learning
let allProjects = [];
let appliedIds = new Set();
let activeFilter = 'all';
let currentExam = null;
let currentQ = 0;
let score = 0;
let answered = false;
let selectedSentiment = "";
let autoMessage = "";
let CU = null;
let UD = null;
let userSkills = [];
let isAvail = true;
let referralCount = 0;
let completedProjects = 0;
let totalEarnings = 0;
let currentBudgetFilter = 1000;
let currentLearningPath = 'Full Stack Developer';
let adIdx = 0;
let adIdx2 = 0;
let currentSubStep = 0;

// ==================== EMAILJS INITIALIZATION ====================
(function(){
  emailjs.init("z3qUjuttUkNzC70rx"); // ✅ Your correct public key
  console.log("✅ EmailJS initialized");
})();

// ==================== SEND AUTO-REPLY EMAIL ====================
function sendAutoReply(name, email) {
  const params = {
    user_name: name,
    user_email: email  // Keep this if you change template to use user_email
    // OR use "email": email if you keep template as {{email}}
  };

  console.log("📧 Sending to:", email);
  console.log("📧 Params:", params);

  return emailjs.send("service_deez137", "template_in1ybqu", params)
    .then((response) => {
      console.log("✅ Email sent successfully:", response);
      showToast("📩 Confirmation email sent!");
    })
    .catch((err) => {
      console.error("❌ Email failed:", err);
      console.error("❌ Status:", err.status);
      console.error("❌ Message:", err.text);
      
      // Don't block user flow
      showToast("✅ Payment confirmed! Proceeding...");
    });
}

// ==================== SEND AUTO-REPLY EMAIL ====================
// ==================== SEND AUTO-REPLY EMAIL ====================
function sendAutoReply(name, email) {
  const params = {
    user_name: name,
    user_email: email
  };

  console.log("📧 Sending to:", email);
  console.log("📧 Params:", params);

  return emailjs.send("service_deez137", "template_in1ybqu", params)
    .then((response) => {
      console.log("✅ Email sent successfully:", response);
      showToast("📩 Confirmation email sent!");
    })
    .catch((err) => {
      console.error("❌ Email failed:", err);
      // Don't block user flow
      showToast("✅ Payment confirmed! Proceeding...");
    });
}

// ==================== HANDLE PAID NOW ====================
function handlePaidNow() {
  const name = document.getElementById('payName')?.value.trim();
  const email = document.getElementById('payEmail')?.value.trim();

  if (!name || !email) {
    showToast("⚠ Please fill all details");
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    showToast("⚠ Please enter a valid email");
    return;
  }

  showToast("⏳ Processing payment...");
  sendAutoReply(name, email);

  setTimeout(() => {
    showToast("✅ Proceeding to activation");
    subNextStep(2);
  }, 1500);
}

// ==================== HANDLE ALREADY PAID ====================
function handleAlreadyPaid() {
  showToast("➡ Proceeding to activation");
  subNextStep(2);
}

// ==================== UNLOCK PAYMENT ====================
function unlockPayment() {
  const name = document.getElementById('payName').value.trim();
  const email = document.getElementById('payEmail').value.trim();

  if (!name || name.length < 3) {
    showToast("⚠ Enter valid name");
    return;
  }

  if (!email || !email.includes("@")) {
    showToast("⚠ Enter valid email");
    return;
  }

  showToast("✅ Details saved! You can now pay with Razorpay");

  setTimeout(() => {
    const razorpayForm = document.querySelector('form');
    if (razorpayForm) {
      razorpayForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}
// ==================== CHECK SUBSCRIPTION ====================
async function checkSubscription() {
  if (!CU) {
    console.log('No user logged in');
    return;
  }
  
  // Check subscription in Firestore
  const result = await FirebaseService.checkAndUpdateSubscription(CU.uid);
  
  if (result.success && result.isActive) {
    // Subscription is active
    isSubscribed = true;
    subscriptionStartDate = result.data.startDate;
    subscriptionEndDate = result.data.endDate;
    
    console.log('Subscription active, expires:', new Date(result.data.endDate).toLocaleDateString());
    
    // Also cache in localStorage for quick access
    localStorage.setItem('cnp_subscription_' + CU.uid, JSON.stringify({
      startDate: subscriptionStartDate,
      endDate: subscriptionEndDate
    }));
    
    // Update UI
    updatePremiumUI();
    updateSubscriptionUI();
  } else {
    // No active subscription
    isSubscribed = false;
    subscriptionStartDate = null;
    subscriptionEndDate = null;
    
    // Clear from localStorage
    localStorage.removeItem('cnp_subscription_' + CU.uid);
    
    updateSubscriptionUI();
  }
}

function updatePremiumUI() {
  if (!isSubscribed || !subscriptionEndDate) {
    // Hide premium elements
    const premiumBadge = document.getElementById('premiumActiveBadge');
    if (premiumBadge) premiumBadge.style.display = 'none';
    
    const premiumBanner = document.getElementById('premiumActiveBanner');
    if (premiumBanner) premiumBanner.style.display = 'none';
    
    const browseSubStrip = document.getElementById('browseSubStrip');
    if (browseSubStrip) browseSubStrip.style.display = 'flex';
    
    return;
  }
  
  const now = Date.now();
  const remainingMs = subscriptionEndDate - now;
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  
  // Update expiry days display
  const expiryDaysEl = document.getElementById('expiryDays');
  if (expiryDaysEl) expiryDaysEl.textContent = remainingDays;
  
  // Show premium active badge
  const premiumBadge = document.getElementById('premiumActiveBadge');
  if (premiumBadge) premiumBadge.style.display = 'block';
  
  // Update browse projects banner
  const browseSubStrip = document.getElementById('browseSubStrip');
  const premiumBanner = document.getElementById('premiumActiveBanner');
  if (browseSubStrip) browseSubStrip.style.display = 'none';
  if (premiumBanner) premiumBanner.style.display = 'block';
}

function updateSubscriptionUI() {
  // Update any subscription-related UI elements
  const subBtn = document.getElementById('subBtn');
  if (subBtn) {
    if (isSubscribed) {
      subBtn.innerHTML = '<i class="fas fa-check"></i> Premium Active';
      subBtn.classList.add('btn-applied');
    } else {
      subBtn.innerHTML = 'Get Premium';
      subBtn.classList.remove('btn-applied');
    }
  }
  
  // Update the browse projects page based on subscription status
  const browseSubStrip = document.getElementById('browseSubStrip');
  const premiumBanner = document.getElementById('premiumActiveBanner');
  
  if (browseSubStrip && premiumBanner) {
    if (isSubscribed) {
      browseSubStrip.style.display = 'none';
      premiumBanner.style.display = 'block';
    } else {
      browseSubStrip.style.display = 'flex';
      premiumBanner.style.display = 'none';
    }
  }
  
  // Re-render projects to update lock status
  if (allProjects.length > 0) {
    renderProjects(allProjects);
  }
}

async function activateSubscriptionWithCoupon() {
  const now = Date.now();
  const endDate = now + (30 * 24 * 60 * 60 * 1000); // 30 days

  subscriptionStartDate = now;
  subscriptionEndDate = endDate;
  isSubscribed = true;

  const saveResult = await FirebaseService.saveSubscription(CU.uid, {
    startDate: now,
    endDate: endDate,
    activatedAt: now,
    method: 'coupon'
  });

  if (saveResult.success) {
    localStorage.setItem('cnp_subscription_' + CU.uid, JSON.stringify({
      startDate: now,
      endDate: endDate
    }));
    console.log('Subscription saved to Firestore for user:', CU.uid);
  } else {
    console.error('Failed to save subscription:', saveResult.error);
    showToast('⚠ Error saving subscription. Please contact support.');
    return;
  }

  updatePremiumUI();
  updateSubscriptionUI();

  const expiryDate = new Date(endDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  // ⚠ NOTE: success UI is injected into subStep2 (the coupon step, index 2)
  const subStep2 = document.getElementById('subStep2');
  if (subStep2) {
    subStep2.innerHTML = `
      <div class="success-message" style="text-align:center;padding:20px 0;">
        <i class="fas fa-check-circle" style="font-size:52px;color:var(--green);margin-bottom:12px;display:block;"></i>
        <h3 style="margin-bottom:8px;">Premium Activated!</h3>
        <p>Your premium subscription has been successfully activated.</p>
        <p>You now have access to all premium projects and features.</p>
        <p style="margin-top:8px;"><strong>Your subscription will expire in 30 days.</strong></p>
        <div style="margin-top:12px;padding:10px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:10px;font-size:13px;">
          <i class="fas fa-calendar-alt"></i> Expires: ${expiryDate}
        </div>
        <p style="margin-top:20px;font-size:12px;color:var(--muted);">Thank you for subscribing to CodenProfit!</p>
        <button class="btn-primary" style="margin-top:20px;width:100%;" onclick="closeModal('subModal'); location.reload();">
          <i class="fas fa-arrow-right"></i> Back to Dashboard
        </button>
      </div>
    `;
  }

  showToast('🎉 Premium subscription activated successfully!');

  if (allProjects.length > 0) {
    renderProjects(allProjects);
  }
}

function activatePremiumWithCoupon() {
  const couponInput = document.getElementById('couponCodeInput');
  if (!couponInput) return;

  const couponCode = couponInput.value.trim().toUpperCase();

  if (!couponCode) {
    showToast('⚠ Please enter a coupon code');
    return;
  }

  const VALID_COUPONS = [
    'STUDENT69','CPVIP2026','CPSTART69','CNP2024','DEVPRO30',
    'ZEAL2025','ENJOYPREM','BILL69','LEARN69','BUILDPREM','CREATE69'
  ];

  if (VALID_COUPONS.includes(couponCode)) {
    activateSubscriptionWithCoupon();
  } else {
    showToast('❌ Invalid coupon code. Please check and try again.');
  }
}

// ==================== SUBSCRIPTION MODAL ====================
function openSubModal() {
  if (isSubscribed) {
    showToast('🌟 Premium is already active!');
    return;
  }
  currentSubStep = 0;
  renderSubStep(0);
  document.getElementById('subModal').classList.add('open');
}

function subNextStep(n) {
  currentSubStep = n;
  renderSubStep(n);
}

function renderSubStep(n) {
  const steps = document.querySelectorAll('.sub-step-content');
  const dots = document.querySelectorAll('.sub-step-dot');

  steps.forEach((el, i) => el.classList.toggle('active', i === n));
  dots.forEach((el, i) => el.classList.toggle('done', i <= n));

  const titles = ['Premium Benefits', 'Payment', 'Activation'];
  const titleEl = document.getElementById('subModalTitle');
  if (titleEl) {
    titleEl.innerHTML = '<i class="fas fa-crown"></i> ' + titles[n];
  }
}

// ==================== AD ROTATOR ====================
function rotateAd(prefix, count) {
  const cur = document.getElementById(prefix + (adIdx % count));
  if (cur) cur.classList.remove('visible');
  adIdx = (adIdx + 1) % count;
  const nxt = document.getElementById(prefix + adIdx);
  if (nxt) nxt.classList.add('visible');
  for (let i = 0; i < count; i++) {
    const dot = document.getElementById(prefix.replace('ad','adDot') + i) || document.getElementById('adDot' + i);
    if (dot) dot.classList.toggle('active', i === adIdx);
  }
}

function rotateAd2() {
  const cur = document.getElementById('ad2_' + (adIdx2 % 3));
  if (cur) cur.classList.remove('visible');
  adIdx2 = (adIdx2 + 1) % 3;
  const nxt = document.getElementById('ad2_' + adIdx2);
  if (nxt) nxt.classList.add('visible');
  for (let i = 0; i < 3; i++) {
    const dot = document.getElementById('ad2Dot' + i);
    if (dot) dot.classList.toggle('active', i === adIdx2);
  }
}

setInterval(() => rotateAd('ad', 4), 4000);
setInterval(rotateAd2, 3500);

// ==================== WELCOME ANIMATION ====================
function startWelcomeAnimation() {
  console.log('Starting welcome animation');
  const welcomeOverlay = document.getElementById('welcomeOverlay');
  const welcomeProgress = document.getElementById('welcomeProgress');
  const welcomePercent = document.getElementById('welcomePercent');
  
  if (!welcomeOverlay || !welcomeProgress || !welcomePercent) {
    console.error('Welcome elements not found');
    return;
  }
  
  let progress = 0;
  const totalTime = 2000;
  const incrementTime = 30;
  const step = 100 / (totalTime / incrementTime);

  const interval = setInterval(() => {
    progress += step;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      setTimeout(() => {
        welcomeOverlay.style.opacity = '0';
        setTimeout(() => {
          welcomeOverlay.style.display = 'none';
          showOfferPopup();
        }, 400);
      }, 100);
    }
    
    welcomeProgress.style.width = progress + '%';
    welcomePercent.textContent = Math.round(progress) + '%';
  }, incrementTime);
}

// ==================== OFFER POPUP ====================
function showOfferPopup() {
  if (!sessionStorage.getItem('offerShown')) {
    setTimeout(() => {
      const popup = document.getElementById('offerPopup');
      if (popup) popup.classList.add('open');
      sessionStorage.setItem('offerShown', 'true');
    }, 300);
  }
}

function closeOfferPopup() {
  const popup = document.getElementById('offerPopup');
  if (popup) popup.classList.remove('open');
  showToast('👋 Offer saved for later!');
}

function claimOffer() {
  closeOfferPopup();
  openSubModal();
  showToast('🎉 Great choice! Complete your subscription.');
}

function startOfferTimer() {
  const timerElement = document.getElementById('offerTimer');
  if (!timerElement) return;
  
  const endTime = new Date().getTime() + (24 * 60 * 60 * 1000);
  
  const timerInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = endTime - now;
    
    if (distance < 0) {
      clearInterval(timerInterval);
      timerElement.textContent = 'EXPIRED';
      return;
    }
    
    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    timerElement.textContent = 
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

// ==================== QR CODE FUNCTIONS ====================
function downloadQR(){
  const url = "https://drive.google.com/uc?export=view&id=11nZWJI6nPQaynzFRTLo0PzqZMVH06IBk";
  window.open(url, "_blank");
}

// ==================== FEEDBACK FUNCTIONS ====================
function setSentiment(sentiment, message) {
  selectedSentiment = sentiment;
  autoMessage = message;
  showToast("Selected: " + sentiment);
}

function sendFeedback() {
  const name = UD ? (UD.displayName || "Student") : "Student";
  const suggestion = document.getElementById('feedbackText').value;
  
  if (!selectedSentiment) {
    showToast("⚠️ Please select a sentiment first!");
    return;
  }

  const subject = encodeURIComponent("Feedback from " + name);
  const body = encodeURIComponent(
    "Hello CodeNProfit Team,\n\n" +
    "Here is some suggestion regarding the platform:\n" + suggestion + "\n\n" +
    "Here is my feedback star for you: " + selectedSentiment + "\n" +
    autoMessage + "\n\n" +
    "Thank you,\n" + name
  );

  window.open(`mailto:Support@codenprofit.com?subject=${subject}&body=${body}`, '_blank');
  showToast("📧 Opening Mail Client...");
}

// ==================== REFERRAL FUNCTIONS ====================
function updateReferralUI() {
  const pcReferrals = document.getElementById('pcReferrals');
  const referralCountEl = document.getElementById('referralCount');
  const referralFill = document.getElementById('referralProgress');
  
  if (pcReferrals) pcReferrals.textContent = referralCount + '/11';
  const progressPercent = (referralCount / 11) * 100;
  if (referralCountEl) referralCountEl.textContent = referralCount;
  if (referralFill) referralFill.style.width = progressPercent + '%';
}

function showGiftComboModal() {
  const modal = document.getElementById('giftComboModal');
  if (modal) modal.classList.add('open');
  closeMobileMenu();
}

function openReferralModal(e) {
  if (e) e.stopPropagation();
  const modal = document.getElementById('referralModal');
  if (modal) modal.classList.add('open');
  closeMobileMenu();
}

function copyReferralLink() {
  const link = document.getElementById('referralLink');
  if (!link) return;
  link.select();
  document.execCommand('copy');
  showToast('📋 Referral link copied to clipboard!');
}

function shareReferral(platform) {
  const link = document.getElementById('referralLink');
  if (!link) return;
  
  const linkValue = link.value;

  const rawMessage =
  "Hey Developer Friend!\n\n" +
  "I found something awesome for students who know coding:\n\n" +
  "CodenProfit – India's First B2S Platform\n" +
  "(Business → Student Developers)\n\n" +
  "What you can do here:\n" +
  "• Build real projects\n" +
  "• Submit your work\n" +
  "• Earn money as a student\n\n" +
  "Simple Formula:\n" +
  "CODE → SUBMIT → PROFIT\n\n" +
  "Perfect for students who want:\n" +
  "• Real project experience\n" +
  "• Portfolio building\n" +
  "• Extra pocket money\n\n" +
  "Join using this link:\n" +
  linkValue + "\n\n" +
  "After taking the subscription,\n" +
  "send me a screenshot and you may receive\n" +
  "a surprise gift combo from the CodenProfit team!\n\n" +
  "Don't miss this opportunity!";

  const message = encodeURIComponent(rawMessage);

  if (platform === 'whatsapp') {
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  } else if (platform === 'email') {
    window.open(`mailto:?subject=Join me on CodenProfit&body=${message}`, '_blank');
  }

  closeModal('referralModal');
}

// ==================== HOST PAGE REDIRECT ====================
function goToHostPage() {
  window.location.href = 'auth.html';
}

// ==================== FIREBASE BOOTSTRAP ====================
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing...');
  startWelcomeAnimation();
});

window.addEventListener('load', function() {
  console.log('Window loaded, initializing Firebase...');
  initializeFirebase();
  
  firebase.auth().onAuthStateChanged(async user => {
    if (!user) {
      window.location.href = 'auth.html';
      return;
    }
    
    CU = user;
    const res = await FirebaseService.getUserType(user.uid);
    if (!res.success || res.type !== 'developer') {
      window.location.href = 'host.html';
      return;
    }
    
    UD = res.data;
    console.log('User data loaded:', UD);
    
    if (UD && UD.displayName) {
      const nameEl = document.getElementById('welcomeName');
      if (nameEl) nameEl.textContent = ' ' + UD.displayName.split(' ')[0];
    }
    
    await checkSubscription();
    await boot();
  });
});

async function boot() {
  loadNav();
  
  activeFilter = 'all';
  
  // Load learning progress
  loadCompletedSteps(); // For backward compatibility
 await loadCompletedTopics();// New module-based learning
  
  const storedStars = JSON.parse(localStorage.getItem('cnp_stars_' + CU.uid) || '{}');
  earnedStars = Object.keys(storedStars).length;
  
  referralCount = parseInt(localStorage.getItem('cnp_referrals_' + CU.uid) || '0');
  
  const appsRes = await FirebaseService.getDevApplications(CU.uid);
  if (appsRes.success) {
    const acceptedApps = appsRes.applications.filter(app => app.status === 'accepted');
    completedProjects = acceptedApps.length;
    totalEarnings = completedProjects * 2000;
  } else {
    completedProjects = 0;
    totalEarnings = 0;
  }
  
  try {
    await Promise.all([
      loadDashboard().catch(e => console.error('Dashboard error:', e)),
      loadProjects().catch(e => console.error('Projects error:', e)),
      loadRequests().catch(e => console.error('Requests error:', e)),
      loadMyApps().catch(e => console.error('MyApps error:', e))
    ]);
  } catch (e) {
    console.error('Boot error:', e);
  }
  
  loadProfileForm();
  loadOverview();
  initLearningPath(); // Updated learning path initialization
  loadBadgesPage();
  updateReferralUI();
  
  await checkSubscription();
}

function loadNav() {
  const name = UD.displayName || 'D';
  isAvail = UD.available !== false;
  updateAvailUI();
}

// ==================== LEARNING PATH FUNCTIONS (UPDATED) ====================
async function switchLearningPath(skill) {
  currentLearningPath = skill;
  await loadLearnPage(skill);
}

// Load completed steps (backward compatibility)
function loadCompletedSteps() {
  try {
    const saved = localStorage.getItem('cnp_steps_' + CU.uid);
    if (saved) {
      completedSteps = JSON.parse(saved);
    } else {
      completedSteps = {};
    }
  } catch (e) {
    console.error('Error loading completed steps:', e);
    completedSteps = {};
  }
}

// Load completed topics from Firestore (with localStorage fallback)
async function loadCompletedTopics() {
  try {
    // Always try Firestore first if user is logged in
    if (CU && typeof FirebaseService !== 'undefined') {
      const result = await FirebaseService.getModuleCompletions(CU.uid);
      if (result.success) {
        // Build flat key map: { "Full Stack Developer_html-css": true, ... }
        completedTopics = {};
        Object.keys(result.completedModules).forEach(key => {
          completedTopics[key] = true;
        });
        // Also mirror to localStorage for offline fallback
        localStorage.setItem('cnp_completed_topics_' + CU.uid, JSON.stringify(completedTopics));
        return;
      }
    }
    // Fallback to localStorage
    const saved = localStorage.getItem('cnp_completed_topics_' + (CU ? CU.uid : 'guest'));
    completedTopics = saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('Error loading completed topics:', e);
    completedTopics = {};
  }
}

// Save completed topics
function saveCompletedTopics() {
  if (CU) {
    localStorage.setItem('cnp_completed_topics_' + CU.uid, JSON.stringify(completedTopics));
  }
}

// Mark a topic as complete (called from modules page or locally)
async function markTopicComplete(skill, moduleId, badge) {
  const key = skill + '_' + moduleId;
  completedTopics[key] = true;
  saveCompletedTopics();

  // Save to Firestore
  if (CU && typeof FirebaseService !== 'undefined') {
    try {
      await FirebaseService.saveModuleCompletion(CU.uid, skill, moduleId, badge);
      console.log('✅ Completion saved to Firestore from dev.html');
    } catch (e) {
      console.error('Failed to save to Firestore:', e);
    }
  }

  // Also update old format for backward compatibility
  const path = LEARNING_PATHS[skill];
  if (path) {
    const stepIndex = path.steps.findIndex(step => step.moduleId === moduleId);
    if (stepIndex !== -1) {
      const oldKey = skill + '_' + stepIndex;
      completedSteps[oldKey] = true;
      localStorage.setItem('cnp_steps_' + CU.uid, JSON.stringify(completedSteps));
    }
  }

  showToast('🎉 Topic completed! ' + badge + ' earned!');

  // Reload the current learning path to update UI
  const selector = document.getElementById('learningPathSelector');
  if (selector) {
    loadLearnPage(selector.value);
  }
}

function openModule(moduleId) {
    console.log("Opening module:", moduleId);
    // Make sure to pass the module ID correctly
window.location.href = `modules.html?module=${moduleId}`;
}
// LEARNING PATHS DATA - UPDATED WITH MODULE IDS
const LEARNING_PATHS = {
  'Full Stack Developer': {
    icon: '<i class="fas fa-laptop-code"></i>',
    desc: 'Master both frontend and backend development to become a complete full stack developer',
    steps: [
      { 
        title: 'HTML & CSS Fundamentals',
        desc: 'Master semantic HTML5, CSS3, flexbox, grid and responsive design.',
        tags: ['HTML5', 'CSS3', 'Flexbox', 'Grid'],
        moduleId: 'html-css',
        moduleName: 'HTML & CSS Fundamentals',
        badge: '🏅 Web Foundations Badge'
      },
      { 
        title: 'JavaScript Essentials',
        desc: 'Variables, functions, DOM manipulation, async/await, ES6+.',
        tags: ['ES6+', 'Async', 'DOM'],
        moduleId: 'javascript-essentials',
        moduleName: 'JavaScript Essentials',
        badge: '🏅 JS Essentials Badge'
      },
      { 
        title: 'Frontend Framework (React)',
        desc: 'Components, hooks, state management, routing, API integration.',
        tags: ['React', 'Hooks', 'React Router'],
        moduleId: 'react-fundamentals',
        moduleName: 'React.js Fundamentals',
        badge: '🏅 React Developer Badge'
      },
      { 
        title: 'Backend with Node.js',
        desc: 'Express, REST APIs, middleware, authentication with JWT.',
        tags: ['Node.js', 'Express', 'REST', 'JWT'],
        moduleId: 'nodejs-basics',
        moduleName: 'Node.js & Backend',
        badge: '🏅 Backend Badge'
      },
      { 
        title: 'Databases',
        desc: 'SQL (PostgreSQL/MySQL) and NoSQL (MongoDB) — CRUD, joins, indexing.',
        tags: ['SQL', 'PostgreSQL', 'MongoDB'],
        moduleId: 'database-design',
        moduleName: 'Database Design & SQL',
        badge: '🏅 Database Badge'
      },
      { 
        title: 'Deployment & DevOps Basics',
        desc: 'Git, Docker, CI/CD pipelines, cloud deployment on AWS/GCP.',
        tags: ['Git', 'Docker', 'AWS', 'CI/CD'],
        moduleId: 'devops-basics',
        moduleName: 'DevOps Fundamentals',
        badge: '🏅 DevOps Badge'
      },
      { 
        title: 'Advanced — System Design',
        desc: 'Scalability patterns, microservices, caching, load balancing.',
        tags: ['Architecture', 'Microservices', 'Redis'],
        moduleId: 'system-design',
        moduleName: 'System Design',
        badge: '🏅 Systems Badge'
      },
      { 
        title: 'Full Stack Mastery',
        desc: 'Build production-grade apps with auth, payments, real-time features.',
        tags: ['Production', 'Stripe', 'WebSockets'],
        moduleId: 'fullstack-mastery-2025',
        moduleName: 'Full Stack Mastery',
        badge: '🎖️ Full Stack Master'
      }
    ]
  },
  'Frontend Developer': {
    icon: '<i class="fas fa-paint-brush"></i>',
    desc: 'Become an expert in creating beautiful and responsive user interfaces',
    steps: [
      { 
        title: 'HTML5 & Semantic Markup',
        desc: 'Structure, accessibility, SEO-friendly HTML.',
        tags: ['HTML5', 'Accessibility', 'SEO'],
        moduleId: 'html-css',
        moduleName: 'HTML & CSS Fundamentals',
        badge: '🏅 HTML Badge'
      },
      { 
        title: 'CSS Mastery',
        desc: 'Flexbox, Grid, animations, CSS variables, responsive design.',
        tags: ['CSS3', 'Animations', 'SCSS'],
        moduleId: 'css-mastery',
        moduleName: 'CSS Mastery',
        badge: '🏅 CSS Expert Badge'
      },
      { 
        title: 'JavaScript & TypeScript',
        desc: 'Core JS, TypeScript, ES2023+ features.',
        tags: ['JavaScript', 'TypeScript'],
        moduleId: 'javascript-essentials',
        moduleName: 'JavaScript Essentials',
        badge: '🏅 JS Badge'
      },
      { 
        title: 'React & Ecosystem',
        desc: 'React, Redux, React Query, Next.js.',
        tags: ['React', 'Redux', 'Next.js'],
        moduleId: 'react-fundamentals',
        moduleName: 'React.js Fundamentals',
        badge: '🏅 React Badge'
      },
      { 
        title: 'Testing',
        desc: 'Jest, React Testing Library, Cypress E2E.',
        tags: ['Jest', 'Cypress', 'RTL'],
        moduleId: 'frontend-testing',
        moduleName: 'Frontend Testing',
        badge: '🏅 Testing Badge'
      },
      { 
        title: 'Performance Optimization',
        desc: 'Lazy loading, code splitting, Core Web Vitals.',
        tags: ['Performance', 'Webpack', 'Vite'],
        moduleId: 'frontend-performance',
        moduleName: 'Performance Optimization',
        badge: '🏅 Performance Badge'
      },
      { 
        title: 'UI Libraries & Design Systems',
        desc: 'Tailwind, MUI, Storybook, design tokens.',
        tags: ['Tailwind', 'Storybook', 'MUI'],
        moduleId: 'ui-design-systems',
        moduleName: 'UI Design Systems',
        badge: '🏅 UI Expert Badge'
      },
      { 
        title: 'Frontend Mastery',
        desc: 'Architecture, monorepos, micro-frontends.',
        tags: ['Architecture', 'Micro-frontends'],
        moduleId: 'frontend-architecture',
        moduleName: 'Frontend Architecture',
        badge: '🎖️ Frontend Master'
      }
    ]
  },
  'Backend Developer': {
    icon: '<i class="fas fa-cogs"></i>',
    desc: 'Build robust, scalable server-side applications and APIs',
    steps: [
      { 
        title: 'Programming Foundations',
        desc: 'Pick one: Node.js, Python, Go or Java. Master the basics.',
        tags: ['Node.js', 'Python', 'Go'],
        moduleId: 'programming-fundamentals',
        moduleName: 'Programming Fundamentals',
        badge: '🏅 Language Badge'
      },
      { 
        title: 'REST API Design',
        desc: 'HTTP methods, status codes, REST best practices, versioning.',
        tags: ['REST', 'HTTP', 'OpenAPI'],
        moduleId: 'api-design',
        moduleName: 'API Design',
        badge: '🏅 API Design Badge'
      },
      { 
        title: 'Databases',
        desc: 'Relational and NoSQL, ORMs, query optimization.',
        tags: ['PostgreSQL', 'MongoDB', 'Prisma'],
        moduleId: 'database-design',
        moduleName: 'Database Design & SQL',
        badge: '🏅 Database Badge'
      },
      { 
        title: 'Authentication & Security',
        desc: 'JWT, OAuth2, HTTPS, input validation, OWASP.',
        tags: ['JWT', 'OAuth2', 'Security'],
        moduleId: 'security-fundamentals',
        moduleName: 'Security Fundamentals',
        badge: '🏅 Security Badge'
      },
      { 
        title: 'Caching & Performance',
        desc: 'Redis, caching strategies, database indexing.',
        tags: ['Redis', 'Caching', 'CDN'],
        moduleId: 'caching-performance',
        moduleName: 'Caching & Performance',
        badge: '🏅 Performance Badge'
      },
      { 
        title: 'Message Queues',
        desc: 'RabbitMQ, Kafka, async processing patterns.',
        tags: ['RabbitMQ', 'Kafka', 'Async'],
        moduleId: 'message-queues',
        moduleName: 'Message Queues',
        badge: '🏅 Async Badge'
      },
      { 
        title: 'Cloud & Deployment',
        desc: 'AWS/GCP/Azure, Docker, serverless functions.',
        tags: ['AWS', 'Docker', 'Serverless'],
        moduleId: 'cloud-deployment',
        moduleName: 'Cloud Deployment',
        badge: '🏅 Cloud Badge'
      },
      { 
        title: 'Backend Mastery',
        desc: 'System design, distributed systems, high availability.',
        tags: ['Distributed', 'HA', 'Architecture'],
        moduleId: 'backend-architecture',
        moduleName: 'Backend Architecture',
        badge: '🎖️ Backend Master'
      }
    ]
  },
  'AI/ML Engineer': {
    icon: '<i class="fas fa-robot"></i>',
    desc: 'Master machine learning, deep learning, and artificial intelligence',
    steps: [
      { 
        title: 'Python for Data Science',
        desc: 'NumPy, Pandas, Matplotlib, Jupyter.',
        tags: ['Python', 'NumPy', 'Pandas'],
        moduleId: 'python-data-science',
        moduleName: 'Python for Data Science',
        badge: '🏅 Python Badge'
      },
      { 
        title: 'Mathematics for ML',
        desc: 'Linear algebra, calculus, statistics, probability.',
        tags: ['Linear Algebra', 'Statistics'],
        moduleId: 'math-for-ml',
        moduleName: 'Mathematics for ML',
        badge: '🏅 Math Badge'
      },
      { 
        title: 'Machine Learning Basics',
        desc: 'Supervised/unsupervised learning, scikit-learn.',
        tags: ['scikit-learn', 'ML Basics'],
        moduleId: 'ml-basics',
        moduleName: 'Machine Learning Basics',
        badge: '🏅 ML Badge'
      },
      { 
        title: 'Deep Learning',
        desc: 'Neural networks, CNNs, RNNs, PyTorch/TensorFlow.',
        tags: ['PyTorch', 'TensorFlow', 'CNN'],
        moduleId: 'deep-learning',
        moduleName: 'Deep Learning',
        badge: '🏅 DL Badge'
      },
      { 
        title: 'Natural Language Processing',
        desc: 'Transformers, BERT, GPT, tokenization.',
        tags: ['NLP', 'Transformers', 'BERT'],
        moduleId: 'nlp-fundamentals',
        moduleName: 'NLP Fundamentals',
        badge: '🏅 NLP Badge'
      },
      { 
        title: 'MLOps',
        desc: 'Model deployment, monitoring, MLflow, feature stores.',
        tags: ['MLflow', 'Docker', 'CI/CD'],
        moduleId: 'mlops-fundamentals',
        moduleName: 'MLOps Fundamentals',
        badge: '🏅 MLOps Badge'
      },
      { 
        title: 'LLMs & Generative AI',
        desc: 'Fine-tuning, RAG, prompt engineering, LangChain.',
        tags: ['LLMs', 'RAG', 'LangChain'],
        moduleId: 'generative-ai',
        moduleName: 'Generative AI',
        badge: '🏅 GenAI Badge'
      },
      { 
        title: 'AI/ML Mastery',
        desc: 'Research papers, custom architectures, production AI.',
        tags: ['Research', 'Production AI'],
        moduleId: 'ai-mastery',
        moduleName: 'AI/ML Mastery',
        badge: '🎖️ AI/ML Master'
      }
    ]
  },
  'DevOps Engineer': {
    icon: '<i class="fas fa-cloud"></i>',
    desc: 'Learn to automate, deploy, and manage infrastructure at scale',
    steps: [
      { 
        title: 'Linux & Scripting',
        desc: 'Linux fundamentals, bash scripting, command line tools.',
        tags: ['Linux', 'Bash', 'Shell'],
        moduleId: 'linux-basics',
        moduleName: 'Linux Fundamentals',
        badge: '🏅 Linux Badge'
      },
      { 
        title: 'Version Control with Git',
        desc: 'Git workflows, branching strategies, GitHub/GitLab.',
        tags: ['Git', 'GitHub', 'GitLab'],
        moduleId: 'git-fundamentals',
        moduleName: 'Git Fundamentals',
        badge: '🏅 Git Badge'
      },
      { 
        title: 'CI/CD Pipelines',
        desc: 'Jenkins, GitHub Actions, GitLab CI, CircleCI.',
        tags: ['CI/CD', 'Jenkins', 'GitHub Actions'],
        moduleId: 'cicd-fundamentals',
        moduleName: 'CI/CD Fundamentals',
        badge: '🏅 CI/CD Badge'
      },
      { 
        title: 'Containerization with Docker',
        desc: 'Docker files, containers, images, registries, compose.',
        tags: ['Docker', 'Containers'],
        moduleId: 'docker-fundamentals',
        moduleName: 'Docker Fundamentals',
        badge: '🏅 Docker Badge'
      },
      { 
        title: 'Orchestration with Kubernetes',
        desc: 'Pods, services, deployments, ingress, helm.',
        tags: ['Kubernetes', 'K8s', 'Helm'],
        moduleId: 'kubernetes-fundamentals',
        moduleName: 'Kubernetes Fundamentals',
        badge: '🏅 Kubernetes Badge'
      },
      { 
        title: 'Infrastructure as Code',
        desc: 'Terraform, CloudFormation, Ansible, Pulumi.',
        tags: ['Terraform', 'Ansible', 'IaC'],
        moduleId: 'iac-fundamentals',
        moduleName: 'Infrastructure as Code',
        badge: '🏅 IaC Badge'
      },
      { 
        title: 'Monitoring & Logging',
        desc: 'Prometheus, Grafana, ELK stack, Datadog.',
        tags: ['Prometheus', 'Grafana', 'ELK'],
        moduleId: 'monitoring-fundamentals',
        moduleName: 'Monitoring & Logging',
        badge: '🏅 Monitoring Badge'
      },
      { 
        title: 'Cloud Platforms',
        desc: 'AWS, GCP, Azure — compute, storage, networking.',
        tags: ['AWS', 'GCP', 'Azure'],
        moduleId: 'cloud-platforms',
        moduleName: 'Cloud Platforms',
        badge: '🎖️ Cloud Expert Badge'
      }
    ]
  },
  'Mobile Developer': {
    icon: '<i class="fas fa-mobile-alt"></i>',
    desc: 'Build native and cross-platform mobile applications',
    steps: [
      { 
        title: 'Mobile Development Basics',
        desc: 'Understanding mobile platforms, app architecture, design patterns.',
        tags: ['iOS', 'Android', 'Mobile'],
        moduleId: 'mobile-basics',
        moduleName: 'Mobile Development Basics',
        badge: '🏅 Mobile Basics Badge'
      },
      { 
        title: 'React Native',
        desc: 'Cross-platform development with React Native, Expo, navigation.',
        tags: ['React Native', 'Expo'],
        moduleId: 'react-native-fundamentals',
        moduleName: 'React Native',
        badge: '🏅 React Native Badge'
      },
      { 
        title: 'Flutter',
        desc: 'Dart, Flutter widgets, state management, animations.',
        tags: ['Flutter', 'Dart'],
        moduleId: 'flutter-fundamentals',
        moduleName: 'Flutter',
        badge: '🏅 Flutter Badge'
      },
      { 
        title: 'iOS Development',
        desc: 'Swift, UIKit, SwiftUI, iOS frameworks, App Store.',
        tags: ['Swift', 'iOS', 'SwiftUI'],
        moduleId: 'ios-development',
        moduleName: 'iOS Development',
        badge: '🏅 iOS Badge'
      },
      { 
        title: 'Android Development',
        desc: 'Kotlin, Jetpack Compose, Android SDK, Play Store.',
        tags: ['Kotlin', 'Android', 'Jetpack'],
        moduleId: 'android-development',
        moduleName: 'Android Development',
        badge: '🏅 Android Badge'
      },
      { 
        title: 'Mobile APIs & Backend',
        desc: 'RESTful APIs, Firebase, GraphQL, offline sync.',
        tags: ['Firebase', 'APIs', 'GraphQL'],
        moduleId: 'mobile-backend',
        moduleName: 'Mobile Backend',
        badge: '🏅 Mobile Backend Badge'
      },
      { 
        title: 'App Performance & Testing',
        desc: 'Performance optimization, testing, debugging, crash reporting.',
        tags: ['Testing', 'Performance'],
        moduleId: 'mobile-testing',
        moduleName: 'Mobile Testing',
        badge: '🏅 Performance Badge'
      },
      { 
        title: 'Mobile Mastery',
        desc: 'Publish apps to stores, monetization, analytics.',
        tags: ['App Store', 'Play Store'],
        moduleId: 'mobile-mastery',
        moduleName: 'Mobile Mastery',
        badge: '🎖️ Mobile Master'
      }
    ]
  },
  'Data Engineer': {
    icon: '<i class="fas fa-database"></i>',
    desc: 'Design and build data pipelines and infrastructure',
    steps: [
      { 
        title: 'SQL Mastery',
        desc: 'Advanced SQL, window functions, query optimization.',
        tags: ['SQL', 'PostgreSQL', 'MySQL'],
        moduleId: 'sql-mastery',
        moduleName: 'SQL Mastery',
        badge: '🏅 SQL Expert Badge'
      },
      { 
        title: 'Python for Data',
        desc: 'Python, data structures, algorithms for data processing.',
        tags: ['Python', 'Pandas'],
        moduleId: 'python-data-science',
        moduleName: 'Python for Data Science',
        badge: '🏅 Python Badge'
      },
      { 
        title: 'Data Warehousing',
        desc: 'Data modeling, star schema, snowflake, data lakes.',
        tags: ['Warehousing', 'Data Modeling'],
        moduleId: 'data-warehousing',
        moduleName: 'Data Warehousing',
        badge: '🏅 Warehousing Badge'
      },
      { 
        title: 'ETL/ELT Pipelines',
        desc: 'Data ingestion, transformation, orchestration tools.',
        tags: ['ETL', 'Airflow', 'dbt'],
        moduleId: 'etl-pipelines',
        moduleName: 'ETL Pipelines',
        badge: '🏅 ETL Badge'
      },
      { 
        title: 'Big Data Technologies',
        desc: 'Hadoop, Spark, Kafka, streaming data.',
        tags: ['Spark', 'Kafka', 'Hadoop'],
        moduleId: 'big-data-technologies',
        moduleName: 'Big Data Technologies',
        badge: '🏅 Big Data Badge'
      },
      { 
        title: 'Cloud Data Platforms',
        desc: 'AWS Redshift, Google BigQuery, Snowflake.',
        tags: ['Redshift', 'BigQuery', 'Snowflake'],
        moduleId: 'cloud-data-platforms',
        moduleName: 'Cloud Data Platforms',
        badge: '🏅 Cloud Data Badge'
      },
      { 
        title: 'Data Governance & Security',
        desc: 'Data quality, lineage, privacy, compliance.',
        tags: ['Governance', 'Security'],
        moduleId: 'data-governance',
        moduleName: 'Data Governance',
        badge: '🏅 Data Governance Badge'
      },
      { 
        title: 'Data Engineering Mastery',
        desc: 'Real-time data, data mesh, modern data stack.',
        tags: ['Real-time', 'Data Mesh'],
        moduleId: 'data-engineering-mastery',
        moduleName: 'Data Engineering Mastery',
        badge: '🎖️ Data Engineer Master'
      }
    ]
  },
  'Cloud Architect': {
    icon: '<i class="fas fa-cloud-upload-alt"></i>',
    desc: 'Design and implement cloud infrastructure and solutions',
    steps: [
      { 
        title: 'Cloud Fundamentals',
        desc: 'Cloud concepts, regions, availability zones, pricing models.',
        tags: ['Cloud', 'AWS', 'GCP'],
        moduleId: 'cloud-fundamentals',
        moduleName: 'Cloud Fundamentals',
        badge: '🏅 Cloud Basics Badge'
      },
      { 
        title: 'Compute Services',
        desc: 'EC2, Lambda, compute optimization, auto-scaling.',
        tags: ['EC2', 'Lambda', 'Compute'],
        moduleId: 'compute-services',
        moduleName: 'Compute Services',
        badge: '🏅 Compute Badge'
      },
      { 
        title: 'Storage & Databases',
        desc: 'S3, EBS, RDS, DynamoDB, Cloud SQL.',
        tags: ['S3', 'RDS', 'DynamoDB'],
        moduleId: 'cloud-storage',
        moduleName: 'Cloud Storage',
        badge: '🏅 Storage Badge'
      },
      { 
        title: 'Networking',
        desc: 'VPC, subnets, load balancing, CDN, DNS.',
        tags: ['VPC', 'Networking', 'CDN'],
        moduleId: 'cloud-networking',
        moduleName: 'Cloud Networking',
        badge: '🏅 Networking Badge'
      },
      { 
        title: 'Security & IAM',
        desc: 'Identity management, encryption, compliance, security groups.',
        tags: ['IAM', 'Security', 'Encryption'],
        moduleId: 'cloud-security',
        moduleName: 'Cloud Security',
        badge: '🏅 Security Badge'
      },
      { 
        title: 'Architecture Design',
        desc: 'High availability, disaster recovery, cost optimization.',
        tags: ['HA', 'DR', 'Cost'],
        moduleId: 'architecture-design',
        moduleName: 'Architecture Design',
        badge: '🏅 Architecture Badge'
      },
      { 
        title: 'Migration & Modernization',
        desc: 'Lift-and-shift, re-platforming, cloud-native.',
        tags: ['Migration', 'Modernization'],
        moduleId: 'cloud-migration',
        moduleName: 'Cloud Migration',
        badge: '🏅 Migration Badge'
      },
      { 
        title: 'Cloud Architect Mastery',
        desc: 'Multi-cloud, hybrid cloud, enterprise architecture.',
        tags: ['Multi-cloud', 'Enterprise'],
        moduleId: 'cloud-architecture-mastery',
        moduleName: 'Cloud Architecture Mastery',
        badge: '🎖️ Cloud Architect Master'
      }
    ]
  },
  'Blockchain Developer': {
    icon: '<i class="fas fa-link"></i>',
    desc: 'Build decentralized applications and smart contracts',
    steps: [
      { 
        title: 'Blockchain Fundamentals',
        desc: 'Cryptography, consensus mechanisms, blockchain structure.',
        tags: ['Cryptography', 'Consensus'],
        moduleId: 'blockchain-fundamentals',
        moduleName: 'Blockchain Fundamentals',
        badge: '🏅 Blockchain Basics Badge'
      },
      { 
        title: 'Ethereum & Smart Contracts',
        desc: 'Solidity, smart contracts, EVM, gas optimization.',
        tags: ['Ethereum', 'Solidity', 'EVM'],
        moduleId: 'ethereum-smart-contracts',
        moduleName: 'Ethereum & Smart Contracts',
        badge: '🏅 Smart Contract Badge'
      },
      { 
        title: 'Web3 Development',
        desc: 'Web3.js, ethers.js, DApp architecture.',
        tags: ['Web3', 'DApp', 'ethers'],
        moduleId: 'web3-development',
        moduleName: 'Web3 Development',
        badge: '🏅 Web3 Badge'
      },
      { 
        title: 'DeFi & NFTs',
        desc: 'DeFi protocols, NFT standards, marketplaces.',
        tags: ['DeFi', 'NFT', 'ERC'],
        moduleId: 'defi-nft',
        moduleName: 'DeFi & NFTs',
        badge: '🏅 DeFi/NFT Badge'
      },
      { 
        title: 'Layer 2 & Scaling',
        desc: 'Rollups, sidechains, state channels.',
        tags: ['Layer2', 'Rollups'],
        moduleId: 'layer2-scaling',
        moduleName: 'Layer 2 Scaling',
        badge: '🏅 Scaling Badge'
      },
      { 
        title: 'Security & Auditing',
        desc: 'Smart contract security, audits, common vulnerabilities.',
        tags: ['Security', 'Auditing'],
        moduleId: 'blockchain-security',
        moduleName: 'Blockchain Security',
        badge: '🏅 Security Badge'
      },
      { 
        title: 'Other Blockchains',
        desc: 'Solana, Polkadot, Hyperledger, cross-chain.',
        tags: ['Solana', 'Polkadot'],
        moduleId: 'other-blockchains',
        moduleName: 'Other Blockchains',
        badge: '🏅 Multi-chain Badge'
      },
      { 
        title: 'Blockchain Mastery',
        desc: 'Build production DApps, tokenomics, governance.',
        tags: ['Production', 'Tokenomics'],
        moduleId: 'blockchain-mastery',
        moduleName: 'Blockchain Mastery',
        badge: '🎖️ Blockchain Master'
      }
    ]
  }
};

// Default path
const defaultPath = {
  icon: '<i class="fas fa-rocket"></i>',
  desc: 'Follow this path to become a master in your chosen field',
  steps: [
    { 
      title: 'Core Fundamentals',
      desc: 'Master the foundational concepts of your role.',
      tags: ['Foundations', 'Core Skills'],
      moduleId: 'fundamentals',
      moduleName: 'Core Fundamentals',
      badge: '🏅 Foundations Badge'
    },
    { 
      title: 'Tools & Ecosystem',
      desc: 'Learn the essential tools and frameworks.',
      tags: ['Tools', 'Frameworks'],
      moduleId: 'tools-ecosystem',
      moduleName: 'Tools & Ecosystem',
      badge: '🏅 Tools Badge'
    },
    { 
      title: 'Best Practices',
      desc: 'Code quality, testing, documentation.',
      tags: ['Testing', 'Clean Code'],
      moduleId: 'best-practices',
      moduleName: 'Best Practices',
      badge: '🏅 Quality Badge'
    },
    { 
      title: 'Real-World Projects',
      desc: 'Build projects that demonstrate real-world skills.',
      tags: ['Projects', 'Portfolio'],
      moduleId: 'real-world-projects',
      moduleName: 'Real-World Projects',
      badge: '🏅 Builder Badge'
    },
    { 
      title: 'Advanced Techniques',
      desc: 'Advanced patterns, optimization and architecture.',
      tags: ['Advanced', 'Optimization'],
      moduleId: 'advanced-techniques',
      moduleName: 'Advanced Techniques',
      badge: '🏅 Advanced Badge'
    },
    { 
      title: 'Collaboration & Git',
      desc: 'Git workflows, code reviews, team collaboration.',
      tags: ['Git', 'Code Review'],
      moduleId: 'collaboration',
      moduleName: 'Collaboration & Git',
      badge: '🏅 Team Badge'
    },
    { 
      title: 'Deployment & DevOps',
      desc: 'Shipping to production, CI/CD, monitoring.',
      tags: ['DevOps', 'CI/CD'],
      moduleId: 'deployment-devops',
      moduleName: 'Deployment & DevOps',
      badge: '🏅 DevOps Badge'
    },
    { 
      title: 'Mastery',
      desc: 'Become a subject matter expert in your field.',
      tags: ['Expert', 'Architecture'],
      moduleId: 'mastery',
      moduleName: 'Mastery',
      badge: '🎖️ Role Master'
    }
  ]
};

// Load learning path page
async function loadLearnPage(skill) {
  const path = LEARNING_PATHS[skill] || defaultPath;
  
  const learnSubtitle = document.getElementById('learnSubtitle');
  if (learnSubtitle) {
    learnSubtitle.innerHTML = `<i class="fas fa-route"></i> Your personalised path to <strong>${skill}</strong> mastery`;
  }
  
  const rolePathHeader = document.getElementById('rolePathHeader');
  if (rolePathHeader) rolePathHeader.style.display = 'flex';
  
  // Always fetch fresh from Firestore/Local so completions show up
  await loadCompletedTopics();
  
  let totalCompletedModules = 0;
  path.steps.forEach((step) => {
    const key = skill + '_' + step.moduleId;
    if (completedTopics[key]) totalCompletedModules++;
  });
  
  const pct = Math.round((totalCompletedModules / path.steps.length) * 100);
  const rolePathPct = document.getElementById('rolePathPct');
  if (rolePathPct) rolePathPct.textContent = pct + '%';
  
  // Update Certificate Button Status
  const certificateBtn = document.getElementById('certificateBtn');
  if (certificateBtn) {
    if (pct === 100) {
      certificateBtn.disabled = false;
      certificateBtn.style.opacity = "1";
      certificateBtn.style.cursor = "pointer";
      certificateBtn.innerHTML = '<i class="fas fa-award"></i> Claim Your Certificate';
      certificateBtn.onclick = () => showToast("🎓 Certificate generation coming soon!");
    } else {
      certificateBtn.disabled = true;
      certificateBtn.innerHTML = '<i class="fas fa-lock"></i> Complete All Modules to Unlock';
    }
  }

  const container = document.getElementById('learningPath');
  if (!container) return;
  
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  
  container.innerHTML = path.steps.map((step, i) => {
    const key = skill + '_' + step.moduleId;
    
    // 1. Check if fully completed (Badge earned)
    const isDone = completedTopics[key];
    
    // 2. Check for partial progress in localStorage
    const progressData = JSON.parse(localStorage.getItem('cnp_module_' + step.moduleId) || '{}');
    const completedChapters = progressData.chapterProgress ? Object.keys(progressData.chapterProgress).length : 0;
    const hasStarted = completedChapters > 0;

    // 3. Locking Logic (Unlock if first module OR if previous module isDone)
    const isLocked = i > 0 && !completedTopics[skill + '_' + path.steps[i-1].moduleId];
    
    // 4. Determine Button Text and Style
    let btnText = '<i class="fas fa-arrow-right"></i> Go to Module';
    let btnClass = 'btn-go-to-module';

    if (isDone) {
        btnText = '<i class="fas fa-check-double"></i> Completed — Visit Again';
        btnClass = 'btn-go-to-module btn-completed';
    } else if (hasStarted) {
        btnText = `<i class="fas fa-spinner"></i> Continue (${completedChapters} Chapters Done)`;
        btnClass = 'btn-go-to-module btn-in-progress';
    } else if (isLocked) {
        btnText = '<i class="fas fa-lock"></i> Locked';
    }

    // Icon Selection logic (keeping your existing icons)
    let stepIcon = '<i class="fas fa-code"></i>';
    const t = step.title.toLowerCase();
    if (t.includes('html')) stepIcon = '<i class="fab fa-html5"></i>';
    else if (t.includes('css')) stepIcon = '<i class="fab fa-css3-alt"></i>';
    else if (t.includes('javascript')) stepIcon = '<i class="fab fa-js"></i>';
    else if (t.includes('react')) stepIcon = '<i class="fab fa-react"></i>';
    else if (t.includes('node')) stepIcon = '<i class="fab fa-node-js"></i>';
    else if (t.includes('database') || t.includes('sql')) stepIcon = '<i class="fas fa-database"></i>';

    return `
    <div class="lp-step ${isDone ? 'completed' : isLocked ? 'locked' : ''}">
      <div class="lp-num">${isDone ? '<i class="fas fa-check"></i>' : i + 1}</div>
      <div class="lp-body">
        <h4>${stepIcon} ${esc(step.title)}</h4>
        <p>${esc(step.desc)}</p>
        <div class="lp-tags">${step.tags.map(t => `<span class="lp-tag"><i class="fas fa-tag"></i> ${esc(t)}</span>`).join('')}</div>
        ${isDone ? `<div class="lp-badge-awarded"><i class="fas fa-star"></i> ${step.badge} Earned!</div>` : ''}
        <div style="margin-top: 16px;">
          <button class="${btnClass}" onclick="openModule('${step.moduleId}')" ${isLocked ? 'disabled' : ''}>
            ${btnText}
          </button>
          ${isLocked ? `<p style="color: var(--muted); font-size: 12px; margin-top: 8px;"><i class="fas fa-lock"></i> Finish "${path.steps[i-1].title}" to unlock</p>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

// Initialize learning path
async function initLearningPath() {
  const defaultSkill = (UD && UD.primarySkill && LEARNING_PATHS[UD.primarySkill]) ? 
                        UD.primarySkill : 'Full Stack Developer';
  
  const selector = document.getElementById('learningPathSelector');
  if (selector) {
    selector.value = defaultSkill;
  }
  
  await loadLearnPage(defaultSkill);
}

// ==================== PAGE NAVIGATION ====================
function showPage(name, btn) {
  // 1. Hide all pages and remove active classes from all buttons
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  // 2. Show the requested page
  const pageEl = document.getElementById('page-' + name);
  if (pageEl) {
    pageEl.classList.add('active');
  }

  // 3. Handle Button Highlighting
  if (btn) {
    // If a button element was passed (normal click), highlight it
    btn.classList.add('active');
  } else {
    // If no button was passed (redirect/hash), find the button that belongs to this page
    // This looks for a button that has the correct 'showPage' call in its onclick attribute
    const autoBtn = document.querySelector(`.nav-btn[onclick*="'${name}'"]`);
    if (autoBtn) autoBtn.classList.add('active');
  }

  // --- Your existing logic for projects ---
  if (name === 'projects') {
    const subStrip = document.getElementById('browseSubStrip');
    const premBanner = document.getElementById('premiumActiveBanner');
    if (typeof isSubscribed !== 'undefined' && isSubscribed) {
      if (subStrip) subStrip.style.display = 'none';
      if (premBanner) premBanner.style.display = 'block';
    } else {
      if (subStrip) subStrip.style.display = 'flex';
      if (premBanner) premBanner.style.display = 'none';
    }
  }

  // --- Your existing logic for learn ---
  if (name === 'learn' && typeof currentLearningPath !== 'undefined' && currentLearningPath) {
    loadLearnPage(currentLearningPath); 
  }
}
// ==================== MOBILE MENU FUNCTIONS ====================
function toggleMobileMenu() {
  const overlay = document.getElementById('mobileMenuOverlay');
  const menu = document.getElementById('mobileMenu');
  if (overlay && menu) {
    overlay.classList.toggle('open');
    menu.classList.toggle('open');
  }
}

function closeMobileMenu() {
  const overlay = document.getElementById('mobileMenuOverlay');
  const menu = document.getElementById('mobileMenu');
  if (overlay && menu) {
    overlay.classList.remove('open');
    menu.classList.remove('open');
  }
}

function showMobilePage(page) {
  closeMobileMenu();
  showPage(page, null);
}

// ==================== DASHBOARD FUNCTIONS ====================
async function loadDashboard() {
  const name = UD.displayName || 'Developer';
  const dashGreeting = document.getElementById('dashGreeting');
  if (dashGreeting) dashGreeting.textContent = `Good to see you, ${name}! Here's your activity.`;
  
  const stEarnings = document.getElementById('st-earnings');
  if (stEarnings) stEarnings.textContent = '₹' + totalEarnings.toLocaleString();
  
  const stStatus = document.getElementById('st-status');
  if (stStatus) stStatus.textContent = isAvail ? '✅ Open' : '🔴 Closed';
  
  const [rRes, aRes] = await Promise.all([
    FirebaseService.getHireRequests(CU.uid),
    FirebaseService.getDevApplications(CU.uid)
  ]);
  
  const stRequests = document.getElementById('st-requests');
  if (rRes.success) {
    if (stRequests) stRequests.textContent = rRes.requests.length;
    const pending = rRes.requests.filter(r => r.status === 'pending');
    const menuReqBadge = document.getElementById('menuReqBadge');
    if (menuReqBadge) {
      if (pending.length) {
        menuReqBadge.style.display = 'inline';
      } else {
        menuReqBadge.style.display = 'none';
      }
    }
    const dashEl = document.getElementById('dashRequests');
    if (dashEl) {
      const recent = rRes.requests.slice(0, 3);
      dashEl.innerHTML = recent.length ? recent.map(reqCardHTML).join('') : '<div class="empty"><i class="fas fa-inbox"></i><p>No hire requests yet — keep your profile visible!</p></div>';
    }
  }
  
  const stApps = document.getElementById('st-apps');
  if (aRes.success) {
    if (stApps) stApps.textContent = aRes.applications.length;
    aRes.applications.forEach(a => appliedIds.add(a.projectId));
  }
  
  const pRes = await FirebaseService.getProjects();
  if (pRes.success) {
    allProjects = (pRes.projects || []).map(p => ({...p, isPremium: false}));
    const dashProjects = document.getElementById('dashProjects');
    if (dashProjects) {
      dashProjects.innerHTML = allProjects.slice(0, 3).map(projectCardHTML).join('') || '<div class="empty" style="grid-column:1/-1"><i class="fas fa-folder-open"></i><p>No projects yet</p></div>';
    }
  }
  
  updatePremiumUI();
}

// ==================== OVERVIEW FUNCTIONS ====================
async function loadOverview() {
  const [rRes, aRes] = await Promise.all([
    FirebaseService.getHireRequests(CU.uid),
    FirebaseService.getDevApplications(CU.uid)
  ]);
  const apps = aRes.success ? aRes.applications.length : 0;
  const reqs = rRes.success ? rRes.requests.length : 0;
  const storedStars = JSON.parse(localStorage.getItem('cnp_stars_' + CU.uid) || '{}');
  const stars = Object.keys(storedStars).length;
  
  const ovEarnings = document.getElementById('ovEarnings');
  if (ovEarnings) ovEarnings.textContent = totalEarnings.toLocaleString();
  
  const ovApps = document.getElementById('ovApps');
  if (ovApps) ovApps.textContent = apps;
  
  const ovReqs = document.getElementById('ovReqs');
  if (ovReqs) ovReqs.textContent = reqs;
  
  const ovStars = document.getElementById('ovStars');
  if (ovStars) ovStars.innerHTML = '<i class="fas fa-star" style="color:#fbbf24; margin-right:4px;"></i> ' + stars;
  
  const ovCompleted = document.getElementById('ovCompleted');
  if (ovCompleted) ovCompleted.textContent = completedProjects;
   
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const aVals = [0, 1, 2, 1, 3, 0, apps];
  const rVals = [0, 0, 1, 0, 2, 1, reqs];
  const maxV = Math.max(...aVals, ...rVals, 1);
  
  const activityGraph = document.getElementById('activityGraph');
  if (activityGraph) {
    activityGraph.innerHTML = days.map((d, i) => `
      <div class="ag-bar-wrap">
        <div class="ag-bar purple" style="height:${(aVals[i] / maxV) * 100}%" data-val="${aVals[i]} apps"></div>
        <div class="ag-bar cyan" style="height:${(rVals[i] / maxV) * 80 + 5}%" data-val="${rVals[i]} reqs"></div>
        <div class="ag-label">${d}</div>
      </div>`).join('');
  }
  
  const score = Math.min(100, 40 + (apps * 8) + (reqs * 5) + (stars * 10) + (completedProjects * 15));
  const creativityScore = document.getElementById('creativityScore');
  if (creativityScore) creativityScore.innerHTML = score + ' <span>/ 100</span>';
  
  const creativityMsg = document.getElementById('creativityMsg');
  if (creativityMsg) {
    const msgs = ['Keep building and applying to boost your score!', 'Great work! Keep the momentum going!', 'Excellent! You\'re on a roll!', 'Outstanding! You\'re a top developer!'];
    creativityMsg.textContent = msgs[Math.min(3, Math.floor(score / 25))];
  }
}

// ==================== PROJECTS FUNCTIONS ====================
async function loadProjects() {
  const el = document.getElementById('allProjectsList');
  if (!el) return;
  
  el.innerHTML = '<p style="color:var(--muted);padding:20px"><i class="fas fa-spinner fa-spin"></i> Loading...</p>';
  
  const regularProjects = await FirebaseService.getProjects();
  
  if (!regularProjects.success || !regularProjects.projects.length) {
    el.innerHTML = '<div class="empty" style="grid-column:1/-1"><i class="fas fa-folder-open"></i><p>No projects available yet</p></div>';
    buildProjectFilters([]);
    return;
  }
  
  allProjects = (regularProjects.projects || []).map(p => ({...p, isPremium: false}));
  
  updateProjectCounts();
  
  buildProjectFilters(allProjects);
  renderProjects(allProjects);
}

function buildProjectFilters(projects) {
  const filterEl = document.getElementById('projectFilters');
  if (!filterEl) return;
  
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  
  const cats = new Set(['all']);
  projects.forEach(p => { if (p.category) cats.add(p.category); });
  filterEl.innerHTML = [...cats].map(c => `<button class="filter-chip ${c === 'all' ? 'active' : ''}" onclick="filterProjects('${esc(c)}',this)"><i class="fas fa-filter"></i> ${c === 'all' ? 'All Projects' : c}</button>`).join('');
}

function filterProjects(cat, btn) {
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = cat;
  console.log('Filter set to:', activeFilter);
  const filtered = cat === 'all' ? allProjects : allProjects.filter(p => p.category === cat);
  renderProjects(filtered);
}

function renderProjects(projects) {
  const el = document.getElementById('allProjectsList');
  if (!el) return;
  
  if (typeof activeFilter === 'undefined') {
    activeFilter = 'all';
  }
  
  let filteredProjects = activeFilter === 'all' ? projects : projects.filter(p => p.category === activeFilter);
  
  if (!filteredProjects || filteredProjects.length === 0) {
    el.innerHTML = '<div class="empty" style="grid-column:1/-1"><i class="fas fa-search"></i><p>No projects match this filter</p></div>';
  } else {
    el.innerHTML = filteredProjects.map(projectCardHTML).join('');
  }
  
  const subStrip = document.getElementById('browseSubStrip');
  const premBanner = document.getElementById('premiumActiveBanner');
  if (isSubscribed) {
    if (subStrip) subStrip.style.display = 'none';
    if (premBanner) premBanner.style.display = 'block';
  } else {
    if (subStrip) subStrip.style.display = 'flex';
    if (premBanner) premBanner.style.display = 'none';
  }
}

function projectCardHTML(p) {
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  
  const applied = appliedIds.has(p.id);
  const skills = (p.requiredSkills || []).slice(0, 4);
  const rawBudget = String(p.budget || '').replace(/['\"₹$,\s]/g, '').trim();
  const budgetValue = parseInt(rawBudget) || 0;
  const budgetDisplay = budgetValue > 0 ? '₹' + budgetValue.toLocaleString() : 'Open Budget';
  const durationDisplay = (p.duration || '').trim() || 'Flexible';
  const safeId = esc(p.id), safeHostId = esc(p.hostId || ''), safeTitle = esc(p.title || ''), safeHostName = esc(p.hostName || 'Host');
  
  const isLocked = !isSubscribed && budgetValue > currentBudgetFilter;
  
  if (isLocked) {
    return `<div class="project-card" style="position:relative; cursor:pointer;" onclick="openProjectDetails('${safeId}')">
      <div class="pc-top"><span class="pc-cat">${esc(p.category || 'Project')}</span><span class="pc-budget">${budgetDisplay}</span></div>
      <div class="pc-title">${esc(p.title)}</div>
      <div class="pc-desc">${esc(p.description || 'No description provided.')}</div>
      ${skills.length ? `<div class="pc-skills">${skills.map(s => `<span class="skill-chip">${esc(s)}</span>`).join('')}</div>` : ''}
      <div class="pc-meta"><span class="pc-meta-item"><i class="fas fa-clock"></i> <strong>${esc(durationDisplay)}</strong></span></div>
      <div class="unlock-overlay" onclick="event.stopPropagation(); openSubModal()">
        <div class="unlock-icon"><i class="fas fa-lock"></i></div>
        <div class="unlock-msg">Premium Feature<br>Subscribe to unlock premium projects and opportunities.</div>
        <button class="btn-unlock" onclick="event.stopPropagation(); openSubModal()">Subscribe Now</button>
      </div>
    </div>`;
  }
  
  return `<div class="project-card" style="cursor:pointer;" onclick="openProjectDetails('${safeId}')">
    <div class="pc-top"><span class="pc-cat">${esc(p.category || 'Project')}</span><span class="pc-budget">${budgetDisplay}</span></div>
    <div class="pc-title">${esc(p.title)}</div>
    <div class="pc-desc">${esc(p.description || 'No description provided.')}</div>
    ${skills.length ? `<div class="pc-skills">${skills.map(s => `<span class="skill-chip">${esc(s)}</span>`).join('')}</div>` : ''}
    <div class="pc-meta">
      <span class="pc-meta-item"><i class="fas fa-clock"></i> <strong>${esc(durationDisplay)}</strong></span>
    </div>
    <div class="pc-footer">
      <span class="pc-host"><i class="fas fa-user"></i> by <strong>${safeHostName}</strong></span>
      ${applied 
        ? `<span class="btn-applied" onclick="event.stopPropagation()"><i class="fas fa-check"></i> Applied</span>` 
        : `<button class="btn-apply" data-pid="${safeId}" data-hostid="${safeHostId}" data-title="${safeTitle}" data-hostname="${safeHostName}" onclick="event.stopPropagation(); applyProject(this.dataset.pid,this.dataset.hostid,this.dataset.title,this.dataset.hostname,this)">Apply Now</button>`
      }
    </div>
  </div>`;
}

function openProjectDetails(pid) {
  const p = allProjects.find(x => x.id === pid);
  if (!p) return;
  
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  
  const rawBudget = String(p.budget || '').replace(/['\"₹$,\s]/g, '').trim();
  const budgetValue = parseInt(rawBudget) || 0;
  const isLocked = !isSubscribed && budgetValue > currentBudgetFilter;
  
  if (isLocked) {
    closeModal('projectDetailsModal');
    openSubModal();
    showToast('🔒 This project requires premium subscription');
    return;
  }
  
  const pdCat = document.getElementById('pd-cat');
  const pdTitle = document.getElementById('pd-title');
  const pdDesc = document.getElementById('pd-desc');
  const pdBudget = document.getElementById('pd-budget');
  const pdDuration = document.getElementById('pd-duration');
  const pdHost = document.getElementById('pd-host');
  const pdHostAvatar = document.getElementById('pd-host-avatar');
  const pdTags = document.getElementById('pd-tags');
  const pdFooter = document.getElementById('pd-footer');
  
  if (pdCat) pdCat.textContent = p.category || 'Project';
  if (pdTitle) pdTitle.textContent = p.title || 'Untitled Project';
  if (pdDesc) pdDesc.textContent = p.description || 'No description provided.';
  if (pdBudget) pdBudget.textContent = budgetValue > 0 ? '₹' + budgetValue.toLocaleString() : 'Open Budget';
  if (pdDuration) pdDuration.textContent = (p.duration || '').trim() || 'Flexible';
  
  const hostName = p.hostName || 'Anonymous Host';
  if (pdHost) pdHost.textContent = hostName;
  if (pdHostAvatar) pdHostAvatar.textContent = hostName[0].toUpperCase();
  
  const skills = p.requiredSkills || [];
  if (pdTags) pdTags.innerHTML = skills.map(s => `<span class="skill-chip">${esc(s)}</span>`).join('');
  
  const applied = appliedIds.has(p.id);
  const safeId = esc(p.id), safeHostId = esc(p.hostId || ''), safeTitle = esc(p.title || ''), safeHostName = esc(p.hostName || 'Host');
  
  let footerHtml = `<button class="btn-cancel" onclick="closeModal('projectDetailsModal')"><i class="fas fa-times"></i> Close</button>`;
  
  if (applied) {
    footerHtml += `<span class="btn-applied" style="margin-left: auto; display: inline-flex; align-items: center; justify-content: center;"><i class="fas fa-check"></i> Applied</span>`;
  } else {
    footerHtml += `<button class="btn-apply" style="margin-left: auto; padding: 12px 24px; font-size: 14px;" onclick="applyProject('${safeId}', '${safeHostId}', '${safeTitle}', '${safeHostName}', this)">Apply Now</button>`;
  }
  
  if (pdFooter) pdFooter.innerHTML = footerHtml;
  const modal = document.getElementById('projectDetailsModal');
  if (modal) modal.classList.add('open');
}

async function applyProject(pid, hostId, title, hostName, btn) {
  const p = allProjects.find(x => x.id === pid);
  if (p) {
    const rawBudget = String(p.budget || '').replace(/['\"₹$,\s]/g, '').trim();
    const budgetValue = parseInt(rawBudget) || 0;
    
    if (budgetValue > currentBudgetFilter && !isSubscribed) {
      showToast('🔒 This project requires premium subscription');
      openSubModal();
      return;
    }
  }
  
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  
  const res = await FirebaseService.applyToProject({
    developerId: CU.uid || '',
    developerName: UD.displayName || firebase.auth().currentUser?.displayName || 'Developer',
    developerSkill: UD.primarySkill || '',
    projectId: pid || '',
    hostId: hostId || '',
    projectTitle: title || '',
    hostName: hostName || ''
  });
  
  if (res.success) {
    appliedIds.add(pid);
    btn.className = 'btn-applied';
    btn.innerHTML = '<i class="fas fa-check"></i> Applied';
    showToast('✅ Application sent to ' + hostName + '!');
    
    const stApps = document.getElementById('st-apps');
    if (stApps) {
      stApps.textContent = (parseInt(stApps.textContent) || 0) + 1;
    }
  } else {
    showToast(res.error);
    btn.disabled = false;
    btn.innerHTML = 'Apply Now';
  }
}

// ==================== HIRE REQUESTS FUNCTIONS ====================
async function loadRequests() {
  const el = document.getElementById('allRequestsList');
  if (!el) return;
  
  const res = await FirebaseService.getHireRequests(CU.uid);
  if (!res.success || !res.requests.length) {
    el.innerHTML = '<div class="empty"><i class="fas fa-inbox"></i><p>No hire requests yet</p></div>';
    return;
  }
  el.innerHTML = res.requests.map(reqCardHTML).join('');
}

function reqCardHTML(r) {
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  
  const initial = (r.hostName || 'H')[0].toUpperCase();
  const actions = r.status === 'pending'
    ? `<div class="req-actions"><button class="btn-accept" onclick="respondReq('${r.id}','accepted')"><i class="fas fa-check"></i> Accept</button><button class="btn-reject" onclick="respondReq('${r.id}','rejected')"><i class="fas fa-times"></i> Decline</button></div>`
    : `<span class="status-pill sp-${r.status}">${r.status}</span>`;
  
  return `<div class="req-card" id="req-${r.id}">
    <div class="req-avatar">${initial}</div>
    <div class="req-info">
      <h4><i class="fas fa-building"></i> Hire request from <strong>${esc(r.hostName || 'A Company')}</strong></h4>
      <p>${esc(r.message || 'They want to hire you for a project.')}</p>
      ${r.projectTitle ? `<div class="req-project"><i class="fas fa-file"></i> For: ${esc(r.projectTitle)}</div>` : ''}
    </div>${actions}
  </div>`;
}

async function respondReq(id, status) {
  const res = await FirebaseService.updateStatus('hireRequests', id, status);
  if (res.success) {
    showToast(status === 'accepted' ? '✅ Hire request accepted!' : 'Request declined');
    loadRequests();
    loadDashboard();
  } else {
    showToast('Error: ' + res.error);
  }
}

// ==================== MY APPLICATIONS FUNCTIONS ====================
async function loadMyApps() {
  const el = document.getElementById('myAppsList');
  if (!el) return;
  
  const res = await FirebaseService.getDevApplications(CU.uid);
  if (!res.success || !res.applications.length) {
    el.innerHTML = '<div class="empty"><i class="fas fa-file-alt"></i><p>You haven\'t applied to any projects yet</p></div>';
    return;
  }
  
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  
  el.innerHTML = res.applications.map(a => `<div class="app-row">
    <i class="fas fa-file" style="font-size:22px; color:var(--neon2);"></i>
    <div class="app-row-info"><h4>${esc(a.projectTitle || 'Project')}</h4><p><i class="fas fa-user"></i> Host: ${esc(a.hostName || '—')}</p></div>
    <span class="status-pill sp-${a.status || 'pending'}">${a.status || 'pending'}</span>
  </div>`).join('');
}

// ==================== PROFILE FUNCTIONS ====================
function loadProfileForm() {
  const pfName = document.getElementById('pf-name');
  const pfBio = document.getElementById('pf-bio');
  
  if (pfName) pfName.value = UD.displayName || '';
  if (pfBio) pfBio.value = UD.bio || '';
  
  const setDropdown = (id, val) => {
    const sel = document.getElementById(id);
    if (val && sel) {
      for (let o of sel.options) if (o.value === val || o.textContent === val) { o.selected = true; break; }
    }
  };

  setDropdown('pf-exp', UD.experience);
  setDropdown('pf-skill', UD.primarySkill);
  setDropdown('pf-exp-type', UD.focusExperience);

  const pfMinBudget = document.getElementById('pf-min-budget');
  if (pfMinBudget) pfMinBudget.value = UD.minBudget || '';
  
  const pfCertCount = document.getElementById('pf-cert-count');
  if (pfCertCount) pfCertCount.value = UD.certCount || '';
  
  const pfCertNames = document.getElementById('pf-cert-names');
  if (pfCertNames) pfCertNames.value = UD.certNames || '';
  
  const pfGithub = document.getElementById('pf-github');
  if (pfGithub) pfGithub.value = UD.github || '';
  
  const pfPortfolio = document.getElementById('pf-portfolio');
  if (pfPortfolio) pfPortfolio.value = UD.portfolio || '';
  
  const pfLinkedin = document.getElementById('pf-linkedin');
  if (pfLinkedin) pfLinkedin.value = UD.linkedin || '';

  userSkills = UD.skills || [];
  renderSkills();
  updateProfileCard();
}

function updateProfileCard() {
  const name = UD.displayName || 'Developer';
  const profileCardName = document.getElementById('profileCardName');
  const profileCardSkill = document.getElementById('profileCardSkill');
  const pcRating = document.getElementById('pcRating');
  const pcStars = document.getElementById('pcStars');
  
  if (profileCardName) profileCardName.textContent = name;
  if (profileCardSkill) profileCardSkill.textContent = UD.primarySkill || '—';
  if (pcRating) pcRating.textContent = UD.rating ? UD.rating.toFixed(1) + ' ⭐' : 'New';
  
  const storedStars = JSON.parse(localStorage.getItem('cnp_stars_' + CU.uid) || '{}');
  if (pcStars) pcStars.innerHTML = '<i class="fas fa-star" style="color:#fbbf24;"></i> ' + Object.keys(storedStars).length;
}

async function saveProfile() {
  const data = {
    displayName: document.getElementById('pf-name').value.trim(),
    bio: document.getElementById('pf-bio').value.trim(),
    primarySkill: document.getElementById('pf-skill').value,
    experience: document.getElementById('pf-exp').value,
    github: document.getElementById('pf-github').value.trim(),
    portfolio: document.getElementById('pf-portfolio').value.trim(),
    linkedin: document.getElementById('pf-linkedin').value.trim(),
    skills: userSkills,
    focusExperience: document.getElementById('pf-exp-type').value,
    minBudget: document.getElementById('pf-min-budget').value,
    certCount: document.getElementById('pf-cert-count').value,
    certNames: document.getElementById('pf-cert-names').value.trim()
  };

  if (!data.displayName) return showToast('⚠ Name is required');

  const res = await FirebaseService.updateProfile('developer', CU.uid, data);
  if (res.success) {
    UD = {...UD, ...data};
    updateProfileCard();
    showToast('✅ Advanced profile saved successfully!');
    
    if (data.primarySkill) {
      const selector = document.getElementById('learningPathSelector');
      if (selector) {
        selector.value = data.primarySkill;
        currentLearningPath = data.primarySkill;
        loadLearnPage(currentLearningPath);
      }
    }
  } else {
    showToast('Error: ' + res.error);
  }
}

function addSkill() {
  const inp = document.getElementById('skillInput');
  const val = inp.value.trim();
  if (!val || userSkills.includes(val)) {
    inp.value = '';
    return;
  }
  userSkills.push(val);
  inp.value = '';
  renderSkills();
}

function removeSkill(skill) {
  userSkills = userSkills.filter(s => s !== skill);
  renderSkills();
}

function renderSkills() {
  const skillsCloud = document.getElementById('skillsCloud');
  if (skillsCloud) {
    function esc(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }
    skillsCloud.innerHTML = userSkills.map(s => `<span class="skill-tag"><i class="fas fa-tag"></i> ${esc(s)}<button class="remove" onclick="removeSkill('${esc(s)}')">×</button></span>`).join('');
  }
}

// ==================== AVAILABILITY FUNCTIONS ====================
async function toggleAvailability() {
  isAvail = !isAvail;
  updateAvailUI();
  await FirebaseService.updateProfile('developer', CU.uid, {available: isAvail});
  showToast(isAvail ? '✅ You are now available for hire!' : '🔴 You are now unavailable');
}

function updateAvailUI() {
  const pill = document.getElementById('availPill');
  const availPillText = document.getElementById('availPillText');
  const profileToggle = document.getElementById('profileToggle');
  const stStatus = document.getElementById('st-status');
  
  if (pill) pill.className = 'avail-pill ' + (isAvail ? 'on' : 'off');
  if (availPillText) availPillText.textContent = isAvail ? 'Available' : 'Unavailable';
  if (profileToggle) profileToggle.classList.toggle('on', isAvail);
  if (stStatus) stStatus.textContent = isAvail ? '✅ Open' : '🔴 Closed';
}

// ==================== BADGES & EXAMS FUNCTIONS ====================
const EXAM_DATA = [
  {id:'ex1',title:'Programming Fundamentals',icon:'💡',desc:'Loops, functions, variables, OOP basics',questions:[
    {q:'What is the time complexity of binary search?',opts:['O(n)','O(log n)','O(n²)','O(1)'],ans:1},
    {q:'Which keyword is used to define a class in Python?',opts:['class','def','type','object'],ans:0},
    {q:'What does OOP stand for?',opts:['Object Oriented Programming','Open Object Protocol','Only One Process','Operator Override Pattern'],ans:0},
    {q:'Which data structure uses LIFO?',opts:['Queue','Array','Stack','Linked List'],ans:2},
    {q:'What is a recursive function?',opts:['A function with no return','A function that calls itself','A function with many params','A pure function'],ans:1},
    {q:'What does DRY mean in coding?',opts:["Don't Repeat Yourself","Do Run Yourself","Data Relay Yield","Direct Reference Yield"],ans:0},
    {q:'What is a null pointer?',opts:['A pointer to zero','A pointer to nothing/undefined','A negative pointer','A float pointer'],ans:1},
    {q:'Which is a compiled language?',opts:['Python','JavaScript','C++','Ruby'],ans:2},
    {q:'What is memoization?',opts:['Random caching','Caching function results','Memory allocation','A sorting algorithm'],ans:1},
    {q:'Big O notation describes?',opts:['Code style','Algorithm complexity','Memory usage only','Runtime errors'],ans:1}
  ]},
  {id:'ex2',title:'Web Development',icon:'🌐',desc:'HTML, CSS, JavaScript, REST APIs',questions:[
    {q:'What does DOM stand for?',opts:['Data Object Model','Document Object Model','Dynamic Output Module','Direct Object Method'],ans:1},
    {q:'Which CSS property controls spacing inside an element?',opts:['margin','padding','border','gap'],ans:1},
    {q:'What HTTP method is used to create a resource?',opts:['GET','DELETE','POST','PUT'],ans:2},
    {q:'What is a closure in JavaScript?',opts:['A loop construct','A function inside a function with access to outer scope','A closed block','A module pattern'],ans:1},
    {q:'What is the purpose of async/await?',opts:['Styling','Handle asynchronous operations','Define classes','Import modules'],ans:1},
    {q:'Which tag makes text bold in HTML?',opts:['<i>','<em>','<b>','<strong>'],ans:3},
    {q:'What does CORS stand for?',opts:['Cross Origin Resource Sharing','Client Object Request System','Code Open Resource Store','Cross Open Request Schema'],ans:0},
    {q:'What is a RESTful API?',opts:['A GraphQL variant','Stateless HTTP-based API','A WebSocket API','A database API'],ans:1},
    {q:'What is the box model in CSS?',opts:['Layout algorithm','Content + padding + border + margin','Grid system','Flexbox model'],ans:1},
    {q:'What does JSON stand for?',opts:['Java Serialized Object Notation','JavaScript Object Notation','JSON Serialized Object Net','Java String Object Notation'],ans:1}
  ]},
  {id:'ex3',title:'Databases & SQL',icon:'🗄️',desc:'SQL queries, NoSQL, indexing, normalization',questions:[
    {q:'What does SQL stand for?',opts:['Structured Query Language','Simple Query Logic','Semantic Query Language','Standard Query List'],ans:0},
    {q:'Which SQL clause filters results?',opts:['SELECT','FROM','WHERE','ORDER BY'],ans:2},
    {q:'What is a primary key?',opts:['Unique row identifier','Any indexed column','The first column','A foreign reference'],ans:0},
    {q:'What is normalization?',opts:['Data encryption','Organizing data to reduce redundancy','Compressing data','Indexing data'],ans:1},
    {q:'Which is a NoSQL database?',opts:['MySQL','PostgreSQL','MongoDB','SQLite'],ans:2},
    {q:'What is an index in a database?',opts:['A primary key','A data structure to speed up queries','A table schema','A stored procedure'],ans:1},
    {q:'What does JOIN do in SQL?',opts:['Splits a table','Combines rows from multiple tables','Deletes duplicates','Sorts data'],ans:1},
    {q:'What is a transaction?',opts:['A database query','A group of operations as a single unit','A table relationship','A cache hit'],ans:1},
    {q:'ACID stands for?',opts:['Atomic Consistent Isolated Durable','Active Committed Indexed Data','Auto Commit Insert Delete','Async Concurrent Isolated Data'],ans:0},
    {q:'What is a foreign key?',opts:['A unique key','A key that references another table','An encrypted key','An index key'],ans:1}
  ]},
  {id:'ex4',title:'System Design',icon:'🏗️',desc:'Scalability, microservices, caching, load balancing',questions:[
    {q:'What is horizontal scaling?',opts:['Upgrading a server','Adding more servers','Splitting a database','Caching data'],ans:1},
    {q:'What is a CDN?',opts:['Central Data Network','Content Delivery Network','Cloud Data Node','Cached DNS Node'],ans:1},
    {q:'What is load balancing?',opts:['Database optimization','Distributing traffic across servers','Caching responses','Compressing data'],ans:1},
    {q:'What is a microservice?',opts:['A tiny CSS file','Independent service with a single responsibility','A mini-database','A frontend component'],ans:1},
    {q:'What is eventual consistency?',opts:['Immediate consistency','Data will be consistent over time','Never consistent','Only consistent in SQL'],ans:1},
    {q:'What is a message queue?',opts:['A chat system','Async communication buffer between services','A logging system','A caching layer'],ans:1},
    {q:'What does CAP theorem state?',opts:['You can have all three simultaneously','You can only have two of CA, CP, or AP','A caching strategy','A security principle'],ans:1},
    {q:'What is idempotency?',opts:['Multiple different results','Same result regardless of how many times called','Random outcomes','State-dependent results'],ans:1},
    {q:'What is rate limiting?',opts:['Speed optimization','Controlling request frequency','Memory management','Load balancing technique'],ans:1},
    {q:'What is a reverse proxy?',opts:['A forward proxy','Server that forwards client requests to backend','A DNS resolver','A firewall'],ans:1}
  ]},
  {id:'ex5',title:'DevOps & Deployment',icon:'🚀',desc:'CI/CD, Docker, Kubernetes, cloud concepts',questions:[
    {q:'What does CI/CD stand for?',opts:['Code Integration / Code Deployment','Continuous Integration / Continuous Delivery','Cloud Infrastructure / Cloud Delivery','Core Interface / Core Design'],ans:1},
    {q:'What is Docker?',opts:['A programming language','A container platform','A cloud service','A database'],ans:1},
    {q:'What is Kubernetes used for?',opts:['Frontend styling','Container orchestration','Database management','Code versioning'],ans:1},
    {q:'What is Git used for?',opts:['Runtime environment','Version control','Deployment','Testing'],ans:1},
    {q:'What is a Dockerfile?',opts:['A log file','Instructions to build a Docker image','A deployment config','A test file'],ans:1},
    {q:'What does IaC mean?',opts:['Interface and Control','Infrastructure as Code','Integration and Config','Intelligent and Clever'],ans:1},
    {q:'What is blue-green deployment?',opts:['A git branching strategy','Two identical environments for zero-downtime deploys','A CSS animation','A security model'],ans:1},
    {q:'What is a pod in Kubernetes?',opts:['A Docker file','Smallest deployable unit containing containers','A service account','A network policy'],ans:1},
    {q:'What is a load balancer health check?',opts:['CPU usage monitor','Verifying backend instance is alive','Memory check','Disk space audit'],ans:1},
    {q:'What is serverless computing?',opts:['Computing without servers','Running code without managing infrastructure','Free tier cloud','Offline computing'],ans:1}
  ]}
];

function loadBadgesPage() {
  const storedStars = JSON.parse(localStorage.getItem('cnp_stars_' + CU.uid) || '{}');
  earnedStars = Object.keys(storedStars).length;
  
  const totalStars = document.getElementById('totalStars');
  if (totalStars) totalStars.textContent = earnedStars;
  
  const pcStars = document.getElementById('pcStars');
  if (pcStars) pcStars.innerHTML = '<i class="fas fa-star" style="color:#fbbf24;"></i> ' + earnedStars;
  
  const container = document.getElementById('examsList');
  if (!container) return;
  
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  
  container.innerHTML = EXAM_DATA.map(exam => {
    const passed = storedStars[exam.id];
    const pct = passed ? 100 : 0;
    
    let iconHtml = exam.icon;
    if (exam.icon === '💡') iconHtml = '<i class="fas fa-lightbulb"></i>';
    else if (exam.icon === '🌐') iconHtml = '<i class="fas fa-globe"></i>';
    else if (exam.icon === '🗄️') iconHtml = '<i class="fas fa-database"></i>';
    else if (exam.icon === '🏗️') iconHtml = '<i class="fas fa-building"></i>';
    else if (exam.icon === '🚀') iconHtml = '<i class="fas fa-rocket"></i>';
    
    return `<div class="exam-card ${passed ? 'passed' : ''}">
      <div class="ec-top"><span class="ec-icon">${iconHtml}</span><div class="ec-star ${passed ? 'earned' : 'not-earned'}">${passed ? '<i class="fas fa-star"></i>' : ''}</div></div>
      <div class="ec-title">${esc(exam.title)}</div>
      <div class="ec-desc">${esc(exam.desc)}</div>
      <div class="ec-progress">
        <div class="ec-pbar"><div class="ec-pfill" style="width:${pct}%"></div></div>
        <div class="ec-meta"><span>${exam.questions.length} questions</span><span>${passed ? '<i class="fas fa-star" style="color:#fbbf24;"></i> Passed' : 'Not started'}</span></div>
      </div>
      ${passed ? `<button class="btn-passed"><i class="fas fa-star"></i> Star Earned!</button>` : `<button class="btn-take-exam" onclick="startExam('${exam.id}')"><i class="fas fa-pencil-alt"></i> Take Exam →</button>`}
    </div>`;
  }).join('');
}

// ==================== EXAM ENGINE ====================
function startExam(examId) {
  currentExam = EXAM_DATA.find(e => e.id === examId);
  currentQ = 0;
  score = 0;
  answered = false;
  const modal = document.getElementById('examModal');
  if (modal) modal.classList.add('open');
  renderQuestion();
}

function renderQuestion() {
  if (!currentExam) return;
  
  const q = currentExam.questions[currentQ];
  const total = currentExam.questions.length;
  const pct = ((currentQ) / total) * 100;
  
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  
  const examContent = document.getElementById('examContent');
  if (!examContent) return;
  
  examContent.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <h3>${currentExam.icon} ${esc(currentExam.title)}</h3>
      <button class="btn-cancel" onclick="closeModal('examModal')" style="padding:6px 12px;font-size:12px"><i class="fas fa-times"></i></button>
    </div>
    <div class="exam-progress-bar"><div class="exam-progress-fill" style="width:${pct}%"></div></div>
    <div class="exam-q-num">Question ${currentQ + 1} of ${total}</div>
    <div class="exam-q-text">${esc(q.q)}</div>
    <div class="exam-options">
      ${q.opts.map((opt, i) => `<button class="exam-opt" id="opt-${i}" onclick="selectOpt(${i})">${esc(opt)}</button>`).join('')}
    </div>
    <div style="text-align:right">
      <button class="btn-primary" id="nextBtn" onclick="nextQuestion()" style="opacity:.4;cursor:not-allowed" disabled>Next <i class="fas fa-arrow-right"></i></button>
    </div>`;
  answered = false;
}

function selectOpt(i) {
  if (answered || !currentExam) return;
  answered = true;
  
  const q = currentExam.questions[currentQ];
  if (i === q.ans) score++;
  
  document.querySelectorAll('.exam-opt').forEach((el, idx) => {
    if (idx === q.ans) el.classList.add('correct');
    else if (idx === i) el.classList.add('wrong');
    el.style.cursor = 'default';
  });
  
  const nb = document.getElementById('nextBtn');
  if (nb) {
    nb.disabled = false;
    nb.style.opacity = '1';
    nb.style.cursor = 'pointer';
  }
}

function nextQuestion() {
  if (!currentExam) return;
  
  currentQ++;
  if (currentQ >= currentExam.questions.length) {
    showExamResult();
  } else {
    renderQuestion();
  }
}

function showExamResult() {
  if (!currentExam) return;
  
  const total = currentExam.questions.length;
  const passed = score >= Math.ceil(total * 0.6);
  
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  
  if (passed) {
    const storedStars = JSON.parse(localStorage.getItem('cnp_stars_' + CU.uid) || '{}');
    storedStars[currentExam.id] = true;
    localStorage.setItem('cnp_stars_' + CU.uid, JSON.stringify(storedStars));
    earnedStars = Object.keys(storedStars).length;
    
    const totalStars = document.getElementById('totalStars');
    if (totalStars) totalStars.textContent = earnedStars;
    
    const pcStars = document.getElementById('pcStars');
    if (pcStars) pcStars.innerHTML = '<i class="fas fa-star" style="color:#fbbf24;"></i> ' + earnedStars;
  }
  
  const examContent = document.getElementById('examContent');
  if (!examContent) return;
  
  examContent.innerHTML = `
    <div class="exam-result">
      <span class="result-icon"><i class="fas fa-${passed ? 'trophy' : 'book'}"></i></span>
      <h3>${passed ? 'Congratulations! You Passed!' : 'Keep Practicing!'}</h3>
      <p>You scored ${score} out of ${total} (${Math.round((score / total) * 100)}%)</p>
      ${passed ? `<div class="star-award"><i class="fas fa-star"></i> ${esc(currentExam.title)} Star Earned!</div>` : `<p style="margin-top:12px;font-size:13px;color:var(--muted)">Need ${Math.ceil(total * 0.6)} correct answers to pass. Try again!</p>`}
      <div style="margin-top:24px;display:flex;gap:10px;justify-content:center">
        <button class="btn-cancel" onclick="closeModal('examModal');loadBadgesPage()">Close</button>
        ${!passed ? `<button class="btn-primary" onclick="startExam('${currentExam.id}')"><i class="fas fa-redo-alt"></i> Retry</button>` : ''}
      </div>
    </div>`;
}

// ==================== UTILITY FUNCTIONS ====================
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.style.display = 'none', 3500);
}

// ==================== MODAL FUNCTIONS ====================
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}
// ==================== EVENT MODAL FUNCTIONS ====================
// ==================== EVENT MODAL FUNCTIONS ====================
function openEventModal(type) {
  const modal = document.getElementById("eventModal");
  const title = document.getElementById("eventTypeTitle");
  const btn = document.getElementById("finalRegisterBtn");

  if (!modal || !title || !btn) {
    console.error("Event modal elements not found");
    return;
  }

  modal.classList.add("active");

  if (type === "offline") {
    title.innerHTML = "Offline Meetup • AIML Building 📍";
  } else {
    title.innerHTML = "Online Live Session 💻";
  }

  btn.onclick = () => {
    window.open("https://forms.gle/ogTJrBy7Hxny6yii7", "_blank");
  };
}

function closeEventModal() {
  const modal = document.getElementById("eventModal");
  if (modal) {
    modal.classList.remove("active");
  }
}
// ==================== BUDGET FILTER FUNCTIONS ====================
function updateBudgetFilter(value) {
  currentBudgetFilter = parseInt(value);
  const budgetValueEl = document.getElementById('budgetValue');
  if (budgetValueEl) budgetValueEl.textContent = currentBudgetFilter.toLocaleString();
  
  const budgetInfoBox = document.getElementById('budgetInfoBox');
  const budgetInfoIcon = document.getElementById('budgetInfoIcon');
  const budgetInfoTitle = document.getElementById('budgetInfoTitle');
  const budgetInfoDesc = document.getElementById('budgetInfoDesc');
  const budgetBadge = document.getElementById('budgetBadge');
  
  if (!budgetInfoBox || !budgetInfoIcon || !budgetInfoTitle || !budgetInfoDesc || !budgetBadge) return;
  
  if (currentBudgetFilter <= 1000) {
    budgetInfoIcon.innerHTML = '<i class="fas fa-lock-open"></i>';
    budgetInfoTitle.textContent = 'Projects under ₹1000 are Free';
    budgetInfoDesc.textContent = 'Projects above ₹1000 require Premium subscription (₹69/month) to view details and apply';
    budgetBadge.className = 'budget-badge-free';
    budgetBadge.textContent = 'FREE';
  } else {
    budgetInfoIcon.innerHTML = '<i class="fas fa-lock"></i>';
    budgetInfoTitle.textContent = `Projects above ₹${currentBudgetFilter.toLocaleString()} are Premium`;
    budgetInfoDesc.textContent = `You need Premium subscription (₹69/month) to view and apply to projects above ₹${currentBudgetFilter.toLocaleString()}`;
    budgetBadge.className = 'budget-badge-premium';
    budgetBadge.textContent = 'PREMIUM';
  }
  
  updateProjectCounts();
  renderProjects(allProjects);
}

function updateProjectCounts() {
  if (!allProjects.length) return;
  
  const freeProjects = allProjects.filter(p => {
    const budget = parseInt(String(p.budget || '').replace(/[^\d]/g, '')) || 0;
    return budget <= 1000;
  }).length;
  
  const premiumProjects = allProjects.length - freeProjects;
  
  const freeEl = document.getElementById('freeProjectsCount');
  const premEl = document.getElementById('premiumProjectsCount');
  
  if (freeEl) freeEl.textContent = `Free: ${freeProjects}`;
  if (premEl) premEl.textContent = `Premium: ${premiumProjects}`;
}

// ==================== AVATAR DROPDOWN FUNCTIONS ====================
function handleAvatarInteraction(event) {
  event.stopPropagation();
  
  if (window.innerWidth > 768) {
    const dropdown = document.getElementById('laptopDropdown');
    if (dropdown) dropdown.classList.toggle('visible');
  } else {
    toggleMobileMenu();
  }
}

function closePCDropdown() {
  const dropdown = document.getElementById('laptopDropdown');
  if (dropdown) dropdown.classList.remove('visible');
}

// ==================== LOGOUT ====================
async function handleLogout() {
  await FirebaseService.signOut();
  window.location.href = 'auth.html';
}

// ==================== INIT ====================
setTimeout(() => {
  startOfferTimer();
}, 500);

document.addEventListener('click', function(event) {
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileMenuOverlay');
  const hamburger = document.querySelector('.hamburger-btn');
  const avatar = document.querySelector('.avatar-btn');
  
  if ((hamburger && !hamburger.contains(event.target)) && (avatar && !avatar.contains(event.target)) && menu && !menu.contains(event.target)) {
    if (overlay) overlay.classList.remove('open');
    if (menu) menu.classList.remove('open');
  }
  
  const dropdown = document.getElementById('laptopDropdown');
  const wrapper = document.querySelector('.avatar-wrapper');
  if (dropdown && wrapper && !wrapper.contains(event.target)) {
    dropdown.classList.remove('visible');
  }
});

document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) m.classList.remove('open');
  });
});
// When module is completed, call back to dev.html
async function completeModuleAndReturn() {
    const moduleId = MODULE_ID;
    const moduleTitle = MODULE_DATA ? MODULE_DATA.title : 'Module';
    const moduleBadge = MODULE_DATA ? MODULE_DATA.badge : 'Badge';
    
    // Check if all chapters are completed
    const allChaptersCompleted = chaptersArray.every(ch => completedChapters[ch.id] === true);
    
    if (allChaptersCompleted && !moduleCompleted) {
        moduleCompleted = true;
        saveProgress();
        
        // Call the parent window function to mark module complete
        if (window.opener && window.opener.markModuleComplete) {
            await window.opener.markModuleComplete(moduleId, moduleTitle, moduleBadge);
        } else if (window.parent && window.parent.markModuleComplete) {
            await window.parent.markModuleComplete(moduleId, moduleTitle, moduleBadge);
        }
        
        // Show completion modal
        showCompletionModal(moduleBadge);
    }
}

function showCompletionModal(badge) {
    const modal = document.getElementById('completionModal');
    if (modal) {
        const content = modal.querySelector('.modal');
        if (content) {
            content.innerHTML = `
                <h2><i class="fas fa-trophy"></i> Congratulations!</h2>
                <div class="completion-badge">
                    <i class="fas fa-certificate"></i>
                    <h3>${badge}</h3>
                    <p>has been added to your profile</p>
                </div>
                <p style="text-align: center; margin-bottom: 24px;">You've successfully completed all chapters!</p>
                <div style="display: flex; gap: 16px; justify-content: center;">
                    <button class="btn-primary" onclick="returnToLearningPath()">
                        <i class="fas fa-arrow-right"></i> Continue to Learning Path
                    </button>
                </div>
            `;
        }
        modal.classList.add('open');
    }
}

function returnToLearningPath() {
    window.location.href = 'dev.html#page-learn';
}

// Call this when all chapters are completed
// Add this check in your markChapterComplete function
const originalMarkChapterComplete = markChapterComplete;
window.markChapterComplete = function(chapterId) {
    originalMarkChapterComplete(chapterId);
    
    // Check if all chapters are now completed
    const allCompleted = chaptersArray.every(ch => completedChapters[ch.id] === true);
    if (allCompleted && !moduleCompleted) {
        completeModuleAndReturn();
    }
};
// ==================== EVENT MODAL FUNCTIONS ====================
function openEventModal(type) {
  const modal = document.getElementById("eventModal");
  const title = document.getElementById("eventTypeTitle");
  const btn = document.getElementById("finalRegisterBtn");

  if (!modal || !title || !btn) {
    console.error("Event modal elements not found");
    return;
  }

  modal.classList.add("active");

  if (type === "offline") {
    title.innerHTML = "Offline Meetup • AIML Building 📍";
  } else {
    title.innerHTML = "Online Live Session 💻";
  }

  btn.onclick = () => {
    window.open("https://forms.gle/ogTJrBy7Hxny6yii7", "_blank");
  };
}

function closeEventModal() {
  const modal = document.getElementById("eventModal");
  if (modal) {
    modal.classList.remove("active");
  }
}
// Export functions for use in modules page
window.markTopicComplete = markTopicComplete;
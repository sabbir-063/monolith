// Generate or retrieve persistent User ID
const getOrCreateUserId = () => {
  if (typeof window === 'undefined') return 'unknown';
  let userId = localStorage.getItem('monolith_user_id');
  if (!userId) {
    userId = 'usr_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('monolith_user_id', userId);
  }
  return userId;
};

// Generate or retrieve Session ID
const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return 'unknown';
  let sessionId = sessionStorage.getItem('monolith_session_id');
  if (!sessionId) {
    sessionId = 'ses_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('monolith_session_id', sessionId);
  }
  return sessionId;
};

let userId = 'unknown';
let sessionId = 'unknown';
let sessionStartTime = typeof Date !== 'undefined' ? Date.now() : 0;

if (typeof window !== 'undefined') {
  userId = getOrCreateUserId();
  sessionId = getOrCreateSessionId();
  sessionStartTime = Date.now();
}

// Get page load time in ms
const getPageLoadTime = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const [entry] = performance.getEntriesByType('navigation');
    if (entry) {
      return Math.round(entry.duration);
    }
    const t = window.performance.timing;
    if (t) {
      return t.loadEventEnd - t.navigationStart;
    }
  }
  return 0;
};

export const trackEvent = async (eventType, eventDetail) => {
  if (typeof window === 'undefined') return;

  const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
  const pageLoadTime = getPageLoadTime();

  const payload = {
    userId,
    sessionId,
    eventType,
    eventDetail,
    pageUrl: window.location.href,
    referrer: document.referrer || 'Direct',
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language || 'Unknown',
    sessionDuration,
    pageLoadTime,
  };

  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (err) {
    console.error('Failed to send tracking event:', err);
  }
};

export const trackChatMessage = async (sender, messageText) => {
  if (typeof window === 'undefined') return;

  const payload = {
    userId,
    sessionId,
    sender,
    message: messageText,
    pageUrl: window.location.href,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language || 'Unknown',
  };

  try {
    await fetch('/api/chat-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (err) {
    console.error('Failed to send chat tracking event:', err);
  }
};

// Auto track page views and click events on elements
export const initTracker = () => {
  if (typeof window === 'undefined') return;

  // Track page view when loaded
  const sendPageView = () => {
    trackEvent('page_view', document.title || 'MONOLITH Home');
  };

  if (document.readyState === 'complete') {
    sendPageView();
  } else {
    window.addEventListener('load', sendPageView, { once: true });
  }

  // Intercept click events on interactive elements
  window.addEventListener('click', (e) => {
    const interactiveElement = e.target.closest('button, a, [data-track]');
    if (!interactiveElement) return;

    const explicitLabel = interactiveElement.getAttribute('data-track');
    const elementId = interactiveElement.id;
    const elementText = interactiveElement.innerText?.trim().substring(0, 50);
    const label = explicitLabel || elementId || elementText || 'unnamed_element';

    trackEvent('click', label);
  }, { passive: true });
};

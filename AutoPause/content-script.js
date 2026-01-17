/**
 * Content Script for YouTube Focus Manager
 * Runs on YouTube tabs to control video playback based on page visibility
 * and tab focus state.
 */

// Track whether the user manually paused the video
let userManuallyPaused = false;
let videoElement = null;
let isPageVisible = true;

/**
 * Get the main YouTube video element
 * YouTube uses the HTML5 <video> element for playback
 */
function getYouTubeVideoElement() {
  // YouTube's main video player uses the video tag within specific containers
  return document.querySelector('video');
}

/**
 * Initialize the video element tracking
 * Sets up listeners to detect manual pause/play by the user
 */
function initializeVideoTracking() {
  videoElement = getYouTubeVideoElement();
  
  if (!videoElement) {
    // Video element not yet loaded, retry after a short delay
    setTimeout(initializeVideoTracking, 500);
    return;
  }

  // Listen for user play events to reset the manual pause flag
  videoElement.addEventListener('play', handleVideoPlay);
  
  // Listen for user pause events to track manual pauses
  videoElement.addEventListener('pause', handleVideoPause);

  console.log('[YouTube Focus Manager] Video element tracked');
}

/**
 * Handle when the video is played
 * If the page is visible and we're resuming from a tab switch, 
 * we know the user intends to watch
 */
function handleVideoPlay() {
  // Only reset manual pause flag if page is visible
  // This means the user actively clicked play on the visible page
  if (isPageVisible) {
    userManuallyPaused = false;
    console.log('[YouTube Focus Manager] User played video');
  }
}

/**
 * Handle when the video is paused
 * Track if the user manually paused while the page was visible
 */
function handleVideoPause() {
  // Only track as manual pause if the page is currently visible
  // (User can see and interact with the page)
  if (isPageVisible) {
    userManuallyPaused = true;
    console.log('[YouTube Focus Manager] User manually paused video');
  }
}

/**
 * Pause the video
 * Only pauses if the user hasn't manually paused it
 */
function pauseVideo() {
  if (!videoElement) {
    videoElement = getYouTubeVideoElement();
  }

  if (videoElement && !videoElement.paused && !userManuallyPaused) {
    videoElement.pause();
    console.log('[YouTube Focus Manager] Paused video due to tab switch');
  }
}

/**
 * Resume the video
 * Only resumes if the user hasn't manually paused it
 */
function resumeVideo() {
  if (!videoElement) {
    videoElement = getYouTubeVideoElement();
  }

  if (videoElement && videoElement.paused && !userManuallyPaused) {
    videoElement.play().catch(err => {
      // Play might fail due to browser autoplay policies
      console.log('[YouTube Focus Manager] Could not resume video:', err.message);
    });
    console.log('[YouTube Focus Manager] Resumed video after tab focus');
  }
}

/**
 * Listen for visibility changes (Page Visibility API)
 * Handles cases where the user minimizes the browser or switches to another tab
 */
document.addEventListener('visibilitychange', () => {
  isPageVisible = !document.hidden;

  if (isPageVisible) {
    console.log('[YouTube Focus Manager] Page became visible');
    resumeVideo();
  } else {
    console.log('[YouTube Focus Manager] Page became hidden');
    pauseVideo();
  }
});

/**
 * Listen for messages from the service worker
 * Service worker notifies when the tab loses or gains focus
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TAB_FOCUS_CHANGED') {
    if (message.isFocused) {
      console.log('[YouTube Focus Manager] Tab gained focus');
      resumeVideo();
    } else {
      console.log('[YouTube Focus Manager] Tab lost focus');
      pauseVideo();
    }
  }
  sendResponse({ received: true });
});

/**
 * Initialize tracking when the script loads
 */
initializeVideoTracking();

console.log('[YouTube Focus Manager] Content script loaded on YouTube page');

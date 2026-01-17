/**
 * Service Worker for YouTube Focus Manager
 * Monitors tab and window focus changes to notify content scripts
 * when the YouTube tab gains or loses focus
 */

// Map to track tab focus state
const tabFocusState = new Map();

/**
 * Handle when a tab becomes active
 * Send message to content script if it's a YouTube tab
 */
chrome.tabs.onActivated.addListener(activeInfo => {
  const tabId = activeInfo.tabId;
  
  // Get information about the newly active tab
  chrome.tabs.get(tabId, (tab) => {
    if (!tab) return;

    // Check if the tab is a YouTube page
    if (isYouTubeTab(tab)) {
      console.log('[YouTube Focus Manager] YouTube tab gained focus:', tabId);
      
      // Send message to content script to resume video
      chrome.tabs.sendMessage(tabId, {
        type: 'TAB_FOCUS_CHANGED',
        isFocused: true
      }).catch(err => {
        // Tab might not have content script loaded yet
        console.log('[YouTube Focus Manager] Could not send message to tab:', err);
      });
    }
  });

  // Mark all other tabs as not focused
  for (const [id, state] of tabFocusState.entries()) {
    if (id !== tabId) {
      tabFocusState.set(id, false);
    }
  }
  tabFocusState.set(tabId, true);
});

/**
 * Handle when a window loses focus
 * All tabs in the unfocused window should pause their videos
 */
chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus entirely (user switched to another application)
    console.log('[YouTube Focus Manager] Browser lost focus');
    
    // Notify all tracked tabs that they lost focus
    notifyAllYouTubeTabs(false);
  } else {
    // Browser regained focus
    console.log('[YouTube Focus Manager] Browser regained focus');
    
    // Get the currently active tab in the focused window
    chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
      if (tabs.length > 0 && isYouTubeTab(tabs[0])) {
        // The active tab in the focused window is YouTube, resume it
        const tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, {
          type: 'TAB_FOCUS_CHANGED',
          isFocused: true
        }).catch(err => {
          console.log('[YouTube Focus Manager] Could not send message:', err);
        });
      }
    });
  }
});

/**
 * Handle when a tab is closed
 * Clean up tracking data
 */
chrome.tabs.onRemoved.addListener(tabId => {
  if (tabFocusState.has(tabId)) {
    tabFocusState.delete(tabId);
    console.log('[YouTube Focus Manager] Cleaned up closed tab:', tabId);
  }
});

/**
 * Check if a tab is a YouTube tab
 */
function isYouTubeTab(tab) {
  return tab.url && (
    tab.url.includes('youtube.com') || 
    tab.url.includes('www.youtube.com')
  );
}

/**
 * Notify all YouTube tabs of focus change
 */
function notifyAllYouTubeTabs(isFocused) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (isYouTubeTab(tab)) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'TAB_FOCUS_CHANGED',
          isFocused: isFocused
        }).catch(err => {
          // Silently ignore if tab doesn't have content script
        });
      }
    });
  });
}

console.log('[YouTube Focus Manager] Service worker initialized');

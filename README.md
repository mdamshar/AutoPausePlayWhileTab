# YouTube Focus Manager - Chrome Extension

Automatically pause YouTube videos when you switch away from the tab or application, and resume playing when you return. Perfect for maintaining focus while developing or working on other tasks.

## Features

✅ **Auto-pause on tab switch** - Pauses video when you switch to another tab
✅ **Auto-pause on app switch** - Pauses video when you switch to another application (Alt+Tab)
✅ **Auto-pause on browser minimize** - Pauses video when you minimize the browser window
✅ **Smart resume** - Resumes only if you didn't manually pause the video
✅ **Manual override** - Respects your manual pause/play actions
✅ **Lightweight** - Minimal performance impact with efficient event listeners
✅ **YouTube only** - Only affects YouTube tabs, no interference with other sites

## How It Works

### Content Script (`content-script.js`)
- Runs on all YouTube pages
- Detects the HTML5 `<video>` element used by YouTube player
- Tracks whether the user manually paused the video
- Listens for visibility changes via the Page Visibility API
- Receives messages from the service worker about tab focus changes
- Controls video playback (play/pause) based on tab and page visibility

### Service Worker (`service-worker.js`)
- Monitors tab activation events (`chrome.tabs.onActivated`)
- Monitors window focus changes (`chrome.windows.onFocusChanged`)
- Detects when the browser loses focus entirely (user switches to another app)
- Sends messages to content scripts to notify about focus changes
- Cleans up tracking data when tabs are closed

### Key Logic

**When to Pause:**
1. Page becomes hidden (Page Visibility API)
2. Tab loses focus (service worker detects tab change)
3. Browser window loses focus (Alt+Tab to another application)
4. BUT ONLY if the user didn't manually pause the video

**When to Resume:**
1. Page becomes visible again
2. Tab regains focus
3. Browser regains focus
4. BUT ONLY if the user didn't manually pause the video

## Installation

### Development Installation (for testing/development)

1. **Clone or download this extension** to a folder on your computer

2. **Open Chrome Extensions page:**
   - Type `chrome://extensions/` in the address bar, or
   - Go to Menu → More tools → Extensions

3. **Enable Developer mode:**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension:**
   - Click "Load unpacked"
   - Navigate to the folder containing this extension
   - Select the folder and click "Select Folder"

5. **Verify installation:**
   - The extension should appear in your Extensions list
   - You should see the extension icon in the toolbar
   - Visit any YouTube page to test

### How to Use

1. **Open a YouTube video** in your browser
2. **Start playing the video**
3. **Switch to another tab** or application - the video will automatically pause
4. **Return to the YouTube tab** - the video will automatically resume

### Manual Pause Override

- If you manually **pause the video**, then switch tabs, the video will **stay paused** when you return
- If you manually **play the video**, then switch tabs, the video will **pause** when you switch away and **resume** when you return

## File Structure

```
youtube-focus-manager/
├── manifest.json          # Extension configuration (Manifest V3)
├── content-script.js      # Runs on YouTube pages to control video
├── service-worker.js      # Monitors tab/window focus changes
└── README.md              # This file
```

## Technical Details

### Manifest V3 Compliance
- Uses `service_worker` instead of background page (Manifest V2 compatibility removed)
- Uses `host_permissions` for YouTube access
- Uses `content_scripts` to inject code into matching pages
- Uses `activeTab` permission for tab access

### APIs Used

**Page Visibility API:**
- `document.visibilityState` - Detects if page is visible
- `document.addEventListener('visibilitychange')` - Monitors visibility changes

**Chrome APIs:**
- `chrome.tabs.onActivated` - Detects when a tab becomes active
- `chrome.tabs.sendMessage()` - Communicates between service worker and content script
- `chrome.windows.onFocusChanged` - Detects when browser loses/gains focus
- `chrome.tabs.onRemoved` - Cleans up when tabs close

**HTML5 Video API:**
- `video.play()` - Resume video playback
- `video.pause()` - Pause video playback
- `video.paused` - Check playback state

## Browser Compatibility

- **Chrome/Chromium:** ✅ Full support (requires Manifest V3 support)
- **Edge:** ✅ Full support (Chromium-based)
- **Opera:** ✅ Full support (Chromium-based)
- **Firefox:** ⚠️ Would require adaptation (uses different API structure)

## Performance Considerations

**Optimizations:**
- Minimal event listeners (only visibility and focus events)
- Content script only runs on YouTube pages
- Service worker doesn't actively monitor - uses reactive event listeners
- No continuous polling or timers
- Efficient tab/window focus tracking with a Map structure

**Resource Usage:**
- Minimal memory footprint
- No background processing when no YouTube tabs are open
- Cleans up tracking data when tabs are closed

## Troubleshooting

### Video doesn't pause when switching tabs
- Ensure the extension is enabled in `chrome://extensions/`
- Ensure JavaScript is enabled in your browser
- Try refreshing the YouTube page
- Check the browser console (F12) for errors

### Extension not appearing in toolbar
- Extensions menu → Pin the extension icon to make it visible

### "Extension doesn't have access to YouTube" error
- Ensure you've granted permissions when prompted
- Check `chrome://extensions/` → YouTube Focus Manager → Details → Permissions

### Video resumes when you don't want it to
- This only happens if you didn't manually pause the video before switching tabs
- Try manually pausing the video before switching - it should stay paused

## Debugging

Open the browser console (F12) while on a YouTube page to see debug messages:

```
[YouTube Focus Manager] Content script loaded on YouTube page
[YouTube Focus Manager] Video element tracked
[YouTube Focus Manager] User manually paused video
[YouTube Focus Manager] Page became hidden
[YouTube Focus Manager] Paused video due to tab switch
[YouTube Focus Manager] Page became visible
[YouTube Focus Manager] Resumed video after tab focus
```

Service worker logs can be viewed in `chrome://extensions/` → YouTube Focus Manager → Inspect views → service worker.

## Future Improvements

- Add options page to customize behavior
- Add whitelist/blacklist for specific videos
- Add keyboard shortcut to toggle extension
- Add history of pause/resume events
- Support for playlists and watch later
- Support for YouTube Music and YouTube Shorts

## License

This extension is provided as-is for personal use. Modify and distribute as needed.

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Open the browser console (F12) for error messages
3. Ensure the extension has permissions for YouTube pages
4. Try reloading the extension from `chrome://extensions/`

## Disclaimer

This extension is not affiliated with Google or YouTube. YouTube and YouTube Music are trademarks of Google LLC.

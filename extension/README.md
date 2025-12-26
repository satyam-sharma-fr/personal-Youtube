# FocusTube Chrome Extension

Add YouTube channels to your [FocusTube](https://focustube-phi.vercel.app) dashboard with one click, directly from YouTube.

## Features

- **One-Click Add**: Add channels from any YouTube channel page or video
- **Category Selection**: Choose which categories to add the channel to
- **Secure Authentication**: Sign in with your FocusTube account
- **Non-Intrusive**: Small button that doesn't interfere with YouTube's UI

## Installation

### Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension/dist` folder
5. The FocusTube icon should appear in your toolbar

### Sign In

1. Click the FocusTube extension icon in your toolbar
2. Enter your FocusTube account email and password
3. Click **Sign In**

That's it! No configuration needed.

## Usage

### From the Popup

1. Navigate to any YouTube channel or video page
2. Click the FocusTube extension icon
3. Select categories (optional)
4. Click **"Add to FocusTube"**

### From YouTube Pages

1. Navigate to any YouTube page:
   - Channel page: `youtube.com/@channelname`
   - Video page: `youtube.com/watch?v=...`
2. Look for the **"Add to FocusTube"** button
3. Click the dropdown arrow to select categories
4. Click the button to add the channel

## Development

### Build from Source

```bash
cd extension

# Install dependencies
npm install

# Build the extension
npm run build

# Watch mode (TypeScript only)
npm run watch
```

### Project Structure

```
extension/
├── manifest.json        # Chrome extension manifest (MV3)
├── popup.html/css       # Extension popup UI
├── content-styles.css   # Styles injected into YouTube
├── icons/               # Extension icons
├── src/
│   ├── background.ts    # Service worker (auth, API calls)
│   ├── content-script.ts # YouTube page integration
│   └── popup.ts         # Popup logic
├── dist/                # Built extension (load this in Chrome)
└── package.json
```

### Making Changes

1. Edit files in `src/` or root directory
2. Run `npm run build`
3. Go to `chrome://extensions/`
4. Click the refresh icon on the FocusTube extension
5. Reload the YouTube page to test

## Troubleshooting

### "Invalid credentials"
- Make sure you have a FocusTube account at https://focustube-phi.vercel.app
- Check that your email and password are correct

### Button doesn't appear on YouTube
- Refresh the YouTube page
- Make sure the extension is enabled in `chrome://extensions/`
- Some YouTube layouts may show the button in the bottom-right corner

### "Failed to add channel"
- Check if you're signed in (click the extension icon)
- You may have reached your channel limit for your plan

## Security

- Your password is never stored - only authentication tokens
- Tokens are stored securely in Chrome's local storage
- The anon key is a public key safe for client-side use

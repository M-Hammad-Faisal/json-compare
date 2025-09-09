# JSON Compare - Web UI

A beautiful web interface for comparing JSON files with Git-like diff visualization.

## Features

- 📁 **File Upload**: Load JSON files directly from your computer
- 📝 **Manual Input**: Paste JSON directly into text areas  
- 🔄 **Auto-formatting**: Automatically formats JSON with proper indentation
- 🔀 **Swap Function**: Quick swap between left and right inputs
- 🎨 **Git-like Diff**: Visual highlighting similar to Git diffs
- 📊 **Summary Stats**: Clear counts of changes, additions, removals
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices
- 🔒 **Privacy**: Everything runs in your browser - no uploads to servers

## Usage

1. Open `index.html` in your web browser
2. Load JSON files using the file inputs or paste JSON directly
3. Click "Compare" to see the differences
4. Use "Swap" to switch left and right sides

## Color Legend

- **🟠 Changed**: Values that exist in both but are different
- **🟢 Added**: Properties that only exist in the right JSON
- **🔴 Removed**: Properties that only exist in the left JSON  
- **🟣 Type Change**: Properties that exist in both but have different data types

## Deployment

Simply serve the `web/` directory with any web server:

```bash
# Using Python (if available)
cd web
python -m http.server 8000

# Using Node.js (if available)
npx serve .

# Or just open index.html directly in your browser
```

## Browser Requirements

- Modern browsers with ES6+ support
- JavaScript enabled
- File API support for file uploads

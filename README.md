# JSON Compare 📄

A professional web tool for comparing JSON files with **GitHub-style side-by-side diff visualization**.

<div align="center">

**[🚀 Launch Web App](https://m-hammad-faisal.github.io/json-compare/)** | **[📖 Full Documentation](DOCS.md)**

*No installation required - runs entirely in your browser!*

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?logo=github)](https://m-hammad-faisal.github.io/json-compare/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

## ✨ Features

- **🎨 GitHub-style diff** - Professional side-by-side comparison with syntax highlighting
- **📁 File upload** or paste JSON directly  
- **🔄 Swap functionality** - Quick left/right switching
- **📊 Smart diff detection** - 🟢 Added, 🔴 Removed, 🟡 Changed, ⚪ Unchanged
- **📱 Mobile responsive** - Works perfectly on any device
- **🔒 Privacy-first** - No server uploads, runs locally in browser
- **⚡ Fast & lightweight** - No external dependencies, instant comparisons
- **🎯 JSON-aware** - Understands JSON structure for accurate diffs

## 🚀 Quick Start

### Web Interface (Recommended)

1. **[Open the web app](https://m-hammad-faisal.github.io/json-compare/)**
2. **Upload JSON files** or **paste JSON** directly
3. **Click Compare** to see the detailed diff
4. Use **Swap** to switch left/right positions
5. Use **📖 Docs** button for help and examples

### Command Line

```bash
git clone https://github.com/M-Hammad-Faisal/json-compare.git
cd json-compare
npm start examples/left.json examples/right.json
```

---

<div align="center">

Made with ❤️ by **[M-Hammad-Faisal](https://github.com/M-Hammad-Faisal)**

⭐ **Star this repo if you find it useful!**

</div>

## 💻 Development

### Local Setup
```bash
git clone https://github.com/M-Hammad-Faisal/json-compare.git
cd json-compare
npm install
```

### CLI Usage
```bash
# Basic comparison
npm start examples/left.json examples/right.json

# Run example comparison
npm run example

# Install globally (optional)
npm link
json-compare file1.json file2.json
```

## 🔧 Technical Details

**Web Interface:**
- Modern vanilla JavaScript (no frameworks)
- CSS Grid for responsive layout
- LCS (Longest Common Subsequence) diff algorithm
- JSON-aware line matching and alignment

**Command Line:**
- Node.js with zero external dependencies
- Recursive JSON object comparison
- Human-readable console output

## 📋 Requirements

- **Web**: Modern browser with JavaScript
- **CLI**: Node.js 12.0.0+

## 📄 License

MIT License - see LICENSE file for details

## 🗺️ Roadmap

- [ ] Export diff results (PDF, HTML)
- [ ] Large file performance optimization
- [ ] Custom ignore patterns
- [ ] JSON schema validation
- [ ] Dark/light theme toggle

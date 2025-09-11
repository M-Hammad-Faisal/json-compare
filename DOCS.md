# JSON Compare

A powerful tool to compare two JSON files and highlight the differences between them.

## 🌐 Web Interface

**[🚀 Launch App](index.html)** | **[📖 Documentation](DOCS.md)**

A beautiful web interface with Git-style side-by-side diff visualization - no installation required!

## Features

### 🖥️ **Web Interface**
- 🎨 **Git-like diff visualization** with side-by-side comparison
- 📁 **File upload support** or paste JSON directly
- 🔄 **Swap functionality** to quickly switch left/right
- 📊 **Real-time comparison** with color-coded differences
- 📱 **Responsive design** - works on desktop, tablet, and mobile
- 🔒 **Privacy-first** - everything runs in your browser, no uploads

### ⌨️ **Command Line**
- 🔍 **Deep comparison**: Recursively compares nested objects and arrays
- 📊 **Clear output**: Shows exactly what changed, was added, or was removed
- 🎯 **Path tracking**: Displays the exact path where differences occur
- 🚀 **Fast and lightweight**: No external dependencies
- 💻 **Cross-platform**: Works on Windows, macOS, and Linux

## Installation

### Clone and run locally
```bash
git clone <your-repo-url>
cd json-compare
npm install
```

### Make executable (optional)
```bash
chmod +x src/json-compare.js
```

## Usage

### 🌐 Web Interface

**[Launch Web App](https://m-hammad-faisal.github.io/json-compare/)**

Or run locally:
```bash
npm run web:open  # Opens web interface in your browser
```

The web interface provides:
- Side-by-side JSON comparison with syntax highlighting
- Git-style diff colors (🟢 added, 🔴 removed, 🟡 changed)
- File upload or direct JSON paste
- Mobile-responsive design
- No server required - runs entirely in your browser

### ⌨️ Command Line

#### Basic usage
```bash
node src/json-compare.js file1.json file2.json
```

### Using npm scripts
```bash
npm start file1.json file2.json
npm run example  # Run with example files
```

### As a global command (after npm link)
```bash
npm link
json-compare file1.json file2.json
```

## Examples

### Example files
Create some test files to try out the tool:

**examples/left.json:**
```json
{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming"],
  "address": {
    "street": "123 Main St",
    "zip": "10001"
  }
}
```

**examples/right.json:**
```json
{
  "name": "John Doe",
  "age": 31,
  "city": "San Francisco",
  "hobbies": ["reading", "cycling", "photography"],
  "address": {
    "street": "456 Oak Ave",
    "zip": "10001",
    "country": "USA"
  }
}
```

### Running the comparison
```bash
npm run example
```

### Sample output
```
🔍 Found 4 difference(s):

1. Path: age
   Type: Value changed
   Left:  30
   Right: 31

2. Path: city
   Type: Value changed
   Left:  "New York"
   Right: "San Francisco"

3. Path: hobbies[1]
   Type: Value changed
   Left:  "swimming"
   Right: "cycling"

4. Path: hobbies[2]
   Type: Added in right
   Value: "photography"

5. Path: address.street
   Type: Value changed
   Left:  "123 Main St"
   Right: "456 Oak Ave"

6. Path: address.country
   Type: Added in right
   Value: "USA"
```

## Difference Types

The tool detects several types of differences:

- **Value changed**: A property exists in both files but has different values
- **Type changed**: A property exists in both files but has different data types
- **Added in right**: A property exists only in the right file
- **Removed from right**: A property exists only in the left file

## Project Structure

```
json-compare/
├── src/
│   └── json-compare.js    # Main application
├── tests/                 # Test files (to be added)
├── examples/             # Example JSON files
├── docs/                 # Documentation
├── package.json          # Node.js configuration
└── README.md            # This file
```

## Development

### Adding tests
Tests will be added in the `tests/` directory. Run them with:
```bash
npm test
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Deployment

### GitHub Pages

This project is automatically deployed to GitHub Pages at:
**https://m-hammad-faisal.github.io/json-compare/**

To deploy your own copy:
1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Set source to "Deploy from a branch" → `main` → `/web`
4. Your JSON Compare tool will be available at `https://yourusername.github.io/json-compare/`

## Requirements

- **Web Interface**: Modern browser with JavaScript enabled
- **Command Line**: Node.js 12.0.0 or higher

## License

MIT License - see LICENSE file for details

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/M-Hammad-Faisal">M-Hammad-Faisal</a>
</p>

## Roadmap

- [ ] Add comprehensive test suite
- [ ] Support for ignoring specific paths
- [ ] JSON schema validation
- [ ] Output formats (JSON, XML, HTML)
- [ ] Configuration file support
- [ ] Performance optimizations for large files
- [ ] Color-coded terminal output

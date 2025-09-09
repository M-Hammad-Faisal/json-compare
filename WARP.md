# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Node.js command-line tool for comparing two JSON files and highlighting differences between them. The tool performs deep recursive comparison of JSON objects and arrays, showing exactly what changed, was added, or removed with precise path tracking.

## Development Commands

### Running the tool
```bash
# Basic usage
node src/json-compare.js file1.json file2.json

# Using npm scripts
npm start file1.json file2.json
npm run example  # Compare the example files
```

### Global installation
```bash
npm link  # Install globally
json-compare file1.json file2.json  # Use as global command
```

### Testing
```bash
npm test  # Currently fails - no test runner implemented yet
```

### Linting
```bash
npm run lint  # Currently just echoes message - no linter configured
```

### Web UI
```bash
npm run web:open  # Opens the web interface in your browser
# Or navigate to web/index.html manually
```

## Architecture

### Core Components

**JsonCompare Class** (`src/json-compare.js`):
- Main comparison engine with recursive deep comparison logic
- Handles different data types: objects, arrays, primitives, null/undefined
- Tracks differences with precise path information
- Formats output for human-readable display

**Comparison Types Detected**:
- `value_change`: Property exists in both but has different values
- `type_change`: Property exists in both but has different data types
- `added`: Property exists only in right file  
- `removed`: Property exists only in left file

### Key Methods

- `compare(left, right, path)`: Main recursive comparison method
- `compareObjects(left, right, path)`: Object-specific comparison
- `compareArrays(left, right, path)`: Array-specific comparison  
- `loadJsonFile(filePath)`: JSON file loading with error handling
- `formatDifferences()`: Human-readable output formatting

## File Structure

```
├── src/json-compare.js     # Main application and JsonCompare class
├── examples/               # Sample JSON files for testing
│   ├── left.json          # Simple example JSON
│   └── right.json         # Complex insurance/medical data JSON
├── package.json           # Node.js config with CLI binary setup
└── README.md             # Usage documentation
```

## Development Notes

### Missing Components
- **Test Suite**: Package.json references `tests/test-runner.js` but no tests exist yet
- **Linting**: No ESLint or similar tool configured
- **Type Checking**: No TypeScript or JSDoc type annotations

### Technical Considerations
- Uses only Node.js built-in modules (fs, path) - no external dependencies
- Supports executable shebang for Unix systems (`#!/usr/bin/env node`)
- Exports JsonCompare class for potential testing/library use
- CLI detection via `require.main === module`

### Current Examples
The example files demonstrate different complexity levels:
- `left.json`: Simple personal data structure
- `right.json`: Complex nested insurance/medical benefits data (likely modified during development)

When working on this codebase, focus on the single-file architecture in `src/json-compare.js` where all core logic resides. The tool is designed to be lightweight and dependency-free.

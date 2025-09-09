#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * JSON Compare Tool
 * Compares two JSON files and shows the differences
 */

class JsonCompare {
    constructor() {
        this.differences = [];
    }

    /**
     * Compare two JSON objects recursively
     * @param {*} left - Left JSON object
     * @param {*} right - Right JSON object  
     * @param {string} path - Current path in the object
     */
    compare(left, right, path = '') {
        // Handle null/undefined cases
        if (left === null || left === undefined || right === null || right === undefined) {
            if (left !== right) {
                this.differences.push({
                    path: path || 'root',
                    type: 'value_change',
                    left: left,
                    right: right
                });
            }
            return;
        }

        // Handle different types
        if (typeof left !== typeof right) {
            this.differences.push({
                path: path || 'root',
                type: 'type_change',
                left: { type: typeof left, value: left },
                right: { type: typeof right, value: right }
            });
            return;
        }

        // Handle arrays
        if (Array.isArray(left) && Array.isArray(right)) {
            this.compareArrays(left, right, path);
            return;
        }

        // Handle objects
        if (typeof left === 'object' && typeof right === 'object') {
            this.compareObjects(left, right, path);
            return;
        }

        // Handle primitive values
        if (left !== right) {
            this.differences.push({
                path: path || 'root',
                type: 'value_change',
                left: left,
                right: right
            });
        }
    }

    compareArrays(left, right, path) {
        const maxLength = Math.max(left.length, right.length);
        
        for (let i = 0; i < maxLength; i++) {
            const currentPath = path ? `${path}[${i}]` : `[${i}]`;
            
            if (i >= left.length) {
                this.differences.push({
                    path: currentPath,
                    type: 'added',
                    right: right[i]
                });
            } else if (i >= right.length) {
                this.differences.push({
                    path: currentPath,
                    type: 'removed',
                    left: left[i]
                });
            } else {
                this.compare(left[i], right[i], currentPath);
            }
        }
    }

    compareObjects(left, right, path) {
        const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
        
        for (const key of allKeys) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (!(key in left)) {
                this.differences.push({
                    path: currentPath,
                    type: 'added',
                    right: right[key]
                });
            } else if (!(key in right)) {
                this.differences.push({
                    path: currentPath,
                    type: 'removed',
                    left: left[key]
                });
            } else {
                this.compare(left[key], right[key], currentPath);
            }
        }
    }

    /**
     * Load and parse JSON file
     * @param {string} filePath - Path to JSON file
     * @returns {*} Parsed JSON object
     */
    loadJsonFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            throw new Error(`Error loading ${filePath}: ${error.message}`);
        }
    }

    /**
     * Format differences for display
     * @returns {string} Formatted differences
     */
    formatDifferences() {
        if (this.differences.length === 0) {
            return '✅ No differences found - JSON objects are identical';
        }

        let output = `🔍 Found ${this.differences.length} difference(s):\n\n`;
        
        this.differences.forEach((diff, index) => {
            output += `${index + 1}. Path: ${diff.path}\n`;
            
            switch (diff.type) {
                case 'value_change':
                    output += `   Type: Value changed\n`;
                    output += `   Left:  ${JSON.stringify(diff.left)}\n`;
                    output += `   Right: ${JSON.stringify(diff.right)}\n`;
                    break;
                case 'type_change':
                    output += `   Type: Type changed\n`;
                    output += `   Left:  ${diff.left.type} (${JSON.stringify(diff.left.value)})\n`;
                    output += `   Right: ${diff.right.type} (${JSON.stringify(diff.right.value)})\n`;
                    break;
                case 'added':
                    output += `   Type: Added in right\n`;
                    output += `   Value: ${JSON.stringify(diff.right)}\n`;
                    break;
                case 'removed':
                    output += `   Type: Removed from right\n`;
                    output += `   Value: ${JSON.stringify(diff.left)}\n`;
                    break;
            }
            output += '\n';
        });

        return output;
    }

    /**
     * Main comparison function
     * @param {string} leftFile - Path to left JSON file
     * @param {string} rightFile - Path to right JSON file
     */
    compareFiles(leftFile, rightFile) {
        try {
            const leftJson = this.loadJsonFile(leftFile);
            const rightJson = this.loadJsonFile(rightFile);
            
            this.differences = []; // Reset differences
            this.compare(leftJson, rightJson);
            
            return this.formatDifferences();
        } catch (error) {
            return `❌ Error: ${error.message}`;
        }
    }
}

// CLI interface
function main() {
    const args = process.argv.slice(2);
    
    if (args.length !== 2) {
        console.log('Usage: node json-compare.js <left-file.json> <right-file.json>');
        console.log('');
        console.log('Compare two JSON files and display the differences.');
        console.log('');
        console.log('Examples:');
        console.log('  node json-compare.js data1.json data2.json');
        console.log('  node json-compare.js ../config/old.json ../config/new.json');
        process.exit(1);
    }

    const [leftFile, rightFile] = args;
    const comparer = new JsonCompare();
    const result = comparer.compareFiles(leftFile, rightFile);
    
    console.log(result);
}

// Export for testing
module.exports = JsonCompare;

// Run CLI if this file is executed directly
if (require.main === module) {
    main();
}

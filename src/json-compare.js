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
        this.maxDifferences = 10000; // Limit differences to prevent memory issues
        this.comparisonCount = 0;
    }

    /**
     * Compare two JSON objects recursively with optimizations for large objects
     * @param {*} left - Left JSON object
     * @param {*} right - Right JSON object  
     * @param {string} path - Current path in the object
     */
    compare(left, right, path = '') {
        // Early exit if we've hit the max differences limit
        if (this.differences.length >= this.maxDifferences) {
            return;
        }
        
        this.comparisonCount++;
        
        // Progress indicator for large comparisons
        if (this.comparisonCount % 10000 === 0) {
            process.stdout.write(`\r🔄 Processing... ${this.comparisonCount} items compared`);
        }
        
        // Handle null/undefined cases
        if (left === null || left === undefined || right === null || right === undefined) {
            if (left !== right) {
                this.addDifference({
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
            this.addDifference({
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
            this.addDifference({
                path: path || 'root',
                type: 'value_change',
                left: left,
                right: right
            });
        }
    }
    
    /**
     * Safely add difference with memory limit check
     * @param {Object} difference - The difference object to add
     */
    addDifference(difference) {
        if (this.differences.length < this.maxDifferences) {
            this.differences.push(difference);
        }
    }

    compareArrays(left, right, path) {
        const maxLength = Math.max(left.length, right.length);
        
        // For very large arrays, sample comparison to avoid memory issues
        const sampleSize = maxLength > 1000 ? 1000 : maxLength;
        const step = maxLength > 1000 ? Math.floor(maxLength / sampleSize) : 1;
        
        if (maxLength > 1000) {
            console.log(`\n⚠️  Large array detected (${maxLength} items). Sampling every ${step} items for performance.`);
        }
        
        for (let i = 0; i < maxLength; i += step) {
            // Early exit if max differences reached
            if (this.differences.length >= this.maxDifferences) {
                break;
            }
            
            const currentPath = path ? `${path}[${i}]` : `[${i}]`;
            
            if (i >= left.length) {
                this.addDifference({
                    path: currentPath,
                    type: 'added',
                    right: right[i]
                });
            } else if (i >= right.length) {
                this.addDifference({
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
        
        if (allKeys.size > 1000) {
            console.log(`\n⚠️  Large object detected (${allKeys.size} keys). Processing...`);
        }
        
        for (const key of allKeys) {
            // Early exit if max differences reached
            if (this.differences.length >= this.maxDifferences) {
                break;
            }
            
            const currentPath = path ? `${path}.${key}` : key;
            
            if (!(key in left)) {
                this.addDifference({
                    path: currentPath,
                    type: 'added',
                    right: right[key]
                });
            } else if (!(key in right)) {
                this.addDifference({
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
     * Load and parse JSON file with stream support for large files
     * @param {string} filePath - Path to JSON file
     * @returns {*} Parsed JSON object
     */
    loadJsonFile(filePath) {
        try {
            // Check file size first
            const stats = fs.statSync(filePath);
            const fileSizeInMB = stats.size / (1024 * 1024);
            
            if (fileSizeInMB > 50) {
                console.log(`⚠️  Warning: Large file detected (${fileSizeInMB.toFixed(2)}MB). This may take some time...`);
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            if (error.name === 'SyntaxError') {
                throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
            } else if (error.code === 'ENOENT') {
                throw new Error(`File not found: ${filePath}`);
            } else if (error.code === 'ENOMEM') {
                throw new Error(`File ${filePath} is too large to fit in memory. Consider splitting it into smaller files.`);
            }
            throw new Error(`Error loading ${filePath}: ${error.message}`);
        }
    }

    /**
     * Format differences for display with performance optimizations
     * @returns {string} Formatted differences
     */
    formatDifferences() {
        // Clear progress indicator
        if (this.comparisonCount > 0) {
            process.stdout.write('\n');
        }
        
        if (this.differences.length === 0) {
            return '✅ No differences found - JSON objects are identical';
        }

        const totalDiffs = this.differences.length;
        const showLimit = 100; // Limit displayed differences for readability
        const diffsToShow = Math.min(totalDiffs, showLimit);
        
        let output = `🔍 Found ${totalDiffs} difference(s)`;
        
        if (totalDiffs >= this.maxDifferences) {
            output += ` (truncated at ${this.maxDifferences} for performance)`;
        }
        
        if (totalDiffs > showLimit) {
            output += `. Showing first ${showLimit}:`;
        } else {
            output += ':';
        }
        
        output += '\n\n';
        
        for (let index = 0; index < diffsToShow; index++) {
            const diff = this.differences[index];
            output += `${index + 1}. Path: ${diff.path}\n`;
            
            switch (diff.type) {
                case 'value_change':
                    output += `   Type: Value changed\n`;
                    output += `   Left:  ${this.formatValue(diff.left)}\n`;
                    output += `   Right: ${this.formatValue(diff.right)}\n`;
                    break;
                case 'type_change':
                    output += `   Type: Type changed\n`;
                    output += `   Left:  ${diff.left.type} (${this.formatValue(diff.left.value)})\n`;
                    output += `   Right: ${diff.right.type} (${this.formatValue(diff.right.value)})\n`;
                    break;
                case 'added':
                    output += `   Type: Added in right\n`;
                    output += `   Value: ${this.formatValue(diff.right)}\n`;
                    break;
                case 'removed':
                    output += `   Type: Removed from right\n`;
                    output += `   Value: ${this.formatValue(diff.left)}\n`;
                    break;
            }
            output += '\n';
        }
        
        if (totalDiffs > showLimit) {
            output += `... and ${totalDiffs - showLimit} more differences.\n`;
            output += `\nTip: Use a more specific comparison or process files in smaller chunks for better performance.\n`;
        }

        return output;
    }
    
    /**
     * Format value for display with length limits
     * @param {*} value - Value to format
     * @returns {string} Formatted value
     */
    formatValue(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        
        const str = JSON.stringify(value);
        const maxLength = 200;
        
        if (str.length > maxLength) {
            return str.substring(0, maxLength) + '... (truncated)';
        }
        
        return str;
    }

    /**
     * Main comparison function with performance monitoring
     * @param {string} leftFile - Path to left JSON file
     * @param {string} rightFile - Path to right JSON file
     */
    compareFiles(leftFile, rightFile) {
        try {
            console.log('🚀 Starting JSON comparison...');
            const startTime = Date.now();
            
            console.log('📁 Loading files...');
            const leftJson = this.loadJsonFile(leftFile);
            const rightJson = this.loadJsonFile(rightFile);
            
            // Reset state
            this.differences = [];
            this.comparisonCount = 0;
            
            console.log('🔄 Comparing JSON structures...');
            this.compare(leftJson, rightJson);
            
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            
            console.log(`\n✅ Comparison completed in ${duration.toFixed(2)}s`);
            console.log(`📊 Processed ${this.comparisonCount.toLocaleString()} comparisons`);
            
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

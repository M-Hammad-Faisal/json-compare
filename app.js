class JsonCompare {
  constructor() {
    this.differences = [];
  }

  compare(left, right, path = '') {
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

    if (typeof left !== typeof right) {
      this.differences.push({
        path: path || 'root',
        type: 'type_change',
        left: { type: typeof left, value: left },
        right: { type: typeof right, value: right }
      });
      return;
    }

    if (Array.isArray(left) && Array.isArray(right)) {
      this.compareArrays(left, right, path);
      return;
    }

    if (typeof left === 'object' && typeof right === 'object') {
      this.compareObjects(left, right, path);
      return;
    }

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

  compareObjects(leftJson, rightJson) {
    this.differences = [];
    this.compare(leftJson, rightJson);
    return this.differences;
  }
}

class JsonCompareUI {
  constructor() {
    this.comparer = new JsonCompare();
    this.initializeElements();
    this.attachEventListeners();
    this.loadExampleData();
  }

  initializeElements() {
    this.leftFile = document.getElementById('leftFile');
    this.rightFile = document.getElementById('rightFile');
    this.leftText = document.getElementById('leftText');
    this.rightText = document.getElementById('rightText');
    this.compareBtn = document.getElementById('compareBtn');
    this.swapBtn = document.getElementById('swapBtn');
    this.status = document.getElementById('status');
    this.summary = document.getElementById('summary');
    this.results = document.getElementById('results');
    this.diffContent = document.getElementById('diffContent');
    
    this.themeToggle = document.getElementById('themeToggle');
    this.docsBtn = document.getElementById('docsBtn');
    this.docsFooterBtn = document.getElementById('docsFooterBtn');
    this.docsModal = document.getElementById('docsModal');
    this.closeDocsBtn = document.getElementById('closeDocsBtn');
    
    // Mobile menu elements
    this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
    this.navLinks = document.getElementById('navLinks');
    
    this.initializeTheme();
  }

  attachEventListeners() {
    this.leftFile.addEventListener('change', (e) => this.handleFileLoad(e, 'left'));
    this.rightFile.addEventListener('change', (e) => this.handleFileLoad(e, 'right'));
    this.compareBtn.addEventListener('click', () => this.performComparison());
    this.swapBtn.addEventListener('click', () => this.swapInputs());
    this.leftText.addEventListener('blur', () => this.formatJSON(this.leftText));
    this.rightText.addEventListener('blur', () => this.formatJSON(this.rightText));
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    this.docsBtn.addEventListener('click', () => this.openDocsModal());
    this.docsFooterBtn.addEventListener('click', () => this.openDocsModal());
    this.closeDocsBtn.addEventListener('click', () => this.closeDocsModal());
    
    // Mobile menu event listeners
    this.mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
    
    // Close mobile menu when clicking nav links
    this.navLinks.addEventListener('click', (e) => {
      if (e.target.closest('.nav-btn')) {
        this.closeMobileMenu();
      }
    });
    
    this.docsModal.addEventListener('click', (e) => {
      if (e.target === this.docsModal) {
        this.closeDocsModal();
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.docsModal.classList.contains('hidden')) {
        this.closeDocsModal();
      }
    });
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem('json-compare-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('json-compare-theme', newTheme);
  }
  
  toggleMobileMenu() {
    const isActive = this.navLinks.classList.contains('active');
    if (isActive) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }
  
  openMobileMenu() {
    this.navLinks.classList.add('active');
    this.mobileMenuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  closeMobileMenu() {
    this.navLinks.classList.remove('active');
    this.mobileMenuToggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  async handleFileLoad(event, side) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      this.showStatus('Please select a JSON file', 'error');
      return;
    }

    try {
      const text = await file.text();
      const textarea = side === 'left' ? this.leftText : this.rightText;
      textarea.value = text;
      this.formatJSON(textarea);
      this.showStatus(`Loaded ${file.name}`, 'success');
    } catch (error) {
      this.showStatus(`Error loading file: ${error.message}`, 'error');
    }
  }

  formatJSON(textarea) {
    try {
      if (!textarea.value.trim()) return;
      const parsed = JSON.parse(textarea.value);
      textarea.value = JSON.stringify(parsed, null, 2);
    } catch (error) {
      // Don't format if invalid JSON - user might still be editing
    }
  }

  swapInputs() {
    const leftValue = this.leftText.value;
    const rightValue = this.rightText.value;
    
    this.leftText.value = rightValue;
    this.rightText.value = leftValue;
    
    // Clear file inputs
    this.leftFile.value = '';
    this.rightFile.value = '';
    
    this.showStatus('Swapped left and right inputs', 'success');
  }

  performComparison() {
    try {
      // Clear previous results
      this.hideResults();
      
      // Validate inputs
      const leftValue = this.leftText.value.trim();
      const rightValue = this.rightText.value.trim();
      
      if (!leftValue || !rightValue) {
        this.showStatus('Please provide JSON in both inputs', 'error');
        return;
      }

      // Parse JSON
      let leftJson, rightJson;
      try {
        leftJson = JSON.parse(leftValue);
      } catch (error) {
        this.showStatus('Invalid JSON in left input', 'error');
        return;
      }

      try {
        rightJson = JSON.parse(rightValue);
      } catch (error) {
        this.showStatus('Invalid JSON in right input', 'error');
        return;
      }

      // Perform comparison
      this.compareBtn.disabled = true;
      this.showStatus('Comparing...', 'success');
      
      // Use setTimeout to allow UI to update
      setTimeout(() => {
        const differences = this.comparer.compareObjects(leftJson, rightJson);
        this.displayResults(differences);
        this.compareBtn.disabled = false;
      }, 10);

    } catch (error) {
      this.showStatus(`Comparison error: ${error.message}`, 'error');
      this.compareBtn.disabled = false;
    }
  }

  displayResults(differences) {
    if (differences.length === 0) {
      this.showStatus('✅ No differences found - JSON objects are identical', 'success');
      this.showSummary('No differences found', 'The JSON objects are identical.');
      return;
    }

    // Show summary
    const counts = this.countDifferenceTypes(differences);
    this.showSummary(`Found ${differences.length} difference(s)`, 
      `${counts.changed} changed, ${counts.added} added, ${counts.removed} removed, ${counts.type} type changes`);

    // Display detailed differences
    this.displayDetailedDifferences(differences);
    this.showStatus(`Found ${differences.length} differences`, 'success');
  }

  countDifferenceTypes(differences) {
    return differences.reduce((counts, diff) => {
      switch (diff.type) {
        case 'value_change': counts.changed++; break;
        case 'added': counts.added++; break;
        case 'removed': counts.removed++; break;
        case 'type_change': counts.type++; break;
      }
      return counts;
    }, { changed: 0, added: 0, removed: 0, type: 0 });
  }

  displayDetailedDifferences(differences) {
    // Get the original JSON strings for side-by-side display
    const leftValue = this.leftText.value.trim();
    const rightValue = this.rightText.value.trim();
    
    // Format the JSON for better readability
    const leftJson = JSON.stringify(JSON.parse(leftValue), null, 2);
    const rightJson = JSON.stringify(JSON.parse(rightValue), null, 2);
    
    this.createSideBySideDiff(leftJson, rightJson, differences);
    this.results.classList.remove('hidden');
  }

  createSideBySideDiff(leftText, rightText, differences) {
    const leftLines = leftText.split('\n');
    const rightLines = rightText.split('\n');
    
    // Use a simple but effective LCS-based diff algorithm
    const diffResult = this.createLineDiff(leftLines, rightLines);
    
    this.diffContent.innerHTML = '';
    
    diffResult.forEach(line => {
      this.createDiffLine(
        line.leftLineNum,
        line.leftContent,
        line.rightLineNum,
        line.rightContent,
        line.type
      );
    });
  }
  
  createLineDiff(leftLines, rightLines) {
    // Simple line-by-line diff using longest common subsequence approach
    const lcs = this.computeLCS(leftLines, rightLines);
    const result = [];
    
    let leftIdx = 0;
    let rightIdx = 0;
    let lcsIdx = 0;
    
    while (leftIdx < leftLines.length || rightIdx < rightLines.length) {
      if (lcsIdx < lcs.length && 
          leftIdx < leftLines.length && 
          rightIdx < rightLines.length && 
          leftLines[leftIdx] === lcs[lcsIdx] && 
          rightLines[rightIdx] === lcs[lcsIdx]) {
        // Common line
        result.push({
          leftLineNum: leftIdx + 1,
          leftContent: leftLines[leftIdx],
          rightLineNum: rightIdx + 1,
          rightContent: rightLines[rightIdx],
          type: 'unchanged'
        });
        leftIdx++;
        rightIdx++;
        lcsIdx++;
      } else if (lcsIdx < lcs.length && 
                 leftIdx < leftLines.length && 
                 leftLines[leftIdx] === lcs[lcsIdx]) {
        // Right side has additions
        result.push({
          leftLineNum: null,
          leftContent: '',
          rightLineNum: rightIdx + 1,
          rightContent: rightLines[rightIdx],
          type: 'added'
        });
        rightIdx++;
      } else if (lcsIdx < lcs.length && 
                 rightIdx < rightLines.length && 
                 rightLines[rightIdx] === lcs[lcsIdx]) {
        // Left side has deletions
        result.push({
          leftLineNum: leftIdx + 1,
          leftContent: leftLines[leftIdx],
          rightLineNum: null,
          rightContent: '',
          type: 'removed'
        });
        leftIdx++;
      } else {
        // Handle remaining lines
        if (leftIdx < leftLines.length && rightIdx < rightLines.length) {
          // Both sides have content - this is a change
          result.push({
            leftLineNum: leftIdx + 1,
            leftContent: leftLines[leftIdx],
            rightLineNum: rightIdx + 1,
            rightContent: rightLines[rightIdx],
            type: 'changed'
          });
          leftIdx++;
          rightIdx++;
        } else if (leftIdx < leftLines.length) {
          // Only left side has content - removal
          result.push({
            leftLineNum: leftIdx + 1,
            leftContent: leftLines[leftIdx],
            rightLineNum: null,
            rightContent: '',
            type: 'removed'
          });
          leftIdx++;
        } else if (rightIdx < rightLines.length) {
          // Only right side has content - addition
          result.push({
            leftLineNum: null,
            leftContent: '',
            rightLineNum: rightIdx + 1,
            rightContent: rightLines[rightIdx],
            type: 'added'
          });
          rightIdx++;
        }
      }
    }
    
    return result;
  }
  
  computeLCS(leftLines, rightLines) {
    // Compute Longest Common Subsequence using dynamic programming
    const m = leftLines.length;
    const n = rightLines.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    // Build the LCS table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (leftLines[i - 1].trim() === rightLines[j - 1].trim()) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    // Reconstruct the LCS
    const lcs = [];
    let i = m, j = n;
    
    while (i > 0 && j > 0) {
      if (leftLines[i - 1].trim() === rightLines[j - 1].trim()) {
        lcs.unshift(leftLines[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    
    return lcs;
  }
  
  createDiffLine(leftLineNum, leftContent, rightLineNum, rightContent, type) {
    const diffLine = document.createElement('div');
    diffLine.className = `diff-line ${type}`;
    
    // Left line number
    const leftNum = document.createElement('div');
    leftNum.className = 'line-number';
    leftNum.textContent = (type === 'added' || leftLineNum === null) ? '' : leftLineNum;
    
    // Left content
    const leftDiv = document.createElement('div');
    leftDiv.className = 'line-content';
    leftDiv.textContent = (type === 'added' || leftContent === null) ? '' : leftContent;
    
    // Right line number
    const rightNum = document.createElement('div');
    rightNum.className = 'line-number';
    rightNum.textContent = (type === 'removed' || rightLineNum === null) ? '' : rightLineNum;
    
    // Right content
    const rightDiv = document.createElement('div');
    rightDiv.className = 'line-content';
    rightDiv.textContent = (type === 'removed' || rightContent === null) ? '' : rightContent;
    
    diffLine.appendChild(leftNum);
    diffLine.appendChild(leftDiv);
    diffLine.appendChild(rightNum);
    diffLine.appendChild(rightDiv);
    
    this.diffContent.appendChild(diffLine);
  }

  formatValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }

  showSummary(title, description) {
    this.summary.innerHTML = `<h3>${title}</h3><p>${description}</p>`;
    this.summary.classList.remove('hidden');
  }

  showStatus(message, type) {
    this.status.textContent = message;
    this.status.className = `status ${type}`;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        if (this.status.classList.contains('success')) {
          this.status.textContent = '';
          this.status.className = 'status';
        }
      }, 3000);
    }
  }

  hideResults() {
    this.summary.classList.add('hidden');
    this.results.classList.add('hidden');
    this.diffContent.innerHTML = '';
  }

  // Load example data for demo
  async loadExampleData() {
    try {
      // Try to load the example files if available
      const leftExample = {
        "name": "John Doe",
        "age": 30,
        "city": "New York",
        "hobbies": ["reading", "swimming"],
        "address": {
          "street": "123 Main St",
          "zip": "10001"
        },
        "isEmployed": true,
        "salary": null
      };

      const rightExample = {
        "name": "John Doe",
        "age": 31,
        "city": "San Francisco", 
        "hobbies": ["reading", "cycling", "photography"],
        "address": {
          "street": "456 Oak Ave",
          "zip": "10001",
          "country": "USA"
        },
        "isEmployed": false,
        "salary": 75000
      };

      this.leftText.value = JSON.stringify(leftExample, null, 2);
      this.rightText.value = JSON.stringify(rightExample, null, 2);
      
    } catch (error) {
      // If example loading fails, just leave inputs empty
      console.log('Could not load example data:', error);
    }
  }
  
  // Modal methods
  openDocsModal() {
    this.docsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Close mobile menu if it's open
    if (this.navLinks.classList.contains('active')) {
      this.closeMobileMenu();
    }
  }
  
  closeDocsModal() {
    this.docsModal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new JsonCompareUI();
});

// Fix the compareObjects method name conflict
JsonCompare.prototype.compareObjects = function(leftJson, rightJson) {
  this.differences = []; // Reset differences
  this.compare(leftJson, rightJson);
  return this.differences;
};

// Re-implement the original compareObjects method with a different name
JsonCompare.prototype.compareObjectProperties = function(left, right, path) {
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
};

// Update the compare method to use the renamed function
JsonCompare.prototype.compare = function(left, right, path = '') {
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
    this.compareObjectProperties(left, right, path);
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
};

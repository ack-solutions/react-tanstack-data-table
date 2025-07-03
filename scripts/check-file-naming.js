#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Check if a filename follows kebab-case convention
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if filename is kebab-case
 */
function isKebabCase(filename) {
  // Remove file extension for checking
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Check if it matches kebab-case pattern
  return /^[a-z]+(-[a-z]+)*$/.test(nameWithoutExt);
}

/**
 * Check if a filename is an exception (allowed to not follow kebab-case)
 * @param {string} filename - The filename to check
 * @returns {boolean} - True if filename is an exception
 */
function isException(filename) {
  const exceptions = [
    'README.md',
    'LICENSE',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'CODING_RULES.md',
    'SETUP_SUMMARY.md',
    'FILTER_REFACTORING.md',
    'CUSTOM_FEATURE_IMPLEMENTATION.md',
    'nx.json',
    'package.json',
    'tsconfig.json',
    'tsconfig.lib.json',
    'tsconfig.app.json',
    'tsconfig.base.json',
    'tsconfig.spec.json',
    'vite.config.ts',
    'playwright.config.ts',
    '.eslintrc.json',
    'index.html',
    'favicon.ico'
  ];
  
  return exceptions.includes(filename);
}

/**
 * Main function to check file naming conventions
 */
function checkFileNaming() {
  console.log('🔍 Checking file naming conventions...\n');
  
  const patterns = [
    'packages/src/**/*.{ts,tsx,js,jsx}',
    'react/src/**/*.{ts,tsx,js,jsx}',
    'react-e2e/src/**/*.{ts,tsx,js,jsx}'
  ];
  
  let hasErrors = false;
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern);
    
    files.forEach(filePath => {
      const filename = path.basename(filePath);
      
      if (!isException(filename) && !isKebabCase(filename)) {
        console.log(`❌ ${filePath}`);
        console.log(`   Expected: ${filename.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')}`);
        console.log('');
        hasErrors = true;
      }
    });
  });
  
  if (!hasErrors) {
    console.log('✅ All files follow kebab-case naming convention!');
  } else {
    console.log('💡 To fix these issues:');
    console.log('   1. Rename files to use kebab-case (lowercase with dashes)');
    console.log('   2. Update import/export statements accordingly');
    console.log('   3. Run this script again to verify\n');
    process.exit(1);
  }
}

// Run the check
checkFileNaming(); 
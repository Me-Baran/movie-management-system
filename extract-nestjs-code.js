#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  rootDir: 'src',
  outputFile: 'nestjs-code-extract.txt',
  excludedDirs: [
    'node_modules',
    'dist',
    '.git',
    'coverage',
    '.vscode',
    '.idea'
  ],
  excludedFiles: [
    '.env',
    '.DS_Store',
    '.gitignore',
    'package-lock.json',
    'yarn.lock'
  ],
  excludedExtensions: [
    '.log',
    '.md',
    '.jpg',
    '.png',
    '.svg',
    '.ico',
    '.woff',
    '.ttf',
    '.eot'
  ]
};

// Initialize output file
fs.writeFileSync(config.outputFile, '# NestJS Code Extraction\n\n', 'utf8');

/**
 * Check if a file should be processed
 * @param {string} filePath - Path to the file
 * @returns {boolean} - Whether the file should be processed
 */
function shouldProcessFile(filePath) {
  const fileName = path.basename(filePath);
  const extension = path.extname(filePath);
  
  // Check if file is in excluded list
  if (config.excludedFiles.includes(fileName)) {
    return false;
  }
  
  // Check if extension is in excluded list
  if (config.excludedExtensions.includes(extension)) {
    return false;
  }
  
  return true;
}

/**
 * Check if a directory should be traversed
 * @param {string} dirPath - Path to the directory
 * @returns {boolean} - Whether the directory should be traversed
 */
function shouldTraverseDir(dirPath) {
  const dirName = path.basename(dirPath);
  
  // Check if directory is in excluded list
  return !config.excludedDirs.includes(dirName);
}

/**
 * Extract code from a file and append to output
 * @param {string} filePath - Path to the file
 */
function extractCodeFromFile(filePath) {
  try {
    const relativePath = path.relative(process.cwd(), filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Append to output file
    fs.appendFileSync(
      config.outputFile,
      `\n\n## File: ${relativePath}\n\`\`\`\n${content}\n\`\`\`\n`,
      'utf8'
    );
    
    console.log(`Processed: ${relativePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
}

/**
 * Recursively process directories
 * @param {string} dirPath - Path to the directory
 */
function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        if (shouldTraverseDir(itemPath)) {
          processDirectory(itemPath);
        }
      } else if (stats.isFile()) {
        if (shouldProcessFile(itemPath)) {
          extractCodeFromFile(itemPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

// Main execution
try {
  console.log(`Starting code extraction from '${config.rootDir}' directory...`);
  
  const srcPath = path.join(process.cwd(), config.rootDir);
  
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Source directory '${config.rootDir}' not found.`);
  }
  
  processDirectory(srcPath);
  
  console.log(`\nCode extraction completed successfully!`);
  console.log(`Output saved to: ${config.outputFile}`);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
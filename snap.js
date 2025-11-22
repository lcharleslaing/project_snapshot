#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Snapshot script that creates a complete backup of the project
 * Excludes files listed in .gitignore
 * Creates markdown file with file tree and project state
 */

/**
 * Find the project root directory
 * If running from node_modules (installed package), finds the project root
 * If running locally, uses parent of snapshots directory
 */
function findProjectRoot() {
  let currentDir = __dirname;
  
  // Check if we're running from node_modules (installed package)
  if (currentDir.includes('node_modules')) {
    // First, walk up until we're out of node_modules
    while (currentDir.includes('node_modules')) {
      currentDir = path.dirname(currentDir);
      if (currentDir === path.dirname(currentDir)) {
        // Reached filesystem root, fallback
        break;
      }
    }
    // Now walk up to find the project root (directory with package.json)
    while (currentDir !== path.dirname(currentDir)) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
  } else {
    // Running locally - project root is parent of snapshots directory
    return path.resolve(__dirname, '..');
  }
  
  // Fallback: use current working directory
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();
const SNAPSHOTS_DIR = path.join(PROJECT_ROOT, 'snapshots');
const GITIGNORE_PATH = path.join(PROJECT_ROOT, '.gitignore');

/**
 * Parse .gitignore file and return array of patterns
 */
function parseGitignore() {
  const ignorePatterns = [];
  
  if (fs.existsSync(GITIGNORE_PATH)) {
    const gitignoreContent = fs.readFileSync(GITIGNORE_PATH, 'utf-8');
    gitignoreContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      // Skip empty lines and comments
      if (trimmed && !trimmed.startsWith('#')) {
        ignorePatterns.push(trimmed);
      }
    });
  }
  
  return ignorePatterns;
}

/**
 * Check if a file path matches any gitignore pattern
 */
function shouldIgnore(filePath, ignorePatterns) {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  
  // Always exclude the snapshots directory to avoid recursion
  if (relativePath.startsWith('snapshots') || relativePath === 'snapshots') {
    return true;
  }
  
  for (const pattern of ignorePatterns) {
    // Handle simple patterns (basic implementation)
    if (pattern.includes('*')) {
      // Convert glob pattern to regex
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(relativePath) || regex.test(path.basename(relativePath))) {
        return true;
      }
    } else {
      // Exact match or directory match
      if (relativePath === pattern || 
          relativePath.startsWith(pattern + '/') ||
          relativePath.endsWith('/' + pattern) ||
          relativePath.includes('/' + pattern + '/')) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Generate file tree structure
 */
function generateFileTree(dir, prefix = '', ignorePatterns, isLast = true) {
  let tree = '';
  const items = fs.readdirSync(dir)
    .filter(item => {
      const fullPath = path.join(dir, item);
      return !shouldIgnore(fullPath, ignorePatterns);
    })
    .sort((a, b) => {
      const aPath = path.join(dir, a);
      const bPath = path.join(dir, b);
      const aIsDir = fs.statSync(aPath).isDirectory();
      const bIsDir = fs.statSync(bPath).isDirectory();
      
      // Directories first, then files
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });
  
  items.forEach((item, index) => {
    const fullPath = path.join(dir, item);
    const isLastItem = index === items.length - 1;
    const isDirectory = fs.statSync(fullPath).isDirectory();
    
    const connector = isLastItem ? '└── ' : '├── ';
    tree += prefix + connector + item + '\n';
    
    if (isDirectory) {
      const nextPrefix = prefix + (isLastItem ? '    ' : '│   ');
      tree += generateFileTree(fullPath, nextPrefix, ignorePatterns, isLastItem);
    }
  });
  
  return tree;
}

/**
 * Get human-readable date string
 */
function getHumanReadableDate(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  return `${dayName}, ${monthName} ${day}, ${year} @ ${hours}:${minutes}${ampm}`;
}

/**
 * Get date folder name (e.g., Sat-11-22-2025)
 */
function getDateFolderName(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = days[date.getDay()];
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${dayName}-${month}-${day}-${year}`;
}

/**
 * Get snapshot filename (e.g., snap-Sat-11-22-2025--5-55-am.md)
 */
function getSnapshotFilename(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = days[date.getDay()];
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  
  return `snap-${dayName}-${month}-${day}-${year}--${hours}-${minutes}-${ampm}.md`;
}

/**
 * Normalize project name for human reading
 */
function normalizeProjectName() {
  const projectName = path.basename(PROJECT_ROOT);
  // Convert kebab-case, snake_case, or camelCase to Title Case
  return projectName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get file contents for the snapshot
 */
function getFileContents(filePath, ignorePatterns) {
  try {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return '[Directory]';
    }
    
    // Skip binary files or very large files
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.length > 100000) {
      return `[File too large - ${Math.round(content.length / 1024)}KB]`;
    }
    
    return content;
  } catch (error) {
    return `[Error reading file: ${error.message}]`;
  }
}

/**
 * Generate snapshot markdown content
 */
function generateSnapshotContent(ignorePatterns) {
  const now = new Date();
  const projectName = normalizeProjectName();
  const humanDate = getHumanReadableDate(now);
  const projectRootName = path.basename(PROJECT_ROOT);
  const fileTree = generateFileTree(PROJECT_ROOT, '', ignorePatterns);
  
  let content = `# ${projectName}\n\n`;
  content += `**Snapshot Date:** ${humanDate}\n\n`;
  content += `---\n\n`;
  content += `## File Tree\n\n`;
  content += `\`\`\`\n${projectRootName}\n${fileTree}\`\`\`\n\n`;
  content += `---\n\n`;
  content += `## File Contents\n\n`;
  
  // Walk through all files and add their contents
  function walkDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir)
      .filter(item => {
        const fullPath = path.join(dir, item);
        return !shouldIgnore(fullPath, ignorePatterns);
      })
      .sort();
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relativeFilePath = path.join(relativePath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        walkDirectory(fullPath, relativeFilePath);
      } else {
        const fileContent = getFileContents(fullPath, ignorePatterns);
        content += `### ${relativeFilePath}\n\n`;
        content += `\`\`\`\n${fileContent}\n\`\`\`\n\n`;
      }
    });
  }
  
  walkDirectory(PROJECT_ROOT);
  
  return content;
}

/**
 * Main function
 */
function main() {
  try {
    console.log('Creating snapshot...');
    console.log(`Project root: ${PROJECT_ROOT}`);
    
    // Create snapshots directory if it doesn't exist
    if (!fs.existsSync(SNAPSHOTS_DIR)) {
      fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
      console.log(`Created snapshots directory: ${SNAPSHOTS_DIR}`);
    }
    
    // Parse gitignore
    const ignorePatterns = parseGitignore();
    console.log(`Found ${ignorePatterns.length} ignore patterns`);
    
    // Generate snapshot content
    const snapshotContent = generateSnapshotContent(ignorePatterns);
    
    // Create date folder and save snapshot
    const now = new Date();
    const dateFolderName = getDateFolderName(now);
    const dateFolderPath = path.join(SNAPSHOTS_DIR, dateFolderName);
    
    // Create date folder if it doesn't exist
    if (!fs.existsSync(dateFolderPath)) {
      fs.mkdirSync(dateFolderPath, { recursive: true });
      console.log(`Created date folder: ${dateFolderName}`);
    }
    
    // Generate filename and save
    const filename = getSnapshotFilename(now);
    const filePath = path.join(dateFolderPath, filename);
    
    fs.writeFileSync(filePath, snapshotContent, 'utf-8');
    console.log(`Snapshot saved to: ${filePath}`);
    console.log('Snapshot created successfully!');
    
  } catch (error) {
    console.error('Error creating snapshot:', error);
    process.exit(1);
  }
}

// Run the script
main();


const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if file uses alert
  if (!content.includes('alert(')) {
    return;
  }

  // Count the occurrences of alert
  const alertCount = (content.match(/alert\(/g) || []).length;
  if (alertCount === 0) return;

  // Make replacements
  // 1. alert('Lỗi: abc') -> toast.error('Lỗi: abc')
  // 2. alert('Thành công: xyz') -> toast.success('Thành công: xyz')
  // 3. other alert('...') -> toast('...')
  
  let newContent = content.replace(/alert\((['"`])((?:(?!\1)[^\\]|\\.)*)\1\)/g, (match, quote, innerString) => {
    const lowerCaseInner = innerString.toLowerCase();
    if (lowerCaseInner.includes('lỗi') || lowerCaseInner.includes('error') || lowerCaseInner.includes('thất bại') || lowerCaseInner.includes('vui lòng')) {
      return `toast.error(${quote}${innerString}${quote})`;
    } else if (lowerCaseInner.includes('thành công') || lowerCaseInner.includes('success')) {
      return `toast.success(${quote}${innerString}${quote})`;
    } else {
      return `toast(${quote}${innerString}${quote})`;
    }
  });

  // Also catch alert(error.message) or alert("Lỗi: " + error.message)
  newContent = newContent.replace(/alert\(([^)]+)\)/g, (match, innerExpr) => {
    // If it's a template literal or string concatenation starting with Error words
    const lowerCaseInner = innerExpr.toLowerCase();
    if (lowerCaseInner.includes('lỗi') || lowerCaseInner.includes('error') || lowerCaseInner.includes('thất bại') || lowerCaseInner.includes('vui lòng')) {
      return `toast.error(${innerExpr})`;
    } else if (lowerCaseInner.includes('thành công') || lowerCaseInner.includes('success')) {
      return `toast.success(${innerExpr})`;
    } else {
      return `toast(${innerExpr})`;
    }
  });

  // Add import if not present
  if (!newContent.includes('import { toast } from "react-hot-toast"') && !newContent.includes("import { toast } from 'react-hot-toast'")) {
    // Find the last import statement or beginning of file
    const importRegex = /^import .+?;?$/gm;
    let match;
    let lastIndex = 0;
    while ((match = importRegex.exec(newContent)) !== null) {
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex > 0) {
      newContent = newContent.slice(0, lastIndex) + '\nimport { toast } from "react-hot-toast";' + newContent.slice(lastIndex);
    } else {
      newContent = 'import { toast } from "react-hot-toast";\n' + newContent;
    }
  }

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Replaced alerts in: ${filePath}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      processFile(filePath);
    }
  }
}

const targetDir = path.resolve(__dirname, 'apps', 'web');
walkDir(targetDir);
console.log('Done!');

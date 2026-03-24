const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.jsx')) { 
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('./src');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Revert texts
  content = content.replace(/text-navy(?!-)/g, 'text-white');
  content = content.replace(/text-slate-500/g, 'text-gray-400');
  content = content.replace(/text-slate-600/g, 'text-gray-500');
  content = content.replace(/text-slate-700/g, 'text-gray-300');
  content = content.replace(/text-saffron(?!-)/g, 'text-accent-purple');
  
  // Revert backgrounds
  content = content.replace(/bg-white\/90/g, 'bg-surface-100/80');
  content = content.replace(/bg-slate-50/g, 'bg-surface-50');
  content = content.replace(/bg-white([^/a-z-]|$)/g, 'bg-white/[0.04]$1');
  
  // Revert borders
  content = content.replace(/border-slate-200/g, 'border-white/[0.06]');
  content = content.replace(/border-slate-300/g, 'border-white/[0.12]');
  
  // Revert gradients structurally (they will be colored by Tailwind config)
  content = content.replace(/from-navy/g, 'from-accent-blue');
  content = content.replace(/to-saffron/g, 'to-accent-purple');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    count++;
  }
});

console.log('Successfully reverted ' + count + ' files back to structure.');

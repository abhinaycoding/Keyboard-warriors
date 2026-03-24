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
  
  // Text colors
  content = content.replace(/text-white/g, 'text-navy');
  content = content.replace(/text-gray-400/g, 'text-slate-500');
  content = content.replace(/text-gray-500/g, 'text-slate-600');
  content = content.replace(/text-gray-600/g, 'text-slate-500');
  content = content.replace(/text-gray-300/g, 'text-slate-700');
  content = content.replace(/text-gray-700/g, 'text-slate-600');
  
  // Accent colors
  content = content.replace(/text-accent-blue/g, 'text-navy');
  content = content.replace(/text-accent-purple/g, 'text-saffron');
  
  // Backgrounds
  content = content.replace(/bg-surface-100\/80/g, 'bg-white/90');
  content = content.replace(/bg-surface-100/g, 'bg-slate-50');
  content = content.replace(/bg-surface-50\/50/g, 'bg-slate-50');
  content = content.replace(/bg-surface-50/g, 'bg-slate-50');
  content = content.replace(/bg-surface/g, 'bg-slate-50');
  
  // Borders
  content = content.replace(/border-white\/\[[0-9.]+\]/g, 'border-slate-200');
  content = content.replace(/border-accent-blue\/[0-9]+/g, 'border-slate-300');
  content = content.replace(/border-accent-purple\/[0-9]+/g, 'border-slate-300');
  
  // Gradients
  content = content.replace(/from-accent-blue/g, 'from-navy');
  content = content.replace(/to-accent-purple/g, 'to-saffron');
  content = content.replace(/to-accent-pink/g, 'to-saffron');
  
  // Glass backgrounds
  content = content.replace(/bg-white\/\[[0-9.]+\]/g, 'bg-white');
  content = content.replace(/bg-accent-blue\/[0-9]+/g, 'bg-slate-100');
  content = content.replace(/bg-accent-purple\/[0-9]+/g, 'bg-slate-100');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    count++;
  }
});

console.log('Successfully refactored ' + count + ' files for Indian Flag Light Theme.');

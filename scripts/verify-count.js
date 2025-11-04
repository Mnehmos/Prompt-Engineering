#!/usr/bin/env node
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/processed/techniques.json', 'utf8'));

console.log('=== ACTUAL TECHNIQUE COUNT ===\n');
console.log(`Total Categories: ${data.categories.length}\n`);

let grandTotal = 0;
data.categories.forEach(cat => {
  const count = cat.techniques.length;
  grandTotal += count;
  console.log(`${cat.name}: ${count} techniques`);
});

console.log(`\nGRAND TOTAL: ${grandTotal} techniques`);
console.log(`\nMetadata says: ${data.metadata?.totalEnhanced || 'N/A'}`);
console.log(`Site claims: 182`);
console.log(`Actual count: ${grandTotal}`);
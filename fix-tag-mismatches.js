const fs = require('fs');

const files = [
  'content/articles/how-much-is-the-holy-grail-worth.md',
  'content/articles/how-much-are-old-masonic-rings-worth.md',
  'content/articles/how-much-are-the-poker-chips-worth.md',
  'content/articles/how-much-are-tiffany-lamps-worth.md',
  'content/articles/how-much-is-a-1923-coke-bottle-worth.md'
];

files.forEach(file => {
  console.log(`Processing ${file}...`);
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove all closing stat-card tags that are causing issues
  content = content.replace(/{{< \/data-modules\/stat-card >}}/g, '');
  
  // Now add proper stat-card tags for each content block
  content = content.replace(/value="(.*?)" label="(.*?)" color="(.*?)" >}}\s+(.*?)(?=\s+(?:{{< data-modules\/stat-card|{{< content-modules))/g, 
    'value="$1" label="$2" color="$3" >}}\n    $4\n{{< /data-modules/stat-card >}}');
  
  fs.writeFileSync(file, content);
  console.log(`Fixed ${file}`);
});

console.log('All files processed.'); 
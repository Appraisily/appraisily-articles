const fs = require('fs');

// Files to fix
const files = [
  'content/articles/how-much-is-the-holy-grail-worth.md',
  'content/articles/how-much-are-old-masonic-rings-worth.md',
  'content/articles/how-much-are-the-poker-chips-worth.md',
  'content/articles/how-much-are-tiffany-lamps-worth.md',
  'content/articles/how-much-is-a-1923-coke-bottle-worth.md'
];

// Process each file
files.forEach(filePath => {
  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix file based on filename pattern
  if (filePath.includes('holy-grail')) {
    // Holy Grail article fix
    const newStatBlock = `{{< data-modules/stats-highlight title="The Holy Grail: Value Beyond Measure" columns="3" />}}

{{< data-modules/stat-card value="Priceless" label="Historical Value" color="blue" >}}
As possibly the most significant Christian relic in existence
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="$100M+" label="Auction Estimate" color="green" >}}
Conservative minimum if authenticated
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="200+" label="Claimed Grails" color="orange" >}}
Number of artifacts claiming to be the Holy Grail across Europe
{{< /data-modules/stat-card >}}`;

    // Find and replace the problematic block
    content = content.replace(/{{< data-modules\/stats-highlight[^>]*>}}[\s\S]*?{{< \/data-modules\/stat-card >}}[\s\S]*?{{< \/data-modules\/stat-card >}}[\s\S]*?{{< \/data-modules\/stat-card >}}/g, newStatBlock);
  } 
  else if (filePath.includes('masonic-rings')) {
    // Masonic rings article fix
    const newStatBlock = `{{< data-modules/stats-highlight title="Masonic Ring Market Statistics" columns="3" />}}

{{< data-modules/stat-card value="$795" label="Average Sale Price" color="blue" >}}
Average price for vintage Masonic rings sold on 1stDibs
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="70%" label="Value Increase" color="green" >}}
Approximate value increase for quality Masonic rings over the past decade
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="40%" label="Condition Impact" color="orange" >}}
Typical value difference between excellent and fair condition rings
{{< /data-modules/stat-card >}}`;

    content = content.replace(/{{< data-modules\/stats-highlight[^>]*>}}[\s\S]*?{{< \/data-modules\/stat-card >}}[\s\S]*?{{< \/data-modules\/stat-card >}}[\s\S]*?{{< \/data-modules\/stat-card >}}/g, newStatBlock);
  }
  else if (filePath.includes('poker-chips')) {
    // Poker chips article fix
    const newStatBlock = `{{< data-modules/stats-highlight title="Common Home Game Chip Distribution (Per Player)" columns="3" />}}

{{< data-modules/stat-card value="10" label="White ($1) Chips" color="blue" >}}
Total value: $10
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="10" label="Red ($5) Chips" color="red" >}}
Total value: $50
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="6" label="Black ($100) Chips" color="green" >}}
Total value: $600
{{< /data-modules/stat-card >}}`;

    content = content.replace(/{{< data-modules\/stats-highlight[^>]*>}}[\s\S]*?{{< \/data-modules\/stat-card >}}[\s\S]*?{{< \/data-modules\/stat-card >}}[\s\S]*?{{< \/data-modules\/stat-card >}}/g, newStatBlock);
  }
  else if (filePath.includes('tiffany-lamps')) {
    // Tiffany lamps article fix
    const newStatBlock = `{{< data-modules/stats-highlight title="Tiffany Lamp Value Overview" columns="3" />}}

{{< data-modules/stat-card value="$4,000+" label="Starting Price" color="blue" >}}
Minimum value for authentic Tiffany lamps in good condition
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="$1M+" label="Record Sales" color="green" >}}
Exceptional rare pieces with documented provenance
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="10-15%" label="Annual Appreciation" color="purple" >}}
Average yearly increase in value for investment-quality pieces
{{< /data-modules/stat-card >}}`;

    content = content.replace(/{{< data-modules\/stats-highlight[^>]*>}}[\s\S]*?{{< \/data-modules\/stat-card >}}[\s\S]*?{{< \/data-modules\/stat-card >}}[\s\S]*?{{< \/data-modules\/stat-card >}}/g, newStatBlock);
  }
  else if (filePath.includes('1923-coke-bottle')) {
    // Coke bottle article fix
    const newStatBlock = `{{< data-modules/stats-highlight title="Key 1923 Coca-Cola Bottle Facts" columns="3" />}}

{{< data-modules/stat-card value="Dec 25, 1923" label="Patent Date" color="red" >}}
The date commonly found on the bottom of vintage Coca-Cola bottles
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="$25-$3,000" label="Value Range" color="green" >}}
Depending on rarity, condition, and manufacturing plant
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="1923-1950s" label="Production Period" color="blue" >}}
Bottles with this patent date were manufactured over several decades
{{< /data-modules/stat-card >}}`;

    content = content.replace(/{{< data-modules\/stats-highlight[^>]*>}}[\s\S]*?{{< \/data-modules\/stat-card >}}[\s\S]*?{{< \/data-modules\/stat-card >}}[\s\S]*?{{< \/data-modules\/stat-card >}}/g, newStatBlock);
  }
  
  // Write the fixed content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
});

console.log('All files processed successfully!'); 
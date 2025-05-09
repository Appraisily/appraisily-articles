const fs = require('fs');

// Define replacements for each file
const replacements = {
  'content/articles/how-much-is-the-holy-grail-worth.md': {
    // Find the start of the problematic section through the end
    pattern: /{{< data-modules\/stats-highlight.*?{{< \/data-modules\/stat-card >}}/gs,
    // Replace with correct structure
    replacement: `{{< data-modules/stats-highlight title="The Holy Grail: Value Beyond Measure" columns="3" />}}

{{< data-modules/stat-card value="Priceless" label="Historical Value" color="blue" >}}
As possibly the most significant Christian relic in existence
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="$100M+" label="Auction Estimate" color="green" >}}
Conservative minimum if authenticated
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="200+" label="Claimed Grails" color="orange" >}}
Number of artifacts claiming to be the Holy Grail across Europe
{{< /data-modules/stat-card >}}`
  },
  'content/articles/how-much-are-old-masonic-rings-worth.md': {
    pattern: /{{< data-modules\/stats-highlight.*?{{< \/data-modules\/stat-card >}}/gs,
    replacement: `{{< data-modules/stats-highlight title="Masonic Ring Market Statistics" columns="3" />}}

{{< data-modules/stat-card value="$795" label="Average Sale Price" color="blue" >}}
Average price for vintage Masonic rings sold on 1stDibs
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="70%" label="Value Increase" color="green" >}}
Approximate value increase for quality Masonic rings over the past decade
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="40%" label="Condition Impact" color="orange" >}}
Typical value difference between excellent and fair condition rings
{{< /data-modules/stat-card >}}`
  },
  'content/articles/how-much-are-the-poker-chips-worth.md': {
    pattern: /{{< data-modules\/stats-highlight.*?{{< \/data-modules\/stat-card >}}/gs,
    replacement: `{{< data-modules/stats-highlight title="Common Home Game Chip Distribution (Per Player)" columns="3" />}}

{{< data-modules/stat-card value="10" label="White ($1) Chips" color="blue" >}}
Total value: $10
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="10" label="Red ($5) Chips" color="red" >}}
Total value: $50
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="6" label="Black ($100) Chips" color="green" >}}
Total value: $600
{{< /data-modules/stat-card >}}`
  },
  'content/articles/how-much-are-tiffany-lamps-worth.md': {
    pattern: /{{< data-modules\/stats-highlight.*?{{< \/data-modules\/stat-card >}}/gs,
    replacement: `{{< data-modules/stats-highlight title="Tiffany Lamp Value Overview" columns="3" />}}

{{< data-modules/stat-card value="$4,000+" label="Starting Price" color="blue" >}}
Minimum value for authentic Tiffany lamps in good condition
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="$1M+" label="Record Sales" color="green" >}}
Exceptional rare pieces with documented provenance
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="10-15%" label="Annual Appreciation" color="purple" >}}
Average yearly increase in value for investment-quality pieces
{{< /data-modules/stat-card >}}`
  },
  'content/articles/how-much-is-a-1923-coke-bottle-worth.md': {
    pattern: /{{< data-modules\/stats-highlight.*?{{< \/data-modules\/stat-card >}}/gs,
    replacement: `{{< data-modules/stats-highlight title="Key 1923 Coca-Cola Bottle Facts" columns="3" />}}

{{< data-modules/stat-card value="Dec 25, 1923" label="Patent Date" color="red" >}}
The date commonly found on the bottom of vintage Coca-Cola bottles
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="$25-$3,000" label="Value Range" color="green" >}}
Depending on rarity, condition, and manufacturing plant
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="1923-1950s" label="Production Period" color="blue" >}}
Bottles with this patent date were manufactured over several decades
{{< /data-modules/stat-card >}}`
  }
};

// Fix each file
Object.entries(replacements).forEach(([filePath, { pattern, replacement }]) => {
  try {
    console.log(`Processing ${filePath}...`);
    
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the pattern exists in the file
    if (!pattern.test(content)) {
      console.log(`Pattern not found in ${filePath}`);
      return;
    }
    
    // Replace the pattern
    const newContent = content.replace(pattern, replacement);
    
    // Write the file
    fs.writeFileSync(filePath, newContent);
    
    console.log(`Successfully updated ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}); 
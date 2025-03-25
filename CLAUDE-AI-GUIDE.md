# Appraisily Article Generation - Claude 3.7 Guide

This guide is specifically designed for Claude 3.7 Sonnet when generating articles for the Appraisily website. It outlines the exact syntax and formatting requirements for shortcodes used in Hugo templates.

## Article Structure Guidelines

1. **Front Matter**: Always include complete front matter with all required fields
2. **Table of Contents**: Include `{{< tableofcontents >}}` at the beginning of the article
3. **Introduction**: Start with an engaging introduction
4. **Main Content**: Organize with clearly defined sections using H2 headings
5. **External Links**: Include numerous external links to authoritative sources for SEO 
6. **FAQ Section**: Always include a comprehensive FAQ section
7. **Resources**: End with a resource-links section containing external references

## Critical Shortcode Formatting

### Self-Closing Shortcodes (MUST use "/>" at the end)

These shortcodes MUST use self-closing syntax:

```
{{< data-modules/stats-highlight title="Title" columns="3" />}}
{{< interactive-modules/checklist-item label="Item label text" />}}
{{< visual-modules/hero-image src="url" alt="text" caption="caption" />}}
```

### Nested Shortcodes (MUST have matching opening/closing tags)

These shortcodes MUST have proper opening and closing tags:

#### Section Header
```
{{< content-modules/section-header title="Section Title" level="2" >}}
  Section description text here.
{{< /content-modules/section-header >}}
```

#### FAQ Container and Items
```
{{< content-modules/faq title="Common Questions" id="faq-section" >}}
  {{< content-modules/faq-item question="First question?" >}}
    Answer to the first question.
  {{< /content-modules/faq-item >}}
  
  {{< content-modules/faq-item question="Second question?" >}}
    Answer to the second question.
  {{< /content-modules/faq-item >}}
{{< /content-modules/faq >}}
```

#### Resource Links and Cards
```
{{< interactive-modules/resource-links title="External Resources" columns="2" >}}
  {{< interactive-modules/resource-card title="Resource Title" url="https://example.com" type="article" >}}
    Description of the resource.
  {{< /interactive-modules/resource-card >}}
  
  {{< interactive-modules/resource-card title="Another Resource" url="https://example2.com" type="tool" >}}
    Description of another resource.
  {{< /interactive-modules/resource-card >}}
{{< /interactive-modules/resource-links >}}
```

#### Timeline
```
{{< visual-modules/timeline title="Historical Timeline" >}}
  {{< visual-modules/timeline-item date="1950" title="First Event" >}}
    Description of the first event.
  {{< /visual-modules/timeline-item >}}
  
  {{< visual-modules/timeline-item date="1970" title="Second Event" >}}
    Description of the second event.
  {{< /visual-modules/timeline-item >}}
{{< /visual-modules/timeline >}}
```

#### Condition Checklist
```
{{< interactive-modules/condition-checklist title="Condition Assessment" description="Check applicable items" >}}
  {{< interactive-modules/checklist-item label="First item to check" />}}
  {{< interactive-modules/checklist-item label="Second item to check" />}}
  {{< interactive-modules/checklist-item label="Third item to check" />}}
{{< /interactive-modules/condition-checklist >}}
```

### Direct HTML Tables

Use direct HTML tables inside these shortcodes:

#### Price Table
```
{{< data-modules/price-table title="Price Ranges" description="Current market values" >}}
  <tr>
    <td>Item Category</td>
    <td>$100-$500</td>
    <td>Good condition</td>
  </tr>
  <tr>
    <td>Another Category</td>
    <td>$500-$1,000</td>
    <td>Excellent condition</td>
  </tr>
{{< /data-modules/price-table >}}
```

#### Auction Results
```
{{< auction-results title="Recent Auction Sales" description="Notable auction records" >}}
  <tr>
    <td>Item Name</td>
    <td>$5,000</td>
    <td>January 2025</td>
    <td>Sotheby's</td>
  </tr>
  <tr>
    <td>Another Item</td>
    <td>$3,500</td>
    <td>February 2025</td>
    <td>Christie's</td>
  </tr>
{{< /auction-results >}}
```

## Complete List of Available Modules

### Content Structure Modules
- **Section Header**: `{{< content-modules/section-header title="Title" level="2" icon="📚" badge="Expert Guide" >}}...{{< /content-modules/section-header >}}`
- **FAQ Container**: `{{< content-modules/faq title="Common Questions" id="faq-section" >}}...{{< /content-modules/faq >}}`
- **FAQ Item**: `{{< content-modules/faq-item question="Question?" >}}...{{< /content-modules/faq-item >}}`
- **Table of Contents**: `{{< tableofcontents >}}`

### Visual Modules
- **Hero Image**: `{{< visual-modules/hero-image src="url" alt="alt text" caption="caption" width="full" />}}`
- **Timeline**: `{{< visual-modules/timeline title="Timeline" theme="alternating" >}}...{{< /visual-modules/timeline >}}`
- **Timeline Item**: `{{< visual-modules/timeline-item date="1950" title="Event" >}}...{{< /visual-modules/timeline-item >}}`
- **Image Gallery**: `{{< image-gallery >}}...{{< /image-gallery >}}`

### Data Presentation Modules
- **Price Table**: `{{< data-modules/price-table title="Title" description="Description" >}}...{{< /data-modules/price-table >}}`
- **Stats Highlight**: `{{< data-modules/stats-highlight title="Title" columns="3" />}}`
- **Stat Card**: `{{< data-modules/stat-card value="Value" label="Label" color="blue" >}}...{{< /data-modules/stat-card >}}`
- **Auction Results**: `{{< auction-results title="Title" description="Description" >}}...{{< /auction-results >}}`

### Interactive Modules
- **Resource Links**: `{{< interactive-modules/resource-links title="Title" columns="2" >}}...{{< /interactive-modules/resource-links >}}`
- **Resource Card**: `{{< interactive-modules/resource-card title="Title" url="URL" type="article" >}}...{{< /interactive-modules/resource-card >}}`
- **Condition Checklist**: `{{< interactive-modules/condition-checklist title="Title" description="Description" >}}...{{< /interactive-modules/condition-checklist >}}`
- **Checklist Item**: `{{< interactive-modules/checklist-item label="Label" />}}`

## Critical Rules to Remember

1. Self-closing shortcodes MUST use "/>" at the end
2. Nested shortcodes MUST have matching opening and closing tags
3. Use direct HTML table rows inside price-table and auction-results
4. Always wrap resource-card shortcodes inside resource-links shortcodes
5. Place shortcodes on their own lines, not inline with text
6. Always maintain proper spacing and indentation for readability

## Mobile Responsiveness Guidelines

1. Keep content width-aware for smaller screens
2. Ensure text in interactive components is readable on small screens
3. Use responsive image sizing in hero images (width="full" or width="normal")
4. Limit table column widths for better mobile display
5. Make sure resource cards display cleanly on smaller screens
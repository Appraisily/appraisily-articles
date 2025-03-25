# Shortcodes Guidelines for Appraisily Articles

This guide explains how to properly use shortcodes in your articles to avoid build failures. Following these guidelines will ensure your articles work correctly in the Hugo build process.

## Common Shortcode Errors

The most common errors with shortcodes are:

1. **Missing closing tags**: Paired shortcodes must have both opening and closing tags
2. **Self-closing syntax**: Some shortcodes should use self-closing syntax (`/>}}`)
3. **Using deprecated shortcodes**: Some shortcodes should be avoided in favor of direct HTML
4. **Nesting issues**: Shortcodes must be properly nested

## Shortcodes That Require Opening and Closing Tags

These shortcodes must have both an opening and closing tag because they wrap content:

```markdown
{{< content-modules/section-header title="My Section" level="2" >}}
This is my section content.
{{< /content-modules/section-header >}}

{{< content-modules/faq >}}
  {{< content-modules/faq-item question="My question?" >}}
  My answer text.
  {{< /content-modules/faq-item >}}
{{< /content-modules/faq >}}

{{< visual-modules/timeline >}}
  {{< visual-modules/timeline-item date="2023" title="Event Title" >}}
  Event description.
  {{< /visual-modules/timeline-item >}}
{{< /visual-modules/timeline >}}

{{< interactive-modules/condition-checklist title="My Checklist" >}}
  {{< interactive-modules/checklist-item text="Checklist item 1" />}}
  {{< interactive-modules/checklist-item text="Checklist item 2" />}}
{{< /interactive-modules/condition-checklist >}}

{{< interactive-modules/resource-links title="Resources" >}}
  {{< interactive-modules/resource-card title="Resource 1" url="https://example.com" description="Resource description" />}}
{{< /interactive-modules/resource-links >}}
```

## Self-Closing Shortcodes

These shortcodes should use self-closing syntax (`/>}}`) because they don't wrap content:

```markdown
{{< data-modules/stats-highlight stat="75%" text="Success Rate" />}}

{{< interactive-modules/checklist-item text="Checklist item" />}}

{{< interactive-modules/resource-card title="Resource" url="https://example.com" description="Description" />}}
```

## Shortcodes To Avoid (Use Direct HTML Instead)

These shortcodes have been problematic and should be replaced with direct HTML:

### For `data-modules/price-table` use:

```markdown
{{< data-modules/price-table title="Price Table" >}}
  <tr>
    <td>Item 1</td>
    <td>$100</td>
    <td>Good condition</td>
  </tr>
  <tr>
    <td>Item 2</td>
    <td>$200</td>
    <td>Excellent condition</td>
  </tr>
{{< /data-modules/price-table >}}
```

Instead of:
```markdown
{{< data-modules/price-table title="Price Table" >}}
  {{< data-modules/price-row item="Item 1" condition="Good" price="$100" >}}
  {{< data-modules/price-row item="Item 2" condition="Excellent" price="$200" >}}
{{< /data-modules/price-table >}}
```

### For `auction-results` use:

```markdown
{{< auction-results >}}
  <tr>
    <td>Item 1</td>
    <td>$1000</td>
    <td>2023</td>
    <td>Auction House</td>
  </tr>
  <tr>
    <td>Item 2</td>
    <td>$2000</td>
    <td>2024</td>
    <td>Another Auction</td>
  </tr>
{{< /auction-results >}}
```

Instead of:
```markdown
{{< auction-results >}}
  {{< auction-item title="Item 1" sold="$1000" date="2023" auctionHouse="Auction House" >}}
  {{< auction-item title="Item 2" sold="$2000" date="2024" auctionHouse="Another Auction" >}}
{{< /auction-results >}}
```

## Validation Script

We've added a validation script that checks your articles for proper shortcode usage. Run it before building:

```bash
npm run validate
```

This script is automatically run before the `build:smart` command, but you can run it separately to check your articles.

## Tips for Avoiding Errors

1. **Use the article template**: Start from the template to get the right structure
2. **Always close paired shortcodes**: Make sure every opening tag has a matching closing tag
3. **Proper nesting**: Close inner shortcodes before outer ones
4. **Use HTML for tables**: Prefer direct HTML for table rows in price-tables and auction-results
5. **Run validation**: Always run `npm run validate` after creating or editing articles

## Automatic Article Generation

When using the `npm run generate` command to create articles with AI, the shortcodes should be correctly formatted. However, always validate the generated articles:

```bash
npm run generate -- "my-article-topic"
npm run validate
```

This ensures that even AI-generated articles follow the correct shortcode syntax.
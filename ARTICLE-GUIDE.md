# Article Creation and SEO Guide for Appraisily

This guide explains how to create and optimize articles for the Appraisily Articles site.

## Creating a New Article

### Method 1: Using Article Template (Recommended)

```bash
# Create a new article template with proper shortcode structure
npm run new article-name "Article Title"
```

This method creates a template with all the correct shortcode syntax, helping you avoid common build errors.

### Method 2: Using Hugo Command

```bash
# Create a new article draft
hugo new content/articles/article-name.md
```

### Method 3: Using Node.js Script for AI Generation

```bash
# Generate a complete article using Claude AI
npm run generate -- "article-keyword-or-topic"
```

## Article Structure

Articles should follow this front matter structure:

```yaml
---
title: "Article Title Here"
date: 2023-01-01T10:00:00-04:00
description: "Brief description for article"
featured_image: "https://ik.imagekit.io/appraisily/Articles/image-name.jpg"
draft: false
---

## Introduction

Content goes here...
```

## Using Shortcodes

Appraisily articles use custom shortcodes to create rich, interactive content:

### Content Modules

```
{{< content-modules/section-header title="Section Title" level="2" >}}
```

```
{{< content-modules/faq >}}
  {{< content-modules/faq-item question="Question 1?" >}}
  Answer to the question...
  {{< /content-modules/faq-item >}}
{{< /content-modules/faq >}}
```

### Data Modules

```
{{< data-modules/price-table title="Price Comparison" >}}
  {{< data-modules/price-row item="Item Name" condition="Good" price="$100-$200" >}}
{{< /data-modules/price-table >}}
```

```
{{< data-modules/stats-highlight stat="95%" text="of experts agree" >}}
```

### Visual Modules

```
{{< visual-modules/hero-image src="https://example.com/image.jpg" alt="Image description" caption="Caption text" >}}
```

```
{{< visual-modules/timeline >}}
  {{< visual-modules/timeline-item year="1950" title="Event Title" >}}
  Description of the event...
  {{< /visual-modules/timeline-item >}}
{{< /visual-modules/timeline >}}
```

### Interactive Modules

```
{{< interactive-modules/condition-checklist title="Condition Factors" >}}
  {{< interactive-modules/checklist-item text="Check for damage" >}}
{{< /interactive-modules/condition-checklist >}}
```

```
{{< interactive-modules/resource-links title="Additional Resources" >}}
  {{< interactive-modules/resource-card title="Resource Title" url="https://example.com" description="Brief description" >}}
{{< /interactive-modules/resource-links >}}
```

## SEO Optimization

### Running the SEO Enhancement Script

To enhance an article with Claude AI-generated SEO metadata:

```bash
# Set your API key first
export ANTHROPIC_API_KEY=your-api-key-here

# Enhance a specific article
node scripts/generate-seo.js content/articles/article-name.md

# Enhance all articles
node scripts/generate-seo.js
```

### Expected SEO Metadata

The script adds the following SEO fields to your article's front matter:

```yaml
meta_title: "Optimized Title for SEO"
meta_description: "Compelling description under 160 characters for search results"
canonical_url: "https://articles.appraisily.com/articles/article-name"
image_alt: "Descriptive alt text for featured image"
keywords: ["keyword1", "keyword2", "keyword phrase"]
```

## Local Development

```bash
# Start the Hugo development server
npm run dev

# Validate shortcodes in all articles
npm run validate

# Build the site for production
npm run build

# Build with smart caching and validation
npm run build:smart
```

## Working with Research Data

The site uses a structured approach to incorporating research data into articles:

### Research Data Structure

```
content/
  articles/
    article-name.md  # The final article
  article-name/      # Research data directory
    article-name-auction-results.json
    article-name-generated-images.json
    article-name-image-ideas.json
    article-name-paa-gemini.json
    article-name-perplexity.json
    article-name-serper.json
```

### Manual Article Creation from Research

1. Examine the research data files (especially `perplexity.json` and `paa-gemini.json`)
2. Create a new article using the template method: `npm run new article-name "Article Title"`
3. Incorporate the research data into the appropriate sections:
   - Use `perplexity.json` for comprehensive analysis and valuation information
   - Use `auction-results.json` for the Recent Auction Results section
   - Use `paa-gemini.json` for the FAQ section
   - Use `image-ideas.json` for image planning with ImageKit

### Shortcode Syntax Notes

When working with shortcodes, be careful to use the correct syntax:
- Self-closing shortcodes that don't wrap content should use `>}}` at the end, not `/>}}`
- Example: `{{< visual-modules/hero-image src="..." alt="..." caption="..." >}}`

## Deployment

The site is automatically deployed to Netlify when changes are pushed to the main branch. The configuration is managed in `netlify.toml`.

## Article Image Guidelines

- Featured images should be 1200x630px for optimal social sharing
- Use high-quality, relevant images that illustrate the article's topic
- Always provide descriptive alt text for accessibility and SEO
- Store images at ImageKit using the URL format: 
  `https://ik.imagekit.io/appraisily/Articles/image-name.jpg`
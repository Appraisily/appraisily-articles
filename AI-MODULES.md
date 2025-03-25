# AI Article Generation Module Documentation

This document provides comprehensive guidelines for utilizing the modular components to transform research data into well-structured, visually appealing articles for the Appraisily website.

## Getting Started

When creating an article, follow these steps:

1. Analyze the research JSON files to understand the article topic and available data
2. Plan the article structure based on content types and user intent
3. Select appropriate modules for each section of the article
4. Use the Hugo shortcodes documented below to implement each module

## Article Structure

A well-structured article typically includes:

1. **Front Matter**: title, description, date, featured_image
2. **Table of Contents**: For longer articles
3. **Introduction**: Engaging opening with context
4. **Main Content Sections**: Using appropriate modules
5. **FAQ Section**: Common questions from research data
6. **Resource Links**: Additional references and tools
7. **Call to Action**: What readers should do next

## Module Documentation

### 1. Content Structure Modules

#### Section Header
Creates visually distinct section headers with optional icons and badges.

```hugo
{{</* content-modules/section-header title="Camera Valuation Guide" level="2" icon="📷" badge="Expert Guide" */>}}
  A comprehensive guide to understanding vintage camera values.
{{</* /content-modules/section-header */>}}
```

Parameters:
- `title`: The header text (required)
- `level`: Heading level - "2", "3", or "4" (default: "2")
- `icon`: Optional icon to display before the title
- `badge`: Optional badge text to display after the title
- `id`: Custom ID for direct linking (default: slug of title)

#### FAQ Module
Displays expandable question/answer pairs with schema.org markup.

```hugo
{{</* content-modules/faq title="Common Questions About Camera Values" id="camera-value-faqs" */>}}
  {{</* content-modules/faq-item question="How much is my old camera worth?" open="true" */>}}
    The value of your old camera depends on several factors:
    
    - Brand and model
    - Current condition
    - Rarity and historical significance
    - Included accessories
  {{</* /content-modules/faq-item */>}}
  
  {{</* content-modules/faq-item question="Where can I sell my vintage camera?" */>}}
    Several options exist for selling vintage cameras:
    
    - Online marketplaces like eBay
    - Specialty camera stores
    - Auction houses for rare models
    - Camera collector forums
  {{</* /content-modules/faq-item */>}}
{{</* /content-modules/faq */>}}
```

Parameters:
- `title`: The heading for the FAQ section (default: "Frequently Asked Questions")
- `id`: Custom ID for the section (default: "faq-section")
- `schema`: Whether to include schema.org markup - "true" or "false" (default: "true")

Parameters for faq-item:
- `question`: The question text (required)
- `open`: Whether the item should be initially expanded - "true" or "false" (default: "false")

### 2. Visual Content Modules

#### Hero Image
Displays a large featured image with caption and optional credit.

```hugo
{{</* visual-modules/hero-image src="https://ik.imagekit.io/appraisily/SEO/old-camera-value/old-camera-value-image-1.png" alt="Vintage Leica M3 camera" caption="A rare Leica M3 rangefinder camera from 1954" credit="Photo: Appraisily Studio" width="full" */>}}
```

Parameters:
- `src`: Image URL (required)
- `alt`: Alt text for accessibility (default: "Featured image")
- `caption`: Optional caption text to display below the image
- `credit`: Optional credit line
- `width`: Image width - "full", "wide", or "normal" (default: "full")

#### Timeline
Creates an interactive timeline with chronological events.

```hugo
{{</* visual-modules/timeline title="Evolution of Camera Values" theme="alternating" */>}}
  {{</* visual-modules/timeline-item date="1950s" title="Early Leica Rangefinders" */>}}
    The Leica M3, introduced in 1954, revolutionized 35mm photography and now commands premiums of $1,500-$3,000 for working models.
  {{</* /visual-modules/timeline-item */>}}
  
  {{</* visual-modules/timeline-item date="1970s" title="Japanese SLR Boom" */>}}
    The Canon AE-1 and Nikon F2 defined this era. Initially affordable consumer cameras, these models now sell for $200-$500 in working condition.
  {{</* /visual-modules/timeline-item */>}}
{{</* /visual-modules/timeline */>}}
```

Parameters:
- `title`: Timeline title (default: "Timeline")
- `theme`: Layout style - "default", "left", or "alternating" (default: "default")

Parameters for timeline-item:
- `date`: Time period or date (required)
- `title`: Event title (required)
- `icon`: Optional icon to display in timeline dot

### 3. Data Presentation Modules

#### Price Table
Displays structured price data in a responsive table.

```hugo
{{</* data-modules/price-table title="Vintage Camera Price Ranges" description="Average market values as of 2025" */>}}
  {{</* data-modules/price-row category="Leica M3" range="$1,200 - $3,000" notes="Premium for original box and papers" */>}}
  {{</* data-modules/price-row category="Canon AE-1" range="$150 - $300" notes="Higher with original lens" highlight="true" */>}}
  {{</* data-modules/price-row category="Rolleiflex TLR" range="$400 - $1,200" notes="Condition critical to value" */>}}
{{</* /data-modules/price-table */>}}
```

Parameters:
- `title`: Table title (default: "Price Ranges")
- `description`: Optional description text
- `columns`: Comma-separated list of column keys (default: "category,range,notes")
- `columnTitles`: Comma-separated list of column headings (default: "Category,Price Range,Notes")

Parameters for price-row:
- `category`: Item category or name (required for default columns)
- `range`: Price range (required for default columns)
- `notes`: Additional information (optional for default columns)
- `highlight`: Whether to highlight the row - "true" or "false" (default: "false")

#### Stats Highlight
Displays key statistics in visually appealing cards.

```hugo
{{</* data-modules/stats-highlight title="Vintage Camera Market Statistics" columns="3" */>}}
  {{</* data-modules/stat-card value="287%" label="Value Growth" color="green" */>}}
    Average appreciation of rare Leica models since 2020
  {{</* /data-modules/stat-card */>}}
  
  {{</* data-modules/stat-card value="$12.5M" label="Auction Record" color="blue" */>}}
    Highest price ever paid for a vintage camera (Leica 0-Series prototype)
  {{</* /data-modules/stat-card */>}}
  
  {{</* data-modules/stat-card value="42%" label="Condition Impact" color="orange" */>}}
    Value difference between 'Excellent' and 'Good' condition ratings
  {{</* /data-modules/stat-card */>}}
{{</* /data-modules/stats-highlight */>}}
```

Parameters:
- `title`: Section title (optional)
- `columns`: Number of columns - "2", "3", or "4" (default: "3")

Parameters for stat-card:
- `value`: The statistic to highlight (required)
- `label`: Description label (required)
- `icon`: Optional icon to display
- `color`: Color theme - "blue", "green", "red", "purple", "orange" (default: "blue")

### 4. Interactive Modules

#### Resource Links
Displays curated external resources with descriptions.

```hugo
{{</* interactive-modules/resource-links title="Further Camera Valuation Resources" columns="2" description="Explore these trusted sources for more information" */>}}
  {{</* interactive-modules/resource-card title="CollectiBlend Camera Price Guide" url="https://collectiblend.com/Cameras/" type="tool" */>}}
    Comprehensive database of vintage camera values with historical price trends and condition guides.
  {{</* /interactive-modules/resource-card */>}}
  
  {{</* interactive-modules/resource-card title="Camera Valuation Basics" url="https://example.com/camera-valuation" type="article" */>}}
    Learn the fundamental factors that determine vintage camera prices and value.
  {{</* /interactive-modules/resource-card */>}}
{{</* /interactive-modules/resource-links */>}}
```

Parameters:
- `title`: Section title (default: "Useful Resources")
- `columns`: Number of columns - "1", "2", or "3" (default: "2")
- `description`: Optional description text

Parameters for resource-card:
- `title`: Resource title (required)
- `url`: Resource URL (required)
- `icon`: Optional icon
- `type`: Resource type - "article", "video", "tool", or "guide" (default: "article")

#### Condition Checklist
Interactive tool for assessing camera condition with scoring.

```hugo
{{</* interactive-modules/condition-checklist title="Camera Condition Assessment Tool" description="Check all items that apply to your camera to estimate its condition rating" */>}}
  {{</* interactive-modules/checklist-item label="Shutter works at all speeds" */>}}
    Test each shutter speed to verify consistent functioning
  {{</* /interactive-modules/checklist-item */>}}
  
  {{</* interactive-modules/checklist-item label="Lens is clear with no fungus or haze" */>}}
    Examine lens elements for clarity when held against light source
  {{</* /interactive-modules/checklist-item */>}}
  
  {{</* interactive-modules/checklist-item label="Light meter is accurate" */>}}
    Compare readings against a known working light meter
  {{</* /interactive-modules/checklist-item */>}}
{{</* /interactive-modules/condition-checklist */>}}
```

Parameters:
- `title`: Section title (default: "Condition Assessment Checklist")
- `description`: Optional description text

Parameters for checklist-item:
- `label`: Item description (required)
- `weight`: Relative importance weight (default: "1")

## Using Research Data

When working with the JSON files in the old-camera-value/ folder:

### 1. Auction Results (old-camera-value-auction-results.json)
Use the `auction-results` shortcode to display notable auction sales.

```hugo
{{</* auction-results title="Notable Camera Auction Results" description="Recent high-value vintage camera sales" */>}}
  {{</* auction-item item="Leica M3 Black Paint" price="$40,000" date="June 2024" auctionHouse="Christie's" */>}}
  {{</* auction-item item="Hasselblad 500C/M" price="$3,200" date="May 2024" auctionHouse="eBay" */>}}
{{</* /auction-results */>}}
```

### 2. FAQ Content (old-camera-value-paa-gemini.json)
Transform people-also-ask queries into FAQ content using the faq module.

### 3. Images (old-camera-value-generated-images.json)
Use the hero-image and image-gallery modules to display the available images.

### 4. Market Data (old-camera-value-perplexity.json)
Extract statistics and price ranges to populate data presentation modules.

### 5. External Resources (old-camera-value-serper.json)
Use URLs from search results to populate the resource-links module.

## Best Practices

1. **Content Organization**: Start with broad overview, then dive into specific details
2. **Visual Hierarchy**: Use section headers consistently to establish content hierarchy
3. **Data Presentation**: Choose the most appropriate module for each data type
4. **User Experience**: Ensure a logical flow with clear transitions between sections
5. **Mobile Optimization**: Test how modules appear on smaller screens
6. **Loading Speed**: Optimize images and limit excessive module use
7. **SEO Considerations**: Include relevant keywords in headers and image alt text

By following these guidelines and utilizing the provided modules, you can create comprehensive, visually appealing articles that effectively present the research data while maintaining consistency with the Appraisily brand.
# Implementation Plan for AI Article Generation Modules

## Overview

This plan outlines a systematic approach to developing modular templates ("tools") that an AI can use to transform research data from the old-camera-value/ folder into well-structured, visually appealing articles. The modules will follow the site's design standards as specified in STYLE-GUIDE.md.

## Objectives

1. Create reusable, modular components that an AI can combine to generate complete articles
2. Ensure visual consistency with the site's aesthetic (shadcn-style UI)
3. Structure content logically and hierarchically
4. Make modules flexible enough to accommodate various content types

## Module Categories

### 1. Content Structure Modules

- **Article Header Module**
  - Purpose: Display the article title, description, metadata
  - Data Sources: Front matter from research files
  - Implementation: Hugo partial template that accepts title, description, date parameters

- **Table of Contents Module**
  - Purpose: Auto-generate a structured outline with jump links
  - Data Sources: Article headings (H2, H3, H4)
  - Implementation: Enhance existing tableofcontents shortcode

- **Section Header Module**
  - Purpose: Create visually distinct section headers with optional icons/badges
  - Data Sources: Section titles from research files
  - Implementation: New shortcode for enhanced H2/H3 headers

- **FAQ Module**
  - Purpose: Display question/answer pairs in an expandable format
  - Data Sources: PAA data from old-camera-value-paa-gemini.json
  - Implementation: Accordion-style shortcode with schema.org markup

### 2. Visual Content Modules

- **Hero Image Module**
  - Purpose: Display main article image with caption
  - Data Sources: old-camera-value-generated-images.json
  - Implementation: Enhanced figure shortcode with shadcn styling

- **Image Gallery Module**
  - Purpose: Display multiple images in a grid with lightbox
  - Data Sources: old-camera-value-generated-images.json
  - Implementation: Extend existing image-gallery shortcode

- **Infographic Module**
  - Purpose: Visual representation of data with annotations
  - Data Sources: Research data in JSON files
  - Implementation: New shortcode with SVG/CSS visualization capabilities

- **Timeline Module**
  - Purpose: Display historical developments chronologically
  - Data Sources: Historical data from research
  - Implementation: Interactive timeline shortcode

### 3. Data Presentation Modules

- **Auction Results Module**
  - Purpose: Display price data in a structured format
  - Data Sources: old-camera-value-auction-results.json
  - Implementation: Enhance existing auction-results shortcode

- **Price Range Table Module**
  - Purpose: Show value ranges for different camera types/brands
  - Data Sources: Pricing data from research files
  - Implementation: New structured table shortcode

- **Comparison Matrix Module**
  - Purpose: Compare different camera types, conditions, or brands
  - Data Sources: Extracted from research content
  - Implementation: New grid-based shortcode

- **Stats Highlight Module**
  - Purpose: Emphasize key statistics with visual elements
  - Data Sources: Numeric data from research files
  - Implementation: Card-based shortcode with SVG charts

### 4. Interactive Modules

- **Value Calculator Module**
  - Purpose: Interactive tool to estimate camera values based on inputs
  - Data Sources: Pricing factors from research
  - Implementation: JavaScript-powered form with simple algorithm

- **Condition Assessment Checklist**
  - Purpose: Guide users through evaluating their cameras
  - Data Sources: Condition criteria from research
  - Implementation: Interactive checklist with scoring system

- **Resource Links Module**
  - Purpose: Curated external resources with descriptions
  - Data Sources: URLs from old-camera-value-serper.json
  - Implementation: Card-based link display with metadata

## Implementation Steps

1. **Module Definition Phase**
   - Create detailed specifications for each module
   - Define input parameters and data structure
   - Design visual mockups following shadcn UI principles

2. **Development Phase**
   - Implement core structure modules first
   - Develop visual content modules
   - Build data presentation modules
   - Create interactive components last

3. **Integration Phase**
   - Create a unified documentation system for the AI
   - Develop example templates showing module combinations
   - Build test articles using the modules

4. **Testing Phase**
   - Verify modules with sample data
   - Test responsive behavior across device sizes
   - Optimize for accessibility and performance

5. **Deployment Phase**
   - Create comprehensive documentation
   - Develop AI prompting templates
   - Deploy modules to production

## Technical Requirements

- Hugo shortcodes for template logic
- CSS using BEM naming convention
- JavaScript for interactive elements
- Schema.org structured data for SEO
- Responsive design following breakpoints in STYLE-GUIDE.md

## AI Usage Guidelines

The implementation will include clear documentation on:
- How to select appropriate modules based on content type
- Required and optional parameters for each module
- Best practices for module combinations
- Examples of complete article structures

## Success Metrics

- Module reusability across different article topics
- Consistency with site design aesthetic
- Page load performance
- Accessibility compliance
- SEO optimization

This implementation plan provides a structured approach to creating modular components that will enable an AI to generate high-quality, visually appealing articles from research data while maintaining design consistency with the Appraisily brand.
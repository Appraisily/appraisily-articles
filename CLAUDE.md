# CLAUDE.md - Hugo Articles Site Development Guide

## Build Commands
- `npm run dev` - Start Hugo development server with drafts
- `npm run build` - Build for production (Hugo with garbage collection and minification)
- `npm run build:smart` - Smart build with article generation caching (recommended for production)
- `npm run build:simple` - Simple build with just Hugo and sitemap generation
- `npm run build:all` - Comprehensive build that generates all new articles first, then builds the site
- `npm run build:all:force` - Generate/regenerate all articles and build the site
- `npm run generate -- "keyword"` - Generate a new article for the specified keyword
- `npm run generate:all` - Generate articles for all keyword folders that don't have articles yet
- `npm run generate:force` - Force regenerate articles for all keyword folders
- `npm run validate` - Run shortcode validation on all articles (essential before commits)
- `npm run enhance-seo -- "article-path"` - Enhance SEO metadata for an article
- `npm run test:api` - Test if your API key is working correctly
- `npm run new article-name "Article Title"` - Create a new article with proper template

## API Key Setup
1. Copy `.env.example` to `.env` in the root directory
2. Get a Claude API key from [Anthropic Console](https://console.anthropic.com/settings/keys)
3. Add your API key to the `.env` file (replace "your-anthropic-api-key-here")
4. Without a valid API key, article generation will create placeholder content

## Security Guidelines for API Keys
1. **NEVER commit API keys to the repository**
2. **NEVER hardcode API keys in any file** - always use environment variables
3. **ALWAYS use .env files** for storing sensitive information
4. **ALWAYS check your code** with `npm run security:check-staged` before committing
5. If you accidentally commit API keys, use `npm run security:clean-history` to clean the git history

The repository has security checks in place to prevent committing sensitive information:
- GitHub push protection is enabled to block commits with detected API keys
- Pre-commit hooks run `npm run security:check-staged` to prevent committing secrets
- The `.gitignore` file is configured to exclude common files containing secrets

## Available Shortcode Modules

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
- **Price Table**: `{{< data-modules/price-table title="Title" description="Description" >}}...<tr><td>...</td></tr>...{{< /data-modules/price-table >}}`
- **Stats Highlight**: `{{< data-modules/stats-highlight title="Title" columns="3" />}}`
- **Stat Card**: `{{< data-modules/stat-card value="Value" label="Label" color="blue" >}}...{{< /data-modules/stat-card >}}`
- **Auction Results**: `{{< auction-results title="Title" description="Description" >}}...<tr><td>...</td></tr>...{{< /auction-results >}}`

### Interactive Modules
- **Resource Links**: `{{< interactive-modules/resource-links title="Title" columns="2" >}}...{{< /interactive-modules/resource-links >}}`
- **Resource Card**: `{{< interactive-modules/resource-card title="Title" url="URL" type="article" >}}...{{< /interactive-modules/resource-card >}}`
- **Condition Checklist**: `{{< interactive-modules/condition-checklist title="Title" description="Description" >}}...{{< /interactive-modules/condition-checklist >}}`
- **Checklist Item**: `{{< interactive-modules/checklist-item label="Label" />}}`

### Critical Formatting Rules
1. Self-closing shortcodes MUST use "/>" at the end: `{{< shortcode attr="value" />}}`
2. Nested shortcodes must have proper opening and closing tags
3. For price tables and auction results, use direct HTML table rows instead of shortcodes
4. Always wrap resource cards inside resource-links shortcodes
5. Place shortcodes on their own lines, not inline with text
6. See `/archetypes/article-template.md` for a complete example of proper usage

## Code Style Guidelines
- **Hugo Templates**: Go template syntax with 2-space indentation, descriptive variable names
- **Markdown Content**: Front matter required (title, date, description, featured_image), H2-H4 heading hierarchy
- **Shortcodes**: Use documented modules from AI-MODULES.md (section-header, faq, hero-image, etc.)
- **Shortcode Syntax**: Some require opening/closing tags, others use self-closing syntax (/>}})
- **HTML/CSS**: BEM naming convention (.block__element--modifier), avoid inline styles
- **Data Tables**: For price-table and auction-results, use direct HTML instead of nested shortcodes
- **Error Handling**: Always check for nil values with if/with/isset to prevent template errors
- **SEO**: Include schema.org structured data via article-schema.html partial
- **Responsive Design**: Test all components at mobile (<768px), tablet (768-1024px), and desktop (>1024px)
- **Accessibility**: Use semantic HTML, provide alt text for images, ensure proper color contrast

## Validation & Testing
- Run `npm run validate` before commits to check shortcode syntax
- Common errors include missing closing tags, improper nesting, and using deprecated shortcodes
- For article generation testing, use `npm run generate -- "test-topic"` with a valid API key
- Preview generated HTML with `node scripts/htmlpreview/generate-demo.js`
- If needed, you can bypass validation during commits with `./scripts/skip-validation-commit.sh "Your commit message"` or by setting `SKIP_VALIDATION=true` before Git commands
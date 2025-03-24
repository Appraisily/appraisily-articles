# CLAUDE.md - Hugo Articles Site Development Guide

## Build Commands
- `npm run dev` - Start Hugo development server with drafts
- `npm run build` - Build for production (Hugo with garbage collection and minification)
- `npm run build:smart` - Smart build with article generation caching (recommended for production)
- `npm run build:simple` - Simple build with just Hugo and sitemap generation
- `npm run clean` - Remove public and resources directories
- `npm run migrate` - Run content migration script
- `npm run generate -- "keyword"` - Generate a new article for the specified keyword
- `npm run generate:all` - Generate articles for all keyword folders that don't have articles yet
- `npm run generate:force` - Force regenerate articles for all keyword folders
- `npm run generate:all -- --force` - Force regenerate articles (alternative syntax)
- `npm run enhance-seo -- "article-path"` - Enhance SEO metadata for an article
- `hugo new content/articles/article-name.md` - Create new article draft
- `hugo server -D --port 1313 --navigateToChanged` - Run server on specific port

## API Key Setup
1. Copy `.env.example` to `.env` in the root directory
2. Get a Claude API key from [Anthropic Console](https://console.anthropic.com/settings/keys)
3. Add your API key to the `.env` file (replace "your-anthropic-api-key-here")
4. Without a valid API key, article generation will create placeholder content

## Code Style Guidelines
- **Hugo Templates**: Go template syntax with 2-space indentation, descriptive variable names
- **Markdown Content**: Front matter required (title, date, description, featured_image), H2-H4 heading hierarchy
- **Shortcodes**: Use documented modules from AI-MODULES.md (section-header, faq, hero-image, etc.)
- **HTML/CSS**: BEM naming convention (.block__element--modifier), avoid inline styles
- **Component Structure**: Follow existing patterns for new components, use partials for reusable elements
- **Front Matter**: Follow consistent order and formatting for all metadata fields
- **Image Assets**: Use ImageKit URLs or store in static/images with proper optimization
- **Error Handling**: Always check for nil values with if/with/isset to prevent template errors
- **SEO**: Include schema.org structured data via article-schema.html partial
- **Responsive Design**: Test all components at mobile (<768px), tablet (768-1024px), and desktop (>1024px) breakpoints
- **Accessibility**: Use semantic HTML, provide alt text for images, ensure proper color contrast
# Single Watermark Configuration

The application now uses a single, configurable watermark system via the `REACT_APP_CANVAS_WATERMARK` environment variable.

## Environment Variable

```bash
REACT_APP_CANVAS_WATERMARK=your_watermark_text
```

## Features

- **Single Watermark**: Only one watermark appears on images (no duplicates)
- **No Prefixes/Suffixes**: The watermark displays exactly as configured
- **Dynamic**: Change the watermark by updating the environment variable
- **Minimal**: Small, subtle watermark with low opacity (10%)
- **Consistent**: Same watermark across all secure image displays

## Examples

```bash
# For a simple watermark
REACT_APP_CANVAS_WATERMARK=secure

# For custom branding
REACT_APP_CANVAS_WATERMARK=MyBrand

# For copyright notice
REACT_APP_CANVAS_WATERMARK=© 2024

# For empty watermark (not recommended)
REACT_APP_CANVAS_WATERMARK=

# For multiple words
REACT_APP_CANVAS_WATERMARK=Private Gallery
```

## Configuration Files

Update these files to change the canvas watermark:

1. **Development**: `frontend/.env`
2. **Production**: `frontend/.env.production`

## Note

- All overlay watermarks have been removed to eliminate duplicates
- Only the canvas watermark is displayed (configurable via environment variable)
- The watermark is applied to all secure images rendered on HTML5 canvas elements
- Very subtle appearance: 10px Arial font with 10% opacity

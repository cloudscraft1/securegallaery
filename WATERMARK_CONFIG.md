# Canvas Watermark Configuration

The canvas watermark can be configured using the `REACT_APP_CANVAS_WATERMARK` environment variable.

## Environment Variable

```bash
REACT_APP_CANVAS_WATERMARK=your_watermark_text
```

## Features

- **No Prefixes/Suffixes**: The watermark will display exactly as configured
- **Dynamic**: Change the watermark by updating the environment variable
- **Minimal**: Small, subtle watermark with low opacity
- **Consistent**: Works across all secure image displays

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

The canvas watermark is applied to secure images rendered on HTML5 canvas elements. It's separate from the overlay watermarks on regular image elements.

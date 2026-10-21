import os
import io
import base64
from PIL import Image

src_path = 'public/assets/og_logo_transparent.webp'
if not os.path.exists(src_path):
    src_path = 'public/assets/og_logo.webp'

im = Image.open(src_path).convert('RGBA')
bbox = im.getbbox()

# Crop tightly to the content
cropped = im.crop(bbox)

# Create a square canvas with a balanced 8% padding on longest side
w, h = cropped.size
max_dim = max(w, h)
canvas_size = int(max_dim * 1.08)
square = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
paste_x = (canvas_size - w) // 2
paste_y = (canvas_size - h) // 2
square.paste(cropped, (paste_x, paste_y), cropped)

# 1. Multi-resolution favicon.ico (16, 32, 48, 64)
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
square.save('public/favicon.ico', format='ICO', sizes=ico_sizes)
print('Saved public/favicon.ico with multi-resolution 16, 32, 48, 64px')

# 2. favicon.webp (256x256)
fav_webp = square.resize((256, 256), Image.Resampling.LANCZOS)
fav_webp.save('public/favicon.webp', format='WEBP', quality=95)
print('Saved public/favicon.webp')

# 3. favicon-32x32.png and favicon-48x48.png (Google search priority size)
fav_32 = square.resize((32, 32), Image.Resampling.LANCZOS)
fav_32.save('public/favicon-32x32.png', format='PNG')
fav_48 = square.resize((48, 48), Image.Resampling.LANCZOS)
fav_48.save('public/favicon-48x48.png', format='PNG')
print('Saved PNG favicons: 32x32 and 48x48')

# 4. apple-touch-icon.png (180x180) - Apple devices expect 180x180 PNG with brand dark background
apple_bg = Image.new('RGBA', (180, 180), (10, 10, 10, 255))
apple_logo = square.resize((150, 150), Image.Resampling.LANCZOS)
apple_bg.paste(apple_logo, (15, 15), apple_logo)
apple_bg.convert('RGB').save('public/apple-touch-icon.png', format='PNG')
apple_bg.save('public/apple-touch-icon.webp', format='WEBP', quality=95)
print('Saved public/apple-touch-icon.png and .webp')

# 5. favicon.svg with crisp embedded image
buf = io.BytesIO()
square.resize((512, 512), Image.Resampling.LANCZOS).save(buf, format='PNG')
b64_png = base64.b64encode(buf.getvalue()).decode('ascii')
svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,{b64_png}" width="512" height="512" />
</svg>
'''
with open('public/favicon.svg', 'w', encoding='utf-8') as fp:
    fp.write(svg_content)
print('Saved public/favicon.svg')

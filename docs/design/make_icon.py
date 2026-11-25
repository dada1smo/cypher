import sys
from PIL import Image, ImageDraw, ImageFont
font_path, out = sys.argv[1], sys.argv[2]
S, BG, FG = 1024, (0x11, 0x13, 0x17), (0xF5, 0x9E, 0x0B)  # #111317, amber-500
size = round(S * 0.56)
font = ImageFont.truetype(font_path, size)
font.set_variation_by_axes([144, 600, 100, 0])  # opsz, wght, SOFT, WONK
track = -0.04 * size
# draw on a big transparent layer, then center the ink box
layer = Image.new('L', (S * 2, S * 2), 0)
d = ImageDraw.Draw(layer)
x = S // 2
d.text((x, S // 2), 'C', font=font, fill=255)
x += font.getlength('C') + track
d.text((x, S // 2), 'y', font=font, fill=255)
l, t, r, b = layer.getbbox()
ink = layer.crop((l, t, r, b))
img = Image.new('RGB', (S, S), BG)
img.paste(Image.new('RGB', ink.size, FG), ((S - ink.width) // 2, (S - ink.height) // 2), ink)
img.save(out)
assert img.size == (S, S) and img.mode == 'RGB' and img.getpixel((0, 0)) == BG
print('ink box', ink.size)

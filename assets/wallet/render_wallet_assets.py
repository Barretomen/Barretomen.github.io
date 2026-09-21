from pathlib import Path
from PIL import Image, ImageDraw
import cairosvg, math

ROOT = Path(__file__).resolve().parent
SVG = ROOT / "joao_barreto_wallet_logo.svg"
LOGO = ROOT / "joao_barreto_wallet_logo.png"
HERO = ROOT / "joao_barreto_wallet_hero.png"

# Logo 660x660, with safe margin for Google Wallet circular mask.
tmp = ROOT / "_logo_raw.png"
cairosvg.svg2png(url=str(SVG), write_to=str(tmp), output_width=660, output_height=660)
img = Image.open(tmp).convert("RGBA")
bbox = img.getbbox()
cropped = img.crop(bbox) if bbox else img
canvas = Image.new("RGBA", (660, 660), (0, 0, 0, 0))
max_dim = int(660 * 0.72)
ratio = min(max_dim / cropped.width, max_dim / cropped.height)
size = (max(1, int(cropped.width * ratio)), max(1, int(cropped.height * ratio)))
cropped = cropped.resize(size, Image.Resampling.LANCZOS)
canvas.alpha_composite(cropped, ((660-size[0])//2, (660-size[1])//2))
canvas.save(LOGO, optimize=True)
tmp.unlink(missing_ok=True)

# Hero 1032x336, dark navy with subtle brand geometry and logo watermark.
W, H = 1032, 336
hero = Image.new("RGBA", (W, H), (7, 17, 28, 255))
draw = ImageDraw.Draw(hero, "RGBA")
for i in range(18):
    alpha = max(0, 70 - i * 3)
    x0 = int(W * 0.42 + i * 28)
    draw.polygon([(x0,0),(x0+220,0),(x0+40,H),(x0-180,H)], fill=(10,56,90,alpha))

draw.line([(560,-30),(1010,366)], fill=(35,198,227,95), width=4)
draw.line([(720,-30),(330,366)], fill=(35,198,227,45), width=2)
draw.line([(790,-30),(430,366)], fill=(55,110,255,35), width=2)

pts = []
for i in range(120):
    x = i / 119 * (W + 120) - 60
    y = H * 0.72 + math.sin(i / 119 * math.pi * 2.1) * H * 0.16
    pts.append((x, y))
draw.line(pts, fill=(35,198,227,50), width=3)

logo = Image.open(LOGO).convert("RGBA").resize((240,240), Image.Resampling.LANCZOS)
a = logo.getchannel("A").point(lambda p: int(p * 0.42))
logo.putalpha(a)
hero.alpha_composite(logo, (25, 48))
hero.convert("RGB").save(HERO, optimize=True)

print(LOGO)
print(HERO)

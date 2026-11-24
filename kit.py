#!/usr/bin/env python3
"""Ritar appikoner, favicon, og-bild och manifest för Kotten och vågen.

Ingen tredjepart. Ikonen är appens mekanik i tre former: en bom, två skålar och
en nöt som ligger högre på den ena sidan. Få, tjocka former så att den överlever
48 px – ingen text, inga tunna streck.
"""
import json
import pathlib

from PIL import Image, ImageDraw, ImageFont

P = pathlib.Path(__file__).parent / "public"
P.mkdir(exist_ok=True)
ACCENT = (47, 125, 90, 255)      # tallgrön
GULD = (232, 163, 61, 255)
VIT = (255, 255, 255, 255)
PAPPER = (250, 247, 242, 255)
BLACK = (20, 24, 31, 255)


def motiv(d, N, bom, skål, not_):
    """Bom på sned + två skålar. Den tunga sidan hänger lägre och har nötter."""
    cx = N / 2
    # bommen, sned: vänster ände högt, höger ände lågt
    y0, y1 = N * 0.42, N * 0.52
    x0, x1 = N * 0.20, N * 0.80
    w = max(2, N * 0.055)
    d.line([x0, y0, x1, y1], fill=bom, width=int(w))
    # stativ
    d.line([cx, N * 0.47, cx, N * 0.82], fill=bom, width=int(w))
    d.line([cx - N * 0.16, N * 0.84, cx + N * 0.16, N * 0.84], fill=bom, width=int(w * 1.1))
    # skålar (halvcirklar under varje ände)
    for sx, sy in ((x0, y0), (x1, y1)):
        r = N * 0.155
        d.pieslice([sx - r, sy + N * 0.02, sx + r, sy + N * 0.02 + 2 * r], 0, 180, fill=skål)
    # nötter på den tyngre (högra) skålen
    r = N * 0.075
    d.ellipse([x1 - r, y1 + N * 0.10 - r, x1 + r, y1 + N * 0.10 + r], fill=not_)
    d.ellipse([x1 - r * 2.2, y1 + N * 0.10 - r, x1 - r * 0.2, y1 + N * 0.10 + r], fill=not_)


def ikon(N):
    ss = 4
    im = Image.new("RGBA", (N * ss, N * ss), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, N * ss - 1, N * ss - 1], radius=N * ss * 0.23, fill=ACCENT)
    motiv(d, N * ss, VIT, VIT, GULD)
    return im.resize((N, N), Image.LANCZOS)


def favicon():
    N = 512
    im = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, N - 1, N - 1], radius=N * 0.23, fill=ACCENT)
    motiv(d, N, VIT, VIT, GULD)
    im.save(P / "favicon.png")
    (P / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
        '<rect width="100" height="100" rx="23" fill="#2f7d5a"/>'
        '<path d="M20 42 L80 52" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/>'
        '<path d="M50 47 L50 82" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/>'
        '<path d="M34 84 L66 84" stroke="#fff" stroke-width="6" stroke-linecap="round"/>'
        '<path d="M5 44 a15 15 0 0 0 30 0 z" fill="#fff"/>'
        '<path d="M65 54 a15 15 0 0 0 30 0 z" fill="#fff"/>'
        '<circle cx="72" cy="64" r="7.5" fill="#e8a33d"/>'
        '<circle cx="88" cy="64" r="7.5" fill="#e8a33d"/></svg>',
        encoding="utf-8")


def og():
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), PAPPER)
    d = ImageDraw.Draw(im)
    ico = ikon(160)
    im.paste(ico, (int(W / 2 - 80), 60), ico)
    font = small = None
    for path in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                 "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if pathlib.Path(path).exists():
            font = ImageFont.truetype(path, 92)
            small = ImageFont.truetype(path, 38)
            break
    if font:
        for t, y, f, col in (
            ("Kotten och vågen", 260, font, BLACK),
            ("Peka på siffran så att vågen väger jämnt · åk 1–3", 380, small, (74, 82, 96)),
            ("Gratis · ingen inloggning · skolappar.com", 460, small, (120, 126, 136)),
        ):
            d.text((W / 2 - d.textlength(t, font=f) / 2, y), t, fill=col, font=f)
    im.save(P / "og.png")


def main():
    favicon()
    ikon(192).save(P / "icon-192.png")
    ikon(512).save(P / "icon-512.png")
    ikon(512).convert("RGB").resize((512, 512), Image.LANCZOS).save(P / "icon-maskable-512.png")
    ikon(180).save(P / "apple-touch-icon.png")
    og()
    (P / "site.webmanifest").write_text(json.dumps({
        "name": "Kotten och vågen – likhetstecknet och lika mycket",
        "short_name": "Vågen",
        "lang": "sv",
        "start_url": "/",
        "display": "standalone",
        "orientation": "any",
        "background_color": "#faf7f2",
        "theme_color": "#2f7d5a",
        "icons": [
            {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (P / "robots.txt").write_text(
        "User-agent: *\nAllow: /\nSitemap: https://kottenvagen.skolappar.com/sitemap.xml\n", encoding="utf-8")
    (P / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        '<url><loc>https://kottenvagen.skolappar.com/</loc></url>\n</urlset>\n', encoding="utf-8")
    ikon(48).save(P.parent / "render48.png")
    print("skrev ikoner, favicon, og.png, manifest, robots, sitemap till", P)


if __name__ == "__main__":
    main()
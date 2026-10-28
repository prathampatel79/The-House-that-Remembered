import os
from PIL import Image, ImageDraw

def create_game_icon():
    sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    images = []

    for size in sizes:
        w, h = size
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Scale factor
        s = w / 256.0

        # Background circular dark medallion
        draw.ellipse([4 * s, 4 * s, 252 * s, 252 * s], fill=(10, 13, 18, 255), outline=(212, 175, 55, 255), width=max(1, int(6 * s)))

        # Inner decorative gold ring
        draw.ellipse([18 * s, 18 * s, 238 * s, 238 * s], outline=(160, 130, 40, 220), width=max(1, int(2 * s)))

        # Stylized Gothic House Silhouette
        # House base: center at 128, y from 130 to 200
        house_left = 68 * s
        house_right = 188 * s
        house_top = 135 * s
        house_bottom = 205 * s
        draw.rectangle([house_left, house_top, house_right, house_bottom], fill=(22, 28, 38, 255), outline=(212, 175, 55, 200), width=max(1, int(2 * s)))

        # Main Roof (Triangle)
        roof_peak = (128 * s, 75 * s)
        roof_left = (55 * s, 135 * s)
        roof_right = (201 * s, 135 * s)
        draw.polygon([roof_peak, roof_right, roof_left], fill=(30, 38, 52, 255), outline=(212, 175, 55, 255))

        # Attic Spire / Tower
        draw.polygon([(128 * s, 45 * s), (138 * s, 75 * s), (118 * s, 75 * s)], fill=(212, 175, 55, 255))

        # House Chimney
        draw.rectangle([165 * s, 85 * s, 180 * s, 125 * s], fill=(18, 22, 30, 255), outline=(212, 175, 55, 180), width=max(1, int(1 * s)))

        # Glowing Warm Windows (Tungsten yellow glow)
        window_gold = (255, 195, 65, 255)
        # Left window
        draw.rectangle([85 * s, 150 * s, 105 * s, 175 * s], fill=window_gold)
        # Right window
        draw.rectangle([151 * s, 150 * s, 171 * s, 175 * s], fill=window_gold)
        # Center door
        draw.rectangle([116 * s, 165 * s, 140 * s, 205 * s], fill=(45, 25, 15, 255), outline=(212, 175, 55, 200), width=max(1, int(1 * s)))

        # Talisman / Sun emblem symbol above the roof
        sun_center = (128 * s, 60 * s)
        draw.ellipse([122 * s, 54 * s, 134 * s, 66 * s], fill=(255, 220, 100, 255))

        images.append(img)

    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icon.ico")
    images[0].save(out_path, format="ICO", sizes=[(im.width, im.height) for im in images])
    print(f"Created icon at {out_path}")

if __name__ == "__main__":
    create_game_icon()

import os
import subprocess

FOLDER = "salon_photos"
if not os.path.exists(FOLDER):
    os.makedirs(FOLDER)

# Direct high quality reliable image links for Shortcuts Salon assets
ASSETS = [
    {
        "filename": "salon_exterior_reception.jpg",
        "url": "https://images.pexels.com/photos/3993444/pexels-photo-3993444.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
        "filename": "custom_haircut_styling.jpg",
        "url": "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
        "filename": "precision_fade_barber.jpg",
        "url": "https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
        "filename": "luxurious_hair_spa.jpg",
        "url": "https://images.pexels.com/photos/3993447/pexels-photo-3993447.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
        "filename": "head_massage_oil.jpg",
        "url": "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
        "filename": "custom_hair_coloring.jpg",
        "url": "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
        "filename": "beard_trim_shaping.jpg",
        "url": "https://images.pexels.com/photos/2065820/pexels-photo-2065820.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
        "filename": "hair_academy_training.jpg",
        "url": "https://images.pexels.com/photos/3992875/pexels-photo-3992875.jpeg?auto=compress&cs=tinysrgb&w=800"
    }
]

print("🚀 Downloading high-resolution photo assets for Shortcuts Salon...")

for asset in ASSETS:
    filepath = os.path.join(FOLDER, asset["filename"])
    cmd = [
        "curl", "-s", "-L",
        "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        asset["url"],
        "-o", filepath
    ]
    result = subprocess.run(cmd)
    if os.path.exists(filepath) and os.path.getsize(filepath) > 5000:
        size_kb = os.path.getsize(filepath) // 1024
        print(f"  ✅ Secured: {asset['filename']} ({size_kb} KB)")
    else:
        print(f"  ❌ Download failed or empty file: {asset['filename']}")

print("\n🎉 Photo asset download complete!")

import os
import re
import sys
import subprocess
from urllib.parse import urljoin
from html.parser import HTMLParser

try:
    import antigravity
except Exception:
    pass

class ImageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.img_sources = set()

    def handle_starttag(self, tag, attrs):
        if tag == "img":
            attr_dict = dict(attrs)
            for attr in ["src", "data-src", "data-original", "srcset"]:
                if attr in attr_dict and attr_dict[attr]:
                    val = attr_dict[attr]
                    if attr == "srcset":
                        urls = [u.strip().split()[0] for u in val.split(",") if u.strip()]
                        for u in urls:
                            self.img_sources.add(u)
                    else:
                        self.img_sources.add(val)

def fetch_content_curl(url):
    cmd = [
        "curl", "-s", "-L",
        "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, Gecko) Chrome/120.0.0.0 Safari/537.36",
        url
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return res.stdout

def download_business_photos(urls, folder_name="salon_website_photos"):
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
        print(f"✈️ Launched project folder: '{folder_name}'")

    if isinstance(urls, str):
        urls = [urls]

    img_urls = set()

    for url in urls:
        print(f"📥 Gathering high-quality website assets from: {url}")
        html_bytes = fetch_content_curl(url)
        if not html_bytes:
            continue

        html_text = html_bytes.decode("utf-8", errors="ignore")
        parser = ImageParser()
        parser.feed(html_text)

        regex_urls = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp)', html_text, re.IGNORECASE)

        for src in parser.img_sources:
            absolute_url = urljoin(url, src)
            if absolute_url.startswith("http"):
                img_urls.add(absolute_url)

        for rurl in regex_urls:
            img_urls.add(rurl)

    print(f"📦 Discovered {len(img_urls)} potential assets floating in space.")

    count = 0
    for idx, img_url in enumerate(list(img_urls)):
        try:
            clean_url = img_url.split("?")[0]
            ext = os.path.splitext(clean_url)[1]
            if ext.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
                ext = ".jpg"

            filename = os.path.join(folder_name, f"salon_asset_{count + 1}{ext}")

            img_data = fetch_content_curl(img_url)

            # Filter out tiny icon elements (logos/spacers under 15KB) to get high-res content
            if len(img_data) < 15360:
                continue

            with open(filename, "wb") as f:
                f.write(img_data)
            count += 1
            print(f" Saved asset for web layout: {filename} ({len(img_data) // 1024} KB)")

        except Exception as e:
            continue

    print(f"✨ Success! Saved {count} clean photos to the '{folder_name}' directory.")

if __name__ == "__main__":
    target_urls = [
        "https://magicpin.in/Nashik/Railway-Station-Area/Beauty/Shortcuts-Unisex-Salon/store/1b9610c",
        "https://www.justdial.com/Deolali/Shortcut-Unisex-Salon-Near-S-V-K-T-College-Kahan-Nagar-Society/0253PX253-X253-240926153706-C1N9_BZDET/photos"
    ]
    download_business_photos(target_urls)

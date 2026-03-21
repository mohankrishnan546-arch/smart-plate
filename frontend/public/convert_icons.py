from PIL import Image
import os

img_path = "c:/Users/LENOVO/Documents/SMART PLATE/frontend/public/logo_final.jpg"
out_512 = "c:/Users/LENOVO/Documents/SMART PLATE/frontend/public/icon-512.png"
out_192 = "c:/Users/LENOVO/Documents/SMART PLATE/frontend/public/icon-192.png"

with Image.open(img_path) as img:
    # 512x512
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(out_512, "PNG")
    
    # 192x192
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(out_192, "PNG")

print("Created icon-512.png and icon-192.png")

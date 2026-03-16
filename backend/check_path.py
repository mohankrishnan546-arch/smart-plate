import os
frontend_path = os.path.abspath("../frontend/dist")
print(f"Path: {frontend_path}")
print(f"Exists: {os.path.exists(frontend_path)}")
if os.path.exists(frontend_path):
    print(f"Contents: {os.listdir(frontend_path)}")
    assets = os.path.join(frontend_path, "assets")
    if os.path.exists(assets):
        print(f"Assets: {os.listdir(assets)}")

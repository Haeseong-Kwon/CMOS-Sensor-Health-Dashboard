import os
import time
import subprocess
from playwright.sync_api import sync_playwright

def record():
    # Ensure assets directory exists
    os.makedirs('assets', exist_ok=True)
    video_dir = os.path.join(os.getcwd(), 'videos')
    os.makedirs(video_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 1280x720 for good GIF resolution
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720},
            record_video_dir=video_dir,
            record_video_size={'width': 1280, 'height': 720},
            device_scale_factor=1,
            color_scheme='dark'
        )
        page = context.new_page()

        print("Navigating to localhost:3000...")
        page.goto('http://localhost:3000', wait_until='networkidle')
        
        # Wait a bit
        page.wait_for_timeout(2000)

        # Click the 'Upload Sensor Log' button
        print("Clicking Upload Sensor Log...")
        # Button is found by text
        page.get_by_text("Upload Sensor Log").click()

        # Wait for simulation to finish (scanning takes ~6s)
        print("Waiting for scanning to finish...")
        page.wait_for_timeout(8000)

        # Close context to save video
        video_path = page.video.path()
        context.close()
        browser.close()

    print(f"Video saved at {video_path}")
    print("Converting to high-quality GIF...")

    gif_path = 'assets/cmos_health_demo_v4.gif'
    
    # Run ffmpeg to generate palette, then apply it for a high quality gif
    cmd = [
        'ffmpeg', '-y', '-i', video_path, 
        '-vf', 'fps=15,scale=1280:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse', 
        '-loop', '0', gif_path
    ]
    
    subprocess.run(cmd, check=True)
    print(f"GIF successfully created at {gif_path}")

if __name__ == "__main__":
    record()

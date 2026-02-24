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
        
        # Hide Next.js dev overlay
        page.add_style_tag(content="nextjs-portal { display: none !important; }")
        
        page.wait_for_timeout(2000)

        # 1. Click "Upload Sensor Log"
        print("Clicking Upload Sensor Log...")
        page.get_by_text("Upload Sensor Log").click()

        # Wait for scanning simulation to finish (~6s) + show results
        print("Waiting for scanning to finish...")
        page.wait_for_timeout(7000)

        # 2. Click a sensor to open HealthReportModal
        print("Opening Sensor Report Modal...")
        page.get_by_text("Alpha-X1").first.click()
        page.wait_for_timeout(3000)

        # Close the modal
        page.keyboard.press("Escape")
        page.wait_for_timeout(1000)

        # 3. Navigate to Sensor Inventory
        print("Navigating to Sensor Inventory...")
        page.get_by_text("Sensor Inventory").click()
        page.wait_for_timeout(2500)

        # 4. Open Register Device Modal
        print("Opening Register Modal...")
        page.get_by_text("Register New Sensor").click()
        page.wait_for_timeout(2000)

        # Close Register Modal
        page.get_by_text("Cancel").click()
        page.wait_for_timeout(1000)

        # 5. Navigate to Status Monitoring
        print("Navigating to Status Monitoring...")
        page.get_by_text("Status Monitoring").click()
        page.wait_for_timeout(3000)

        # Close context to save video
        video_path = page.video.path()
        context.close()
        browser.close()

    print(f"Video saved at {video_path}")
    print("Converting to high-quality GIF...")

    gif_path = 'assets/cmos_health_demo_hq.gif'
    
    # Run ffmpeg to generate palette, then apply it for a high quality gif at 60fps
    cmd = [
        'ffmpeg', '-y', '-i', video_path, 
        '-vf', 'fps=60,scale=1280:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5', 
        '-loop', '0', gif_path
    ]
    
    subprocess.run(cmd, check=True)
    print(f"GIF successfully created at {gif_path}")

if __name__ == "__main__":
    record()

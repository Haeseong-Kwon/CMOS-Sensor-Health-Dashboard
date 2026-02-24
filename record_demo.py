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
        
        # STEP 1: Wait on the initial empty dashboard to show off the empty state
        print("Waiting on initial empty state...")
        page.wait_for_timeout(3000)

        # STEP 2: Deliberately click "Upload Sensor Log"
        print("Clicking Upload Sensor Log...")
        page.get_by_text("Upload Sensor Log").click()

        # STEP 3: Wait patiently while the loading spinner/progress completes (7.5s)
        print("Waiting for 'Analyzing...' to finish...")
        page.wait_for_timeout(7500)
        
        # STEP 4: Let the data animate in smoothly
        print("Data loaded, letting animations finish...")
        page.wait_for_timeout(3000)

        # STEP 5: Move mouse over charts to trigger tooltips
        print("Hovering over Thermal Integrity Predictive Chart...")
        page.mouse.move(800, 600) # approximate over predictive chart
        page.wait_for_timeout(1000)
        page.mouse.move(700, 600)
        page.wait_for_timeout(1000)
        
        print("Hovering over Realtime Chart...")
        page.mouse.move(400, 400) # approximate over realtime chart
        page.wait_for_timeout(1000)
        page.mouse.move(500, 400)
        page.wait_for_timeout(2000)

        # STEP 6: Open Sensor Report Modal
        print("Opening Sensor Report Modal...")
        page.get_by_text("Alpha-X1").first.click()
        page.wait_for_timeout(4000)

        # Close the modal
        page.keyboard.press("Escape")
        page.wait_for_timeout(2000)

        # STEP 7: Check other pages briefly (Inventory & Monitoring)
        print("Navigating to Sensor Inventory...")
        page.get_by_text("Sensor Inventory").click()
        page.wait_for_timeout(3000)

        # Close context to save video
        video_path = page.video.path()
        context.close()
        browser.close()

    print(f"Video saved at {video_path}")
    print("Converting to high-quality GIF...")

    gif_path = 'assets/sensor_dashboard_full_workflow.gif'
    
    # Run ffmpeg to generate palette, then apply it for a high quality gif at 30fps and 1024w to fix Github freeze
    cmd = [
        'ffmpeg', '-y', '-i', video_path, 
        '-vf', 'fps=30,scale=1024:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5', 
        '-loop', '0', gif_path
    ]
    
    subprocess.run(cmd, check=True)
    print(f"GIF successfully created at {gif_path}")

if __name__ == "__main__":
    record()

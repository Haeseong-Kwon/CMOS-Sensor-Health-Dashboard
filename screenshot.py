from playwright.sync_api import sync_playwright

def take_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto('http://localhost:3000')
        # Wait a bit
        page.wait_for_timeout(3000)
        page.screenshot(path='/Users/haeseong/Desktop/Developing/cmos-sensor/screenshot.png')
        browser.close()

if __name__ == "__main__":
    take_screenshot()

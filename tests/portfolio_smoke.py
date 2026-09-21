from pathlib import Path
from playwright.sync_api import sync_playwright


BASE = "http://127.0.0.1:4173/hub"
OUTPUT = Path(".artifacts")
OUTPUT.mkdir(exist_ok=True)


def assert_clean_page(page, path, title_fragment):
    errors = []
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    response = page.goto(f"{BASE}{path}", wait_until="networkidle")
    assert response and response.ok, f"Failed to load {path}"
    assert title_fragment in page.title()
    assert page.locator("nav[aria-label='Navegação principal']").is_visible()
    assert not errors, f"Console errors on {path}: {errors}"


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    desktop = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    assert_clean_page(desktop, "/", "João Barreto")
    assert desktop.locator("#featured-projects .case-card").count() == 3
    desktop.screenshot(path=OUTPUT / "home-desktop.png", full_page=True)

    assert_clean_page(desktop, "/projects/", "Projetos")
    assert desktop.locator("#projects-archive .case-card").count() == 9
    desktop.get_by_role("button", name="Desktop").click()
    assert desktop.locator("#projects-archive .case-card:visible").count() == 2
    desktop.screenshot(path=OUTPUT / "projects-desktop.png", full_page=True)

    for path, title in [("/about/", "Sobre"), ("/now/", "Agora"), ("/contact/", "Contacto")]:
        assert_clean_page(desktop, path, title)

    mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    assert_clean_page(mobile, "/", "João Barreto")
    assert mobile.locator(".site-nav").is_visible()
    mobile.screenshot(path=OUTPUT / "home-mobile.png", full_page=True)
    assert_clean_page(mobile, "/projects/", "Projetos")
    assert mobile.locator("#projects-archive .case-card").count() == 9
    mobile.screenshot(path=OUTPUT / "projects-mobile.png", full_page=True)
    browser.close()

print("portfolio smoke test passed")

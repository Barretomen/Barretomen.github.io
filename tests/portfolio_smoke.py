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
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
    assert not errors, f"Console errors on {path}: {errors}"


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    desktop = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    assert_clean_page(desktop, "/", "João Barreto")
    assert desktop.locator("#featured-projects .project-panel").count() == 3
    desktop.screenshot(path=OUTPUT / "home-desktop.png", full_page=True)

    assert_clean_page(desktop, "/projects/", "Projetos")
    assert desktop.locator("#projects-archive .case-card").count() == 9
    desktop.locator(".filter-bar").scroll_into_view_if_needed()
    desktop.get_by_role("button", name="Desktop").click()
    assert desktop.locator("#projects-archive .case-card:visible").count() == 2
    desktop.screenshot(path=OUTPUT / "projects-desktop.png", full_page=True)

    for path, title, image in [
        ("/about/", "Sobre", "about-desktop.png"),
        ("/now/", "Agora", "now-desktop.png"),
        ("/contact/", "Contacto", "contact-desktop.png"),
    ]:
        assert_clean_page(desktop, path, title)
        assert desktop.locator("body.inner-page").count() == 1
        desktop.locator(".content-section").first.scroll_into_view_if_needed()
        desktop.wait_for_timeout(950)
        assert desktop.locator(".content-section").first.is_visible()
        desktop.screenshot(path=OUTPUT / image, full_page=True)

    mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    assert_clean_page(mobile, "/", "João Barreto")
    assert mobile.locator(".site-nav").is_visible()
    mobile.screenshot(path=OUTPUT / "home-mobile.png", full_page=True)
    assert_clean_page(mobile, "/projects/", "Projetos")
    assert mobile.locator("#projects-archive .case-card").count() == 9
    mobile.screenshot(path=OUTPUT / "projects-mobile.png", full_page=True)
    assert_clean_page(mobile, "/contact/", "Contacto")
    mobile.locator(".content-section").first.scroll_into_view_if_needed()
    mobile.wait_for_timeout(950)
    assert mobile.locator(".contact-grid").is_visible()
    mobile.screenshot(path=OUTPUT / "contact-mobile.png", full_page=True)

    reduced = browser.new_page(
        viewport={"width": 1440, "height": 1000},
        reduced_motion="reduce",
    )
    assert_clean_page(reduced, "/about/", "Sobre")
    assert reduced.locator(".profile-layout").is_visible()
    assert reduced.evaluate("document.querySelectorAll('.pin-spacer').length") == 0
    assert reduced.evaluate("window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 0") == 0

    no_js_context = browser.new_context(java_script_enabled=False)
    no_js = no_js_context.new_page()
    assert_clean_page(no_js, "/projects/", "Projetos")
    assert no_js.locator("#projects-archive .case-card").count() == 9
    assert_clean_page(no_js, "/about/", "Sobre")
    assert no_js.locator(".profile-layout").is_visible()
    no_js_context.close()
    browser.close()

print("portfolio smoke test passed")

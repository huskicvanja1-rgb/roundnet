/**
 * QA Smoke Tests — Roundnet Directory Europe
 *
 * Run:  npx playwright test scripts/qa-smoke.spec.ts
 * Requires: npm i -D @playwright/test
 *
 * These tests verify critical SEO and functional requirements
 * against a running instance (local dev or deployed URL).
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ─── Route availability ─────────────────────────────────────────────

test.describe('Route availability', () => {
  const routes = [
    { path: '/en', label: 'Homepage (EN)' },
    { path: '/de', label: 'Homepage (DE)' },
    { path: '/en/clubs', label: 'Clubs listing' },
    { path: '/en/clubs/germany', label: 'Country page (Germany)' },
    { path: '/en/clubs/germany/berlin', label: 'City page (Berlin)' },
    { path: '/robots.txt', label: 'robots.txt' },
    { path: '/sitemap.xml', label: 'sitemap.xml' },
  ];

  for (const { path, label } of routes) {
    test(`${label} → 200`, async ({ request }) => {
      const res = await request.get(`${BASE_URL}${path}`);
      expect(res.status()).toBe(200);
    });
  }

  test('Root / redirects to /en', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/`, { maxRedirects: 0 });
    expect([301, 302, 307, 308]).toContain(res.status());
    expect(res.headers()['location']).toContain('/en');
  });
});

// ─── SEO: Canonical & hreflang ──────────────────────────────────────

test.describe('SEO: Canonical & hreflang', () => {
  test('Country page has canonical URL', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/clubs/germany`);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
    expect(canonical).toContain('/en/clubs/germany');
  });

  test('Country page has hreflang alternates for all locales', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/clubs/germany`);
    const hreflangs = await page.locator('link[rel="alternate"][hreflang]').all();
    const langs = await Promise.all(hreflangs.map((el) => el.getAttribute('hreflang')));
    // Expect en, de, fr, es, it + x-default
    for (const lang of ['en', 'de', 'fr', 'es', 'it', 'x-default']) {
      expect(langs).toContain(lang);
    }
  });

  test('Self-referencing hreflang exists', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/clubs/germany`);
    const selfHreflang = await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute('href');
    expect(selfHreflang).toContain('/en/clubs/germany');
  });
});

// ─── SEO: Structured data (JSON-LD) ────────────────────────────────

test.describe('SEO: Structured data', () => {
  test('City page has FAQPage JSON-LD', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/clubs/germany/berlin`);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const hasFaq = scripts.some((s) => s.includes('"FAQPage"'));
    expect(hasFaq).toBe(true);
  });

  test('City page has ItemList JSON-LD', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/clubs/germany/berlin`);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const hasItemList = scripts.some((s) => s.includes('"ItemList"'));
    expect(hasItemList).toBe(true);
  });

  test('City page has BreadcrumbList JSON-LD', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/clubs/germany/berlin`);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const hasBreadcrumb = scripts.some((s) => s.includes('"BreadcrumbList"'));
    expect(hasBreadcrumb).toBe(true);
  });

  test('Club page has SportsActivityLocation JSON-LD', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/club/berlin-roundnet-verein`);
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const hasSports = scripts.some((s) => s.includes('"SportsActivityLocation"'));
    expect(hasSports).toBe(true);
  });
});

// ─── SEO: Sitemap ───────────────────────────────────────────────────

test.describe('SEO: Sitemap', () => {
  test('Sitemap contains locale URLs', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/sitemap.xml`);
    const body = await res.text();
    expect(body).toContain('/en/clubs');
    expect(body).toContain('/de/clubs');
    expect(body).toContain('/fr/clubs');
  });

  test('Sitemap does not contain /admin paths', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/sitemap.xml`);
    const body = await res.text();
    expect(body).not.toContain('/admin');
  });
});

// ─── SEO: robots.txt ────────────────────────────────────────────────

test.describe('SEO: robots.txt', () => {
  test('robots.txt disallows /admin/ and /api/', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/robots.txt`);
    const body = await res.text();
    expect(body).toContain('/admin/');
    expect(body).toContain('/api/');
  });

  test('robots.txt references sitemap', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/robots.txt`);
    const body = await res.text();
    expect(body.toLowerCase()).toContain('sitemap');
  });
});

// ─── SEO: Meta tags ─────────────────────────────────────────────────

test.describe('SEO: Meta tags', () => {
  test('Homepage has title and description', async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc!.length).toBeGreaterThan(30);
  });

  test('Homepage has Open Graph tags', async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
    expect(ogDesc).toBeTruthy();
    expect(ogUrl).toContain('/en');
  });

  test('html lang attribute matches locale', async ({ page }) => {
    await page.goto(`${BASE_URL}/de`);
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('de');
  });
});

// ─── i18n: Language switching ───────────────────────────────────────

test.describe('i18n: Language switching', () => {
  test('Language switcher is visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);
    const switcher = page.locator('button', { hasText: /English|🇬🇧/ });
    await expect(switcher).toBeVisible();
  });
});

// ─── Functional: Navigation ─────────────────────────────────────────

test.describe('Functional: Navigation', () => {
  test('Country card links to country page', async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);
    const countryLink = page.locator('a[href*="/en/clubs/"]').first();
    if (await countryLink.isVisible()) {
      const href = await countryLink.getAttribute('href');
      expect(href).toMatch(/^\/en\/clubs\//);
    }
  });

  test('Breadcrumbs present on city page', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/clubs/germany/berlin`);
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
  });
});

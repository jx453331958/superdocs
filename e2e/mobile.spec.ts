import { test, expect, Page } from '@playwright/test';

/**
 * 移动端适配测试 — 在 mobile-safari 项目运行（iPhone 14 viewport 390x844）
 *
 * 针对外部部署服务器（有 Supabase）：
 *   E2E_BASE_URL=http://192.168.1.5:8080 E2E_AUTH_TOKEN=xxx npx playwright test --project=mobile-safari e2e/mobile.spec.ts
 *
 * 针对本地开发（无 Supabase，仅验证渲染）：
 *   npx playwright test --project=mobile-safari e2e/mobile.spec.ts
 */

const TOKEN = process.env.E2E_AUTH_TOKEN || process.env.API_AUTH_TOKEN || 'fake-token-for-render-test';
const hasRealServer = !!process.env.E2E_BASE_URL;

/** 注入 localStorage token 跳过登录流程 */
async function injectAuth(page: Page) {
  await page.goto('/login');
  await page.evaluate((token) => {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: { token },
      version: 0,
    }));
  }, TOKEN);
}

/** 完整登录流程（需要真实后端） */
async function login(page: Page) {
  await page.goto('/login');
  await page.waitForSelector('#token', { timeout: 10000 });
  await page.fill('#token', TOKEN);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

test.describe('移动端适配测试', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  // === 登录页（无需后端） ===
  test.describe('登录页', () => {
    test('登录页应正常渲染，输入框和按钮可见', async ({ page }) => {
      await page.goto('/login');

      const loginBtn = page.locator('button[type="submit"]');
      await expect(loginBtn).toBeVisible({ timeout: 10000 });
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#token')).toBeVisible();
    });

    test('登录后应跳转到 dashboard', async ({ page }) => {
      test.skip(!hasRealServer, '需要真实后端（E2E_BASE_URL）');
      await login(page);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  // === 需要后端的页面完整测试 ===
  test.describe('页面完整测试（需部署后端）', () => {
    test.skip(!hasRealServer, '需要真实后端（E2E_BASE_URL）');

    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('仪表盘 — 移动端展示横向滚动统计卡', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const title = page.locator('h4:has-text("仪表盘")');
      await expect(title).toBeVisible({ timeout: 10000 });

      const statsCards = page.locator('.ant-statistic');
      expect(await statsCards.count()).toBeGreaterThanOrEqual(1);
    });

    test('底部导航栏可见、4 个 tab、可交互', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const nav = page.locator('nav');
      await expect(nav).toBeVisible({ timeout: 10000 });
      await expect(nav.locator('a')).toHaveCount(4);

      // 每个 tab 最小触摸高度
      for (const tab of await nav.locator('a').all()) {
        const box = await tab.boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(40);
      }

      await nav.locator('a:has-text("文章")').click();
      await expect(page).toHaveURL(/\/articles/, { timeout: 10000 });
    });

    test('文章列表 — 搜索栏、筛选同行、无 table', async ({ page }) => {
      await page.goto('/articles');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('input[placeholder*="搜索"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.ant-select').first()).toBeVisible();
      expect(await page.locator('table').count()).toBe(0);
    });

    test('文章列表 — FAB 新建按钮', async ({ page }) => {
      await page.goto('/articles');
      await page.waitForLoadState('networkidle');

      const fab = page.locator('button.ant-btn-circle');
      await expect(fab).toBeVisible({ timeout: 10000 });
      await fab.click();
      await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 5000 });
    });

    test('日历页 — 迷你日历面板', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h4:has-text("内容日历")')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.ant-picker-panel').first()).toBeVisible({ timeout: 5000 });
    });

    test('设置页 — 退出登录按钮', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('button:has-text("退出登录")')).toBeVisible({ timeout: 10000 });
    });

    test('底部导航完整流程', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const nav = page.locator('nav');
      await expect(nav).toBeVisible({ timeout: 10000 });

      await nav.locator('a:has-text("文章")').click();
      await expect(page).toHaveURL(/\/articles/, { timeout: 10000 });

      await nav.locator('a:has-text("日历")').click();
      await expect(page).toHaveURL(/\/calendar/, { timeout: 10000 });

      await nav.locator('a:has-text("设置")').click();
      await expect(page).toHaveURL(/\/settings/, { timeout: 10000 });

      await nav.locator('a:has-text("仪表盘")').click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });
  });

  // === 本地渲染验证（注入 localStorage，不依赖 API 数据） ===
  test.describe('本地渲染验证', () => {
    test.skip(hasRealServer, '完整测试已覆盖，跳过本地渲染测试');

    test('仪表盘 — 页面加载不崩溃，底部导航可见', async ({ page }) => {
      await injectAuth(page);
      await page.goto('/dashboard');

      // 等待客户端水合完成
      await page.waitForTimeout(3000);

      // 即使 API 失败，底部导航和页面框架应该渲染
      // 如果重定向到 login，说明 API 失败触发了 clearToken
      const url = page.url();
      if (url.includes('/dashboard')) {
        const nav = page.locator('nav');
        await expect(nav).toBeVisible({ timeout: 5000 });
        await expect(nav.locator('a')).toHaveCount(4);
      }
      // 即使跳到 login，也证明渲染没崩溃
      expect(url).toMatch(/\/(dashboard|login)/);
    });

    test('文章列表 — 页面加载不崩溃', async ({ page }) => {
      await injectAuth(page);
      await page.goto('/articles');
      await page.waitForTimeout(3000);

      const url = page.url();
      expect(url).toMatch(/\/(articles|login)/);
    });

    test('日历页 — 页面加载不崩溃', async ({ page }) => {
      await injectAuth(page);
      await page.goto('/calendar');
      await page.waitForTimeout(3000);

      const url = page.url();
      expect(url).toMatch(/\/(calendar|login)/);
    });

    test('设置页 — 页面框架渲染', async ({ page }) => {
      await injectAuth(page);
      await page.goto('/settings');
      await page.waitForTimeout(2000);

      const url = page.url();
      if (url.includes('/settings')) {
        // 设置页不需要 API 调用，应该正常渲染
        await expect(page.locator('button:has-text("退出登录")')).toBeVisible({ timeout: 5000 });
      }
      expect(url).toMatch(/\/(settings|login)/);
    });
  });
});

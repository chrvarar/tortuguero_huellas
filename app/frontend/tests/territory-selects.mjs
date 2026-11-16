import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.VITALINK_PLAYWRIGHT_PATH);
const rows = JSON.parse(await readFile('app/backend/app/Database/Seeds/territory-2026.json', 'utf8'));
const provinces = [...new Map(rows.map((row) => [row.province_code, { id: row.province_code, name: row.province }])).values()];
const cantons = [...new Map(rows.map((row) => [row.canton_code, { id: row.canton_code, province_id: row.province_code, name: row.canton }])).values()];
const districts = rows.map((row) => ({ id: row.code, official_code: row.code, canton_id: row.canton_code, name: row.name,
  province: row.province, canton: row.canton }));
const browser = await chromium.launch({ executablePath: process.env.VITALINK_CHROME_PATH, headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path === '/api/distritos' ? { provinces, cantons, districts }
      : path === '/api/adopciones' ? { profiles: [] }
        : path === '/api/sesion' ? { user: null, csrf: 'test' } : null;
    if (!data) throw new Error(`API inesperada: ${path}`);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  });
  await page.goto('http://127.0.0.1:15173/');
  await page.locator('.vl-primary-actions').getByRole('button', { name: 'Mi compañero animal se extravió' }).click();
  const dialog = page.getByRole('dialog');
  const province = dialog.locator('select[name="province_id"]');
  const canton = dialog.locator('select[name="canton_id"]');
  const district = dialog.locator('select[name="district_id"]');
  await page.waitForFunction(() => document.querySelector('select[name="province_id"]')?.options.length === 8);
  assert.equal(await dialog.getByLabel('Provincia', { exact: true }).count(), 1);
  assert.equal(await province.locator('option').count(), 8);
  assert.equal(await canton.isDisabled(), true);
  await province.selectOption('1');
  assert.equal(await canton.locator('option').count(), 21);
  await canton.selectOption('101');
  assert.equal(await district.locator('option').count(), 12);
  await district.selectOption('10101');
  await province.selectOption('7');
  assert.equal(await canton.inputValue(), '');
  assert.equal(await district.inputValue(), '');
  assert.equal(await canton.locator('option').count(), 7);
  await canton.selectOption('706');
  assert.equal(await district.locator('option').count(), 6);
  assert.equal(await district.locator('option', { hasText: 'Duacarí' }).count(), 1);
  console.log('Selectores de provincia, cantón y distrito verificados en el modal de extravío.');
} finally {
  await browser.close();
}

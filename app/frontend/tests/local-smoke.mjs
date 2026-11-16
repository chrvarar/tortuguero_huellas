import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

const require = createRequire(import.meta.url);
const playwrightPath = process.env.VITALINK_PLAYWRIGHT_PATH;
if (!playwrightPath) throw new Error('Definí VITALINK_PLAYWRIGHT_PATH con la ruta local del módulo Playwright.');
const { chromium } = require(playwrightPath);
const browser = await chromium.launch({ executablePath: process.env.VITALINK_CHROME_PATH, headless: true });
const origin = process.env.VITALINK_ORIGIN || 'http://127.0.0.1:5173';

try {
  for (const viewport of [{ width: 1366, height: 768 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'VitalLink', level: 1 }).waitFor();
    for (const id of ['guia', 'adopcion', 'comunidad', 'organizaciones']) {
      assert.equal(await page.locator(`#${id}`).count(), 1, `Falta sección ${id}`);
    }
    await page.waitForFunction(() => document.querySelector('.vl-hero video')?.currentTime > 0, { timeout: 12000 });
    assert.equal(await page.locator('.vl-video-control').count(), 0, 'El control de reproducción no debe mostrarse');
    assert.equal(await page.locator('.vl-guide-card > img').count(), 2, 'Las dos tarjetas necesitan imagen');
    assert.equal(await page.locator('.vl-guide-card > img').first().evaluate((img) => getComputedStyle(img).objectFit), 'contain');
    await page.getByRole('button', { name: 'Encontré un animal' }).click();
    await page.getByRole('dialog').getByRole('heading', { name: 'Encontré un animal' }).waitFor();
    assert.equal(new URL(page.url()).pathname, '/', 'El modal de hallazgo debe permanecer en la portada');
    await page.getByRole('button', { name: 'Cerrar ventana' }).click();
    await page.getByRole('button', { name: 'Reportar extravío' }).first().click();
    await page.getByRole('dialog').getByRole('heading', { name: 'Reportar extravío' }).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Registrar a mi compañero animal' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Crear cuenta y entrar' }).waitFor();
    await page.getByRole('button', { name: 'Cerrar ventana' }).click();
    await page.locator('#guia').getByRole('button', { name: 'Reportar un hallazgo sin QR' }).click();
    await page.getByRole('dialog').getByRole('heading', { name: 'Encontré un animal' }).waitFor();
    await page.getByRole('button', { name: 'Cerrar ventana' }).click();
    try {
      await page.locator('#adopcion').getByRole('button', { name: 'Quiero adoptar' }).first().click({ timeout: 10000 });
    } catch (failure) {
      throw new Error(`Adopción no disponible: ${await page.locator('#adopcion').innerText()} | JS: ${errors.join('; ')} | ${failure.message}`);
    }
    await page.getByRole('dialog').getByRole('heading', { name: 'Quiero adoptar' }).waitFor();
    assert.equal(new URL(page.url()).pathname, '/', 'La solicitud de adopción debe permanecer en la portada');
    await page.getByRole('button', { name: 'Cerrar ventana' }).click();
    await page.getByRole('group', { name: 'Idioma' }).getByRole('button', { name: /English/ }).click();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('dialog').getByRole('heading', { name: 'Sign in' }).waitFor();
    await page.getByRole('heading', { name: 'Sign in' }).waitFor();
    await page.getByLabel('Username').fill('administrador');
    await page.getByLabel('Password').fill('administrador');
    await page.getByRole('dialog').getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('heading', { name: 'Current census' }).waitFor();
    if (viewport.width < 705) await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('link', { name: 'Users', exact: true }).waitFor();
    if (viewport.width < 705) await page.getByRole('button', { name: 'Menu' }).click();
    await page.locator('#expedientes').getByRole('button', { name: /Toby/ }).click();
    const qr = page.getByRole('img', { name: 'QR code for Toby' });
    await qr.waitFor();
    const image = await qr.getAttribute('src');
    assert.match(image, /^data:image\/png;base64,/);
    const png = PNG.sync.read(Buffer.from(image.split(',')[1], 'base64'));
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data;
    const publicUrl = await page.getByRole('link', { name: 'Open public profile' }).getAttribute('href');
    assert.equal(decoded, publicUrl, 'El QR de Toby debe contener su ficha pública completa');
    const anonymous = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const publicPage = await anonymous.newPage();
    await publicPage.goto(decoded, { waitUntil: 'networkidle' });
    await publicPage.getByRole('heading', { name: 'Toby' }).waitFor();
    assert.equal(await publicPage.getByText('Owner’s private email address').count(), 0, 'La ficha pública expone datos privados');
    await anonymous.close();
    await page.getByRole('button', { name: 'Dark' }).click();
    assert.equal(await page.locator('.vl-dark').count(), 1, 'Tema oscuro no aplicado');
    assert.equal(errors.length, 0, `Errores JavaScript: ${errors.join('; ')}`);

    await page.goto(`${origin}/hallazgo`, { waitUntil: 'networkidle' });
    await page.getByRole('combobox', { name: 'Language' }).selectOption('de');
    await page.getByRole('heading', { name: 'Ich habe ein Tier gefunden' }).waitFor();
    await page.getByText('Genaue Adresse').waitFor();
    await page.goto(`${origin}/extravio`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Vermisstes Tier melden' }).waitFor();
    await page.getByLabel('E-Mail-Adresse').waitFor();
    await page.goto(`${origin}/adopciones`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Tiere zur Adoption' }).waitFor();
    await page.getByRole('link', { name: 'Ich möchte adoptieren' }).first().click();
    await page.getByLabel('E-Mail-Adresse').waitFor();
    assert.equal(errors.length, 0, `Errores JavaScript: ${errors.join('; ')}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    assert.equal(overflow, false, `Desbordamiento horizontal con ${viewport.width}px`);

    await context.close();
    process.stdout.write(`Interfaz verificada a ${viewport.width}px: portada, idioma, acceso, censo, QR público, tema, avisos y adopción.\n`);
  }
} finally {
  await browser.close();
}

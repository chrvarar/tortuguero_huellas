import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.VITALINK_PLAYWRIGHT_PATH);
const browser = await chromium.launch({ executablePath: process.env.VITALINK_CHROME_PATH, headless: true });
const origin = process.env.VITALINK_ORIGIN || 'http://127.0.0.1:5173';
const district = { id: 1, official_code: 10101, province: 'San José', canton: 'San José', canton_id: 101, name: 'Carmen' };
const profile = { code: 'a'.repeat(32), name: 'Mora', species: 'perro', age_label: '2 años', shelter_name: 'Albergue de muestra',
  province: 'San José', canton: 'San José', district: 'Carmen', story: 'Historia de demostración.', is_demo: 1 };
const demoAnimals = [
  ['Zorro', 'perro', 'Carmen', 'dog2.jpeg'], ['Lucas', 'perro', 'Zapote', 'dog5.jpeg'],
  ['Oso', 'perro', 'Catedral', 'dog3.jpeg'], ['Pirata', 'perro', 'Carmen', 'dog6.jpeg'],
  ['Miel', 'perro', 'Zapote', 'dog7.jpeg'], ['Bruno', 'perro', 'Catedral', 'dog4.jpeg'],
  ['Barón', 'perro', 'Carmen', 'dog8.jpeg'], ['Pecas', 'perro', 'Zapote', 'dog9.jpeg'],
  ['Roco', 'perro', 'Catedral', 'dog10.jpeg'],
];
const profiles = [profile, ...demoAnimals.map(([name, species, districtName], index) => ({
  ...profile, code: String.fromCharCode(98 + index).repeat(32), name, species, district: districtName,
  photo: `/api/adopciones/${String.fromCharCode(98 + index).repeat(32)}/foto`,
}))];
const photos = new Map(profiles.slice(1).map((item, index) => [item.code, demoAnimals[index][3]]));

try {
  for (const viewport of [{ width: 1366, height: 768 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const errors = [];
    let account = null;
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('**/api/**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      const method = route.request().method();
      let status = 200;
      let body = {};
      if (path === '/api/adopciones' && method === 'GET') body = { profiles };
      else if (/^\/api\/adopciones\/[a-z0-9]{32}\/foto$/.test(path) && method === 'GET') {
        const file = photos.get(path.split('/')[3]);
        if (!file) throw new Error(`Foto no esperada: ${path}`);
        await route.fulfill({ status: 200, contentType: 'image/jpeg',
          body: await readFile(`app/backend/app/Database/Seeds/demo-animals/${file}`) });
        return;
      }
      else if (path === '/api/distritos' && method === 'GET') body = {
        provinces: [{ id: 1, name: 'San José' }], cantons: [{ id: 101, province_id: 1, name: 'San José' }], districts: [district],
      };
      else if (path === '/api/sesion' && method === 'GET') body = { user: account, csrf: 'prueba' };
      else if (path === '/api/registro' && method === 'POST') {
        account = { id: 7, username: 'persona_demo', role: 'general', display_name: 'Persona Demo', avatar: null };
        body = { user: account, csrf: 'prueba' };
        status = 201;
      } else if (path === '/api/animales' && method === 'GET') body = { animals: [] };
      else if (path.startsWith('/api/avisos/') && method === 'POST') { body = { message: 'Aviso registrado' }; status = 201; }
      else if (path.endsWith('/solicitudes') && method === 'POST') { body = { message: 'Solicitud registrada' }; status = 201; }
      else throw new Error(`Solicitud API inesperada: ${method} ${path}`);
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    });

    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'VitaLink', level: 1 }).waitFor();
    assert.equal(await page.locator('.vl-hero video').count(), 0);
    await page.locator('.vl-hero img.vl-hero-media').waitFor();
    assert.equal(await page.locator('.vl-video-control').count(), 0);
    assert.equal(await page.locator('.vl-paws').count(), 1);
    assert.equal(await page.locator('.vl-paws i').count(), 4);
    assert.equal(await page.locator('.vl-paws').evaluate((layer) => getComputedStyle(layer).position), 'absolute');
    await page.waitForFunction(() => [...document.querySelectorAll('.vl-paws i')].every((paw) => paw.style.left));
    assert.deepEqual(await page.locator('.vl-paws i').evaluateAll((paws) => paws.map((paw) => getComputedStyle(paw).animationDuration)),
      ['3.4s', '4.6s', '5.2s', '4s']);
    const initialPaws = await page.locator('.vl-paws i').evaluateAll((paws) => paws.map((paw) => {
      const rect = paw.getBoundingClientRect();
      return { x: rect.left, y: rect.top, width: rect.width };
    }));
    for (let i = 0; i < initialPaws.length; i += 1) for (let j = i + 1; j < initialPaws.length; j += 1) {
      assert.ok(Math.hypot(initialPaws[i].x - initialPaws[j].x, initialPaws[i].y - initialPaws[j].y) > initialPaws[i].width * 1.5,
        `Las huellas ${i + 1} y ${j + 1} no deben colisionar`);
    }
    const firstPosition = await page.locator('.vl-paws i').first().getAttribute('style');
    await page.waitForFunction((before) => document.querySelector('.vl-paws i').getAttribute('style') !== before,
      firstPosition, { timeout: 3600 });
    const movedPaws = await page.locator('.vl-paws i').evaluateAll((paws) => paws.map((paw) => {
      const rect = paw.getBoundingClientRect();
      return { x: rect.left, y: rect.top, width: rect.width };
    }));
    for (let i = 0; i < movedPaws.length; i += 1) for (let j = i + 1; j < movedPaws.length; j += 1) {
      assert.ok(Math.hypot(movedPaws[i].x - movedPaws[j].x, movedPaws[i].y - movedPaws[j].y) > movedPaws[i].width * 1.5,
        `Las huellas ${i + 1} y ${j + 1} no deben colisionar tras reubicarse`);
    }
    const scrollPositions = await page.evaluate(() => {
      const paw = document.querySelector('.vl-paws i');
      const before = paw.getBoundingClientRect().top;
      window.scrollTo(0, 250);
      const after = paw.getBoundingClientRect().top;
      window.scrollTo(0, 0);
      return [before, after];
    });
    assert.ok(Math.abs(scrollPositions[0] - scrollPositions[1] - 250) < 2, 'La huellita debe moverse junto con la página');
    assert.equal(await page.locator('.vl-header nav').count(), 0);
    assert.equal(await page.locator('.vl-primary-actions button').count(), 3);
    assert.equal(await page.locator('.vl-guide-card > img').count(), 2);
    assert.equal(await page.locator('#adopcion .vl-adopt-card:not([aria-hidden="true"])').count(), 10);
    assert.equal(await page.locator('#adopcion .vl-adopt-card:not([aria-hidden="true"]) img').count(), 10);
    await page.locator('#adopcion .vl-adopt-card').last().scrollIntoViewIfNeeded();
    await page.locator('#adopcion .vl-adopt-card img').last().evaluate((photo) => photo.decode());
    assert.equal(await page.locator('.vl-guide-card > img').first().evaluate((img) => getComputedStyle(img).objectFit), 'contain');
    const language = page.getByRole('combobox', { name: 'Idioma' });
    await language.click();
    assert.deepEqual(await page.getByRole('listbox', { name: 'Idioma' }).getByRole('option').allTextContents(),
      ['Español', 'English', 'Deutsch']);
    assert.equal(await page.getByRole('listbox', { name: 'Idioma' }).locator('img').count(), 3);
    await page.getByRole('option', { name: 'English' }).click();
    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'Deutsch' }).click();
    await page.getByRole('combobox', { name: 'Sprache' }).click();
    await page.getByRole('option', { name: 'Español' }).click();

    await page.locator('.vl-primary-actions').getByRole('button', { name: 'Encontré a un compañero animal' }).click();
    await page.getByRole('dialog').getByRole('heading', { name: 'Encontré un animal' }).waitFor();
    assert.equal(new URL(page.url()).pathname, '/');
    await page.getByRole('dialog').getByLabel('Dirección exacta').fill('Parque de prueba');
    await page.getByRole('dialog').getByLabel('Cuéntenos qué observó').fill('Un animal de muestra');
    await page.getByRole('dialog').locator('select[name="province_id"]').selectOption('1');
    await page.getByRole('dialog').locator('select[name="canton_id"]').selectOption('101');
    await page.getByRole('dialog').locator('select[name="district_id"]').selectOption('1');
    await page.getByRole('dialog').getByRole('button', { name: 'Enviar aviso' }).click();
    await page.getByRole('dialog').getByText('Su aviso quedó registrado.').waitFor();
    await page.getByRole('button', { name: 'Aceptar' }).click();
    assert.equal(new URL(page.url()).pathname, '/');

    await page.locator('#guia').getByRole('button', { name: 'Reportar extravío' }).click();
    await page.getByRole('dialog').getByRole('heading', { name: 'Reportar extravío' }).waitFor();
    await page.keyboard.press('Escape');
    await page.locator('#comunidad').getByRole('button', { name: 'Reportar un hallazgo sin QR' }).click();
    await page.getByRole('dialog').getByRole('heading', { name: 'Encontré un animal' }).waitFor();
    await page.getByRole('button', { name: 'Cerrar ventana' }).click();

    await page.locator('#adopcion').getByRole('button', { name: 'Quiero adoptar' }).first().click();
    await page.getByRole('dialog').getByLabel('Nombre').fill('Persona de prueba');
    await page.getByRole('dialog').getByLabel('Correo electrónico').fill('persona@example.test');
    await page.getByRole('dialog').getByLabel('Cuéntenos por qué desea adoptar').fill('Quiero cuidar a Mora.');
    await page.getByRole('dialog').getByRole('button', { name: 'Enviar solicitud' }).click();
    await page.getByRole('dialog').getByText('Su solicitud quedó registrada.').waitFor();
    await page.getByRole('button', { name: 'Aceptar' }).click();
    assert.equal(new URL(page.url()).pathname, '/');

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    assert.equal(overflow, false, `Desbordamiento horizontal a ${viewport.width}px`);
    await mkdir('tmp/landing-check', { recursive: true });
    await page.screenshot({ path: `tmp/landing-check/${viewport.width}.png`, fullPage: true });

    await page.locator('.vl-primary-actions').getByRole('button', { name: 'Registrar a mi compañero animal' }).click();
    await page.getByRole('dialog').getByRole('heading', { name: 'Ingresar a VitaLink' }).waitFor();
    await page.getByRole('dialog').getByRole('button', { name: '¿No tiene cuenta? Registrarse' }).click();
    await page.getByRole('dialog').getByRole('heading', { name: 'Crear cuenta' }).waitFor();
    await page.getByRole('dialog').getByLabel('Nombre completo').fill('Persona Demo');
    await page.getByRole('dialog').getByLabel('Correo electrónico').fill('persona@example.test');
    await page.getByRole('dialog').getByLabel('Usuario').fill('persona_demo');
    await page.getByRole('dialog').getByLabel('Contraseña').fill('clave1234');
    await page.getByRole('dialog').getByLabel('Confirmar contraseña').fill('clave1234');
    await page.getByRole('dialog').getByRole('button', { name: 'Crear cuenta', exact: true }).click();
    await page.waitForURL('**/ingresar*');
    await page.getByRole('heading', { name: 'Mi compañero animal', exact: true }).waitFor();
    await page.locator('#registrar-animal input[name="name"]').waitFor();
    assert.equal(new URL(page.url()).pathname, '/ingresar');
    assert.deepEqual(errors, [], `Errores de JavaScript a ${viewport.width}px`);
    process.stdout.write(`Portada verificada a ${viewport.width}px: imagen, huellas, idiomas, modales, envíos y registro.\n`);
    await context.close();
  }
  const reducedContext = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(origin, { waitUntil: 'domcontentloaded' });
  const reducedPaw = reducedPage.locator('.vl-paws i').first();
  assert.equal(await reducedPaw.evaluate((paw) => getComputedStyle(paw).animationName), 'vl-paw-life');
  assert.equal(await reducedPaw.evaluate((paw) => getComputedStyle(paw).animationDuration), '2s');
  await reducedContext.close();
} finally {
  await browser.close();
}

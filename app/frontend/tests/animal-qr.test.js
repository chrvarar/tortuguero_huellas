import assert from 'node:assert/strict';
import test from 'node:test';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { animalQr } from '../src/animal-qr.js';

test('el PNG del expediente contiene la URL pública completa', async () => {
  const code = 'a'.repeat(32);
  const { url, image } = await animalQr(code, 'http://127.0.0.1:5173');
  assert.equal(url, `http://127.0.0.1:5173/ficha/${code}`);
  assert.match(image, /^data:image\/png;base64,/);

  const png = PNG.sync.read(Buffer.from(image.split(',')[1], 'base64'));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  assert.equal(decoded?.data, url);
});

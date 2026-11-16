import QRCode from 'qrcode';

export async function animalQr(code, origin) {
  const url = new URL(`/ficha/${code}`, origin).href;
  const image = await QRCode.toDataURL(url, { width: 512, margin: 4 });
  return { url, image };
}

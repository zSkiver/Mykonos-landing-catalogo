/**
 * Gera as versões servidas ao navegador a partir dos originais em `src/assets/`.
 *
 * Os arquivos-fonte ficam fora de `public/` de propósito: tudo em `public/` é
 * copiado inteiro para o build, então um PNG de 2 MB iria junto mesmo sem uso.
 *
 * Rode depois de trocar qualquer foto:  npm run images
 */
import { mkdir, readdir, stat } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = 'src/assets';
const OUTPUT_DIR = 'public/img';
const WIDTHS = [768, 1280, 1920, 2560];
const SOURCE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

const kb = (bytes) => `${Math.round(bytes / 1024)} kB`;

async function optimize(fileName) {
  const source = join(SOURCE_DIR, fileName);
  const name = basename(fileName, extname(fileName));
  const image = sharp(source);
  const { width: originalWidth } = await image.metadata();
  const { size: originalSize } = await stat(source);

  console.log(`\n${fileName} — ${kb(originalSize)}, ${originalWidth}px`);

  // Nunca amplia. A largura nativa entra na lista para que a maior versão
  // servida corresponda de fato ao original, e não ao degrau abaixo dele.
  const targets = new Set(WIDTHS.filter((width) => width <= originalWidth));
  targets.add(originalWidth);

  for (const width of [...targets].sort((a, b) => a - b)) {
    const target = join(OUTPUT_DIR, `${name}-${width}.webp`);
    const { size } = await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(target);

    console.log(`  ${width.toString().padStart(4)}px  ${kb(size).padStart(8)}  ${target}`);
  }
}

const files = (await readdir(SOURCE_DIR)).filter((file) =>
  SOURCE_EXTENSIONS.has(extname(file).toLowerCase()),
);

if (files.length === 0) {
  console.log(`Nenhuma imagem em ${SOURCE_DIR}/ para otimizar.`);
} else {
  await mkdir(OUTPUT_DIR, { recursive: true });
  for (const file of files) await optimize(file);
  console.log('\nPronto.');
}

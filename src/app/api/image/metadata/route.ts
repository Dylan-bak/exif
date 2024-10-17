import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const imageBlob = formData.get('imageBlob') as Blob | null;
    const exifDataSerialize = formData.get('exifData') as string | null;
    // const exifDataJson = JSON.parse(exifDataSerialize || '');

    // if (!imageBlob || !exifDataJson) return NextResponse.json({ message: 'Invalid request format' }, { status: 400 });
    if (!imageBlob) return NextResponse.json({ message: 'Invalid request format' }, { status: 400 });

    const arrayBuffer = await imageBlob.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);
    const tempFilePath = join(tmpdir(), 'temp-image.jpg');
    await fs.writeFile(tempFilePath, inputBuffer);
    const outputBuffer = await fs.readFile(tempFilePath);
    await fs.unlink(tempFilePath);

    const file = await sharp(outputBuffer)
      .withMetadata()
      .withExifMerge({
        IFD0: {
          DateTimeOriginal: '2023:10:01 12:00:00',
        },
      })
      .toFormat('jpg', { quality: 100 })
      .toFile('resizeIMG.jpeg', (err, info) => {
        console.log(`리사이징 이미지 info : ${JSON.stringify(info, null, 2)}`);
      });
    const updatedBuffer = await file.toBuffer();

    return NextResponse.json(updatedBuffer, { headers: { 'Content-Type': 'image/jpeg' }, status: 200 });
  } catch (err) {
    console.error('Error processing image:', err);
    return NextResponse.json({ message: `Failed to update image: ${err}` }, { status: 500 });
  }
}

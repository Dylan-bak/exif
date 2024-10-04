import { NextResponse } from 'next/server';
import sharp from 'sharp';
import ExifReader from 'exif-reader';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageBlob = formData.get('imageBlob') as Blob | null;
    if (!imageBlob) return NextResponse.json({ message: 'No image file provided' }, { status: 400 });

    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const metadata = await sharp(buffer).metadata();

    if (!metadata.exif) return NextResponse.json({ message: 'No EXIF data found' }, { status: 404 });
    const exifData = ExifReader(metadata.exif);
    return NextResponse.json(exifData, { status: 200 });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ message: 'Failed to read EXIF data' }, { status: 500 });
  }
}

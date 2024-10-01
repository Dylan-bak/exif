'use client';

import { useState } from 'react';
import piexif from './piexif.js';

export default function IndexPage() {
  const [dateTaken, setDateTaken] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      if (!base64Data) return alert('No image loaded');

      try {
        const exifData = piexif.load(base64Data);
        debugger;

        // 날짜를 가져오기
        const dateTaken = exifData['Exif']['DateTimeOriginal'];
        setDateTaken(dateTaken ? dateTaken : 'Date Taken not found');

        // 새 날짜를 설정
        const newDate = '2024:08:06 12:34:56'; // 수정할 날짜와 시간
        exifData['Exif']['DateTimeOriginal'] = newDate;
        const modifiedExifStr = piexif.dump(exifData);

        // EXIF 데이터를 수정한 이미지 데이터를 생성
        const newImageData = piexif.insert(modifiedExifStr, base64Data);

        // Base64를 data URL로 변환
        const newImageSrc = `data:image/jpeg;base64,${newImageData}`;
        const aTag = document.createElement('a');
        aTag.href = newImageSrc;
        aTag.download = 'image.jpg';
        aTag.click();
      } catch (error) {
        console.error('Error processing image:', error);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full w-full px-8 pb-8">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <p>Date Taken: {dateTaken}</p>
    </div>
  );
}

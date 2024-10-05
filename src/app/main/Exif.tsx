'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { Exif } from 'exif-reader';

export default function IndexPage() {
  const [dateTaken, setDateTaken] = useState<string>('');
  const [file, setFile] = useState<File>();
  const [exifData, setExifData] = useState<Exif>();
  const [dateInput, setDateInput] = useState<string>('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    const _file = files && files[0];
    if (!_file) return;
    setFile(_file);

    const formData = new FormData();
    formData.append('imageBlob', _file);

    try {
      const response = await fetch('/api/image/metadata/info', { method: 'POST', body: formData });
      if (response.ok) {
        const _exifData: Exif = await response.json();
        console.log('_exifData', _exifData);
        setExifData(_exifData);
      } else {
        console.error('Failed to fetch EXIF data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;

    const timestamp = new Date(dateInput).getTime() / 1000;
    const formData = new FormData();
    formData.append('imageBlob', file);
    formData.append('timestamp', timestamp.toString());

    try {
      const response = await fetch('/api/image/metadata', { method: 'PATCH', body: formData });

      if (response.ok) {
        const { updatedExif, imageBlob } = await response.json();
        const url = URL.createObjectURL(new Blob([imageBlob]));
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'updated_image.jpg';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        console.error('Failed to update image metadata:', errorData.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const ExifDisplay: React.FC<{ data: any; depth?: number }> = ({ data, depth = 0 }) => {
    if (typeof data !== 'object' || data === null) JSON.stringify(data);
    const makeChildren = (value: unknown) => {
      if (typeof value === 'object' && value !== null) {
        return <ExifDisplay data={value} depth={depth + 1} />;
      } else {
        return JSON.stringify(value);
      }
    };
    return (
      <ul className={`${depth > 0 ? 'ml-4' : ''}`}>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong>
            {makeChildren(value)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="h-full w-full px-8 pb-8">
      <form onSubmit={(event) => handleSubmit(event)}>
        <input type="file" accept="image/*" onChange={(event) => handleFileChange(event)} />
        <input type="date" value={dateInput} onChange={(event) => setDateInput(event.target.value)} required />
        <button type="submit" disabled={!file}>
          Update Metadata and Download
        </button>
      </form>
      <div>
        <h3>Original EXIF Data:</h3>
        {exifData && <ExifDisplay data={exifData} />}
      </div>
    </div>
  );
}

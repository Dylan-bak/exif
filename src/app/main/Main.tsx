'use client';

import Exif from './Exif';

interface ApiType {}

export default function (props?: { api?: ApiType }) {
  return (
    <div className="h-full w-full px-8 pb-8">
      <div className="flex items-start justify-between px-6 sm:flex-row sm:items-center">
        <div className={`w-full`}>
          <Exif />
        </div>
      </div>
    </div>
  );
}

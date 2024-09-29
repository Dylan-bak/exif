import React from 'react';

interface RootLayoutProps {
  children: any;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body className={'min-h-screen bg-background font-sans antialiased'}>
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}

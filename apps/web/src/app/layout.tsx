import '@mantine/core/styles.css';
import { Noto_Sans_TC } from 'next/font/google';

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from '@mantine/core';
import { theme } from './theme';

const notoSansTC = Noto_Sans_TC({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
});

export const metadata = {
  title: 'My Mantine app',
  description: 'I have followed setup instructions carefully',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-hant" {...mantineHtmlProps} className={notoSansTC.className}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}

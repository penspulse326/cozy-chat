import '@mantine/core/styles.css';

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from '@mantine/core';
import { theme } from './theme';

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
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}

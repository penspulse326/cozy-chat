import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { Noto_Sans_TC } from 'next/font/google';
import { SocketProvider } from '../contexts/SocketContext';
import { theme } from '../theme';

const notoSansTC = Noto_Sans_TC({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
});

export const metadata = {
  title: 'Cozy Chat',
  description: '放輕鬆，隨便聊',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-hant" {...mantineHtmlProps} className={notoSansTC.className}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <SocketProvider>
          <MantineProvider theme={theme}>{children}</MantineProvider>
        </SocketProvider>
      </body>
    </html>
  );
}

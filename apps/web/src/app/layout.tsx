import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { SocketProvider } from '../contexts/SocketContext';
import { theme } from '../theme';

export const metadata = {
  title: 'Cozy Chat',
  description: '放輕鬆，隨便聊',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-hant" {...mantineHtmlProps}>
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

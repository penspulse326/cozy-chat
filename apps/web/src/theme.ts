'use client';

import { generateColors } from '@mantine/colors-generator';
import { createTheme } from '@mantine/core';
import localFont from 'next/font/local';

const lineSeedTW = localFont({
  src: [
    {
      path: '../public/fonts/line_seed_tw_th.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/line_seed_tw_rg.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/line_seed_tw_bd.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
});

export const theme = createTheme({
  primaryColor: 'moss-green',
  fontFamily: `${lineSeedTW.style.fontFamily}, sans-serif`,
  colors: {
    'soft-lime': generateColors('#DDEB9D'),
    'moss-green': generateColors('#A0C878'),
    'deep-teal': generateColors('#27667B'),
    'navy-steel': generateColors('#143D60'),
  },
});

'use client';

import { generateColors } from '@mantine/colors-generator';
import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'moss-green',
  fontFamily: 'Noto Sans TC, sans-serif',
  colors: {
    'soft-lime': generateColors('#DDEB9D'),
    'moss-green': generateColors('#A0C878'),
    'deep-teal': generateColors('#27667B'),
    'navy-steel': generateColors('#143D60'),
  },
});

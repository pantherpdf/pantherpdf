/**
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021
 * @license MIT
 */

import { googleFontCssUrl, destructGoogleFontUrl } from './GoogleFonts';

test('destructGoogleFontUrl 1', () => {
  const arr = destructGoogleFontUrl(
    'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;1,300&display=swap',
  );
  expect(arr).toStrictEqual([
    { name: 'Lato', weight: 300, italic: false },
    { name: 'Lato', weight: 400, italic: false },
    { name: 'Lato', weight: 300, italic: true },
  ]);
});

test('destructGoogleFontUrl 2', () => {
  const arr = destructGoogleFontUrl(
    'https://fonts.googleapis.com/css2?family=Lato&display=swap',
  );
  expect(arr).toStrictEqual([{ name: 'Lato', weight: 400, italic: false }]);
});

test('googleFontCssUrl 1', () => {
  const arr = [
    { name: 'Lato', weight: 300, italic: true },
    { name: 'Lato', weight: 300, italic: false },
    { name: 'Lato', weight: 400, italic: false },
  ];
  expect(googleFontCssUrl(arr)).toBe(
    'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;1,300&display=swap',
  );
});

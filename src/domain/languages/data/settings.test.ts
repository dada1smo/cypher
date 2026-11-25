import { sanitizeSettings } from './settings';

jest.mock('expo-sqlite/kv-store', () => ({}));

const all = () => true;

test('nothing saved: English only', () => {
  expect(sanitizeSettings(null, all)).toEqual({ enabled: ['en'], current: 'en' });
});

test('keeps saved languages and the current one', () => {
  expect(sanitizeSettings({ enabled: ['en', 'fr'], current: 'fr' }, all)).toEqual({ enabled: ['en', 'fr'], current: 'fr' });
});

test('drops unknown, unavailable and repeated languages, and moves current to one still on', () => {
  const noFrench = (code: string) => code !== 'fr';
  expect(sanitizeSettings({ enabled: ['fr', 'xx', 'en', 'en'], current: 'fr' }, noFrench)).toEqual({
    enabled: ['en'],
    current: 'en',
  });
});

test('never leaves the list empty', () => {
  expect(sanitizeSettings({ enabled: [], current: 'fr' }, all)).toEqual({ enabled: ['en'], current: 'en' });
});

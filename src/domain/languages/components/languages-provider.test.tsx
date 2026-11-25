import { act, renderHook } from '@testing-library/react-native';
import { deleteDictionary, downloadDictionary, isAvailable, keepIfComplete } from '../data/dictionary-files';
import { loadSettings, saveSettings } from '../data/settings';
import type { LanguagesValue } from '../hooks/languages-context';
import { useLanguages } from '../hooks/use-languages';
import { LanguagesProvider } from './languages-provider';

jest.mock('../data/dictionary-files');
jest.mock('../data/settings');

// A download the test finishes, fails or cancels by hand.
function fakeTask() {
  let settle!: { resolve: (v: unknown) => void; reject: (e: Error) => void };
  const task = {
    state: 'active',
    downloadAsync: () => new Promise((resolve, reject) => (settle = { resolve, reject })),
    cancel: jest.fn(() => {
      task.state = 'cancelled';
      settle.reject(new Error('cancelled'));
    }),
    finish: () => settle.resolve({}),
    fail: () => settle.reject(new Error('network')),
  };
  return task;
}

let hook: { current: LanguagesValue };

let task: ReturnType<typeof fakeTask>;
let progress: (fraction: number) => void;
beforeEach(async () => {
  jest.clearAllMocks();
  jest.mocked(loadSettings).mockReturnValue({ enabled: ['en'], current: 'en' });
  jest.mocked(isAvailable).mockImplementation((code) => code === 'en');
  jest.mocked(keepIfComplete).mockReturnValue(true);
  jest.mocked(downloadDictionary).mockImplementation((_language, onProgress) => {
    progress = onProgress;
    task = fakeTask();
    return task as never;
  });
  hook = (await renderHook(useLanguages, { wrapper: LanguagesProvider })).result;
});

test('turning French on downloads it with progress, then enables and saves it', async () => {
  await act(() => hook.current.enable('fr'));
  expect(hook.current.downloads.fr).toEqual({ progress: 0 });
  await act(() => progress(0.5));
  expect(hook.current.downloads.fr).toEqual({ progress: 0.5 });
  await act(async () => task.finish());
  expect(hook.current.enabled).toEqual(['en', 'fr']);
  expect(hook.current.downloads.fr).toBeUndefined();
  expect(saveSettings).toHaveBeenLastCalledWith({ enabled: ['en', 'fr'], current: 'en' });
});

test('a failed download says so and leaves French off', async () => {
  await act(() => hook.current.enable('fr'));
  await act(async () => task.fail());
  expect(hook.current.downloads.fr).toEqual({ failed: true });
  expect(hook.current.enabled).toEqual(['en']);
});

test('a download of the wrong size counts as failed', async () => {
  jest.mocked(keepIfComplete).mockReturnValue(false);
  await act(() => hook.current.enable('fr'));
  await act(async () => task.finish());
  expect(hook.current.downloads.fr).toEqual({ failed: true });
  expect(hook.current.enabled).toEqual(['en']);
});

test('cancelling stops the download without an error', async () => {
  await act(() => hook.current.enable('fr'));
  await act(async () => hook.current.cancel('fr'));
  expect(task.cancel).toHaveBeenCalled();
  expect(hook.current.downloads.fr).toBeUndefined();
  expect(hook.current.enabled).toEqual(['en']);
});

test('the last language stays on and its file stays', async () => {
  await act(() => hook.current.disable('en'));
  expect(hook.current.enabled).toEqual(['en']);
  expect(deleteDictionary).not.toHaveBeenCalled();
});

test('turning off the current language moves home to another and deletes the file', async () => {
  jest.mocked(isAvailable).mockReturnValue(true);
  await act(() => hook.current.enable('fr'));
  await act(() => hook.current.select('fr'));
  expect(hook.current.current).toBe('fr');
  await act(() => hook.current.disable('fr'));
  expect(hook.current).toMatchObject({ enabled: ['en'], current: 'en' });
  expect(deleteDictionary).toHaveBeenCalledWith(expect.objectContaining({ code: 'fr' }));
});

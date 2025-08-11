export const maybeCompleteAuthSession = jest.fn(() => ({}));
export const openBrowserAsync = jest.fn(async () => ({ type: 'opened' }));
export const dismissBrowser = jest.fn(() => undefined);
export const WarmBrowser = { mayInitWithUrl: jest.fn(async () => true) };
export default { maybeCompleteAuthSession, openBrowserAsync, dismissBrowser, WarmBrowser };

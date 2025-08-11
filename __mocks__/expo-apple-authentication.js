export const isAvailableAsync = jest.fn(async () => false);
export const signInAsync = jest.fn(async () => ({ user: 'test', email: 'test@example.com' }));
export const AppleAuthenticationScope = { FULL_NAME: 'FULL_NAME', EMAIL: 'EMAIL' };
export const AppleAuthentication = { isAvailableAsync, signInAsync, AppleAuthenticationScope };
export default AppleAuthentication;

export const useAuthRequest = jest.fn(() => [{}, jest.fn(), jest.fn()]);
export const useIdTokenAuthRequest = jest.fn(() => [{}, jest.fn(), jest.fn()]);
export const useAutoDiscovery = jest.fn(() => ({}));
export default { useAuthRequest, useIdTokenAuthRequest, useAutoDiscovery };

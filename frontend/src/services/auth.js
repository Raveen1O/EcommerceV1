/**
 * Lightweight JWT auth helper.
 * Reads the tokens stored by Login.js (localStorage) so we never need
 * Auth.currentAuthenticatedUser() outside of the Cognito sign-in flow.
 */

/** Parse a JWT payload without any external library. */
const decodeJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

/** Return the decoded access-token payload, or null if not logged in. */
export const getTokenPayload = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  return decodeJwt(token);
};

/**
 * Return a stable user-id string for cart API calls.
 * Prefers Cognito's `sub` claim, falls back to `username`, then 1.
 */
export const getUserId = () => {
  const payload = getTokenPayload();
  if (!payload) return '1';               // unauthenticated / fallback
  return payload.sub || payload.username || '1';
};

/** Return the username string stored in the token. */
export const getUsername = () => {
  const payload = getTokenPayload();
  return payload?.username || payload?.['cognito:username'] || null;
};

/** Return the email from the id-token payload, or null. */
export const getEmail = () => {
  const idToken = localStorage.getItem('idToken');
  if (!idToken) return null;
  const payload = decodeJwt(idToken);
  return payload?.email || null;
};

/** True when an (unexpired) access token exists. */
export const isLoggedIn = () => {
  const payload = getTokenPayload();
  if (!payload) return false;
  if (payload.exp && payload.exp * 1000 < Date.now()) return false;
  return true;
};

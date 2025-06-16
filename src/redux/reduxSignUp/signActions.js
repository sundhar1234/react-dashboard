
import { LOGIN, LOGOUT } from './signInTypes';

export const signIn = () => ({
    type: LOGIN,
    // eslint-disable-next-line no-undef
    payload,
});

export const signOut = () => ({
  type: LOGOUT,
});

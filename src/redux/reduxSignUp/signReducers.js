
import { LOGIN, LOGOUT } from './signInTypes';

const initialState = {
  email: '',
  password: '',
  isSignedIn: false,
};

export const signReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        ...action.payload,
        isSignedIn: true,
      };
    case LOGOUT:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

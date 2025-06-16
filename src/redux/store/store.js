import { createStore, combineReducers } from 'redux';

import { signReducer } from '../reduxSignUp/signReducers.js';



const rootReducer = combineReducers({
  sign: signReducer,
});

export const store = createStore(rootReducer);
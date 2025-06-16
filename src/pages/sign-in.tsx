import { CONFIG } from 'src/config-global';

import { SignInView } from '../sections/auth/sign-in-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Sign in - ${CONFIG.appName}`}</title>

      <SignInView />
    </>
  );
}

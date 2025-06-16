import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { SignInView } from 'src/sections/auth/sign-in-view';





// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
// eslint-disable-next-line import/no-unresolved
export const ClientPage = lazy(() => import('src/pages/client'));
export const PaymentPage = lazy(() => import('src/pages/payment'));
export const PaymentDetailsPage = lazy(() => import('src/pages/paymentDetails'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    index: true,
    // path: 'sign-in',
    element: (
      <AuthLayout>
        <Suspense fallback={renderFallback()}>
          <SignInView />
        </Suspense>
      </AuthLayout>
    ),
  },
  {
    // path: 'dashboard',
    element: (
      <DashboardLayout>
        <Suspense fallback={renderFallback()}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'client', element: <ClientPage /> },
      { path: 'payment', element: <PaymentPage /> },
      { path: 'payment-Details', element: <PaymentDetailsPage /> },
    ],
  },
  // {
  //   path: 'sign-in',
  //   element: (
  //     <AuthLayout>
  //       <SignInPage />
  //     </AuthLayout>
  //   ),
  // },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];

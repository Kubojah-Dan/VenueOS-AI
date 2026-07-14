import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';

// Error Boundary Page
import ErrorBoundaryPage from '../pages/NotFound/ErrorBoundaryPage';

// Lazy Loaded Pages
const Landing = lazy(() => import('../pages/Landing/Landing'));
const Login = lazy(() => import('../pages/Login/Login'));
const DashboardOverview = lazy(() => import('../pages/Dashboard/DashboardOverview'));
const OperationsCenter = lazy(() => import('../pages/Operations/OperationsCenter'));
const CrowdIntelligence = lazy(() => import('../pages/Crowd/CrowdIntelligence'));
const NavigationCenter = lazy(() => import('../pages/Navigation/NavigationCenter'));
const AIAssistant = lazy(() => import('../pages/AIAssistant/AIAssistant'));
const UploadCenter = lazy(() => import('../pages/UploadCenter/UploadCenter'));
const EmergencyCenter = lazy(() => import('../pages/Emergency/EmergencyCenter'));
const AccessibilityCenter = lazy(() => import('../pages/Accessibility/AccessibilityCenter'));
const Sustainability = lazy(() => import('../pages/Sustainability/Sustainability'));
const Reports = lazy(() => import('../pages/Reports/Reports'));
const Settings = lazy(() => import('../pages/Settings/Settings'));
const NotFound = lazy(() => import('../pages/NotFound/NotFound'));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-12">
    <div className="w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full animate-spin"></div>
    <span className="mt-4 text-sm text-gray-500 font-medium">Loading VenueOS AI Panel...</span>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorBoundaryPage />,
    element: (
      <Suspense fallback={<PageLoader />}>
        <Landing />
      </Suspense>
    )
  },
  {
    path: '/login',
    errorElement: <ErrorBoundaryPage />,
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    )
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      {
        path: '',
        element: <Navigate to="overview" replace />
      },
      {
        path: 'overview',
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardOverview />
          </Suspense>
        )
      },
      {
        path: 'operations',
        element: (
          <Suspense fallback={<PageLoader />}>
            <OperationsCenter />
          </Suspense>
        )
      },
      {
        path: 'crowd',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CrowdIntelligence />
          </Suspense>
        )
      },
      {
        path: 'navigation',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NavigationCenter />
          </Suspense>
        )
      },
      {
        path: 'ai-assistant',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AIAssistant />
          </Suspense>
        )
      },
      {
        path: 'upload-center',
        element: (
          <Suspense fallback={<PageLoader />}>
            <UploadCenter />
          </Suspense>
        )
      },
      {
        path: 'emergency',
        element: (
          <Suspense fallback={<PageLoader />}>
            <EmergencyCenter />
          </Suspense>
        )
      },
      {
        path: 'accessibility',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AccessibilityCenter />
          </Suspense>
        )
      },
      {
        path: 'sustainability',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Sustainability />
          </Suspense>
        )
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Reports />
          </Suspense>
        )
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        )
      }
    ]
  },
  {
    path: '*',
    errorElement: <ErrorBoundaryPage />,
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFound />
      </Suspense>
    )
  }
]);
export default router;

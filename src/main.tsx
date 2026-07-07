import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './assets/css/index.css'
import './features/shared/lib/i18n'
import { queryClient } from './features/shared/lib/queryClient.ts'
import { Toaster } from './features/shared/ui/sonner.tsx'
import TenantAuthBoundary from './features/shared/auth/TenantAuthBoundary.tsx'
import TenantRequiredPage from './features/shared/components/TenantRequiredPage.tsx'
import CaseLayout from './layouts/CaseLayout.tsx'
import InvestigationCasesPage from './features/investigation-case/pages/InvestigationCasesPage.tsx'
import InvestigationCaseDetailsPage from './features/investigation-case/pages/InvestigationCaseDetailsPage.tsx'
import InvestigationCaseComparisonPage from './features/investigation-case/pages/InvestigationCaseComparisonPage.tsx'

const router = createBrowserRouter([
  { path: '/', element: <TenantRequiredPage /> },
  {
    path: '/:slug',
    element: <TenantAuthBoundary />,
    children: [
      { index: true, element: <InvestigationCasesPage /> },
      { path: 'affaires', element: <InvestigationCasesPage /> },
      {
        path: 'affaires/:id',
        element: <CaseLayout />,
        children: [
          { index: true, element: <InvestigationCaseDetailsPage /> },
          { path: 'comparaison', element: <InvestigationCaseComparisonPage /> },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left"  />
    </QueryClientProvider>
  </StrictMode>
)

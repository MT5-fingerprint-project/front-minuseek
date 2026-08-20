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
import CasePageLayout from './layouts/CasePageLayout.tsx'
import CaseComparisonLayout from './layouts/CaseComparisonLayout.tsx'
import InvestigationCasesPage from './features/investigation-case/pages/InvestigationCasesPage.tsx'
import InvestigationCaseDetailsPage from './features/investigation-case/pages/InvestigationCaseDetailsPage.tsx'
import InvestigationCaseSubjectsPage from './features/investigation-case/pages/InvestigationCaseSubjectsPage.tsx'
import SubjectDetailsPage from './features/investigation-case/pages/SubjectDetailsPage.tsx'
import InvestigationCaseComparisonPage from './features/investigation-case/pages/InvestigationCaseComparisonPage.tsx'
import DetachedReferencePrintsPage from './features/investigation-case/pages/DetachedReferencePrintsPage.tsx'
import CaseHistoryPage from './features/audit-trail/pages/CaseHistoryPage.tsx'
import CaseReportsPage from './features/reporting/pages/CaseReportsPage.tsx'

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
        children: [
          {
            element: <CasePageLayout />,
            children: [{ index: true, element: <InvestigationCaseDetailsPage /> }],
          },
          {
            path: 'historique',
            element: <CasePageLayout activeNav="history" />,
            children: [{ index: true, element: <CaseHistoryPage /> }],
          },
          {
            path: 'sujets',
            element: <CasePageLayout activeNav="subjects" />,
            children: [
              { index: true, element: <InvestigationCaseSubjectsPage /> },
              { path: ':subjectId', element: <SubjectDetailsPage /> },
            ],
          },
          {
            path: 'rapports',
            element: <CasePageLayout activeNav="reports" />,
            children: [{ index: true, element: <CaseReportsPage /> }],
          },
          {
            path: 'comparaison',
            element: <CaseComparisonLayout />,
            children: [
              { index: true, element: <InvestigationCaseComparisonPage /> },
              { path: 'empreintes', element: <DetachedReferencePrintsPage /> },
            ],
          },
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
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  </StrictMode>
)

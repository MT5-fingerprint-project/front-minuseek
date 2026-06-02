import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './assets/css/index.css'
import './features/shared/lib/i18n'
import { queryClient } from './features/shared/lib/queryClient.ts'
import { Toaster } from './features/shared/ui/sonner.tsx'
import AppLayout from './layouts/AppLayout.tsx'
import InvestigationCasePage from './features/investigation-case/pages/InvestigationCasesPage.tsx'
import InvestigationCaseDetailsPage from './features/investigation-case/pages/InvestigationCaseDetailsPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <InvestigationCasePage /> },
      { path: 'affaires', element: <InvestigationCasePage /> },
      { path: 'affaires/:id', element: <InvestigationCaseDetailsPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)

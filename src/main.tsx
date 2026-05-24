import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './assets/css/index.css'
import './features/shared/lib/i18n'
import AppLayout from './layouts/AppLayout.tsx'
import AffairePage from './features/investigation-case/pages/InvestigationCasesPage.tsx'
import AffaireDetailsPage from './features/investigation-case/pages/InvestigationCaseDetailsPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <AffairePage /> },
      { path: 'affaires', element: <AffairePage /> },
      { path: 'affaires/:id', element: <AffaireDetailsPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)

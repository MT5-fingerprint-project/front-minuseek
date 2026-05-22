import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './assets/css/index.css'
import AppLayout from './layouts/AppLayout.tsx'
import AffairePage from './pages/InvestigationCasesPage.tsx'
import AffaireDetailsPage from './pages/InvestigationCaseDetailsPage.tsx'

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

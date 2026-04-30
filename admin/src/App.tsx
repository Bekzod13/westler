import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/AdminLayout'
import { RequireAuth } from './components/RequireAuth'
import { BannersPage } from './pages/BannersPage'
import { CompaniesPage } from './pages/CompaniesPage'
import { DashboardPage } from './pages/DashboardPage'
import { GroupsPage } from './pages/GroupsPage'
import { LanguagesPage } from './pages/LanguagesPage'
import { LoginPage } from './pages/LoginPage'
import { PartnersPage } from './pages/PartnersPage'
import { ServicesPage } from './pages/ServicesPage'
import { TranslationsPage } from './pages/TranslationsPage'
import { UsersPage } from './pages/UsersPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="languages" element={<LanguagesPage />} />
          <Route path="translations" element={<TranslationsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="groups" element={<GroupsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

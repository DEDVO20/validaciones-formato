import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import UsersPage from "./pages/users/UsersPage";
import EditUserPage from "./pages/users/EditUserPage";
import RoleDemoPage from "./pages/demo/RoleDemoPage";
import FormatsPage from "./pages/formats/FormatsPage";
import UseFormatPage from "./pages/formats/UseFormatPage";
import ValidationsPage from "./pages/validations/ValidationsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import { isAuthenticated } from "./services/auth";
import SubmissionsPage from './pages/Submission/SubmissionsPage';
import { Toaster } from 'sonner';
import { NotificationProvider } from './components/NotificationProvider';

// Componente para proteger rutas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

// Componente para redirigir usuarios autenticados
function PublicRoute({ children }: { children: React.ReactNode }) {
  return !isAuthenticated() ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <Router>
      <NotificationProvider>
        <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        } />
        <Route path="/users/:id/edit" element={
          <ProtectedRoute>
            <EditUserPage />
          </ProtectedRoute>
        } />

        <Route path="/demo/roles" element={
          <ProtectedRoute>
            <RoleDemoPage />
          </ProtectedRoute>
        } />
        <Route path="/formats" element={
          <ProtectedRoute>
            <FormatsPage />
          </ProtectedRoute>
        } />
        <Route path="/formats/:id/use" element={
          <ProtectedRoute>
            <UseFormatPage />
          </ProtectedRoute>
        } />
        <Route path="/completions" element={
          <ProtectedRoute>
            <SubmissionsPage />
          </ProtectedRoute>
        } />
        <Route path="/validations" element={
          <ProtectedRoute>
            <ValidationsPage />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </NotificationProvider>
    </Router>
  );
}

export default App;

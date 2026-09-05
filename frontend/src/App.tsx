import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider, useApp } from "@/context/AppContext";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute, ManagerRoute } from "@/components/layout/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import MyReportPage from "@/pages/MyReportPage";
import ReportHistoryPage from "@/pages/ReportHistoryPage";
import ReportDetailPage from "@/pages/ReportDetailPage";
import MemberProfilePage from "@/pages/MemberProfilePage";
import ManagerDashboardPage from "@/pages/ManagerDashboardPage";
import ManagerReviewPage from "@/pages/ManagerReviewPage";
import ReviewQueuePage from "@/pages/ReviewQueuePage";
import ProjectsPage from "@/pages/ProjectsPage";
import UserManagementPage from "@/pages/UserManagementPage";

const queryClient = new QueryClient();

function DefaultRedirect() {
  const { isManager } = useApp();
  return <Navigate to={isManager ? "/dashboard" : "/my-report"} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/my-report" element={<MyReportPage />} />
                  <Route path="/report-history" element={<ReportHistoryPage />} />
                  <Route path="/reports/:reportId" element={<ReportDetailPage />} />

                  <Route element={<ManagerRoute />}>
                    <Route path="/dashboard" element={<ManagerDashboardPage />} />
                    <Route path="/review-queue" element={<ReviewQueuePage />} />
                    <Route path="/review/:reportId" element={<ManagerReviewPage />} />
                    <Route path="/team" element={<UserManagementPage />} />
                    <Route path="/members/:memberId" element={<MemberProfilePage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                  </Route>

                  <Route index element={<DefaultRedirect />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

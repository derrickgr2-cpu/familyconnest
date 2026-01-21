import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MembersPage from "./pages/MembersPage";
import MemberProfilePage from "./pages/MemberProfilePage";
import CalendarPage from "./pages/CalendarPage";
import ForumPage from "./pages/ForumPage";
import Layout from "./components/Layout";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF0E6]">
                <div className="animate-pulse text-[#4A3728] font-serif text-xl">
                    Loading...
                </div>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

// Public Route - redirects to dashboard if authenticated
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF0E6]">
                <div className="animate-pulse text-[#4A3728] font-serif text-xl">
                    Loading...
                </div>
            </div>
        );
    }
    
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute>
                    <RegisterPage />
                </PublicRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout>
                        <DashboardPage />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/members" element={
                <ProtectedRoute>
                    <Layout>
                        <MembersPage />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/members/:id" element={
                <ProtectedRoute>
                    <Layout>
                        <MemberProfilePage />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/calendar" element={
                <ProtectedRoute>
                    <Layout>
                        <CalendarPage />
                    </Layout>
                </ProtectedRoute>
            } />
            <Route path="/forum" element={
                <ProtectedRoute>
                    <Layout>
                        <ForumPage />
                    </Layout>
                </ProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
                <Toaster position="top-right" richColors />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;

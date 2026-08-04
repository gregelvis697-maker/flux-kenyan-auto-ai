import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Waitlist from "./pages/Waitlist";
import Auth from "./pages/Auth";
import { DashboardRedirect } from "@/components/DashboardRedirect";
import PendingApproval from "./pages/PendingApproval";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import { AdminHotkey } from "@/components/AdminHotkey";
import { PageBackdrop } from "@/components/PageBackdrop";


import DealerDashboard from "./pages/DealerDashboard";
import ImporterDashboard from "./pages/ImporterDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import Marketplace from "./pages/Marketplace";
import VehicleDetail from "./pages/VehicleDetail";
import NotFound from "./pages/NotFound";
import Stores from "./pages/Stores";
import PublicTracking from "./pages/PublicTracking";
import MarketplacePage from "./pages/products/MarketplacePage";
import EscrowPage from "./pages/products/EscrowPage";
import AIIntelligencePage from "./pages/products/AIIntelligencePage";
import AnalyticsPage from "./pages/products/AnalyticsPage";
import DealerToolsPage from "./pages/products/DealerToolsPage";

const App = () => (
  <QueryClientProvider client={queryClient}>
  <ThemeProvider>
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <PageBackdrop />
        <AdminHotkey />

        <Routes>

          <Route path="/" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/track/:token" element={<PublicTracking />} />
          <Route path="/waitlist" element={<Waitlist />} />

          <Route path="/auth" element={<Auth />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route
            path="/dashboard/buyer"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/dealer"
            element={
              <ProtectedRoute allowedRoles={['dealer']}>
                <DealerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/importer"
            element={
              <ProtectedRoute allowedRoles={['importer']}>
                <ImporterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard/:role" element={<Navigate to="/dashboard" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route

            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/products/marketplace" element={<MarketplacePage />} />
          <Route path="/products/escrow" element={<EscrowPage />} />
          <Route path="/products/ai-intelligence" element={<AIIntelligencePage />} />
          <Route path="/products/analytics" element={<AnalyticsPage />} />
          <Route path="/products/dealer-tools" element={<DealerToolsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </TooltipProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;

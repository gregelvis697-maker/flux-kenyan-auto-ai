import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Waitlist from "./pages/Waitlist";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import PendingApproval from "./pages/PendingApproval";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/AdminDashboard";
import DealerDashboard from "./pages/DealerDashboard";
import ImporterDashboard from "./pages/ImporterDashboard";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Buyer Dashboard - Protected for 'buyer' role only */}
          <Route
            path="/dashboard/buyer"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Dealer Dashboard - Protected for 'dealer' role only */}
          <Route
            path="/dashboard/dealer"
            element={
              <ProtectedRoute allowedRoles={['dealer']}>
                <DealerDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Importer Dashboard - Protected for 'importer' role only */}
          <Route
            path="/dashboard/importer"
            element={
              <ProtectedRoute allowedRoles={['importer']}>
                <ImporterDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Dashboard - Protected for 'admin' role only */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Generic dashboard fallback - redirects to proper role dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:role"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;

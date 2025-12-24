import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { UserNav } from "@/components/user-nav";
import { useTranslation } from "react-i18next";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import SuppliersPage from "@/pages/suppliers";
import SupplierDocumentsPage from "@/pages/supplier-documents";
import RfcisPage from "@/pages/rfcis";
import RfciDetailPage from "@/pages/rfci-detail";
import RfciNewPage from "@/pages/rfci-new";
import SupplierDashboardPage from "@/pages/supplier-dashboard";
import SupplierQuotationsPage from "@/pages/supplier-quotations";
import SupplierQuotationRespondPage from "@/pages/supplier-quotation-respond";
import SupplierMyQuotationsPage from "@/pages/supplier-my-quotations";
import NotFound from "@/pages/not-found";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isSupplier = user?.role === "SUPPLIER";
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 px-4 py-3 border-b bg-background sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="hidden sm:block">
                <h2 className="text-sm font-medium">
                  {isSupplier ? t('header.supplierPortal') : t('header.buyerPortal')}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function Router() {
  const { user } = useAuth();
  const isSupplier = user?.role === "SUPPLIER";

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      <Route path="/">
        <ProtectedRoute>
          {isSupplier ? <SupplierDashboardPage /> : <DashboardPage />}
        </ProtectedRoute>
      </Route>
      
      <Route path="/suppliers">
        <ProtectedRoute>
          <SuppliersPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/documents">
        <ProtectedRoute>
          <SupplierDocumentsPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/rfcis">
        <ProtectedRoute>
          <RfcisPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/rfcis/new">
        <ProtectedRoute>
          <RfciNewPage />
        </ProtectedRoute>
      </Route>
      
      <Route path="/rfcis/:id">
        <ProtectedRoute>
          <RfciDetailPage />
        </ProtectedRoute>
      </Route>

      <Route path="/supplier">
        <ProtectedRoute>
          <SupplierDashboardPage />
        </ProtectedRoute>
      </Route>

      <Route path="/supplier/quotations">
        <ProtectedRoute>
          <SupplierQuotationsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/supplier/quotations/:id">
        <ProtectedRoute>
          <SupplierQuotationRespondPage />
        </ProtectedRoute>
      </Route>

      <Route path="/supplier/my-quotations">
        <ProtectedRoute>
          <SupplierMyQuotationsPage />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="eproc-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

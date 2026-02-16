import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { store } from "@/store";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import MarinaDetail from "./pages/MarinaDetail";
import Reservations from "./pages/Reservations";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/discover/:slug" element={<MarinaDetail />} />
              <Route
                path="/reservations"
                element={
                  <AuthGuard>
                    <Reservations />
                  </AuthGuard>
                }
              />
              <Route
                path="/profile"
                element={
                  <AuthGuard>
                    <Profile />
                  </AuthGuard>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </Provider>
);

createRoot(document.getElementById("root")!).render(<App />);

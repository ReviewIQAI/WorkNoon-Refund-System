import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import CustomerPortal from "@/pages/CustomerPortal";
import AdminDashboard from "@/pages/AdminDashboard";

function App() {
  return (
    <div className="min-h-screen bg-background grain">
      <BrowserRouter>
        <AuthProvider>
          <Header />
          <Routes>
            <Route path="/" element={<CustomerPortal />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

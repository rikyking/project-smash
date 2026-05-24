import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomerPage from "./pages/CustomerPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";
import AdminPanel from "./components/admin/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminPanel />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
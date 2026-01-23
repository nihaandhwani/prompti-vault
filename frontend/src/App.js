import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import AdminCategories from "@/pages/AdminCategories";
import AdminTags from "@/pages/AdminTags";
import AuthorPrompts from "@/pages/AuthorPrompts";
import CreatePrompt from "@/pages/CreatePrompt";
import EditPrompt from "@/pages/EditPrompt";
import PublicHome from "@/pages/PublicHome";
import PromptDetail from "@/pages/PromptDetail";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicHome />} />
            <Route path="/prompti/:id" element={<PromptDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tags"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminTags />
                </ProtectedRoute>
              }
            />
            <Route
              path="/author/prompti"
              element={
                <ProtectedRoute>
                  <AuthorPrompts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/author/prompti/create"
              element={
                <ProtectedRoute>
                  <CreatePrompt />
                </ProtectedRoute>
              }
            />
            <Route
              path="/author/prompti/edit/:id"
              element={
                <ProtectedRoute>
                  <EditPrompt />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

export default App;
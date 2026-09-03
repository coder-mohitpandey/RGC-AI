import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import ComplaintForm from "./pages/user/ComplaintForm";
import LostFound from "./pages/user/LostFound";
import MyComplaints from "./pages/user/MyComplaints";
import ReportLostItem from "./pages/user/ReportLostItem";

import AdminComplaints from "./pages/admin/AdminComplaints";
import ManageUsers from "./pages/admin/ManageUsers";
import UploadLostItem from "./pages/admin/UploadLostItem";
import VerifyReports from "./pages/admin/VerifyReports";

import StaffComplaints from "./pages/staff/StaffComplaints";

function Home() {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role === "admin") return <Navigate to="/admin/complaints" replace />;
  if (role === "staff") return <Navigate to="/staff/complaints" replace />;
  return <Navigate to="/user/complaint/new" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* User routes */}
        <Route
          path="/user/complaint/new"
          element={
            <ProtectedRoute role="user">
              <ComplaintForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/complaints"
          element={
            <ProtectedRoute role="user">
              <MyComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/lost-found"
          element={
            <ProtectedRoute role="user">
              <LostFound />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/lost-found/report"
          element={
            <ProtectedRoute role="user">
              <ReportLostItem />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute role="admin">
              <AdminComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verify-reports"
          element={
            <ProtectedRoute role="admin">
              <VerifyReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/lost-found/upload"
          element={
            <ProtectedRoute role="admin">
              <UploadLostItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-users"
          element={
            <ProtectedRoute role="admin">
              <ManageUsers />
            </ProtectedRoute>
          }
        />

        {/* Staff routes */}
        <Route
          path="/staff/complaints"
          element={
            <ProtectedRoute role="staff">
              <StaffComplaints />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

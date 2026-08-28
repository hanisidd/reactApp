import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";
import Admins from "./admin/pages/Admins";

import ProtectedRoute from "./admin/components/ProtectedRoute";
import AdminLayout from "./admin/components/AdminLayout";

function App() {
    return (
        <Routes>

            {/* Public */}
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Admin Panel */}
            <Route element={<ProtectedRoute />}>

                <Route element={<AdminLayout />}>

                    <Route
                        path="/admin/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/admin/admins"
                        element={<Admins />}
                    />


                </Route>

            </Route>

            {/* Unknown URL */}
            <Route
                path="*"
                element={<Navigate to="/admin/dashboard" replace />}
            />

        </Routes>
    );
}

export default App;
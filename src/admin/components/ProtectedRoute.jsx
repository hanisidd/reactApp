import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";
function ProtectedRoute() {

    const { admin, loading } = useAuth();

    if (loading) {
    return <Loader />;
}

    if (!admin) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
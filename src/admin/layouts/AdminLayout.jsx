import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function AdminLayout() {
    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <Navbar />
            <main className="max-w-7xl mx-auto py-6">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/admin/login" element={<Login />} />

                <Route path="/admin/dashboard" element={<Dashboard />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
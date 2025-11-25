import Sidebar from "../components/Sidebar";
import AdminPage from "../pages/AdminPage";
import {Routes, Route} from "react-router-dom";
import "../css/AdminPage.css";


function AdminLayout() {
    return (
        <div className="admin-container">
            <Sidebar role="admin" />
            <div className="admin-content">
            <Routes>
                <Route path="" element={<AdminPage />} />
                <Route path="validate-organizers" element={<AdminPage />} />
                <Route path="validate-events" element={<AdminPage />} />
                <Route path="validate-participants" element={<AdminPage />} />
                <Route path="management-report" element={<AdminPage />} />
            </Routes>

            </div>
        </div>
    )
}

export default AdminLayout;
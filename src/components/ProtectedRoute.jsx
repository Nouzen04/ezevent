import { Navigate } from "react-router-dom";
import { useAuth }  from "./AuthContext";


//Make sure that unauthorized users cannot go to certain pages
export default function ProtectedRoute({ children }) {
    const { user } = useAuth();

    if(!user) {
        return <Navigate to="/login" replace />;
    }

    return children
}
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    // If application authentication state is bootstrapping, wait for context memory
    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-brand-dark">
                <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    /* 
      Bypassing async context delays: If token or storedUser exists locally, 
      we allow entry to prevent instant redirection feedback loops during state updates.
    */
    if (!token || (!user && !storedUser)) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
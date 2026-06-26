import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white/[0.02] border-b border-white/[0.05] backdrop-blur-md z-50 px-6 flex items-center justify-between">
            <Link to="/" className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                NEXUS
            </Link>

            <div className="flex items-center gap-6">
                {user && (
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-200">{user.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-white/[0.05] border border-white/[0.08] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-gray-300 text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
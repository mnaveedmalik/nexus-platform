// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    // 🧹 LEAN AND CLEAN NAVIGATION MATRIX: Removed Documents and Payments loops
    const links = [
        { name: 'Dashboard', path: '/' },
        { name: 'Meetings', path: '/meetings' },
    ];

    return (
        <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white/[0.01] border-r border-white/[0.05] backdrop-blur-sm z-40 p-4 flex flex-col justify-between">
            <div className="space-y-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Navigation
                </div>
                <nav className="space-y-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400'
                                    : 'text-gray-400 hover:bg-white/[0.02] hover:text-gray-200'
                                }`
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {user && (
                <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                        {user.role} Account
                    </span>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
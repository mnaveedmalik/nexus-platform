// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useAxios from '../hooks/useAxios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
    const { user } = useAuth();
    const axiosInstance = useAxios();
    const [stats, setStats] = useState({ meetings: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 🧹 CLEAN CORE DISPATCH: Hit only active endpoints to avoid 404 network spam
                const meetingsRes = await axiosInstance.get('/meetings');

                setStats({
                    meetings: meetingsRes.data.length
                });
            } catch (error) {
                console.error('Error fetching dashboard statistics', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="min-h-screen bg-brand-dark text-gray-100">
            <Navbar />
            <Sidebar />

            <main className="pl-64 pt-16 min-h-screen w-full p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Console Dashboard
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Overview metrics for {user?.name} ({user?.role})
                        </p>
                    </div>

                    {loading ? (
                        <div className="max-w-md">
                            <div className="h-32 bg-white/[0.02] border border-white/[0.05] rounded-2xl animate-pulse"></div>
                        </div>
                    ) : (
                        <div className="max-w-md">
                            {/* PREMIUM GLASSMORPHISM MEETING STATS CARD */}
                            <div className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-6 rounded-2xl transition-all duration-300 hover:border-white/[0.1] shadow-2xl">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    Scheduled Meetings
                                </p>
                                <h3 className="text-4xl font-black text-blue-400">
                                    {stats.meetings}
                                </h3>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
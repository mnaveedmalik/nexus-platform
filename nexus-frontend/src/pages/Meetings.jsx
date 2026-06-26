// src/pages/Meetings.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxios from '../hooks/useAxios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Meetings = () => {
    const axiosInstance = useAxios();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [inviteeEmail, setInviteeEmail] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 10000);
        return () => clearInterval(timer);
    }, []);

    const fetchMeetings = async () => {
        try {
            const response = await axiosInstance.get('/meetings');
            setMeetings(response.data);
        } catch (error) {
            console.error('Error fetching meetings', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        const token = localStorage.getItem('token');
        if (!token) {
            setMessage({ text: 'Session expired. Please re-login.', type: 'error' });
            return;
        }

        try {
            const combinedStartString = `${date}T${time}:00`;
            const startTimestamp = new Date(combinedStartString);
            const endTimestamp = new Date(startTimestamp.getTime() + 60 * 60 * 1000);

            if (isNaN(startTimestamp.getTime())) {
                setMessage({ text: 'Please select a valid date and time.', type: 'error' });
                return;
            }

            const payload = {
                title: title.trim(),
                description: `Partnership sync slot mapped via console`,
                inviteeEmail: inviteeEmail.trim().toLowerCase(),
                startTime: startTimestamp.toISOString(),
                endTime: endTimestamp.toISOString()
            };

            await axiosInstance.post('/meetings', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setMessage({ text: 'Meeting scheduled successfully!', type: 'success' });
            setTitle('');
            setDate('');
            setTime('');
            setInviteeEmail('');
            fetchMeetings();
        } catch (error) {
            const backendErrorMsg = error.response?.data?.message || error.response?.data?.error;
            setMessage({ text: backendErrorMsg || 'Scheduling handshake rejected.', type: 'error' });
        }
    };

    const handleUpdateStatus = async (meetingId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage({ text: 'Session expired. Please re-login.', type: 'error' });
                return;
            }

            const targetStatus = newStatus === 'Cancelled' ? 'Cancelled' : 'Rejected';

            await axiosInstance({
                method: 'PUT',
                url: `/meetings/${meetingId}`,
                data: { status: targetStatus },
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setMessage({ text: `Meeting updated successfully!`, type: 'success' });
            fetchMeetings();
        } catch (error) {
            console.error("Status sync failure:", error.response?.data || error);
            setMessage({ text: 'Failed to update meeting status.', type: 'error' });
        }
    };

    const getMeetingStatus = (meeting, startTimeStr, endTimeStr) => {
        if (meeting.status === 'Completed') {
            return {
                label: 'Completed',
                style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                isFinished: true,
                canJoin: false
            };
        }

        if (meeting.status === 'Cancelled' || meeting.status === 'Rejected') {
            return {
                label: meeting.status === 'Cancelled' ? 'Cancelled' : 'Rejected',
                style: 'bg-red-500/10 text-red-400 border-red-500/20',
                isFinished: true,
                canJoin: false
            };
        }

        const start = new Date(startTimeStr);
        const end = new Date(endTimeStr);

        if (currentTime > end) {
            return {
                label: 'Expired',
                style: 'bg-white/[0.04] text-gray-500 border-white/[0.05]',
                isFinished: true,
                canJoin: false
            };
        }

        if (currentTime < start) {
            return {
                label: 'Upcoming',
                style: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                isFinished: false,
                canJoin: false
            };
        }

        return {
            label: 'Live Now',
            style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse',
            isFinished: false,
            canJoin: true
        };
    };

    /* 🧹 AUTOMATIC CLEANING ENGINE (FRONTEND FILTER):
       Yeh filter har us meeting ko hide kar dega jo Finished (Completed/Rejected/Expired) 
       ho chuki hai AUR jise guzaari hue 24 ghante (1 din) se zyada ka time ho chuka hai.
    */
    const activeAndRecentMeetings = meetings.filter((meeting) => {
        const status = getMeetingStatus(meeting, meeting.startTime, meeting.endTime);

        if (status.isFinished) {
            const meetingEndTime = new Date(meeting.endTime);
            const oneDayInMs = 24 * 60 * 60 * 1000;
            // Agar meeting khatam hue 1 din se zyada ho gaya hai toh false (mat dikhao)
            if (currentTime - meetingEndTime > oneDayInMs) {
                return false;
            }
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-brand-dark text-gray-100">
            <Navbar />
            <Sidebar />

            <main className="pl-64 pt-16 min-h-screen w-full p-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Universal Scheduler Form */}
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                Portal Console
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">Initialize or track partner slots</p>
                        </div>

                        {message.text && (
                            <div className={`text-sm p-3 rounded-xl border text-center ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleCreateMeeting} className="space-y-4 bg-white/[0.02] border border-white/[0.06] p-6 rounded-2xl backdrop-blur-xl">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Meeting Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                                    placeholder="Strategic Evaluation Sync"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                    Invitee Email ({user?.role === 'Investor' ? 'Entrepreneur Email' : 'Investor Email'})
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={inviteeEmail}
                                    onChange={(e) => setInviteeEmail(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                                    placeholder="partner@nexus.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg active:scale-[0.99] transition-all cursor-pointer text-sm"
                            >
                                Schedule Handshake
                            </button>
                        </form>
                    </div>

                    {/* Right Side: Timeline ledger grid */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-gray-200">Timeline Ledger</h2>
                            <p className="text-sm text-gray-400 mt-1">Live active/historical synchronization ledger (Cleaned daily)</p>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="h-20 bg-white/[0.02] border border-white/[0.05] rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : activeAndRecentMeetings.length === 0 ? (
                            <div className="bg-white/[0.01] border border-white/[0.05] p-8 rounded-xl text-center text-gray-500 text-sm italic">
                                No recent or active slots configured in your timeline.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                                {activeAndRecentMeetings.map((meeting) => {
                                    const status = getMeetingStatus(meeting, meeting.startTime, meeting.endTime);
                                    const isOrganizer = meeting.entrepreneur?._id === user?._id || meeting.entrepreneur === user?._id;

                                    return (
                                        <div key={meeting._id} className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/[0.1] transition-all">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-sm font-bold text-gray-200">{meeting.title}</h4>
                                                    <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded border ${status.style}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400">
                                                    Host: <span className="text-gray-300">{meeting.entrepreneur?.name || 'You'}</span> | Invitee: <span className="text-gray-300">{meeting.investor?.name || 'Partner'}</span>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 self-end sm:self-auto">
                                                <span className="text-xs font-mono text-gray-400 mr-2">
                                                    {new Date(meeting.startTime).toLocaleDateString()} {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>

                                                {/* CONDITIONAL ACTION BUTTONS */}
                                                {!status.isFinished && !status.canJoin && (
                                                    isOrganizer ? (
                                                        <button
                                                            onClick={() => handleUpdateStatus(meeting._id, 'Cancelled')}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUpdateStatus(meeting._id, 'Rejected')}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                                                        >
                                                            Reject
                                                        </button>
                                                    )
                                                )}

                                                <button
                                                    disabled={!status.canJoin || status.isFinished}
                                                    onClick={() => navigate(`/room/${meeting.roomID || 'test-room'}`)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${status.canJoin && !status.isFinished
                                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 cursor-pointer'
                                                        : 'bg-white/[0.04] text-gray-500 border border-white/[0.05] cursor-not-allowed'
                                                        }`}
                                                >
                                                    Join Call
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Meetings;
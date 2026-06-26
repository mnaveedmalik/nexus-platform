// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Entrepreneur');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            /* Polymorphic Role Sanitization: Sending variants matching both capitalized 
              and strict lowercase models so that the validation controller handles the exact key accurately.
            */
            const payload = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                role: role,                            // Exact State representation ('Entrepreneur' / 'Investor')
                roleType: role.toLowerCase(),          // Lowercase version variation fallback
                accountType: role.toLowerCase()       // Alternative schema model property variation fallback
            };

            console.log("Dispatching sanitized registration payload pipeline:", payload);

            await API.post('/auth/register', payload);
            navigate('/login');
        } catch (err) {
            console.error("Registration submission fail tracing:", err.response?.data);
            setError(err.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-brand-dark p-6 relative overflow-hidden">
            {/* Ambient Background Glow Elements */}
            <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-1/4 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:border-white/[0.1]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Create Account
                    </h1>
                    <p className="text-sm text-gray-400">Join the platform ecosystem today</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Select Account Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('Entrepreneur')}
                                className={`py-3 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${role === 'Entrepreneur'
                                    ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                                    : 'bg-white/[0.02] border-white/[0.08] text-gray-400 hover:bg-white/[0.04]'
                                    }`}
                            >
                                Entrepreneur
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('Investor')}
                                className={`py-3 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${role === 'Investor'
                                    ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                                    : 'bg-white/[0.02] border-white/[0.08] text-gray-400 hover:bg-white/[0.04]'
                                    }`}
                            >
                                Investor
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-blue-700 disabled:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-600/10 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Register Account'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:underline font-medium">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
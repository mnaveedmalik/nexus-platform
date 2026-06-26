// src/pages/Room.jsx
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import useAxios from '../hooks/useAxios';

const Room = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const axiosInstance = useAxios();

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socketRef = useRef(null);
    const peerRef = useRef(null);
    const localStreamRef = useRef(null);

    const [micActive, setMicActive] = useState(true);
    const [camActive, setCamActive] = useState(true);
    const [callStatus, setCallStatus] = useState('Initializing media assets...');
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);

    const iceServersConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    const [meetingDatabaseId, setMeetingDatabaseId] = useState(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:5000');

        const syncMeetingReference = async () => {
            try {
                const res = await axiosInstance.get('/meetings');
                const matchingMeeting = res.data.find(m => m.roomID === roomId || m._id === roomId);
                if (matchingMeeting) {
                    setMeetingDatabaseId(matchingMeeting._id);
                }
            } catch (err) {
                console.error("Failed to map room to database context:", err);
            }
        };
        syncMeetingReference();

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setCallStatus('Camera active. Syncing signal pipeline...');
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                socketRef.current.emit('join-room', { roomId });

                socketRef.current.on('user-connected', async (partnerSocketId) => {
                    setCallStatus('Connecting to peer call channel...');
                    initiatePeerConnection(partnerSocketId, stream);
                    const offer = await peerRef.current.createOffer();
                    await peerRef.current.setLocalDescription(offer);
                    socketRef.current.emit('offer', { sdp: peerRef.current.localDescription, target: partnerSocketId });
                });

                socketRef.current.on('offer', async (data) => {
                    setCallStatus('Incoming link established...');
                    initiatePeerConnection(data.sender, stream);
                    await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    const answer = await peerRef.current.createAnswer();
                    await peerRef.current.setLocalDescription(answer);
                    socketRef.current.emit('answer', { sdp: peerRef.current.localDescription, target: data.sender });
                });

                socketRef.current.on('answer', async (data) => {
                    await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    setCallStatus('Call Secure and Live Now');
                });

                socketRef.current.on('ice-candidate', async (data) => {
                    if (data.candidate && peerRef.current) {
                        try {
                            await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                        } catch (e) { console.error(e); }
                    }
                });

                socketRef.current.on('user-disconnected', () => {
                    setCallStatus('Partner left the room.');
                    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
                });
            })
            .catch((err) => {
                setCallStatus('Hardware access denied.');
            });

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            peerRef.current?.close();
            socketRef.current?.disconnect();
        };
    }, [roomId]);

    const initiatePeerConnection = (targetSocketId, stream) => {
        peerRef.current = new RTCPeerConnection(iceServersConfig);
        stream.getTracks().forEach(track => peerRef.current.addTrack(track, stream));
        peerRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('ice-candidate', { candidate: event.candidate, target: targetSocketId });
            }
        };
        peerRef.current.ontrack = (event) => {
            setCallStatus('Call Connected & Live');
            if (remoteVideoRef.current) { remoteVideoRef.current.srcObject = event.streams[0]; }
        };
    };

    // Updates status strictly to 'Completed' now that the backend enum supports it!
    const handleFinalizeMeeting = async () => {
        const targetId = meetingDatabaseId || roomId;
        try {
            if (targetId) {
                const token = localStorage.getItem('token');
                setCallStatus('Finalizing session data...');

                await axiosInstance({
                    method: 'PUT',
                    url: `/meetings/${targetId}`,
                    data: { status: 'Completed' },
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            setTimeout(() => {
                navigate('/meetings');
            }, 300);
        } catch (error) {
            console.error("Pipeline failure in updating status:", error.response?.data || error);
            navigate('/meetings');
        }
    };

    const toggleMic = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) { audioTrack.enabled = !audioTrack.enabled; setMicActive(audioTrack.enabled); }
        }
    };

    const toggleCam = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) { videoTrack.enabled = !videoTrack.enabled; setCamActive(videoTrack.enabled); }
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] text-gray-100 p-6 flex flex-col justify-between relative overflow-hidden">
            {/* Header */}
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between z-10">
                <div>
                    <h2 className="text-lg font-bold tracking-wider text-gray-200 uppercase bg-white/[0.02] border border-white/[0.05] px-4 py-1.5 rounded-xl backdrop-blur-md">
                        Room Token: <span className="text-blue-400 font-mono">{roomId}</span>
                    </h2>
                </div>
                <div className="px-4 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 font-medium text-xs tracking-wide">
                    {callStatus}
                </div>
            </div>

            {/* Video Streams */}
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 my-auto z-10">
                <div className="relative aspect-video bg-white/[0.01] border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md border border-white/[0.08] px-3 py-1 rounded-lg text-xs font-semibold text-gray-300">
                        You (Local Output Feed)
                    </div>
                </div>

                <div className="relative aspect-video bg-white/[0.01] border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md flex items-center justify-center">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md border border-white/[0.08] px-3 py-1 rounded-lg text-xs font-semibold text-gray-300">
                        Partner Output Feed
                    </div>
                    {!remoteVideoRef.current?.srcObject && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0F19]/90 text-gray-500 space-y-2">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs tracking-wider">Awaiting remote network ingestion feed...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Control Dock */}
            <div className="w-full max-w-md mx-auto bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl px-6 py-4 rounded-2xl flex items-center justify-center gap-6 shadow-2xl z-10">
                <button onClick={toggleMic} className={`p-3.5 rounded-xl transition-all border cursor-pointer ${micActive ? 'bg-white/[0.03] border-white/[0.08] text-gray-300 hover:bg-white/[0.08]' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {micActive ? 'Mute Mic' : 'Unmute Mic'}
                </button>
                <button onClick={toggleCam} className={`p-3.5 rounded-xl transition-all border cursor-pointer ${camActive ? 'bg-white/[0.03] border-white/[0.08] text-gray-300 hover:bg-white/[0.08]' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {camActive ? 'Stop Video' : 'Start Video'}
                </button>
                <button onClick={() => setShowDisconnectModal(true)} className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-600/10 transition-all cursor-pointer">
                    Disconnect
                </button>
            </div>

            {/* CONFIRMATION MODAL POPUP */}
            {showDisconnectModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111625] border border-white/[0.08] p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="text-lg font-bold text-gray-100">Disconnect Session</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Is your conversation completely finished, or do you want to leave the room temporarily (keeping the call live for internet drops)?
                        </p>
                        <div className="flex flex-col gap-2 pt-2">
                            <button
                                onClick={handleFinalizeMeeting}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                            >
                                Yes, Meeting is Finished
                            </button>
                            <button
                                onClick={() => navigate('/meetings')}
                                className="w-full bg-white/[0.03] border border-white/[0.08] text-gray-300 hover:bg-white/[0.06] font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                            >
                                Just Leave Room Temporarily
                            </button>
                            <button
                                onClick={() => setShowDisconnectModal(false)}
                                className="w-full text-gray-500 hover:text-gray-400 text-xs font-medium pt-1 cursor-pointer"
                            >
                                Cancel & Stay inside Call
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Room;
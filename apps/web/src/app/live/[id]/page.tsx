"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import Image from "next/image";
import { 
  Mic2, MicOff, Video, VideoOff, Users, Heart, MessageCircle, 
  Share2, Flag, Power, Settings, AlertCircle, ShieldCheck, BookOpen, Target 
} from "lucide-react";
import { API_URL, SOCKET_URL } from "@/lib/config";

const REACTIONS = [
  { icon: "♥️", label: "Tiako", bg: "hover:bg-secondary/5" },
  { icon: "👏", label: "Teheka", bg: "hover:bg-yellow-500/5" },
  { icon: "🤔", label: "Saintsaino", bg: "hover:bg-blue-500/5" },
  { icon: "🎯", label: "Latsaka", bg: "hover:bg-primary/5" },
];

export default function LiveAuditorium() {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeReactions, setActiveReactions] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<{ [key: string]: RTCPeerConnection }>({});
  const thumbnailTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thumbnailKickoffRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [mediaErrorMessage, setMediaErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const fetchSession = async () => {
      try {
        const res = await fetch(`${API_URL}/sessions/${id}`);
        const data = await res.json();
        setSession(data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur session:", err);
      }
    };
    fetchSession();
  }, [id]);

  useEffect(() => {
    if (!session || !id) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit("join-room", id);

    socket.on("new-reaction", (reac) => {
      setActiveReactions(prev => [...prev, reac]);
      setTimeout(() => setActiveReactions(prev => prev.filter(r => r.id !== reac.id)), 2000);
    });

    socket.on("new-message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    const isParticipant = Boolean(
      user?.id && (
        user.id === session.speakerId ||
        session.participants?.some((participant: any) => participant.id === user.id)
      )
    );
    if (isParticipant) {
      socket.on("user-joined", (userId) => initPeerConnection(userId, true));
    }

    socket.on("signal", async ({ signal, from }) => {
      if (!peersRef.current[from]) initPeerConnection(from, false);
      const pc = peersRef.current[from];
      if (signal.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("signal", { roomId: id, signal: pc.localDescription, to: from });
      } else if (signal.type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
      } else if (signal.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(signal));
      }
    });

    return () => {
      socket.disconnect();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [session, user, id]);

  const initPeerConnection = async (userId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peersRef.current[userId] = pc;
    pc.onicecandidate = (e) => e.candidate && socketRef.current?.emit("signal", { roomId: id, signal: e.candidate, to: userId });
    pc.ontrack = (e) => {
      if (!session?.participants?.some((participant: any) => participant.id === user?.id) && user?.id !== session?.speakerId && videoRef.current) videoRef.current.srcObject = e.streams[0];
    };
    if (streamRef.current) streamRef.current.getTracks().forEach(t => pc.addTrack(t, streamRef.current!));
    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit("signal", { roomId: id, signal: pc.localDescription, to: userId });
    }
  };

  useEffect(() => {
    const isParticipant = Boolean(
      user?.id && (
        user.id === session?.speakerId ||
        session?.participants?.some((participant: any) => participant.id === user.id)
      )
    );
    if (isParticipant && !loading) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => setMediaErrorMessage("Matériel non détecté."));
    }
  }, [user, session, loading]);

  useEffect(() => {
    const isParticipant = Boolean(
      user?.id && (
        user.id === session?.speakerId ||
        session?.participants?.some((participant: any) => participant.id === user.id)
      )
    );

    if (!isParticipant || loading || !session || !id) return;

    const captureAndUploadThumbnail = async () => {
      const video = videoRef.current;
      const token = localStorage.getItem("token");
      if (!video || !token || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

      const maxWidth = 960;
      const scale = Math.min(1, maxWidth / video.videoWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const context = canvas.getContext("2d");
      if (!context) return;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const liveThumbnail = canvas.toDataURL("image/jpeg", 0.72);

      try {
        await fetch(`${API_URL}/sessions/${id}/thumbnail`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ liveThumbnail }),
        });
      } catch (error) {
        console.error("Erreur miniature live:", error);
      }
    };

    thumbnailKickoffRef.current = setTimeout(captureAndUploadThumbnail, 4000);
    thumbnailTimerRef.current = setInterval(captureAndUploadThumbnail, 5 * 60 * 1000);

    return () => {
      if (thumbnailKickoffRef.current) clearTimeout(thumbnailKickoffRef.current);
      if (thumbnailTimerRef.current) clearInterval(thumbnailTimerRef.current);
    };
  }, [id, loading, session, user]);

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    socketRef.current?.emit("send-message", {
      roomId: id,
      message: inputValue,
      user: user?.name || "Mpanaraka",
      userPhoto: user?.photo || null,
    });
    setInputValue("");
  };

  if (loading) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-primary gap-4">
      <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Andrasana...</p>
    </div>
  );

  const isOwner = Boolean(
    user?.id && (
      user.id === session?.speakerId ||
      session?.participants?.some((participant: any) => participant.id === user.id)
    )
  );
  const liveParticipants = session?.participants?.length
    ? session.participants
    : session?.speaker
      ? [{ id: session.speakerId, name: session.speaker.name, photo: session.speaker.photo, participantRoleLabel: session.participantRoleLabel }]
      : [];

  return (
    <div className="min-h-screen bg-surface font-sans pt-16 lg:pt-20">
      
      {/* Main Container: Stacked on Mobile, Row on Desktop */}
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row p-2 lg:p-6 gap-4 lg:gap-8">
        
        {/* Left Column: Video & Details */}
        <div className="w-full flex-grow flex flex-col gap-4 lg:gap-6 order-1">
          
          {/* Stage Wrapper */}
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col">
            
            {/* Video Area */}
            <div className="aspect-video relative overflow-hidden bg-neutral-900 flex items-center justify-center">
              
              {/* Overlays */}
              <div className="absolute top-2 lg:top-4 left-2 lg:left-4 right-2 lg:right-4 z-20 flex justify-between items-start pointer-events-none">
                <div className="flex items-center gap-1 lg:gap-2 pointer-events-auto">
                  <div className="bg-secondary text-white px-2 lg:px-3 py-1 lg:py-1.5 rounded-md lg:rounded-lg flex items-center gap-1.5 lg:gap-2 text-[8px] lg:text-[9px] font-black uppercase tracking-widest shadow-lg">
                    <div className="w-1 lg:w-1.5 h-1 lg:h-1.5 bg-white rounded-full animate-pulse"></div> LIVE
                  </div>
                  <div className="bg-white/90 backdrop-blur px-2 lg:px-3 py-1 lg:py-1.5 rounded-md lg:rounded-lg flex items-center gap-1.5 lg:gap-2 text-[8px] lg:text-[9px] font-black uppercase tracking-widest border border-neutral-100 text-neutral-500 shadow-sm">
                    <Users size={10} className="lg:w-3 lg:h-3 text-primary" /> 1.2k
                  </div>
                </div>

                {isOwner && (
                  <div className="flex items-center gap-1.5 lg:gap-2 pointer-events-auto">
                    <button onClick={() => {
                      if (streamRef.current) {
                        const t = streamRef.current.getAudioTracks()[0];
                        t.enabled = !t.enabled;
                        setIsMicOn(t.enabled);
                      }
                    }} className={`w-8 lg:w-9 h-8 lg:h-9 rounded-md lg:rounded-lg flex items-center justify-center transition-all border shadow-lg backdrop-blur ${isMicOn ? 'bg-white/90 border-neutral-100 text-primary' : 'bg-red-500 border-red-600 text-white'}`}>
                      {isMicOn ? <Mic2 size={14} className="lg:w-4 lg:h-4" /> : <MicOff size={14} className="lg:w-4 lg:h-4" />}
                    </button>
                    <button onClick={() => {
                      if (streamRef.current) {
                        const t = streamRef.current.getVideoTracks()[0];
                        t.enabled = !t.enabled;
                        setIsCameraOn(t.enabled);
                      }
                    }} className={`w-8 lg:w-9 h-8 lg:h-9 rounded-md lg:rounded-lg flex items-center justify-center transition-all border shadow-lg backdrop-blur ${isCameraOn ? 'bg-white/90 border-neutral-100 text-primary' : 'bg-red-500 border-red-600 text-white'}`}>
                      {isCameraOn ? <Video size={14} className="lg:w-4 lg:h-4" /> : <VideoOff size={14} className="lg:w-4 lg:h-4" />}
                    </button>
                    <button onClick={() => router.push("/")} className="bg-secondary text-white w-8 lg:w-9 h-8 lg:h-9 rounded-md lg:rounded-lg flex items-center justify-center shadow-lg border border-secondary/50">
                      <Power size={14} className="lg:w-4 lg:h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* VIDEO PLAYER */}
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" style={{ transform: isOwner ? 'scaleX(-1)' : 'none' }} />

              {(!isCameraOn || mediaErrorMessage) && (
                <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                  <div className="relative w-24 lg:w-32 h-24 lg:h-32 rounded-2xl lg:rounded-[2rem] bg-white border border-neutral-100 flex flex-col items-center justify-center text-primary shadow-2xl">
                    <VideoOff size={24} className="lg:w-8 lg:h-8 text-neutral-300" />
                    <span className="text-[7px] lg:text-[8px] font-black uppercase mt-2">{mediaErrorMessage || "Tapaka"}</span>
                  </div>
                </div>
              )}

              {/* Reactions Layer */}
              <div className="absolute inset-0 pointer-events-none z-40">
                {activeReactions.map(reac => (
                  <div key={reac.id} className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float-up text-2xl lg:text-3xl" style={{ left: `${48 + Math.random() * 4}%` }}>
                    {reac.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Info Bar */}
            <div className="bg-white border-t border-neutral-50 p-3 lg:p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="flex -space-x-2">
                  {liveParticipants.slice(0, 2).map((participant: any, index: number) => (
                    <div key={participant.id || index} className="w-10 lg:w-12 h-10 lg:h-12 rounded-lg lg:rounded-xl bg-primary border-2 border-white flex items-center justify-center text-white text-base lg:text-lg font-black shadow-md uppercase overflow-hidden">
                      {participant.photo ? (
                        <Image src={participant.photo} alt={participant.name || "Mpikabary"} width={48} height={48} className="w-full h-full object-cover" />
                      ) : (
                        participant.name?.[0] || "M"
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <h1 className="text-base lg:text-lg font-black tracking-tight text-neutral-900 leading-tight">{session.title}</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] lg:text-[9px] text-primary font-black uppercase tracking-widest">
                      {liveParticipants.map((participant: any) => participant.name).filter(Boolean).join(" · ") || session.speaker.name}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-200"></span>
                    <span className="text-[8px] lg:text-[9px] text-neutral-400 font-bold uppercase tracking-widest">{session.context.type}</span>
                  </div>
                </div>
              </div>
              <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 font-black text-[9px] uppercase tracking-widest text-neutral-600 border border-neutral-100">
                <Share2 size={14} /> Hizara
              </button>
            </div>
          </div>

          {/* Details Section: Stacked on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-white rounded-xl lg:rounded-2xl border border-neutral-100 p-4 lg:p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex items-center gap-2 text-primary text-[8px] lg:text-[9px] font-black uppercase tracking-widest mb-2 lg:mb-4">
                <BookOpen size={14} /> Lohahevitra
              </div>
              <p className="text-base lg:text-lg text-neutral-700 leading-relaxed font-literary italic">"{session.context.description}"</p>
            </div>
            <div className="bg-white rounded-xl lg:rounded-2xl border border-neutral-100 p-4 lg:p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
              <div className="flex items-center gap-2 text-secondary text-[8px] lg:text-[9px] font-black uppercase tracking-widest mb-2 lg:mb-4">
                <Target size={14} /> Fitsipika
              </div>
              <p className="text-xs lg:text-sm text-neutral-500 leading-relaxed font-medium">{session.context.rules || "Haja sy fahaiza-mihaino."}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Chat - Moves below on Mobile */}
        <div className="w-full lg:w-[380px] flex flex-col h-[450px] lg:h-auto order-2">
          <div className="bg-white rounded-xl lg:rounded-2xl border border-neutral-100 flex flex-col h-full overflow-hidden shadow-sm">
            
            {/* Chat Header */}
            <div className="p-3 lg:p-4 border-b border-neutral-100 bg-neutral-50/50">
               <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20">
                <MessageCircle size={14} className="inline mr-2" /> Tafa sy Resaka
              </div>
            </div>

            {/* Input & Reactions TOP */}
            <div className="p-3 lg:p-4 space-y-3 lg:space-y-4 border-b border-neutral-100 bg-neutral-50/10">
              <div className="flex justify-between items-center px-1">
                {REACTIONS.map((reac) => (
                  <button key={reac.label} onClick={() => socketRef.current?.emit("send-reaction", { roomId: id, icon: reac.icon })} className="w-8 lg:w-9 h-8 lg:h-9 rounded-md lg:rounded-lg bg-white border border-neutral-100 flex items-center justify-center text-base lg:text-lg transition-all hover:scale-110 active:scale-95 shadow-sm">
                    {reac.icon}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 bg-white p-1 lg:p-1.5 rounded-lg lg:rounded-xl border border-neutral-100 shadow-sm">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder=" Manorata hafatra..." className="flex-grow bg-transparent border-none px-2 lg:px-3 py-1.5 lg:py-2 text-xs focus:outline-none placeholder:text-neutral-400" />
                <button onClick={sendMessage} className="bg-primary text-white p-2 lg:p-2.5 rounded-md lg:rounded-lg shadow-md">
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>

            {/* Real Messages List */}
            <div className="flex-grow overflow-y-auto p-3 lg:p-4 space-y-4 scrollbar-hide flex flex-col-reverse">
              {[...messages].reverse().map((m, i) => (
                <div key={i} className="flex gap-3 animate-in slide-in-from-bottom-2">
                  <div className="w-7 lg:w-8 h-7 lg:h-8 rounded-lg bg-primary/5 border border-primary/10 shrink-0 flex items-center justify-center text-[8px] lg:text-[10px] text-primary font-black uppercase overflow-hidden">
                    {m.userPhoto ? (
                      <Image src={m.userPhoto} alt={m.user || "User"} width={32} height={32} className="w-full h-full object-cover" />
                    ) : (
                      m.user[0]
                    )}
                  </div>
                  <div className="space-y-1 flex-grow">
                    <span className="text-[8px] lg:text-[9px] font-black text-neutral-900 uppercase tracking-widest">{m.user}</span>
                    <p className="text-[11px] lg:text-xs text-neutral-600 bg-neutral-50/50 p-2 lg:p-3 rounded-xl rounded-tl-none border border-neutral-100">
                      {m.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

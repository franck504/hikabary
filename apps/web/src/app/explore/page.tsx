"use client";

import React, { useEffect, useState } from "react";
import { 
  Radio, 
  Search, 
  Clock, 
  Users, 
  ChevronRight,
  Filter,
  PlayCircle
} from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import Image from "next/image";

export default function ExploreLivePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveSessions = async () => {
      try {
        const res = await fetch(`${API_URL}/sessions/active`);
        const data = await res.json();
        setSessions(data);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveSessions();
  }, []);

  return (
    <div className="min-h-screen bg-surface pt-32 pb-20">
      <div className="container mx-auto px-6 lg:px-20">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-3 bg-secondary/10 text-secondary px-4 py-2 rounded-2xl mb-6 border border-secondary/10 animate-pulse">
            <Radio size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">Mivantana izao</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-neutral-900 uppercase tracking-tighter leading-none mb-6">
            Fikarohana
          </h1>
          <p className="text-lg text-neutral-500 font-medium leading-relaxed">
            Midira mivantana amin'ireo fifanakalozana kabary mandeha amin'izao fotoana izao.
          </p>
        </div>

        {/* Live Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-neutral-100 rounded-3xl"></div>
            ))}
          </div>
        ) : sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {sessions.map((session) => (
              <Link 
                key={session.id} 
                href={`/live/${session.id}`} 
                className="pro-card group h-[450px] relative overflow-hidden"
              >
                {/* Session Thumbnail / Background */}
                <div className="absolute inset-0 bg-neutral-950">
                  {/* On pourrait mettre l'image de l'orateur ici */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10"></div>
                </div>

                <div className="absolute top-6 left-6 z-20">
                  <div className="bg-secondary text-white inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black shadow-xl">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                    MIVANTANA
                  </div>
                </div>

                <div className="absolute bottom-10 left-10 right-10 z-20">
                  <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-3">
                    <Clock size={12} />
                    Efa mandeha 15mn
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {session.title || "Lohahevitra tsy fantatra"}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white font-black text-sm">
                        {session.speaker?.photo ? (
                          <Image
                            src={session.speaker.photo}
                            alt={session.speaker.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          session.speaker.name[0]
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">Mpikabary</span>
                        <span className="text-xs font-black text-white">{session.speaker.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/50 text-[10px] font-black">
                      <Users size={14} />
                      1.2k
                    </div>
                  </div>
                </div>
                
                {/* Play Icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                    <PlayCircle size={48} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="pro-card p-32 flex flex-col items-center justify-center text-center bg-white/50 border-dashed border-4 border-neutral-100">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-neutral-200 mb-6 shadow-sm">
              <Radio size={32} />
            </div>
            <h3 className="text-2xl font-black text-neutral-300 uppercase tracking-widest">Tsy misy live mandeha</h3>
            <p className="text-neutral-400 text-sm mt-2 font-medium">Hahazo fampandrenesana ianao raha vao misy manomboka.</p>
          </div>
        )}

        {/* Categories Quick Filter */}
        <div className="mt-24">
          <header className="mb-12 flex items-center justify-between">
            <h4 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter">Sokajy malaza</h4>
            <Link href="/library" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Hijery rehetra</Link>
          </header>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {["Fanambadiana", "Famadihana", "Fandroana", "Tsodrano", "Fiarahamonina", "Hafa"].map(cat => (
              <button key={cat} className="pro-card p-6 flex flex-col items-center gap-4 hover:border-primary/40 transition-all group bg-white">
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                  <Filter size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-800">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

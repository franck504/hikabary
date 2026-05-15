"use client";

import React, { useEffect, useState } from "react";
import { ContextCard } from "@/components/ContextCard";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Radio, 
  LayoutGrid, 
  Plus, 
  Globe,
  Mic2,
  ChevronRight,
  Users
} from "lucide-react";
import { API_URL } from "@/lib/config";

const HERO_SLIDES = [
  {
    title: "Fifaninanana",
    description: "Ny adin-kabary toy ny dontany sy kapotandroka"
  },
  {
    title: "Teny",
    description: "Miteny ny iray toa novankonina ; miteny ny iray toa nampalesina"
  },
  {
    title: "Kabary",
    description: "Zanak'omby tsy ampianarin-domano, zanak'andriana tsy ampianari-mikabary"
  }
];

export default function Home() {
  const [contexts, setContexts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);

    const fetchData = async () => {
      try {
        const [ctxRes, sessRes] = await Promise.all([
          fetch(`${API_URL}/kabary/contexts`),
          fetch(`${API_URL}/sessions/active`)
        ]);
        const [ctxData, sessData] = await Promise.all([
          ctxRes.ok ? ctxRes.json() : Promise.resolve([]),
          sessRes.ok ? sessRes.json() : Promise.resolve([]),
        ]);
        setContexts(ctxData);
        setSessions(sessData);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => clearInterval(slideInterval);
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none bg-fixed opacity-[0.12]"
        style={{
          backgroundImage: "url('/hero_pattern.png')",
          backgroundSize: "650px",
          backgroundPosition: "center",
        }}
      />
      
      {/* --- HERO SECTION --- */}
      {/* pt-36 pour plus de respiration, pb-12 pour l'équilibre */}
      <section className="relative z-10 pt-24 pb-12 lg:pt-28 lg:pb-0 overflow-hidden flex items-center min-h-[75vh]">
        
        <div className="container mx-auto px-10 lg:px-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] items-center gap-12 lg:gap-20">
            
            {/* Left Content - Dynamic Text */}
            <div className="w-full text-center lg:text-left flex flex-col justify-center">
              {/* Badge avec marge optimisée (mb-8 = 32px) */}
              <div className="inline-flex items-center gap-3 bg-white shadow-sm text-primary px-4 py-2 rounded-2xl mb-8 border border-neutral-100 mx-auto lg:mx-0">
                <span className="text-[10px] font-black uppercase tracking-[0.25em]">🇲🇬 sehatry ny kabary Malagasy</span>
              </div>
              
              {/* Zone Titre avec hauteur fixe pour éviter le saut de layout */}
              <div className="relative overflow-hidden h-[100px] md:h-[140px] mb-6">
                {HERO_SLIDES.map((slide, index) => (
                  <div 
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 transform ${
                      index === currentSlide 
                        ? "opacity-100 translate-y-0" 
                        : "opacity-0 translate-y-8 pointer-events-none"
                    }`}
                  >
                    <h1 className="text-5xl md:text-6xl lg:text-6xl font-black leading-none text-neutral-900 tracking-tighter uppercase">
                      {slide.title}
                    </h1>
                  </div>
                ))}
              </div>
              
              {/* Zone Proverbe avec marge optimisée (mb-12 = 48px) */}
              <div className="relative h-[80px] mb-12">
                {HERO_SLIDES.map((slide, index) => (
                  <div 
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 delay-100 ${
                      index === currentSlide 
                        ? "opacity-100 scale-100" 
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    <p className="text-xl md:text-2xl lg:text-3xl text-primary font-black font-literary italic tracking-tight leading-relaxed max-w-2xl">
                      "{slide.description}"
                    </p>
                  </div>
                ))}
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-wrap gap-5 justify-center lg:justify-start">
                <Link href="/register" className="pro-button-primary px-10 py-5 text-lg shadow-2xl shadow-primary/20">
                  Hanomboka <ArrowRight size={20} />
                </Link>
                <Link href="/explore" className="pro-button-outline px-10 py-5 text-lg border-neutral-200 text-neutral-800 hover:border-primary">
                  Zahao ny hetsika
                </Link>
              </div>
            </div>

            {/* Right Image (Cut-out Mpikabary) */}
            <div className="relative h-[400px] lg:h-[600px] flex items-end justify-center lg:justify-end group -translate-y-4">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl -z-10"></div>
              
              <div className="relative w-full h-full lg:w-[120%] lg:-mr-[10%]">
                <Image 
                  src="/mpikabary_no_bg.png" 
                  alt="Mpikabary" 
                  fill
                  style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
                  className="drop-shadow-[0_20px_60px_rgba(0,0,0,0.12)] group-hover:scale-[1.02] transition-transform duration-700"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- LIVE SECTION --- */}
      <section className="py-24 bg-transparent relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-16 border-b border-neutral-100 pb-10">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-black text-neutral-900 uppercase tracking-tighter leading-none mb-3">Kabary Mivantana</h2>
              <p className="text-neutral-400 font-bold text-xs tracking-widest uppercase">Fifanakalozana mivantana amin'izao fotoana izao</p>
            </div>
            <Link href="/explore" className="pro-button-outline px-6 py-2.5 text-xs">
              HIJERY NY REHETRA <ChevronRight size={16} />
            </Link>
          </div>

          {sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {sessions.map((session: any) => (
                <Link 
                  key={session.id} 
                  href={`/live/${session.id}`} 
                  className="pro-card group h-[400px] relative overflow-hidden bg-neutral-900 border-none hover:shadow-2xl hover:shadow-primary/20 transition-all duration-700"
                >
                  {/* Image Placeholder with Gradient Overlay */}
                  <div className="absolute inset-0 bg-neutral-800 transition-transform duration-1000 group-hover:scale-110">
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10"></div>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 z-20 p-8 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="bg-secondary text-white inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black shadow-xl backdrop-blur-md border border-white/10">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]"></div>
                        MIVANTANA
                      </div>
                      <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-white/70 text-[9px] font-black uppercase tracking-widest border border-white/5">
                        <Users size={12} className="inline mr-1.5" />
                        1.2k
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                        <span className="w-6 h-[2px] bg-primary"></span>
                        {session.context?.type || "Kabary"}
                      </div>
                      <h3 className="text-white text-3xl font-black mb-6 line-clamp-2 leading-tight tracking-tighter group-hover:text-primary transition-colors duration-500">
                        {session.title}
                      </h3>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white font-black text-sm group-hover:bg-primary transition-all duration-500">
                            {session.speaker?.photo ? (
                              <Image
                                src={session.speaker.photo}
                                alt={session.speaker.name}
                                width={44}
                                height={44}
                                className="w-full h-full object-cover rounded-2xl"
                              />
                            ) : (
                              session.speaker.name[0]
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">Mpikabary</span>
                            <span className="text-sm font-black text-white group-hover:translate-x-1 transition-transform duration-500">{session.speaker.name}</span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-500 shadow-xl">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="pro-card p-24 flex flex-col items-center justify-center text-center bg-neutral-50/40 border-dashed border-4 border-neutral-100">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-neutral-200 mb-4 shadow-sm">
                <Mic2 size={28} />
              </div>
              <h3 className="text-xl font-black text-neutral-200 uppercase tracking-widest">Tsy misy live mandeha</h3>
            </div>
          )}
        </div>
      </section>

      {/* --- CONTEXTS SECTION --- */}
      <section className="py-24 bg-transparent relative z-10">
        <div className="container mx-auto px-6">
          <header className="mb-16 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 uppercase tracking-tighter leading-none mb-3">Lohahevitra</h2>
            <p className="text-neutral-400 font-bold text-xs tracking-widest uppercase">Zahao ireo sokajy samihafa</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
            {contexts.map((context: any) => (
              <ContextCard key={context.id} context={context} />
            ))}
            
            <Link href="/institution/create" className="pro-card p-10 flex flex-col items-center justify-center text-center gap-6 border-dashed border-2 border-neutral-200 group hover:border-primary/40 hover:bg-white transition-all bg-white/50">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-neutral-300 group-hover:bg-primary group-hover:text-white shadow-sm transition-all group-hover:scale-110">
                <Plus size={28} />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-neutral-800 font-black uppercase text-xs">Hampiditra hevitra</h4>
                <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Sekoly / Mpikabary</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-neutral-950 text-white pt-24 pb-12 mt-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50"></div>
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <Link href="/" className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                <Mic2 size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">FIHAONANKABARY</span>
            </Link>
            <p className="text-neutral-500 max-w-sm text-base leading-relaxed">
              Ny fombantsika, ny hambom-pontsika. Ho an'ny kabary sy ny kolontsaina Malagasy.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4 text-neutral-600 text-[10px] font-black uppercase tracking-[0.3em]">
            <div className="flex gap-8">
              <Link href="#" className="hover:text-white transition-colors">Tantara</Link>
              <Link href="#" className="hover:text-white transition-colors">Hetsika</Link>
              <Link href="#" className="hover:text-white transition-colors">Hifandray</Link>
            </div>
            <span>© 2026 VOATANA NY ZO REHETRA.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

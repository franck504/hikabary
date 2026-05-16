"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Filter,
  Radio,
  Search,
} from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import { LiveSessionCard } from "@/components/LiveSessionCard";

type SessionMode = "CONTINUOUS_LIVE" | "ASYNCHRONOUS_LIVE";

type LiveSession = {
  id: string;
  title?: string | null;
  status: string;
  participantRoleLabel?: string | null;
  createdAt: string;
  liveThumbnail?: string | null;
  context?: {
    id: string;
    title: string;
    type: string;
    image?: string | null;
    description?: string | null;
    sessionMode?: SessionMode | null;
  } | null;
  speaker?: {
    id: string;
    name: string;
    role: string;
    photo?: string | null;
  } | null;
  participants?: {
    id?: string | null;
    name?: string | null;
    photo?: string | null;
    participantRoleLabel?: string | null;
  }[];
};

export default function ExploreLivePage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("Rehetra");

  useEffect(() => {
    const fetchLiveSessions = async () => {
      try {
        const res = await fetch(`${API_URL}/sessions/active`);
        const data = await res.json();
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveSessions();
  }, []);

  const types = useMemo(() => {
    const values = sessions.map((session) => session.context?.type).filter(Boolean) as string[];
    return ["Rehetra", ...Array.from(new Set(values))];
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sessions.filter((session) => {
      const context = session.context;
      const matchesType = activeType === "Rehetra" || context?.type === activeType;
      const searchable = [
        session.title,
        context?.title,
        context?.description,
        context?.type,
        session.participantRoleLabel,
        session.speaker?.name,
        ...(session.participants?.map((participant) => [
          participant.name,
          participant.participantRoleLabel,
        ]).flat() || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesType && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [activeType, query, sessions]);

  return (
    <div className="min-h-screen bg-surface pt-32 pb-20 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none bg-fixed opacity-[0.12]"
        style={{
          backgroundImage: "url('/hero_pattern.png')",
          backgroundSize: "650px",
          backgroundPosition: "center",
        }}
      />

      <div className="container mx-auto px-6 lg:px-20 relative z-10">
        <header className="mb-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex h-9 items-center gap-2 bg-secondary/10 text-secondary px-3 rounded-xl mb-5 border border-secondary/10">
              <Radio size={15} />
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">Mivantana izao</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 uppercase tracking-tighter leading-none mb-4">
              Fikarohana Live
            </h1>
            <p className="text-base text-neutral-500 font-medium leading-relaxed">
              Jereo ireo kabary mandeha amin&apos;izao fotoana izao, ny andraikitry ny mpandray anjara ary ny fomba fihaonana.
            </p>
          </div>

          <div className="w-full xl:w-[420px] space-y-3">
            <div className="h-12 rounded-xl bg-white border border-neutral-100 px-4 flex items-center gap-3 shadow-sm">
              <Search size={16} className="text-neutral-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Hikaroka lohahevitra na mpikabary..."
                className="w-full bg-transparent border-none outline-none text-sm font-semibold text-neutral-700 placeholder:text-neutral-400"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveType(type)}
                  className={`h-10 rounded-xl border px-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    activeType === type
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-neutral-500 border-neutral-100 hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-[420px] bg-white rounded-2xl border border-neutral-100" />
            ))}
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <LiveSessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="pro-card p-16 md:p-24 flex flex-col items-center justify-center text-center bg-white/75 border-dashed border-4 border-neutral-100">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-neutral-200 mb-6 shadow-sm">
              <Radio size={32} />
            </div>
            <h3 className="text-2xl font-black text-neutral-300 uppercase tracking-widest">Tsy misy live mandeha</h3>
            <p className="text-neutral-400 text-sm mt-2 font-medium">Hiseho eto avy hatrany ireo kabary vao manomboka.</p>
          </div>
        )}

        <section className="mt-20">
          <header className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter">Lohahevitra hafa</h4>
              <p className="text-sm text-neutral-500 font-medium mt-1">Raha mbola tsy misy live, afaka misafidy sujet hidirana ianao.</p>
            </div>
            <Link href="/library" className="h-12 rounded-xl bg-white border border-neutral-100 px-4 inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:border-primary/30 transition-colors">
              <BookOpen size={15} />
              Hijery rehetra
            </Link>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {["Fanambadiana", "Famadihana", "Fandroana", "Tsodrano", "Fiarahamonina", "Hafa"].map((cat) => (
              <Link
                key={cat}
                href="/library"
                className="h-12 rounded-xl bg-white border border-neutral-100 px-4 flex items-center justify-between gap-3 hover:border-primary/30 hover:text-primary transition-colors"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-700">{cat}</span>
                <Filter size={15} className="text-neutral-300" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

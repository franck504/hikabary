"use client";

import React, { useEffect, useState } from "react";
import { ContextCard } from "@/components/ContextCard";
import { StyledDropdown } from "@/components/StyledDropdown";
import { 
  Search, 
  BookOpen, 
  Sparkles,
  Plus
} from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import { UserRole } from "@kabary/shared";

const CATEGORIES = [
  "Rehetra",
  "Fanambadiana",
  "Famadihana",
  "Fandroana",
  "Fiarahamonina",
  "Zavaboary",
  "Hafa"
];

export default function LibraryPage() {
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Rehetra");
  const [user, setUser] = useState<{ role: UserRole } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const fetchContexts = async () => {
      try {
        const res = await fetch(`${API_URL}/kabary/contexts`);
        const data = await res.json();
        setContexts(data);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContexts();
  }, []);

  const filteredContexts = contexts.filter(ctx => {
    const matchesSearch = ctx.title.toLowerCase().includes(search.toLowerCase()) || 
                         ctx.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "Rehetra" || ctx.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const canCreate = user && (
    user.role === UserRole.ADMIN || 
    user.role === UserRole.INSTITUTION || 
    user.role === UserRole.PRO || 
    user.role === UserRole.BEGINNER
  );

  return (
    <div className="min-h-screen bg-surface pt-32 pb-20 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none bg-fixed opacity-[0.1]"
        style={{
          backgroundImage: "url('/hero_pattern.png')",
          backgroundSize: "650px",
          backgroundPosition: "center",
        }}
      />
      <div className="container mx-auto px-6 lg:px-20 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-4 bg-white/80 border border-neutral-100 rounded-xl px-3 py-2">
              <BookOpen size={14} className="text-secondary" />
              Boky fitehirizana
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-neutral-900 uppercase tracking-tighter leading-none mb-6">
              Lohahevitra
            </h1>
            <p className="text-lg text-neutral-500 font-medium leading-relaxed">
              Tadiavo ireo scénario sy contexte kabary rehetra efa namboarina ho anao.
            </p>
          </div>

          {canCreate && (
            <Link href="/institution/create" className="pro-button-primary px-7 py-3.5 shadow-xl shadow-primary/20 animate-in fade-in zoom-in duration-500">
              <Plus size={18} /> Hampiditra vaovao
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white/85 backdrop-blur rounded-xl border border-neutral-100 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-black">Tontaly</div>
            <div className="text-xl font-black text-neutral-900 mt-1">{contexts.length}</div>
          </div>
          <div className="bg-white/85 backdrop-blur rounded-xl border border-neutral-100 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-black">Valiny</div>
            <div className="text-xl font-black text-neutral-900 mt-1">{filteredContexts.length}</div>
          </div>
          <div className="bg-white/85 backdrop-blur rounded-xl border border-neutral-100 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-black">Sokajy</div>
            <div className="text-sm font-black text-neutral-900 mt-2 line-clamp-1">{activeCategory}</div>
          </div>
          <div className="bg-white/85 backdrop-blur rounded-xl border border-neutral-100 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-black">Status</div>
            <div className="text-sm font-black text-primary mt-2 flex items-center gap-2">
              <Sparkles size={14} className="text-secondary" />
              {loading ? "Mampakatra..." : "Vonona"}
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/90 backdrop-blur rounded-2xl border border-neutral-100 p-4 md:p-5 mb-10 sticky top-24 z-20">
          <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex flex-col md:flex-row items-stretch md:items-center flex-grow w-full">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Hikaroka lohahevitra..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-100 rounded-xl py-3 pl-12 pr-4 md:pr-40 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="mt-3 md:mt-0 md:absolute md:right-2 md:top-1/2 md:-translate-y-1/2 w-full md:w-40">
              <div className="hidden md:block absolute inset-y-1 -left-2 w-px bg-neutral-200" />
              <StyledDropdown
                value={activeCategory}
                onChange={setActiveCategory}
                options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                label="Sokajy"
                compact
                align="left"
              />
            </div>
          </div>
        </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-[400px] bg-neutral-100 rounded-2xl"></div>
            ))}
          </div>
        ) : filteredContexts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
            {filteredContexts.map((context) => (
              <ContextCard key={context.id} context={context} />
            ))}
          </div>
        ) : (
          <div className="p-24 flex flex-col items-center justify-center text-center bg-white/75 border border-dashed border-neutral-200 rounded-2xl">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-neutral-200 mb-6 shadow-sm">
              <Search size={32} />
            </div>
            <h3 className="text-2xl font-black text-neutral-300 uppercase tracking-widest">Tsy misy valiny</h3>
            <p className="text-neutral-400 text-sm mt-2 font-medium">Andramo indray amin'ny teny hafa.</p>
          </div>
        )}
      </div>
    </div>
  );
}

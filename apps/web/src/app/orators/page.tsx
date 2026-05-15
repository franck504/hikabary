"use client";

import React, { useEffect, useState } from "react";
import { 
  Search, 
  Users, 
  UserCheck, 
  MapPin, 
  Star,
  ChevronRight,
  MessageSquare,
  Award
} from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import { UserRole } from "@kabary/shared";
import { StyledDropdown } from "@/components/StyledDropdown";

const ROLE_LABELS: Record<string, string> = {
  [UserRole.PRO]: "Matihanina",
  [UserRole.BEGINNER]: "Mpanomboka",
  [UserRole.STUDENT]: "Mpianatra",
};

export default function OratorsPage() {
  const [orators, setOrators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState("ALL");

  useEffect(() => {
    const fetchOrators = async () => {
      try {
        // Pour l'instant on récupère les PRO par défaut ou on fait plusieurs appels
        const roles = [UserRole.PRO, UserRole.BEGINNER, UserRole.STUDENT];
        const responses = await Promise.all(roles.map(r => fetch(`${API_URL}/users/role/${r}`)));
        const data = await Promise.all(responses.map(r => r.json()));
        setOrators(data.flat());
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrators();
  }, []);

  const filteredOrators = orators.filter(ora => {
    const matchesSearch = ora.name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = activeRole === "ALL" || ora.role === activeRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-surface pt-32 pb-20">
      <div className="container mx-auto px-6 lg:px-20">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-4">
            <Users size={14} className="text-secondary" />
            Ny mpandray anjara
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-neutral-900 uppercase tracking-tighter leading-none mb-6">
            Mpikabary
          </h1>
          <p className="text-lg text-neutral-500 font-medium leading-relaxed">
            Ireo mpikabary matihanina sy vao misondrotra izay manome aina ny kolontsaina Malagasy.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
          <div className="relative w-full md:w-[440px] flex flex-col md:flex-row items-stretch md:items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Hikaroka mpikabary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-neutral-100 rounded-xl py-3 pl-12 pr-4 md:pr-[150px] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
            <div className="mt-3 md:mt-0 md:absolute md:right-2 md:top-1/2 md:-translate-y-1/2 w-full md:w-[138px]">
              <StyledDropdown
                value={activeRole}
                onChange={setActiveRole}
                options={[
                  { value: "ALL", label: "REHETRA" },
                  { value: UserRole.PRO, label: ROLE_LABELS[UserRole.PRO] },
                  { value: UserRole.BEGINNER, label: ROLE_LABELS[UserRole.BEGINNER] },
                  { value: UserRole.STUDENT, label: ROLE_LABELS[UserRole.STUDENT] },
                ]}
                label="Sokajy"
                compact
                align="left"
              />
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-neutral-100 rounded-3xl"></div>
            ))}
          </div>
        ) : filteredOrators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredOrators.map((ora) => (
              <div key={ora.id} className="pro-card p-8 flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-3xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-300 group-hover:border-primary/20 transition-all overflow-hidden">
                    {ora.photo ? (
                      <img src={ora.photo} alt={ora.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users size={40} />
                    )}
                  </div>
                  {ora.role === UserRole.PRO && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary rounded-xl flex items-center justify-center text-white border-4 border-white shadow-lg">
                      <Award size={14} />
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-black text-neutral-900 mb-1">{ora.name}</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-70 mb-4">
                  {ROLE_LABELS[ora.role]}
                </span>

                <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold mb-6">
                  <MapPin size={14} />
                  {ora.region || "Antananarivo"}
                </div>

                <div className="grid grid-cols-2 gap-3 w-full pt-6 border-t border-neutral-50">
                  <Link 
                    href={`/profile/${ora.id}`}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-neutral-100 text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 transition-all"
                  >
                    Profil
                  </Link>
                  <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                    Hiresaka
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-black text-neutral-300 uppercase tracking-widest">Tsy misy mpikabary hita</h3>
          </div>
        )}
      </div>
    </div>
  );
}

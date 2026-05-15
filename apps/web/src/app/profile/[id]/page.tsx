"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  User,
  MapPin,
  Calendar,
  Award,
  MessageSquare,
  Heart
} from "lucide-react";
import { API_URL } from "@/lib/config";
import { UserRole } from "@kabary/shared";

const ROLE_LABELS: Record<string, string> = {
  [UserRole.PRO]: "Matihanina",
  [UserRole.BEGINNER]: "Mpanomboka",
  [UserRole.STUDENT]: "Mpianatra",
  [UserRole.SPECTATOR]: "Mpijery",
  [UserRole.INSTITUTION]: "Sekoly / Fikambanana",
  [UserRole.ADMIN]: "Admin",
};

export default function UserProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/users/profile/${id}`);
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Mampakatra...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Tsy hita ity mpikabary ity</div>;

  return (
    <div className="min-h-screen bg-surface pt-32 pb-20">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="pro-card p-10 md:p-16 bg-white mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-20 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start relative z-10">
            <div className="relative">
              <div className="w-40 h-40 rounded-[3rem] bg-neutral-50 border-4 border-white shadow-2xl flex items-center justify-center text-neutral-200 overflow-hidden">
                {profile.photo ? (
                  <Image src={profile.photo} alt={profile.name} width={160} height={160} className="w-full h-full object-cover" />
                ) : (
                  <User size={64} />
                )}
              </div>
              {profile.role === UserRole.PRO && (
                <div className="absolute -bottom-2 -right-2 bg-secondary text-white p-3 rounded-2xl border-4 border-white shadow-xl">
                  <Award size={24} />
                </div>
              )}
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <h1 className="text-4xl font-black text-neutral-900 uppercase tracking-tighter">{profile.name}</h1>
                <div className="px-4 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest inline-block self-center md:self-auto">
                  {ROLE_LABELS[profile.role]}
                </div>
              </div>

              <p className="text-neutral-500 font-medium text-lg leading-relaxed max-w-2xl mb-8">
                {profile.bio || "Mpikabary mpankafy ny teny malagasy sy ny fomban-drazana."}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-8 text-neutral-400 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> {profile.region || "Antananarivo"}</span>
                <span className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> Mpikambana nanomboka {new Date(profile.createdAt || Date.now()).getFullYear()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0">
              <div className="pro-card p-6 bg-surface flex flex-col items-center gap-1">
                <span className="text-2xl font-black text-neutral-900">24</span>
                <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Kabary</span>
              </div>
              <div className="pro-card p-6 bg-surface flex flex-col items-center gap-1">
                <span className="text-2xl font-black text-secondary">1.5k</span>
                <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Mpanaraka</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <header className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter">Mombamomba</h2>
              <div className="h-1 flex-grow mx-8 bg-neutral-100 rounded-full"></div>
            </header>

            <div className="pro-card p-8 bg-white space-y-6">
              <div>
                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Bio</h3>
                <p className="text-neutral-700 font-medium leading-relaxed">
                  {profile.bio || "Mbola tsy nametraka bio ny mpampiasa."}
                </p>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Anjara andraikitra</h3>
                <p className="text-neutral-800 font-black">{ROLE_LABELS[profile.role] || profile.role}</p>
              </div>
              {profile.phone && (
                <div>
                  <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Laharana finday</h3>
                  <p className="text-neutral-700 font-semibold">{profile.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-10">
            <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter">Fankasitrahana</h2>

            <div className="pro-card p-8 bg-white space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Heart className="text-red-500" fill="currentColor" size={20} />
                  <span className="text-sm font-black text-neutral-800">1.2k Teheka</span>
                </div>
                <div className="text-xs font-bold text-neutral-400">Total</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Award className="text-yellow-500" size={20} />
                  <span className="text-sm font-black text-neutral-800">Matihanina</span>
                </div>
                <div className="text-xs font-bold text-neutral-400">Ambaratonga</div>
              </div>

              <div className="pt-8 border-t border-neutral-50">
                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Sokajy mampiavaka</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-neutral-50 rounded-lg text-[9px] font-black text-neutral-600 border border-neutral-100 uppercase tracking-widest">Fanambadiana</span>
                  <span className="px-3 py-1 bg-neutral-50 rounded-lg text-[9px] font-black text-neutral-600 border border-neutral-100 uppercase tracking-widest">Tsodrano</span>
                </div>
              </div>

              <button className="w-full pro-button-primary py-4 text-xs tracking-widest uppercase shadow-xl shadow-primary/20">
                <MessageSquare size={16} /> Hanaraka
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


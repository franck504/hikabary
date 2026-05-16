"use client";

import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { UserRole } from "@kabary/shared";
import Image from "next/image";
import {
  LogOut,
  User as UserIcon,
  Mic2,
  Search,
  Radio,
  BookOpen,
  GraduationCap,
  Users,
  X,
  Menu
} from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  [UserRole.PRO]: "Matihanina",
  [UserRole.BEGINNER]: "Mpanomboka",
  [UserRole.STUDENT]: "Mpianatra",
  [UserRole.SPECTATOR]: "Mpijery",
  [UserRole.INSTITUTION]: "Sekoly",
  [UserRole.ADMIN]: "Admin",
};

export const Navbar = () => {
  const [user, setUser] = useState<{ name: string; role: UserRole; photo?: string | null } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Détection clic extérieur pour fermer la recherche
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsMobileMenuOpen(false);
    window.location.href = "/";
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  if (!mounted) return null;

  return (
    <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${scrolled
        ? "glass-morphism py-4 shadow-xl shadow-black/[0.03]"
        : "bg-transparent py-7"
      }`}>
      <div className="w-[96%] 2xl:w-[94%] mx-auto px-4 lg:px-8 flex items-center justify-between">

        {/* Left Side: Logo */}
        <div className="flex items-center gap-12 flex-grow">
          <Link href="/" className={`flex items-center gap-3 group transition-all duration-500 ${isSearchExpanded ? 'opacity-0 -translate-x-4 pointer-events-none' : 'opacity-100'}`}>
            <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover:rotate-12 transition-all">
              <Mic2 size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter text-primary uppercase hidden sm:inline">HIKABARY</span>
          </Link>
        </div>

        {/* Right Side: Search & User */}
        <div className="flex items-center gap-6">
          {!isSearchExpanded && (
            <div className="hidden xl:flex items-center gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <Link href="/explore" className="flex items-center gap-2 text-[10px] font-black text-neutral-400 hover:text-primary uppercase tracking-[0.2em] transition-all group">
                <Radio size={14} className="text-secondary group-hover:animate-pulse" />
                Mivantana
              </Link>
              <Link href="/library" className="flex items-center gap-2 text-[10px] font-black text-neutral-400 hover:text-primary uppercase tracking-[0.2em] transition-all">
                <BookOpen size={14} />
                Lohahevitra
              </Link>
              <Link href="/academy" className="flex items-center gap-2 text-[10px] font-black text-neutral-400 hover:text-primary uppercase tracking-[0.2em] transition-all">
                <GraduationCap size={14} />
                Sekoly
              </Link>
              <Link href="/orators" className="flex items-center gap-2 text-[10px] font-black text-neutral-400 hover:text-primary uppercase tracking-[0.2em] transition-all">
                <Users size={14} />
                Mpikabary
              </Link>
            </div>
          )}

          {/* Dynamic Search Component */}
          <div
            ref={searchRef}
            className={`flex items-center transition-all duration-500 ease-out shrink-0 cursor-pointer ${isSearchExpanded
                ? "bg-white shadow-2xl ring-4 ring-primary/5 border border-primary/20 rounded-2xl px-5 py-3 w-[300px] md:w-[500px]"
                : "flex items-center gap-2 text-[10px] font-black text-neutral-400 hover:text-primary uppercase tracking-[0.2em] transition-all"
              }`}
            onClick={() => !isSearchExpanded && toggleSearch()}
          >
            <Search
              size={14}
              className={`transition-colors flex-shrink-0 ${isSearchExpanded ? "text-primary" : "text-neutral-400"}`}
            />

            {/* {!isSearchExpanded && <span>Hikaroka</span>} */}

            <input
              ref={inputRef}
              type="text"
              placeholder="Hikaroka mpikabary, lohahevitra..."
              className={`bg-transparent border-none outline-none px-4 text-sm font-semibold transition-all duration-500 ${isSearchExpanded ? "w-full opacity-100" : "w-0 opacity-0 pointer-events-none"
                }`}
            />

            {isSearchExpanded && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsSearchExpanded(false); }}
                className="text-neutral-300 hover:text-secondary transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* User Section (Hidden when search is expanded on mobile) */}
          <div className={`hidden md:flex items-center gap-6 transition-all duration-500 ${isSearchExpanded ? 'md:hidden lg:flex' : 'md:flex'}`}>
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile/me" className="flex items-center gap-3 group cursor-pointer">
                  <div className="flex flex-col items-end leading-tight hidden lg:flex">
                    <span className="text-xs font-black text-neutral-900">{user.name}</span>
                    <span className="text-[9px] uppercase tracking-widest text-secondary font-black opacity-70">{ROLE_LABELS[user.role]}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 shadow-sm group-hover:border-primary/20 transition-all overflow-hidden">
                    {user.photo ? (
                      <Image src={user.photo} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={18} />
                    )}
                  </div>
                </Link>
                <button onClick={handleLogout} className="p-2 text-neutral-300 hover:text-secondary transition-all">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-[10px] font-black text-neutral-500 hover:text-primary px-4 py-2 uppercase tracking-widest transition-colors hidden sm:inline">
                  Miditra
                </Link>
                <Link href="/register" className="pro-button-primary py-2.5 px-6 text-[10px] tracking-widest shadow-lg shadow-primary/20 whitespace-nowrap">
                  HISORATRA
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            aria-label="Menu"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="xl:hidden w-10 h-10 rounded-xl bg-white border border-neutral-100 text-neutral-700 flex items-center justify-center shadow-sm"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-[110]">
          <button
            aria-label="Close mobile menu"
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-[86%] max-w-sm bg-white border-l border-neutral-100 shadow-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-primary">Navigation</span>
              <button
                aria-label="Close"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 rounded-lg bg-neutral-50 border border-neutral-100 text-neutral-600 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="/explore" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-neutral-700 bg-neutral-50 border border-neutral-100">
                <Radio size={16} className="text-secondary" /> Mivantana
              </Link>
              <Link href="/library" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-neutral-700 bg-neutral-50 border border-neutral-100">
                <BookOpen size={16} className="text-primary" /> Lohahevitra
              </Link>
              <Link href="/academy" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-neutral-700 bg-neutral-50 border border-neutral-100">
                <GraduationCap size={16} className="text-primary" /> Sekoly
              </Link>
              <Link href="/orators" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-neutral-700 bg-neutral-50 border border-neutral-100">
                <Users size={16} className="text-primary" /> Mpikabary
              </Link>
            </div>

            <div className="mt-auto pt-6 border-t border-neutral-100">
              {user ? (
                <div className="space-y-3">
                  <Link href="/profile/me" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-primary/10 flex items-center justify-center text-neutral-400">
                        {user.photo ? (
                          <Image src={user.photo} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={16} />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-black text-neutral-900">{user.name}</div>
                        <div className="text-[10px] uppercase tracking-widest text-secondary font-black">
                          {ROLE_LABELS[user.role]}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full pro-button-outline py-3 text-xs"
                  >
                    <LogOut size={14} /> Hivoaka
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full pro-button-outline py-3 text-xs">
                    Miditra
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full pro-button-primary py-3 text-xs">
                    Hisoratra
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

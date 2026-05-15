"use client";

import React from "react";
import { 
  GraduationCap, 
  BookOpen, 
  PlayCircle, 
  Star, 
  Clock, 
  ChevronRight,
  Sparkles,
  Award
} from "lucide-react";
import Link from "next/link";

const COURSES = [
  {
    title: "Ny fototry ny Kabary",
    level: "Mpanomboka",
    duration: "4 herinandro",
    lessons: 12,
    rating: 4.8
  },
  {
    title: "Kabary am-panambadiana",
    level: "Matihanina",
    duration: "6 herinandro",
    lessons: 18,
    rating: 4.9
  },
  {
    title: "Ohabolana sy Hainteny",
    level: "Rehetra",
    duration: "Fohy",
    lessons: 8,
    rating: 4.7
  }
];

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-surface pt-32 pb-20">
      <div className="container mx-auto px-6 lg:px-20">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-4">
              <GraduationCap size={14} className="text-secondary" />
              Sekoly sy Fanabeazana
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-neutral-900 uppercase tracking-tighter leading-none mb-6">
              Hianatra Kabary
            </h1>
            <p className="text-lg text-neutral-500 font-medium leading-relaxed">
              Loharano sy fampianarana mba ho lasa mpikabary mahay sy manaja ny fomban-drazana.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="pro-card px-8 py-6 bg-white flex flex-col items-center gap-2">
              <span className="text-3xl font-black text-primary">12</span>
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Fampianarana</span>
            </div>
            <div className="pro-card px-8 py-6 bg-white flex flex-col items-center gap-2">
              <span className="text-3xl font-black text-secondary">450</span>
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Mpianatra</span>
            </div>
          </div>
        </div>

        {/* Featured Course */}
        <div className="pro-card bg-neutral-900 overflow-hidden mb-24 relative group">
          <div className="absolute inset-0 bg-[url('/hero_pattern.png')] opacity-[0.05] pointer-events-none"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 lg:p-20 relative z-10 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mb-6">
                <Sparkles size={12} />
                Malaza indrindra
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight uppercase tracking-tighter">
                Ny kanto sy ny <br/> <span className="text-primary italic font-serif">Hainteny</span>
              </h2>
              <p className="text-neutral-400 text-lg mb-10 max-w-md leading-relaxed">
                Ianaro ny fomba fampiasana ny teny mafonja sy ny haingo-teny malagasy amin'ny kabary.
              </p>
              <button className="pro-button-primary self-start px-10 py-5 text-lg">
                Hianatra izao <ChevronRight size={20} />
              </button>
            </div>
            <div className="bg-neutral-800 flex items-center justify-center p-12 lg:p-0 relative min-h-[400px]">
              <PlayCircle size={100} className="text-white/20 group-hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Course List */}
        <div className="mb-24">
          <header className="mb-12 flex items-center justify-between">
            <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter">Ireo fampianarana rehetra</h3>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {COURSES.map((course) => (
              <div key={course.title} className="pro-card group bg-white flex flex-col">
                <div className="h-48 bg-neutral-50 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
                  <BookOpen size={48} className="text-neutral-200 group-hover:text-primary transition-all duration-500 scale-90 group-hover:scale-100" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-neutral-100 shadow-sm text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    {course.level}
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-[10px] font-black text-secondary uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {course.duration}</span>
                    <span className="flex items-center gap-1.5"><LayoutGrid size={12} /> {course.lessons} lesona</span>
                  </div>
                  <h4 className="text-2xl font-black text-neutral-900 mb-6 group-hover:text-primary transition-colors leading-tight">{course.title}</h4>
                  
                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-neutral-50">
                    <div className="flex items-center gap-1.5 text-yellow-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-black text-neutral-800">{course.rating}</span>
                    </div>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-1">
                      Zahao <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="pro-card p-12 lg:p-20 bg-primary/5 border-primary/10 flex flex-col items-center text-center">
          <Award size={64} className="text-primary mb-8" />
          <h3 className="text-3xl md:text-4xl font-black text-neutral-900 uppercase tracking-tighter mb-4">Ho lasa Mpikabary Matihanina</h3>
          <p className="text-neutral-500 max-w-2xl mb-10 font-medium">
            Misy certificates omena isaky ny mahavita dingana iray amin'ny fianarana ianao. Izany no antoky ny fahaizanao.
          </p>
          <button className="pro-button-primary px-12 py-5 text-lg">Hisoratra anarana amin'ny sekoly</button>
        </div>

      </div>
    </div>
  );
}

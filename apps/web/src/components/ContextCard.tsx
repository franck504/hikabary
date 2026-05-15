"use client";

import React from "react";
import { Calendar, User, Tag, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ContextCardProps {
  context: {
    id: string;
    title: string;
    type: string;
    image?: string | null;
    description: string;
    author: { id?: string; name: string; photo?: string | null };
    createdAt: string;
  };
}

export const ContextCard = ({ context }: ContextCardProps) => {
  return (
    <Link href={`/context/${context.id}`} className="pro-card flex flex-col h-full group bg-white hover:-translate-y-0.5 transition-all">
      {/* Visual Header */}
      <div className="h-64 bg-neutral-100 relative overflow-hidden">
        {context.image ? (
          <Image src={context.image} alt={context.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/5"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10"></div>
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-primary/10 shadow-sm">
            <Tag size={12} className="text-secondary" />
            {context.type}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors leading-tight line-clamp-2">
            {context.title}
          </h3>
          <p className="text-sm text-white/85 line-clamp-2 mt-2 leading-relaxed font-medium">
            {context.description}
          </p>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between pt-1 border-t border-neutral-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 border border-neutral-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors overflow-hidden">
              {context.author?.photo ? (
                <Image src={context.author.photo} alt={context.author.name} width={40} height={40} className="w-full h-full object-cover" />
              ) : (
                <User size={18} />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">Mpanoratra</span>
              <span className="text-xs font-black text-neutral-800">{context.author.name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400">
            <Calendar size={12} />
            {new Date(context.createdAt).toLocaleDateString('mg-MG')}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-neutral-100">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Hijery antsipiriany</span>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <ChevronRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
};

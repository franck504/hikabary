"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, User as UserIcon } from "lucide-react";

type SessionMode = "CONTINUOUS_LIVE" | "ASYNCHRONOUS_LIVE";

export type LiveSessionCardData = {
  id: string;
  title?: string | null;
  participantRoleLabel?: string | null;
  createdAt?: string | null;
  liveThumbnail?: string | null;
  context?: {
    title?: string | null;
    type?: string | null;
    image?: string | null;
    description?: string | null;
    sessionMode?: SessionMode | null;
  } | null;
  speaker?: {
    name?: string | null;
    photo?: string | null;
  } | null;
  participants?: {
    id?: string | null;
    name?: string | null;
    photo?: string | null;
    participantRoleLabel?: string | null;
  }[];
};

const SESSION_MODE_LABELS: Record<SessionMode, string> = {
  CONTINUOUS_LIVE: "Live mitohy",
  ASYNCHRONOUS_LIVE: "Live miatoato",
};

const getElapsedLabel = (createdAt?: string | null) => {
  if (!createdAt) return "Live";
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`;
};

export function LiveSessionCard({ session }: { session: LiveSessionCardData }) {
  const context = session.context;
  const mode = context?.sessionMode || "CONTINUOUS_LIVE";
  const title = context?.title || session.title || "Lohahevitra tsy fantatra";
  const elapsed = getElapsedLabel(session.createdAt);
  const roleLabel = session.participantRoleLabel || "Mpikabary";
  const cardImage = session.liveThumbnail || context?.image;
  const participants = session.participants?.length
    ? session.participants
    : [
        {
          name: session.speaker?.name,
          photo: session.speaker?.photo,
          participantRoleLabel: roleLabel,
        },
      ];
  const visibleParticipants = mode === "CONTINUOUS_LIVE" ? participants.slice(0, 2) : participants.slice(0, 1);
  const participantLabel = mode === "CONTINUOUS_LIVE"
    ? `${visibleParticipants.length}/2 mpandray anjara`
    : roleLabel;

  return (
    <Link
      href={`/live/${session.id}`}
      className="pro-card group h-[360px] relative overflow-hidden bg-neutral-950 hover:-translate-y-0.5"
    >
      <div className="absolute inset-0 bg-neutral-950">
        {cardImage ? (
          <Image
            src={cardImage}
            alt={title}
            fill
            className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-neutral-950 to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/35 to-transparent z-10" />
      </div>

      <div className="absolute top-5 left-5 right-5 z-20 flex items-start justify-between gap-3">
        <div className="bg-secondary text-white inline-flex h-9 items-center gap-2 px-3 rounded-xl text-[10px] font-black shadow-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          MIVANTANA
        </div>
        <div className="h-9 rounded-xl bg-neutral-950/45 backdrop-blur-md px-3 inline-flex items-center text-white/75 text-[10px] font-black uppercase tracking-widest border border-white/10">
          {context?.type || "Kabary"}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/60">
          {SESSION_MODE_LABELS[mode]} · {participantLabel} · {elapsed}
        </p>

        <h3 className="text-2xl font-black text-white mb-5 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            {visibleParticipants.map((participant, index) => (
              <div key={participant.id || `${participant.name}-${index}`} className="flex items-center gap-2 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white font-black text-sm overflow-hidden shrink-0"
                >
                  {participant.photo ? (
                    <Image
                      src={participant.photo}
                      alt={participant.name || "Mpikabary"}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={16} />
                  )}
                </div>
                <span className="max-w-[110px] truncate text-sm font-black text-white">
                  {participant.name || "Tsy fantatra"}
                </span>
              </div>
            ))}
          </div>
          <div className="w-10 h-10 rounded-full bg-white text-neutral-950 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all shrink-0">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </div>
    </Link>
  );
}

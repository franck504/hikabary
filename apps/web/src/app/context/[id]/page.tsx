"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";
import { ArrowLeft, Mic2, Tag, User, Calendar, ShieldCheck, Play, X, Users } from "lucide-react";
import { UserRole } from "@kabary/shared";
import { StyledDropdown } from "@/components/StyledDropdown";
import Image from "next/image";

type ParticipantRole = {
  key: string;
  label: string;
  description?: string;
  required?: boolean;
  slots?: number;
};

type ContextDetails = {
  id: string;
  title: string;
  type: string;
  sessionMode?: "CONTINUOUS_LIVE" | "ASYNCHRONOUS_LIVE";
  image?: string | null;
  description: string;
  rules?: string | null;
  participantRoles?: ParticipantRole[] | null;
  createdAt: string;
  author?: { id?: string; name: string; role: string; photo?: string | null };
};

type ActiveSession = {
  id: string;
  contextId: string;
  title?: string | null;
  participantRoleKey?: string | null;
  participantRoleLabel?: string | null;
  speaker?: {
    id: string;
    name: string;
    role: string;
    photo?: string | null;
  };
  participants?: {
    id?: string | null;
    name?: string | null;
    photo?: string | null;
    participantRoleKey?: string | null;
    participantRoleLabel?: string | null;
  }[];
};

export default function ContextDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const contextId = params?.id;

  const [context, setContext] = useState<ContextDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showStartPopup, setShowStartPopup] = useState(false);
  const [selectedRoleKey, setSelectedRoleKey] = useState("");
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [starting, setStarting] = useState(false);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored) as { role?: UserRole };
      setUserRole(parsed.role || null);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!contextId) return;
      try {
        const res = await fetch(`${API_URL}/kabary/contexts/${contextId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Tsy azo ilay lohahevitra");
        setContext(data);
        const roles = Array.isArray(data?.participantRoles) ? data.participantRoles : [];
        setSelectedRoleKey(roles[0]?.key || "mpikabary");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [contextId]);

  useEffect(() => {
    const fetchActive = async () => {
      if (!contextId) return;
      try {
        const res = await fetch(`${API_URL}/sessions/active`);
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) return;
        const related = data.filter((s: ActiveSession) => s.contextId === contextId);
        setActiveSessions(related);
      } catch (error) {
        console.error(error);
      }
    };
    fetchActive();
  }, [contextId, starting]);

  const canStartLive = !!userRole && [UserRole.ADMIN, UserRole.INSTITUTION, UserRole.PRO, UserRole.BEGINNER].includes(userRole);
  const participantRoles = Array.isArray(context?.participantRoles) ? context?.participantRoles : [];
  const roleOptions =
    participantRoles.length > 0
      ? participantRoles.map((role) => ({ value: role.key, label: role.label }))
      : [{ value: "mpikabary", label: "Mpikabary" }];

  const getRoleOccupants = (roleKey: string, roleLabel: string) => {
    return activeSessions.filter((session) => {
      const participantMatch = session.participants?.some((participant) => {
        if (participant.participantRoleKey && participant.participantRoleKey === roleKey) return true;
        if (participant.participantRoleLabel && participant.participantRoleLabel.toLowerCase() === roleLabel.toLowerCase()) return true;
        return false;
      });
      if (participantMatch) return true;
      if (session.participantRoleKey && session.participantRoleKey === roleKey) return true;
      if (session.participantRoleLabel && session.participantRoleLabel.toLowerCase() === roleLabel.toLowerCase()) return true;
      const title = String(session.title || "").toLowerCase();
      return title.includes(roleLabel.toLowerCase());
    });
  };

  const startSessionFromPopup = async () => {
    if (!acceptedRules) return;
    setStarting(true);
    try {
      const token = localStorage.getItem("token");
      const selectedRole = participantRoles.find((role) => role.key === selectedRoleKey);
      const roleLabel = selectedRole?.label || "Mpikabary";

      const res = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contextId: context?.id,
          title: `Kabary: ${context?.title} - ${roleLabel}`,
          participantRoleKey: selectedRoleKey,
          participantRoleLabel: roleLabel,
        }),
      });

      const session = await res.json();
      if (!res.ok) throw new Error(session.error || "Tsy nahomby ny nanomboka ny session");
      router.push(`/live/${session.id}`);
    } catch (error: any) {
      alert(error.message || "Nisy olana teo am-panombohana.");
    } finally {
      setStarting(false);
    }
  };

  const isContinuousMode = context.sessionMode === "CONTINUOUS_LIVE";
  const modeLabel = isContinuousMode ? "Live mitohy" : "Live miatoato";
  const modeDescription = isContinuousMode
    ? "Olona 1 isaky ny andraikitra, fotoana voafaritra, ary mila tonga miaraka."
    : "Afaka mifamaly miatoato, olona maro isaky ny andraikitra, ary fotoana malefaka kokoa.";

  if (loading) {
    return <div className="min-h-screen pt-32 flex items-center justify-center text-primary font-black">Andraso kely...</div>;
  }

  if (!context) {
    return <div className="min-h-screen pt-32 flex items-center justify-center text-red-600 font-bold">Tsy hita ilay lohahevitra.</div>;
  }

  return (
    <div className="min-h-screen bg-surface pt-28 pb-16 px-6 relative overflow-x-hidden">
      <div className="container mx-auto max-w-4xl">
        <Link href="/library" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-primary mb-6">
          <ArrowLeft size={14} /> Miverina
        </Link>

        <div className="pro-card p-6 md:p-8 bg-white">
          <div className="mb-6 h-64 md:h-80 rounded-2xl overflow-hidden relative bg-neutral-100">
            {context.image ? (
              <Image
                src={context.image}
                alt={context.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 900px"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
              <Tag size={12} />
              {context.type}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest">
              <Mic2 size={12} />
              {modeLabel}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tighter mb-4">{context.title}</h1>
          <p className="text-neutral-600 font-medium leading-relaxed mb-6">{context.description}</p>
          <div className="mb-6 rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-neutral-700 font-medium">
            {modeDescription}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3 text-sm text-neutral-700">
              <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-black mb-1">Mpanoratra</div>
              <div className="inline-flex items-center gap-2 font-bold">
                <span className="w-6 h-6 rounded-full overflow-hidden bg-neutral-200 inline-flex items-center justify-center">
                  {context.author?.photo ? (
                    <Image src={context.author.photo} alt={context.author.name} width={24} height={24} className="w-full h-full object-cover" />
                  ) : (
                    <User size={12} />
                  )}
                </span>
                {context.author?.name || "Tsy fantatra"}
              </div>
            </div>
            <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3 text-sm text-neutral-700">
              <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-black mb-1">Daty namoronana</div>
              <div className="inline-flex items-center gap-2 font-bold"><Calendar size={14} /> {new Date(context.createdAt).toLocaleDateString("mg-MG")}</div>
            </div>
          </div>

          {context.rules && (
            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-black mb-2">Fitsipika</div>
              <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm text-neutral-700 leading-relaxed">{context.rules}</div>
            </div>
          )}

          {participantRoles.length > 0 && (
            <div className="mb-8">
              <div className="text-[10px] uppercase tracking-widest text-neutral-400 font-black mb-3">Anjara asan&apos;ireo mpikabary</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {participantRoles.map((role, idx) => (
                  <div key={`${role.key}-${idx}`} className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="font-black text-neutral-900">{role.label}</div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">x{role.slots || 1}</span>
                    </div>
                    {role.description && <p className="text-sm text-neutral-600">{role.description}</p>}
                    {role.required && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-secondary">
                        <ShieldCheck size={12} />
                        Ilaina
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      {(() => {
                        const occupants = getRoleOccupants(role.key, role.label);
                        const occupied = occupants.length;
                        const total = role.slots || 1;
                        const free = Math.max(0, total - occupied);
                        return (
                          <>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-neutral-400">Sata</span>
                              <span className={free > 0 ? "text-green-600" : "text-red-500"}>
                                {free > 0 ? `${free} mbola malalaka` : "Feno"}
                              </span>
                            </div>
                            {occupied > 0 && (
                              <div className="mt-2 space-y-1">
                                {occupants.map((session) => (
                                  session.speaker?.id ? (
                                    <Link
                                      key={session.id}
                                      href={`/profile/${session.speaker.id}`}
                                      className="text-xs text-primary hover:text-secondary inline-flex items-center gap-1.5 font-semibold"
                                    >
                                      <span className="w-5 h-5 rounded-full overflow-hidden bg-neutral-200 inline-flex items-center justify-center">
                                        {session.speaker?.photo ? (
                                          <Image src={session.speaker.photo} alt={session.speaker.name} width={20} height={20} className="w-full h-full object-cover" />
                                        ) : (
                                          <Users size={10} />
                                        )}
                                      </span>
                                      {session.speaker?.name || "Mpandray anjara"}
                                    </Link>
                                  ) : (
                                    <div key={session.id} className="text-xs text-neutral-600 inline-flex items-center gap-1.5">
                                      <Users size={12} />
                                      {session.speaker?.name || "Mpandray anjara"}
                                    </div>
                                  )
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-5 border-t border-neutral-100 flex flex-col sm:flex-row gap-3">
            {canStartLive ? (
              <button
                type="button"
                onClick={() => setShowStartPopup(true)}
                className="pro-button-primary px-6 py-3"
              >
                <Mic2 size={16} />
                Hanomboka fandraisana anjara
              </button>
            ) : (
              <Link href="/explore" className="pro-button-outline px-6 py-3">
                Hijery mivantana
              </Link>
            )}
          </div>
        </div>
      </div>

      {showStartPopup && (
        <div className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-neutral-100 shadow-2xl p-6 md:p-7">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-xl font-black text-neutral-900">Hanomboka fandraisana anjara</h3>
                <p className="text-sm text-neutral-500 mt-1">Safidio ny andraikitrao ary ankatoavy ny fitsipika.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowStartPopup(false)}
                className="w-9 h-9 rounded-full border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:border-neutral-300 inline-flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">Andraikitry ny mpikabary</label>
                <StyledDropdown
                  value={selectedRoleKey}
                  onChange={setSelectedRoleKey}
                  options={roleOptions}
                  label="Safidio ny andraikitra"
                />
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <label className="inline-flex items-start gap-3 text-sm text-neutral-700 font-medium">
                  <input
                    type="checkbox"
                    checked={acceptedRules}
                    onChange={(e) => setAcceptedRules(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary/20"
                  />
                  <span>Ekena ny fitsipika sy ny fanajana ny mpandray anjara rehetra mandritra ny kabary.</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => setShowStartPopup(false)}
                className="pro-button-outline px-5 py-2.5"
              >
                Hakatona
              </button>
              <button
                type="button"
                disabled={!acceptedRules || starting}
                onClick={startSessionFromPopup}
                className="pro-button-primary px-5 py-2.5 disabled:opacity-60"
              >
                <Play size={14} />
                {starting ? "Andraso kely..." : "Hanomboka izao"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

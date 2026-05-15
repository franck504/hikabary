"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, BookOpen, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import { StyledDropdown } from "@/components/StyledDropdown";

type ParticipantRole = {
  key: string;
  label: string;
  description?: string;
  required?: boolean;
  slots?: number;
};

export default function StartLivePage() {
  const { id } = useParams();
  const router = useRouter();
  const [context, setContext] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [selectedRoleKey, setSelectedRoleKey] = useState("");

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const res = await fetch(`${API_URL}/kabary/contexts/${id}`);
        const data = await res.json();
        setContext(data);
        const roles = Array.isArray(data?.participantRoles) ? data.participantRoles : [];
        if (roles.length > 0) {
          setSelectedRoleKey(String(roles[0].key || ""));
        } else {
          setSelectedRoleKey("mpikabary");
        }
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, [id]);

  const handleStart = async () => {
    if (!selectedRoleKey) {
      alert("Safidio aloha ny andraikitrao.");
      return;
    }

    setStarting(true);
    const token = localStorage.getItem("token");
    const roles: ParticipantRole[] = Array.isArray(context?.participantRoles) ? context.participantRoles : [];
    const selectedRole = roles.find((role) => role.key === selectedRoleKey);
    const roleLabel = selectedRole?.label || "Mpikabary";

    try {
      const res = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          contextId: id,
          title: `Kabary: ${context.title} - ${roleLabel}`,
          participantRoleKey: selectedRoleKey,
          participantRoleLabel: roleLabel,
        })
      });

      const session = await res.json();
      if (!res.ok) throw new Error(session.error || "Tsy nahomby ny nanomboka ny session");

      // Redirection vers la page du Live effectif
      router.push(`/live/${session.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-bold">Andraso kely...</div>;

  const roles: ParticipantRole[] = Array.isArray(context?.participantRoles) ? context.participantRoles : [];
  const roleOptions =
    roles.length > 0
      ? roles.map((role) => ({ value: role.key, label: role.label }))
      : [{ value: "mpikabary", label: "Mpikabary" }];
  const selectedRole = roles.find((role) => role.key === selectedRoleKey);

  return (
    <div className="min-h-screen bg-background p-6 pt-24">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <Link href="/" className="flex items-center gap-2 text-muted hover:text-primary transition-colors text-small">
          <ArrowLeft size={16} /> Hiverina
        </Link>

        <div className="card-premium p-10 space-y-8">
          <header className="space-y-4 border-b border-primary/5 pb-8">
            <div className="text-secondary text-small font-black uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={16} /> Vonona haneho ny fahaizanao ve ianao ?
            </div>
            <h1 className="text-primary leading-tight" style={{ fontSize: 'var(--font-title)' }}>
              {context.title}
            </h1>
            <p className="text-muted italic">{context.description}</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 font-black text-primary text-small">
                <BookOpen size={18} className="text-secondary" /> 
                NY FISAFIDIANANA
              </h4>
              <p className="text-small text-muted leading-relaxed">
                Amin'ny maha Mpikabary anao, ianao no hitarika ny fotoana. Ny mpijery dia afaka manome "Teheka" (applaudissements) mandritra ny kabary.
              </p>
            </div>
            
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
              <h4 className="font-black text-primary text-small mb-2 uppercase">Fitsipika</h4>
              <ul className="text-small text-muted space-y-2 list-disc list-inside">
                <li>Hajao ny fotoana</li>
                <li>Hajao ny mpijery</li>
                <li>Asehoy ny fahaiza-mandaha-teny</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-primary text-small uppercase tracking-widest">Safidio ny andraikitrao</h4>
            <StyledDropdown
              value={selectedRoleKey}
              onChange={setSelectedRoleKey}
              options={roleOptions}
              label="Andraikitry ny mpikabary"
              className="max-w-md"
            />
            {selectedRole?.description && (
              <p className="text-sm text-muted">{selectedRole.description}</p>
            )}
          </div>

          <button 
            onClick={handleStart}
            disabled={starting}
            className="btn-primary w-full py-6 text-lg flex items-center justify-center gap-4 shadow-xl shadow-primary/20"
          >
            {starting ? (
              "Amboarina ny sehatra..."
            ) : (
              <>
                <Play size={24} fill="currentColor" />
                <span>HANOMBOKA NY KABARY</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import { User, Save, ArrowLeft, Upload } from "lucide-react";
import { StyledDropdown } from "@/components/StyledDropdown";

type Profile = {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  role: string;
  bio?: string | null;
  photo?: string | null;
};

export default function MyProfilePage() {
  const roleOptions = ["ADMIN", "INSTITUTION", "PRO", "BEGINNER", "STUDENT", "SPECTATOR"];
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "SPECTATOR",
    bio: "",
    photo: "",
  });

  const roleLabel = useMemo(() => {
    if (!profile) return "";
    return profile.role;
  }, [profile]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) {
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(stored) as { id?: string };
    if (!user.id) {
      window.location.href = "/login";
      return;
    }

    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/users/profile/${user.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Tsy nahazo profil");
        setProfile(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          role: data.role || "SPECTATOR",
          bio: data.bio || "",
          photo: data.photo || "",
        });
      } catch (e: any) {
        setError(e.message || "Nisy olana");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const raw = await res.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { error: raw || "Valiny tsy azo vakiana avy amin'ny serveur." };
      }
      if (!res.ok) throw new Error(data.error || "Tsy voatahiry ny fanovana");

      setMessage("Voatahiry tsara ny mombamomba anao.");

      const stored = localStorage.getItem("user");
      if (stored) {
        const previous = JSON.parse(stored);
        localStorage.setItem("user", JSON.stringify({ ...previous, ...data }));
      }

      setProfile((prev) => (prev ? { ...prev, ...data } : prev));
    } catch (e: any) {
      setError(e.message || "Nisy olana. Andramo ahena ny haben'ny sary dia avereno indray.");
    } finally {
      setSaving(false);
    }
  };

  const onPhotoSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Safidio sary ihany.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Lehibe loatra ny sary (max 2MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      setForm((prev) => ({ ...prev, photo: value }));
      setError("");
    };
    reader.onerror = () => setError("Tsy voavaky ny sary.");
    reader.readAsDataURL(file);
  };

  const roleHint = useMemo(() => {
    switch (form.role) {
      case "INSTITUTION":
        return "Hanana andraikitra amin'ny famoronana contexte sy fandrindrana seance.";
      case "PRO":
        return "Mifantoka amin'ny fandraisana anjara sy fitarihana kabary matihanina.";
      case "BEGINNER":
        return "Mpanomboka amin'ny fanazaran-tena sy fanatsarana teknika.";
      case "STUDENT":
        return "Mifantoka amin'ny fianarana sy fanangonana traikefa.";
      case "ADMIN":
        return "Fahazoan-dalana feno amin'ny fitantanana sehatra.";
      default:
        return "Mpijery mahazo manaraka live sy mifandray amin'ny fiarahamonina.";
    }
  }, [form.role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-32 flex items-center justify-center text-primary font-black">
        Andraso kely...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-28 pb-16 px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none bg-fixed"
        style={{
          backgroundImage: "url('/hero_pattern.png')",
          backgroundSize: "600px",
          backgroundPosition: "center",
        }}
      />
      <div className="container mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-primary mb-6">
          <ArrowLeft size={14} /> Miverina
        </Link>

        <div className="px-1 md:px-2 pb-2 md:pb-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-end gap-6 mb-8 pt-2">
              <button type="submit" form="profile-form" disabled={saving} className="pro-button-primary w-full md:w-auto px-6 py-3">
                <Save size={16} /> {saving ? "Andraso kely..." : "Hitahiry"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
              <form id="profile-form" onSubmit={onSave} className="space-y-5">
                <div className="p-5 md:p-6 bg-white/90 border border-neutral-100 rounded-2xl">
                  <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Mombamomba ankapobeny</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">Anarana</label>
                      <input
                        type="text"
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">Adiresy mailaka</label>
                      <input
                        type="email"
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">Laharana finday</label>
                      <input
                        type="text"
                        readOnly
                        className="w-full bg-neutral-100 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-semibold text-neutral-600 cursor-not-allowed"
                        value={profile?.phone || "Tsy misy"}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-6 bg-white/90 border border-neutral-100 rounded-2xl">
                  <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Anjara andraikitra sy fampahafantarana</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">Karazana mpikambana</label>
                      <StyledDropdown
                        value={form.role}
                        onChange={(value) => setForm((prev) => ({ ...prev, role: value }))}
                        options={roleOptions.map((role) => ({ value: role, label: role }))}
                        label="Karazana mpikambana"
                      />
                      <p className="mt-2 text-xs text-neutral-500">{roleHint}</p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                        {form.role === "INSTITUTION" ? "Fampahafantarana ny fikambanana" : "Momba ahy"}
                      </label>
                      <textarea
                        rows={5}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={form.bio}
                        onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </form>

              <aside className="space-y-4">
                <div className="p-5 md:p-6 bg-white/90 border border-neutral-100 rounded-2xl">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Sary mombamomba</h3>

                  <input id="profile-photo-input" type="file" accept="image/*" className="hidden" onChange={onPhotoSelected} />
                  <div className="relative mb-4">
                    <label htmlFor="profile-photo-input" className="relative w-full aspect-square rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50 flex items-center justify-center text-neutral-300 cursor-pointer group">
                      {form.photo ? (
                        <Image src={form.photo} alt={form.name || "Profil"} fill sizes="(max-width: 1024px) 100vw, 320px" className="object-cover" />
                      ) : (
                        <User size={52} />
                      )}
                      <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </label>
                    <label
                      htmlFor="profile-photo-input"
                      className="absolute right-2 bottom-2 w-9 h-9 rounded-full bg-white border border-neutral-200 text-neutral-600 shadow-md hover:text-primary hover:border-primary/30 inline-flex items-center justify-center cursor-pointer"
                    >
                      <Upload size={14} />
                    </label>
                  </div>

                  <div className="mb-4 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <div className="text-sm font-black text-neutral-900">{form.name || "Anarana tsy mbola feno"}</div>
                    <div className="text-[10px] uppercase tracking-widest text-secondary font-black mt-1">
                      {form.role || roleLabel}
                    </div>
                    {profile?.phone && <div className="text-xs text-neutral-500 mt-1">{profile.phone}</div>}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, photo: "" }))}
                      className="text-xs font-bold text-neutral-500 hover:text-secondary py-2"
                    >
                      Esory ny sary
                    </button>
                  </div>
                </div>

                {message && (
                  <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-semibold">
                    {message}
                  </div>
                )}
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
                    {error}
                  </div>
                )}
              </aside>
            </div>
        </div>
      </div>
    </div>
  );
}

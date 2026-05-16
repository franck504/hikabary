"use client";

import React, { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight,
  Send, 
  BookOpen, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  Info,
  Tag,
  Users,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import { StyledDropdown } from "@/components/StyledDropdown";
import Image from "next/image";

type ParticipantRole = {
  key: string;
  label: string;
  description: string;
  required: boolean;
  slots: number;
};

type SessionMode = "CONTINUOUS_LIVE" | "ASYNCHRONOUS_LIVE";

const ROLE_TEMPLATES_BY_TYPE: Record<string, ParticipantRole[]> = {
  Fanambadiana: [
    { key: "mpangataka", label: "Mpangataka", description: "Mpitondra ny teny fangatahana.", required: true, slots: 1 },
    { key: "mpamoaka", label: "Mpamoaka", description: "Mpitondra ny valin-teny sy fanehoan-kevitra.", required: true, slots: 1 },
  ],
  Famadihana: [
    { key: "mpitarika", label: "Mpitarika", description: "Mitantana ny fizotry ny kabary.", required: true, slots: 1 },
    { key: "mpamaly", label: "Mpamaly", description: "Mamaly sy manamafy ny hafatra.", required: true, slots: 1 },
  ],
  Fandroana: [
    { key: "mpitarika", label: "Mpitarika", description: "Mitarika ny fitenenana sy filaharana.", required: true, slots: 1 },
    { key: "mpanampy", label: "Mpanampy", description: "Manohana ny fandrindrana ny teny.", required: false, slots: 1 },
  ],
  Fahafatesana: [
    { key: "mpionona", label: "Mpionona", description: "Mpitondra teny fampiononana.", required: true, slots: 1 },
    { key: "fianakaviana", label: "Solontenan'ny fianakaviana", description: "Miteny amin'ny anaran'ny fianakaviana.", required: true, slots: 1 },
  ],
  Hafa: [
    { key: "mpikabary_1", label: "Mpikabary 1", description: "Anjara asa fototra.", required: true, slots: 1 },
    { key: "mpikabary_2", label: "Mpikabary 2", description: "Anjara asa fanampiny.", required: false, slots: 1 },
  ],
};

export default function CreateContextPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    type: "Fanambadiana",
    sessionMode: "CONTINUOUS_LIVE" as SessionMode,
    image: "",
    description: "",
    rules: "",
    duration: "15",
    restrictions: "",
    participantRoles: ROLE_TEMPLATES_BY_TYPE.Fanambadiana,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const steps = [
    { key: "title_type", label: "Lohateny sy karazana (Fototra)" },
    { key: "meeting_style", label: "Endriky ny fihaonana" },
    { key: "participants", label: "Mpandray anjara" },
    { key: "details", label: "Antsipiriany" },
    { key: "image", label: "Sary fanehoana" },
    { key: "rules", label: "Fitsipika" },
  ] as const;

  const onImageSelected = (e: ChangeEvent<HTMLInputElement>) => {
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
      setFormData((prev) => ({ ...prev, image: String(reader.result || "") }));
      setError("");
    };
    reader.onerror = () => setError("Tsy voavaky ny sary.");
    reader.readAsDataURL(file);
  };

  const applyTypeTemplate = (type: string) => {
    const template = ROLE_TEMPLATES_BY_TYPE[type] || ROLE_TEMPLATES_BY_TYPE.Hafa;
    setFormData((prev) => ({
      ...prev,
      type,
      participantRoles: template.map((role) => ({
        ...role,
        slots: prev.sessionMode === "CONTINUOUS_LIVE" ? 1 : role.slots,
      })),
    }));
  };

  const applySessionMode = (sessionMode: SessionMode) => {
    setFormData((prev) => ({
      ...prev,
      sessionMode,
      participantRoles: prev.participantRoles.map((role) => ({
        ...role,
        slots: sessionMode === "CONTINUOUS_LIVE" ? 1 : Math.max(1, role.slots),
      })),
    }));
  };

  const updateParticipantRole = (index: number, patch: Partial<ParticipantRole>) => {
    setFormData((prev) => ({
      ...prev,
      participantRoles: prev.participantRoles.map((role, idx) =>
        idx === index ? { ...role, ...patch } : role
      ),
    }));
  };

  const removeParticipantRole = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      participantRoles: prev.participantRoles.filter((_, idx) => idx !== index),
    }));
  };

  const addParticipantRole = () => {
    setFormData((prev) => ({
      ...prev,
      participantRoles: [
        ...prev.participantRoles,
        {
          key: `role_${prev.participantRoles.length + 1}`,
          label: "",
          description: "",
          required: false,
          slots: 1,
        },
      ],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Tsy maintsy miditra aloha ianao vao afaka manao izany.");
      setLoading(false);
      return;
    }

    const validRoles = formData.participantRoles.filter(
      (role) => role.label.trim().length > 0 && Number(role.slots) > 0
    );
    if (validRoles.length === 0) {
      setError("Ampidiro farafahakeliny andraikitra iray ho an'ny mpikabary.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/kabary/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          participantRoles: validRoles,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Tsy nahomby ny famoronana lohahevitra");
      }

      router.push("/library");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validRolesCount = formData.participantRoles.filter((role) => role.label.trim().length > 0).length;
  const canGoNext =
    currentStep === 0
      ? formData.title.trim().length > 0 && formData.type.trim().length > 0
      : currentStep === 1
        ? formData.sessionMode.length > 0
        : currentStep === 2
          ? validRolesCount > 0
          : currentStep === 3
            ? formData.description.trim().length > 0
            : currentStep === 4
              ? true
              : currentStep === 5
                ? true
        : true;

  return (
    <div className="min-h-screen bg-surface pt-32 pb-20 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none bg-fixed opacity-[0.12]"
        style={{
          backgroundImage: "url('/hero_pattern.png')",
          backgroundSize: "650px",
          backgroundPosition: "center",
        }}
      />
      <div className="w-full px-5 md:px-8 lg:px-10 relative z-10">
        <div className="w-full">
          <Link href="/library" className="inline-flex items-center gap-2 text-neutral-400 hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest mb-10 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> HIVERINA AMIN'NY BOKY
          </Link>

          <header className="mb-8">
            <div className="inline-flex h-9 items-center gap-2 bg-primary/5 text-primary px-3 rounded-xl text-[9px] font-black uppercase tracking-widest mb-4">
              <BookOpen size={14} /> Forona vaovao
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-neutral-900 uppercase tracking-tighter leading-none mb-4">
              Hanorona Lohahevitra
            </h1>
            <p className="text-neutral-500 font-medium max-w-2xl">
              Fenoy ny mombamomba ny Kabary tianao hapetraka eto amin'ny sehatra mba ho hitan'ny mpikabary.
            </p>
          </header>

          {error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-8 text-sm flex items-center gap-3 border border-red-100 font-bold">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)_340px] gap-6 items-start">
                <aside className="pro-card p-4 bg-white lg:sticky lg:top-28 h-fit">
                  <div className="space-y-2">
                    {steps.map((step, index) => {
                      const done = index < currentStep;
                      const active = index === currentStep;
                      return (
                        <button
                          key={step.key}
                          type="button"
                          onClick={() => setCurrentStep(index)}
                          className={`w-full min-h-12 text-left rounded-xl border px-3 py-0 transition-colors ${
                            active ? "border-primary/30 bg-primary/5" : "border-neutral-100 bg-white hover:border-neutral-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {done ? <CheckCircle2 size={16} className="text-primary" /> : <span className={`w-4 h-4 rounded-full border ${active ? "border-primary bg-primary/15" : "border-neutral-300"}`} />}
                            <span className="text-[11px] font-black uppercase tracking-widest text-neutral-700">{step.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </aside>

                <section className="pro-card p-6 md:p-8 bg-white space-y-8">
                  {currentStep === 0 && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                            <Tag size={14} className="text-primary" /> Anaran'ny lohahevitra
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full h-12 bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-0 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="o.hat: Fangataham-bady"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                            <Info size={14} className="text-primary" /> Karazana Kabary
                          </label>
                          <StyledDropdown
                            value={formData.type}
                            onChange={applyTypeTemplate}
                            options={[
                              { value: "Fanambadiana", label: "Fanambadiana" },
                              { value: "Famadihana", label: "Famadihana" },
                              { value: "Fandroana", label: "Fandroana" },
                              { value: "Fahafatesana", label: "Fahafatesana" },
                              { value: "Hafa", label: "Hafa" },
                            ]}
                            label="Karazana Kabary"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                        <Clock size={14} className="text-primary" /> Fomba fandraisana anjara
                      </label>
                      <StyledDropdown
                        value={formData.sessionMode}
                        onChange={(value) => applySessionMode(value as SessionMode)}
                        options={[
                          { value: "CONTINUOUS_LIVE", label: "Live mitohy (olona 1 isaky ny andraikitra)" },
                          { value: "ASYNCHRONOUS_LIVE", label: "Live miatoato (olona maro isaky ny andraikitra)" },
                        ]}
                        label="Fomba live"
                      />
                      <p className="text-xs text-neutral-500 font-medium">
                        {formData.sessionMode === "CONTINUOUS_LIVE"
                          ? "Mila tonga miaraka sy amin'ny ora voafaritra ny mpandray anjara rehetra."
                          : "Azo tohizana amin'ny fotoana samihafa ny valin-kabary, ka afaka miditra tsikelikely ny mpandray anjara."}
                      </p>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                          <Users size={14} className="text-primary" /> Anjara asan&apos;ireo mpikabary
                        </label>
                        <button
                          type="button"
                          onClick={addParticipantRole}
                          className="inline-flex h-10 items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-0 rounded-xl border border-neutral-200 bg-white hover:border-primary/40 hover:text-primary transition-colors"
                        >
                          <Plus size={12} />
                          Ampio andraikitra
                        </button>
                      </div>
                      {formData.sessionMode === "CONTINUOUS_LIVE" && (
                        <p className="text-xs text-neutral-500 font-medium">
                          Amin&apos;ny live mitohy: olona 1 farafahabetsany isaky ny andraikitra.
                        </p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.participantRoles.map((role, index) => (
                          <div key={`${role.key}-${index}`} className="border border-neutral-100 rounded-xl p-4 bg-neutral-50/60 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_92px] gap-3">
                              <input
                                type="text"
                                placeholder="Anarana andraikitra"
                                value={role.label}
                                onChange={(e) => updateParticipantRole(index, { label: e.target.value })}
                                className="w-full h-10 bg-white border border-neutral-100 rounded-xl px-3 py-0 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={formData.sessionMode === "CONTINUOUS_LIVE" ? 1 : role.slots}
                                onChange={(e) => updateParticipantRole(index, { slots: Number(e.target.value) || 1 })}
                                disabled={formData.sessionMode === "CONTINUOUS_LIVE"}
                                className="w-full h-10 bg-white border border-neutral-100 rounded-xl px-3 py-0 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                title="Isan'ny mpikabary amin'ity andraikitra ity"
                              />
                            </div>
                            <textarea
                              rows={2}
                              placeholder="Famaritana fohy..."
                              value={role.description}
                              onChange={(e) => updateParticipantRole(index, { description: e.target.value })}
                              className="w-full bg-white border border-neutral-100 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <div className="flex items-center justify-between">
                              <label className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600">
                                <input
                                  type="checkbox"
                                  checked={role.required}
                                  onChange={(e) => updateParticipantRole(index, { required: e.target.checked })}
                                  className="rounded border-neutral-300 text-primary focus:ring-primary/20"
                                />
                                Tsy maintsy fenoina
                              </label>
                              <button
                                type="button"
                                onClick={() => removeParticipantRole(index)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={13} />
                                Esory
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                          <BookOpen size={14} className="text-primary" /> Famaritana ny contexte
                        </label>
                        <textarea
                          required
                          rows={4}
                          className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Lazao eto ny antsipirian'ity lohahevitra ity..."
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                          <Clock size={14} className="text-primary" /> Fe-potoana (Minitra)
                        </label>
                        <input
                          type="number"
                          className="w-full h-12 bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-0 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        />
                      </div>
                    </>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                        <ImageIcon size={14} className="text-primary" /> Sary fanoharana
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-start">
                        <input id="context-image-input" type="file" accept="image/*" className="hidden" onChange={onImageSelected} />
                        <div className="relative">
                          <label
                            htmlFor="context-image-input"
                            className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-neutral-100 bg-neutral-50 flex items-center justify-center text-neutral-300 cursor-pointer group"
                          >
                            {formData.image ? (
                              <Image src={formData.image} alt="Sary lohahevitra" fill className="object-cover" sizes="220px" />
                            ) : (
                              <ImageIcon size={26} />
                            )}
                            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </label>
                          <label
                            htmlFor="context-image-input"
                            className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-white border border-neutral-200 text-neutral-600 shadow-md hover:text-primary hover:border-primary/30 inline-flex items-center justify-center cursor-pointer"
                          >
                            <Upload size={13} />
                          </label>
                        </div>
                        <div className="space-y-2">
                          {formData.image && (
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                              className="block text-xs font-bold text-neutral-500 hover:text-secondary"
                            >
                              Esory ny sary
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                          <ShieldAlert size={14} className="text-primary" /> Fitsipika (Rules)
                        </label>
                        <textarea
                          rows={4}
                          className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Ohatra: Teny madio, fanajana ny taona..."
                          value={formData.rules}
                          onChange={(e) => setFormData({...formData, rules: e.target.value})}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                          <AlertCircle size={14} className="text-primary" /> Zavatra fady (Restrictions)
                        </label>
                        <textarea
                          rows={4}
                          className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Lazao ireo lohahevitra tsy azo kasihina..."
                          value={formData.restrictions}
                          onChange={(e) => setFormData({...formData, restrictions: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-neutral-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                      disabled={currentStep === 0}
                      className="pro-button-outline px-5 disabled:opacity-50"
                    >
                      <ArrowLeft size={16} />
                      Dingana teo aloha
                    </button>
                    {currentStep < steps.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                        disabled={!canGoNext}
                        className="pro-button-primary px-5 disabled:opacity-50"
                      >
                        Dingana manaraka
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="pro-button-primary px-6 disabled:opacity-60"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Send size={18} />
                            HAPETRAKA NY LOHAHEVITRA
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </section>

                <aside className="pro-card lg:sticky lg:top-28 h-fit bg-white p-4 space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    Aperçu dynamique
                  </div>
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100">
                    {formData.image ? (
                      <Image src={formData.image} alt={formData.title || "Aperçu"} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300"><ImageIcon size={26} /></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-neutral-900 leading-tight">{formData.title || "Anaran'ny lohahevitra..."}</h3>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <span className="h-12 inline-flex items-center rounded-xl bg-neutral-50 border border-neutral-100 px-4 text-sm font-black text-primary">
                        {formData.type}
                      </span>
                      <span className="h-12 inline-flex items-center rounded-xl bg-neutral-50 border border-neutral-100 px-4 text-sm font-black text-neutral-600">
                        {formData.sessionMode === "CONTINUOUS_LIVE" ? "Live mitohy" : "Live miatoato"}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">{formData.description || "Famaritana ny lohahevitra..."}</p>
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                      Anjara asa ({validRolesCount})
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-auto pr-1">
                      {formData.participantRoles.filter((r) => r.label.trim()).map((role, idx) => (
                        <div key={`${role.key}-preview-${idx}`} className="h-12 text-sm bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-0 flex items-center justify-between">
                          <span className="font-semibold text-neutral-700">{role.label}</span>
                          <span className="text-neutral-400 font-bold">x{formData.sessionMode === "CONTINUOUS_LIVE" ? 1 : role.slots}</span>
                        </div>
                      ))}
                      {validRolesCount === 0 && (
                        <div className="h-12 text-sm bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-0 flex items-center text-neutral-400">
                          Tsy mbola misy andraikitra.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-12 rounded-xl bg-neutral-50 border border-neutral-100 px-4 py-0 flex items-center text-sm text-neutral-500">
                    <span className="font-bold text-neutral-700">Fe-potoana:</span> {formData.duration || "-"} min
                  </div>
                </aside>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { UserRole } from "@kabary/shared";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import { StyledDropdown } from "@/components/StyledDropdown";

const ROLE_LABELS: Record<string, string> = {
  [UserRole.PRO]: "Mpikabary Matihanina",
  [UserRole.BEGINNER]: "Mpikabary vao manomboka",
  [UserRole.STUDENT]: "Mpianatra Kabary",
  [UserRole.SPECTATOR]: "Mpijery tsotra",
  [UserRole.INSTITUTION]: "Sekoly / Fikambanana",
  [UserRole.ADMIN]: "Mpandrindra (Admin)",
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: UserRole.SPECTATOR,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tsy nahomby ny fisoratana anarana");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-28 pb-16 px-6 relative overflow-x-hidden">
      <div
        className="absolute inset-0 pointer-events-none bg-fixed"
        style={{
          backgroundImage: "url('/hero_pattern.png')",
          backgroundSize: "700px",
          backgroundPosition: "center",
          opacity: 0.14,
        }}
      />
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 place-items-center min-h-[70vh] relative z-10">
          <section className="pro-card p-8 lg:p-10 bg-white w-full max-w-xl overflow-visible relative">
            <h2 className="text-2xl md:text-3xl font-black text-neutral-900 uppercase tracking-tighter mb-6">
              Hamorona Kaonty
            </h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">Anarana feno</label>
                <input
                  type="text"
                  required
                  className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Rakoto Jean"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">Laharana finday</label>
                <input
                  type="tel"
                  required
                  className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="034 00 000 00"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">Teny fanalahidy</label>
                <input
                  type="password"
                  required
                  className="w-full bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-neutral-500 mb-2">Karazana mpikambana</label>
                <StyledDropdown
                  value={formData.role}
                  onChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                  options={Object.entries(ROLE_LABELS).map(([role, label]) => ({
                    value: role,
                    label,
                  }))}
                  label="Karazana mpikambana"
                />
              </div>

              <button type="submit" className="pro-button-primary w-full py-3.5 mt-2" disabled={loading}>
                {loading ? "Andraso kely..." : "Hamorona kaonty"}
              </button>
            </form>

            <p className="mt-6 text-sm text-neutral-500">
              Efa manana kaonty?{" "}
              <Link href="/login" className="text-secondary font-black hover:underline">
                Midira eto
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

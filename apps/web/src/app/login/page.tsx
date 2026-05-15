"use client";

import React, { useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/config";

export default function LoginPage() {
  const [formData, setFormData] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔍 Tentative de connexion sur :", `${API_URL}/users/login`);
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tsy nahomby ny fidirana");

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
    <div className="min-h-screen bg-surface pt-28 pb-16 px-6 relative overflow-hidden">
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
          <section className="pro-card p-8 lg:p-10 bg-white w-full max-w-xl">
            <h2 className="text-2xl md:text-3xl font-black text-neutral-900 uppercase tracking-tighter mb-6">
              Hiditra ao amin'ny Kaonty
            </h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <button type="submit" className="pro-button-primary w-full py-3.5 mt-2" disabled={loading}>
                {loading ? "Andraso kely..." : "Midira"}
              </button>
            </form>

            <p className="mt-6 text-sm text-neutral-500">
              Mbola tsy manana kaonty?{" "}
              <Link href="/register" className="text-secondary font-black hover:underline">
                Hisoratra anarana
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

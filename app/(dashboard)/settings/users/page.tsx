"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { 
  Users, 
  UserPlus, 
  Mail, 
  ShieldAlert,
  Loader2,
  Trash2
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UsersSettingsPage() {
  const { currentUser } = useAppStore();
  const supabase = createSupabaseBrowserClient();
  const { toast } = useToast();

  const [staffList, setStaffList] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setStaffList(data as Profile[]);
    }
    setIsLoading(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);

    try {
      const res = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, name: inviteName }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast("Undangan berhasil dikirim ke email kasir!", "success");
        setIsInviteOpen(false);
        setInviteEmail("");
        setInviteName("");
        fetchStaff();
      } else {
        toast(result.error || "Gagal mengundang pengguna", "error");
      }
    } catch (err) {
      toast("Terjadi kesalahan jaringan", "error");
    } finally {
      setIsInviting(false);
    }
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100">
        <ShieldAlert className="w-12 h-12 text-terracotta-500 mb-3" />
        <h2 className="text-xl font-bold text-ink-primary">Akses Ditolak</h2>
        <p className="text-ink-secondary">Hanya admin yang bisa mengelola akun kasir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink-primary">Manajemen Kasir</h1>
          <p className="text-sm text-ink-secondary">Kelola akses staf dan kasir di toko Anda</p>
        </div>
        <Button onClick={() => setIsInviteOpen(true)} variant="primary" className="shrink-0">
          <UserPlus className="w-4 h-4 mr-2" />
          Undang Kasir
        </Button>
      </div>

      {isInviteOpen && (
        <div className="bg-white p-6 rounded-xl border border-terracotta-100 shadow-sm mb-6 animate-in fade-in zoom-in-95">
          <h3 className="text-lg font-bold text-ink-primary mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-terracotta-600" />
            Undang Kasir Baru
          </h3>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Input
                label="Nama Kasir"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Contoh: Siti Kasir"
                required
              />
            </div>
            <div className="flex-1 w-full">
              <Input
                label="Alamat Email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="siti@toko.com"
                required
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)} className="flex-1">
                Batal
              </Button>
              <Button type="submit" variant="primary" isLoading={isInviting} className="flex-1">
                Kirim Undangan
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-terracotta-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Nama User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Peran (Role)</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-ink-primary flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-terracotta-100 text-terracotta-700 flex items-center justify-center font-bold">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      {staff.name}
                    </td>
                    <td className="p-4 text-sm text-ink-secondary">{staff.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        staff.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {staff.role === 'admin' ? 'Admin' : 'Kasir'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {staff.role !== 'admin' && (
                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Hapus
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

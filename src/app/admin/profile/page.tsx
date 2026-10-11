"use client";

import { useState, useEffect } from "react";
import { UserCircle, Key, Save, MessageCircle } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useAuth } from "@/contexts/auth-context";
import { updatePassword, getAuth as getFirebaseAuth } from "firebase/auth";
import { useStoreSettings } from "@/contexts/store-settings-context";

export default function AdminProfilePage() {
  const { user } = useAuth();
  const { settings, saveSettings, ready } = useStoreSettings();
  
  const [username, setUsername] = useState("Admin User");
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [whatsappMsg, setWhatsappMsg] = useState(settings.whatsappMessage);
  useEffect(() => {
    if (ready) {
      queueMicrotask(() => {
        setWhatsappNumber(settings.whatsappNumber);
        setWhatsappMsg(settings.whatsappMessage);
      });
    }
  }, [ready, settings.whatsappNumber, settings.whatsappMessage]);
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("Profile settings saved successfully.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSaveWhatsapp = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      ...settings,
      whatsappNumber,
      whatsappMessage: whatsappMsg
    });
    setSuccessMsg("WhatsApp settings saved successfully.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };



  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setSuccessMsg("");
    
    if (password !== confirmPassword) {
      setPwdError("Passwords do not match.");
      return;
    }
    
    if (password.length < 6) {
      setPwdError("Password must be at least 6 characters.");
      return;
    }
    
    try {
      const currentUser = getFirebaseAuth().currentUser;
      if (currentUser) {
        await updatePassword(currentUser, password);
        setSuccessMsg("Password updated successfully.");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setPwdError((err as Error).message || "Could not update password. Please re-authenticate and try again.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-[1600px] w-full mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Store Settings & Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your admin account details and integrations</p>
        </div>

        {successMsg && (
          <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            {successMsg}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          {/* General Profile Info */}
          <div className="bg-card border border-border/50 shadow-md rounded-3xl p-6 sm:p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <UserCircle size={24} className="text-primary" />
              <h2 className="text-lg font-semibold">General Information</h2>
            </div>
            
            <form onSubmit={handleSaveProfile} className="flex-1 flex flex-col space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || "admin@gmail.com"}
                  className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/80 text-muted-foreground text-sm font-medium truncate cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 mt-6"
              >
                <Save size={18} /> Save Settings
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-card border border-border/50 shadow-md rounded-3xl p-6 sm:p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <Key size={24} className="text-primary" />
              <h2 className="text-lg font-semibold">Security & Password</h2>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="flex-1 flex flex-col space-y-4">
              {pwdError && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                  {pwdError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm font-medium"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-border/50 bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 mt-6"
              >
                <Key size={18} /> Update Password
              </button>
            </form>
          </div>
          
          {/* WhatsApp Integration (Full Width) */}
          <div className="xl:col-span-2 bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#25D366]/20">
              <MessageCircle size={24} className="text-[#25D366]" />
              <h2 className="text-lg font-semibold text-[#128C7E]">WhatsApp Integration</h2>
            </div>
            
            <form onSubmit={handleSaveWhatsapp} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#128C7E]">WhatsApp Number</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-4 py-3 rounded-xl border border-[#25D366]/30 bg-background/50 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 text-sm"
                  />
                  <p className="text-xs text-[#128C7E]/70 mt-1">Make sure to include your country code (e.g. 91 for India).</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#128C7E]">Custom Pre-filled Message</label>
                  <textarea
                    value={whatsappMsg}
                    onChange={(e) => setWhatsappMsg(e.target.value)}
                    rows={3}
                    placeholder="Hello! I would like to inquire about..."
                    className="w-full px-4 py-3 rounded-xl border border-[#25D366]/30 bg-background/50 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 text-sm"
                  />
                  <p className="text-xs text-[#128C7E]/70 mt-1">This exact message will pop up when users click the chat bubble.</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#25D366] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Update WhatsApp Sync
                </button>
              </div>
            </form>
          </div>



        </div>
      </div>
    </AdminLayout>
  );
}

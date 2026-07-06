import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { fadeUp, fadeUpSm, stagger } from "../lib/motion";

export function SettingsPage() {
  const { token, user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [key, setKey] = useState("");
  const save = useMutation({
    mutationFn: () => api.settings(token!, { name, openrouter_api_key: key }),
    onSuccess: (data) => setUser(data.user),
  });
  const remove = useMutation({ mutationFn: () => api.deleteAccount(token!), onSuccess: logout });

  return (
    <div className="space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage theme, profile, API key fallback, and account controls.</p>
      </motion.div>

      <motion.div className="grid gap-5 lg:grid-cols-2" variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUpSm}>
          <Card>
            <CardHeader><CardTitle>Profile</CardTitle><Save className="text-primary" /></CardHeader>
            <label className="block text-sm font-medium">Display name<Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} /></label>
            <Button className="mt-4" onClick={() => save.mutate()} disabled={save.isPending}><Save size={16} /> Save profile</Button>
            <AnimatePresence>
              {save.isSuccess && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 text-sm text-primary"
                >
                  Settings saved.
                </motion.p>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
        <motion.div variants={fadeUpSm}>
          <Card>
            <CardHeader><CardTitle>OpenRouter API key</CardTitle><KeyRound className="text-primary" /></CardHeader>
            <Input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-or-..." />
            <p className="mt-3 text-sm text-muted-foreground">Leave blank to rely on Predictra's local statistical engine.</p>
            <Button className="mt-4" variant="secondary" onClick={() => save.mutate()} disabled={save.isPending}>Update key</Button>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="glow-border rounded-xl" style={{ "--glow-color": "rgba(244,63,94,0.35)" } as React.CSSProperties}>
          <Card className="border-rose-500/30 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-rose-500/20 pointer-events-none"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <CardHeader><CardTitle>Delete account</CardTitle><Trash2 className="text-rose-600" /></CardHeader>
            <p className="text-sm text-muted-foreground">This removes your local account and uploaded datasets from the backend.</p>
            <Button className="mt-4" variant="danger" onClick={() => remove.mutate()} disabled={remove.isPending}><Trash2 size={16} /> Delete account</Button>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

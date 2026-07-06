import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { ThemeToggle } from "../components/ThemeToggle";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { scaleIn, stagger, fadeUpSm } from "../lib/motion";

const schema = z.object({
  name: z.preprocess((value) => (value === "" ? undefined : value), z.string().min(2).optional()),
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", name: "" } });
  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: FormValues) {
    setError("");
    try {
      if (mode === "signup") await auth.signup(values.name || "Predictra User", values.email, values.password);
      else await auth.login(values.email, values.password);
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center bg-muted/35 p-4">
      <div className="aurora-mini" />
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <motion.div variants={scaleIn} initial="hidden" animate="show" className="relative z-10 w-full max-w-md">
        <Card>
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16} /> Back</Link>
          <h1 className="text-3xl font-semibold">{mode === "signup" ? "Create your workspace" : "Welcome back"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Analyze data, generate insights, and export decisions from one secure dashboard.</p>
          <motion.form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" variants={stagger} initial="hidden" animate="show">
            {mode === "signup" && (
              <motion.label variants={fadeUpSm} className="block text-sm font-medium">
                Name
                <Input className="mt-2" {...form.register("name")} autoComplete="name" />
              </motion.label>
            )}
            <motion.label variants={fadeUpSm} className="block text-sm font-medium">
              Email
              <Input className="mt-2" type="email" {...form.register("email")} autoComplete="email" />
            </motion.label>
            <motion.label variants={fadeUpSm} className="block text-sm font-medium">
              Password
              <Input className="mt-2" type="password" {...form.register("password")} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
            </motion.label>
            <AnimatePresence>
              {error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.div variants={fadeUpSm}>
              <Button className="w-full" disabled={submitting}>{submitting && <Loader2 className="animate-spin" size={16} />}{mode === "signup" ? "Create account" : "Login"}</Button>
            </motion.div>
          </motion.form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
            <Link className="font-medium text-primary" to={mode === "signup" ? "/login" : "/signup"}>{mode === "signup" ? "Login" : "Sign up"}</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

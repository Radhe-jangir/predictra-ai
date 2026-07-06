import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, FileText, UploadCloud, User } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Reveal } from "../components/ui/Reveal";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { fadeUp, scaleIn, stagger, fadeUpSm } from "../lib/motion";

type RecentUpload = { id: number; name: string; created_at: string };
type SavedReport = { id: number; title: string; created_at: string };

export function ProfilePage() {
  const { token, user } = useAuth();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => api.me(token!), enabled: Boolean(token) });
  if (profile.isLoading) return <Skeleton className="h-80" />;
  return (
    <div className="space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className="text-3xl font-semibold">Profile</h1>
        <p className="mt-2 text-muted-foreground">Your uploads, reports, and account activity.</p>
      </motion.div>

      <motion.div variants={scaleIn} initial="hidden" animate="show">
        <Card glass className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </Card>
      </motion.div>

      <Reveal delay={0.1}>
        <motion.div className="grid gap-5 md:grid-cols-2" variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUpSm}>
            <Card>
              <CardHeader><CardTitle>Recent uploads</CardTitle><UploadCloud className="text-primary" /></CardHeader>
              <div className="space-y-3">
                {(profile.data?.recent_uploads as RecentUpload[] | undefined)?.map((item) => <p key={item.id} className="rounded-md bg-muted p-3 text-sm">{item.name}</p>)}
                {!profile.data?.recent_uploads.length && <p className="text-sm text-muted-foreground">No uploads yet.</p>}
              </div>
            </Card>
          </motion.div>
          <motion.div variants={fadeUpSm}>
            <Card>
              <CardHeader><CardTitle>Saved reports</CardTitle><FileText className="text-primary" /></CardHeader>
              <div className="space-y-3">
                {(profile.data?.saved_reports as SavedReport[] | undefined)?.map((item) => <p key={item.id} className="rounded-md bg-muted p-3 text-sm">{item.title}</p>)}
                {!profile.data?.saved_reports.length && <p className="text-sm text-muted-foreground">No reports yet.</p>}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </Reveal>

      <Reveal delay={0.2}>
        <Card>
          <CardHeader><CardTitle>Analytics history</CardTitle><Calendar className="text-primary" /></CardHeader>
          <p className="text-sm text-muted-foreground">Activity is tracked per dataset in the workbench after uploads, cleaning, ML, insights, and exports.</p>
        </Card>
      </Reveal>
    </div>
  );
}

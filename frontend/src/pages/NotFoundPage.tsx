import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { fadeUp } from "../lib/motion";

export function NotFoundPage() {
  return (
    <div className="relative grid min-h-screen place-items-center p-6 text-center">
      <div className="aurora-mini" />
      <div className="relative z-10">
        <p className="text-8xl font-black text-gradient animate-float md:text-9xl">404</p>
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <h1 className="mt-4 text-4xl font-semibold">Page not found</h1>
          <p className="mt-3 text-muted-foreground">The route you opened does not exist.</p>
        </motion.div>
        <Link to="/app"><Button className="mt-6">Go to dashboard</Button></Link>
      </div>
    </div>
  );
}

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Skeleton } from "./ui/Skeleton";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8"><Skeleton className="h-16 w-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

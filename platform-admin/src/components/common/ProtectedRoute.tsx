import { useAppDispatch, useAppSelector } from "@/hooks/use-store";
import { fetchMe } from "@/store/auth/auth.slice";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { Spinner } from "@/components/ui/spinner";

const ProtectedRoute = () => {
  const { status, accessToken } = useAppSelector((state) => state.auth);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, []);

  if (status === "loading")
    return (
      <div className="flex h-svh w-full flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <Spinner className="size-6" />
        <p className="text-sm">Loading...</p>
      </div>
    );

  const isAuthenticated = Boolean(accessToken) && status !== "failed";
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;

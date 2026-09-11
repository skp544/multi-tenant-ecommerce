import { useAppDispatch, useAppSelector } from "@/hooks/use-store";
import { fetchMe } from "@/store/auth/auth.slice";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { user, status, accessToken } = useAppSelector((state) => state.auth);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, []);

  if (status === "loading")
    return (
      <div>
        <p>Loading...</p>
      </div>
    );

  const isAuthenticated = Boolean(accessToken) && status !== "failed";
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;

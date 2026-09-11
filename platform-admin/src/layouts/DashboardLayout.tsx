import { useAppDispatch, useAppSelector } from "@/hooks/use-store";
import { fetchMe } from "@/store/auth/auth.slice";
import { useEffect } from "react";
import { Outlet } from "react-router";

const DashboardLayout = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchMe());
  }, []);

  return (
    <div>
      <h1>DashboardLayout</h1>
      <Outlet />
    </div>
  );
};

export default DashboardLayout;

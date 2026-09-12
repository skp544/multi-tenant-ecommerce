import { Outlet, useNavigate } from "react-router";
import { getCurrentYear } from "@/lib/utils";
import { useAppSelector } from "@/hooks/use-store";
import { useEffect } from "react";

const AuthLayout = () => {
  const { accessToken } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      navigate("/dashboard");
    }
  }, [accessToken, navigate]);

  return (
    <div className="flex min-h-svh">
      {/* Left  */}
      <div className="hidden sm:flex flex-col justify-between bg-linear-to-br from-brand-panel-from to-brand-panel-to lg:w-[40%] xl:w=[45%] p-12">
        <div className="flex items-center gap-3">
          <img
            src="/logos/platform-logo.png"
            alt="Platform Admin logo"
            className="size-12 rounded-xl shadow-lg shadow-black/20"
          />
          <span className="text-base font-bold text-white">Platform Admin</span>
        </div>

        <div>
          <h1 className="max-w-95 text-2xl leading-snug font-bold text-white">
            Run every store on your marketplace from one place
          </h1>

          <p className="mt-3.5 max-w-90 text-sm leading-5 text-brand-panel-foreground-muted">
            Tenants, catalog, commissions, delivery network and reporting -
            unified across every store on the platform
          </p>
        </div>
        <p className="text-xs text-brand-panel-foreground-subtle">
          &copy; {getCurrentYear()} Platform Admin. All rights reserved.
        </p>
      </div>
      {/* Right */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;

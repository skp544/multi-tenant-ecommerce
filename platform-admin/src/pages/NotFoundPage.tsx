import { Button } from "@/components/ui/button";
import { getCurrentYear } from "@/lib/utils";
import { CompassIcon } from "lucide-react";
import { Link } from "react-router";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-8 text-center">
      <div className="flex flex-col items-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-brand-panel-from to-brand-panel-to shadow-lg shadow-black/10">
          <CompassIcon className="size-8 text-white" />
        </div>

        <p className="mt-6 text-6xl font-bold tracking-tight text-foreground">
          404
        </p>

        <h1 className="mt-2 text-xl font-semibold text-foreground">
          Page not found
        </h1>

        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The page you're looking for doesn't exist or you no longer have access
          to it. Head back to the login page to continue.
        </p>

        <Button asChild className="mt-6 h-10 px-5">
          <Link to="/auth/login">Back to Login</Link>
        </Button>
      </div>

      <p className="mt-12 text-xs text-muted-foreground">
        &copy; {getCurrentYear()} Platform Admin. All rights reserved.
      </p>
    </div>
  );
};

export default NotFoundPage;

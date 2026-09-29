import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/use-store";
import { fetchSessions } from "@/store/auth/auth.slice";
import TitleHeading from "../common/TitleHeading";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const SessionCard = () => {
  const dispatch = useAppDispatch();
  const sessions = useAppSelector((state) => state.auth.sessions);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        await dispatch(fetchSessions()).unwrap();
      } catch (error) {
        toast.error(error as string);
      } finally {
        setSessionsLoading(false);
      }
    };

    loadSessions();
  }, [dispatch]);

  return (
    <Card className="p-4 lg:p-6 min-h-52">
      <TitleHeading
        title="Active Sessions"
        description={`${sessions.length} ${sessions.length === 1 ? "Device" : "Devices"} signed in`}
        className="flex justify-between gap-4"
        classNameTitle="font-medium text-base "
      />

      <div className="grid gap-3">
        {sessionsLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          sessions.slice(0, 5).map((session) => (
            <div key={session.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Monitor className="size-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {session.deviceLabel ?? "Unknown device"}
                      {session.isCurrent && (
                        <span className="ml-2 bg-primary/20 text-primary font-semibold px-2 py-0.5 text-xs rounded-full">
                          This device
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.ipAddress ?? "Unknown IP"} · Last active{" "}
                      {new Date(session.lastActiveAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-b mt-3" />
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default SessionCard;

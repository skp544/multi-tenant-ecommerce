import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/use-store";
import { fetchSessions } from "@/store/auth/auth.slice";
import TitleHeading from "../common/TitleHeading";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { getRelativeTime } from "@/lib";

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
          sessions.slice(0, 5).map((session, index) => (
            <div key={session.id}>
              {index > 0 && <div className="border-t mb-3" />}
              <div className="flex justify-between ">
                {/* device details */}
                <div>
                  <p className="font-semibold">{session.deviceLabel}</p>
                  <p className="">{getRelativeTime(session.lastActiveAt)}</p>
                </div>
                {/* <Button /> */}
                <div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Revoke</Button>
                    </DialogTrigger>

                    <DialogContent className="w-full lg:max-w-2xl min-h-28 p-4 lg:p-6">
                      <TitleHeading
                        title="Revoke Session"
                        classNameTitle="font-semibold "
                        description=""
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default SessionCard;

import TitleHeading from "@/components/common/TitleHeading";
import ChangePassword from "@/components/my-account/ChangePassword";
import ProfileUpdate from "@/components/my-account/ProfileUpdate";
import TwoFactorAuthentication from "@/components/my-account/TwoFactorAuthentication";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAppSelector } from "@/hooks/use-store";
import { getAvatarName } from "@/lib";
import { ArrowRight } from "lucide-react";

const MyAccountPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div>
      <TitleHeading
        title="My Account"
        description={`Your profile, password, two-factor authentication, and where you're currently signed in.`}
      />

      <div className="space-y-4 space-x-4 mt-4 lg:mt-6">
        {/* User details and roles */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="col-span-1 lg:col-span-2">
            <Card className="p-4 lg:p-6 min-h-52">
              <div className="flex justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="cursor-pointer w-14 h-14">
                    <AvatarImage src={user?.profileImage} />
                    <AvatarFallback className="bg-primary font-semibold text-white truncate">
                      {getAvatarName(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-lg truncate">
                      {user?.fullName}
                    </div>
                    <div className="bg-primary/20 text-primary font-semibold px-3 py-1 text-xs rounded-full w-fit">
                      {user?.userType}
                    </div>
                  </div>
                </div>

                <div>
                  <ProfileUpdate user={user} />
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Email</Label>
                  <div>{user?.email}</div>
                </div>
                <div className="border-b" />
                <div className="flex items-center justify-between">
                  <Label>Phone</Label>
                  <div>{user?.phone}</div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-4 lg:p-6 min-h-52">
              <TitleHeading
                title="Role & Access"
                description=""
                classNameTitle="font-medium text-base "
              />

              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Role</Label>
                  <div>{user?.role?.name ?? "-"}</div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Full access to every module - stores, catalog, orders, payouts,
                delivery network, and platform settings
              </p>

              <Button variant="link" className="cursor-pointer">
                View Permission matrix <ArrowRight />
              </Button>
            </Card>
          </div>
        </div>
        {/* Password and security */}
        <Card className="p-4 lg:p-6 min-h-52">
          <TitleHeading
            title="Password & Security"
            description=""
            classNameTitle="font-medium text-base "
          />

          <div className="flex justify-between items-center gap-4 lg:gap-6">
            <div className="flex flex-col">
              <Label>Password</Label>
              <div>Last changed 2 months ago</div>
            </div>
            <div>
              <ChangePassword />
            </div>
          </div>

          <div className="border-b" />
          <div className="flex justify-between items-center gap-4 lg:gap-6">
            <div className="flex flex-col">
              <Label>Two-Factor Authentication</Label>
              <div>
                Extra code required at login, in addition to your password
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <TwoFactorAuthentication user={user!} />
              <Button variant={"outline"}>Disable</Button>
            </div>
          </div>
        </Card>

        {/* Session details */}
      </div>
    </div>
  );
};

export default MyAccountPage;

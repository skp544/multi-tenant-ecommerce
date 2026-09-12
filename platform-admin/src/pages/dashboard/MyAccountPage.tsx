import TitleHeading from "@/components/common/TitleHeading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAppSelector } from "@/hooks/use-store";
import { getAvatarName } from "@/lib";

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
            <Card className="p-4 lg:p-6">
              <div className="flex justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="cursor-pointer w-14 h-14">
                    <AvatarImage src={user?.profileImage} />
                    <AvatarFallback className="bg-primary font-semibold text-white truncate">
                      {getAvatarName(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-lg">
                      {user?.fullName}
                    </div>
                    <div className="bg-primary/20 text-primary font-semibold px-3 py-1 text-xs rounded-full w-fit">
                      {user?.userType}
                    </div>
                  </div>
                </div>

                <div>
                  <Button type="button" variant={"outline"}>
                    Edit Profile
                  </Button>
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
            <Card></Card>
          </div>
        </div>
        {/* Password and security */}

        {/* Session details */}
      </div>
    </div>
  );
};

export default MyAccountPage;

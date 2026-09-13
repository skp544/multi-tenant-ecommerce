import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import type { User } from "@/types/user";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import TitleHeading from "../common/TitleHeading";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAppDispatch } from "@/hooks/use-store";
import { updateUser } from "@/store/auth/auth.slice";
import { toast } from "sonner";

type Props = {
  user?: User | null;
};

const ProfileUpdate = ({ user }: Props) => {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<User>(user!);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setData(user!);
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const result = await dispatch(
        updateUser({
          fullName: data.fullName,
          phone: data.phone ?? null,
          profileImage: data.profileImage ?? null,
        }),
      ).unwrap();

      toast.success(result.message);
    } catch (error) {
      toast.error(error as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant={"outline"} className="cursor-pointer">
          Edit Profile
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full lg:max-w-2xl min-h-28 p-4 lg:p-6">
        <TitleHeading
          title="Edit Profile"
          classNameTitle="font-semibold"
          description="Update your profile details"
        />

        <form onSubmit={handleSubmit} className="my-3 grid gap-4 grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              type="text"
              name="fullName"
              placeholder="Enter full name"
              id="fullName"
              className="h-10"
              value={data?.fullName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="text"
              name="email"
              placeholder="Enter email"
              id="email"
              className="h-10"
              value={data?.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              type="text"
              name="phone"
              placeholder="Enter phone"
              id="phone"
              className="h-10"
              value={data?.phone || ""}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="col-span-2 mt-4">
            <Button className="mx-auto block h-10" disabled={isSubmitting}>
              Update Profile
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileUpdate;

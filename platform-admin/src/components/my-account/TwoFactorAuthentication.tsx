import { useState, type SubmitEvent } from "react";
import TitleHeading from "../common/TitleHeading";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { User } from "@/types/user";
import { useAppDispatch } from "@/hooks/use-store";
import { generate2FAOtp } from "@/store/auth/auth.slice";
import { toast } from "sonner";

type Props = {
  user: User;
};
const TwoFactorAuthentication = ({ user }: Props) => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await dispatch(generate2FAOtp()).unwrap();

      toast.success(result.message);
    } catch (error) {
      toast.error(error as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={"outline"} className="cursor-pointer">
          Enable
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full lg:max-w-2xl min-h-28 p-4 lg:p-6">
        <TitleHeading
          title="Two Factor Authentication"
          classNameTitle="font-semibold"
          description="Add an extra layer of security to your account by enabling two-factor authentication. This will require you to enter a unique code each time you sign in to your account."
        />

        <form
          onSubmit={handleSubmit}
          className="my-3 grid gap-4 lg:gap-6 w-full"
        >
          <div className="w-full flex flex-col gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="Enter your email"
              value={user.email}
              className="h-10"
              required
              disabled
            />
          </div>

          <div className="mt-4">
            <Button className="mx-auto block h-10" disabled={isSubmitting}>
              {isSubmitting ? "Sending otp..." : "Send OTP"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorAuthentication;

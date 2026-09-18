import { useState, type SubmitEvent } from "react";
import TitleHeading from "../common/TitleHeading";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { User } from "@/types/user";
import { useAppDispatch } from "@/hooks/use-store";
import { generate2FAOtp, verify2FAOtp } from "@/store/auth/auth.slice";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

type Props = {
  user: User;
};

const TwoFactorAuthentication = ({ user }: Props) => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSend, setOtpSend] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerifyOTP = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await dispatch(verify2FAOtp({ otp })).unwrap();

      toast.success(response.message);
      setOtp("");
      setOtpSend(false);
      setOpen(false);
    } catch (error) {
      toast.error(error as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await dispatch(generate2FAOtp()).unwrap();

      toast.success(result.message);
      setOtpSend(true);
    } catch (error) {
      toast.error(error as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={"outline"}
          className="cursor-pointer"
          disabled={user.twoFactorEnabled}
        >
          {user.twoFactorEnabled ? "Enabled" : "Enable"}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full lg:max-w-2xl min-h-28 p-4 lg:p-6">
        {otpSend ? (
          <>
            <TitleHeading
              title="Verify your email"
              classNameTitle="font-semibold"
              description={`Enter the 6-digit code we sent to ${user.email}.`}
            />

            <form
              onSubmit={handleVerifyOTP}
              className="my-3 grid gap-4 lg:gap-6 w-full"
            >
              <div className="w-full flex flex-col gap-1">
                <Label>Enter OTP</Label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <InputOTPGroup className="w-full">
                    <InputOTPSlot index={0} className="w-full h-14 text-lg" />
                    <InputOTPSlot index={1} className="w-full h-14 text-lg" />
                    <InputOTPSlot index={2} className="w-full h-14 text-lg" />
                    <InputOTPSlot index={3} className="w-full h-14 text-lg" />
                    <InputOTPSlot index={4} className="w-full h-14 text-lg" />
                    <InputOTPSlot index={5} className="w-full h-14 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="mt-4">
                <Button className="mx-auto block h-10" disabled={isSubmitting}>
                  {isSubmitting ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <TitleHeading
              title="Enable Two-Factor Authentication"
              classNameTitle="font-semibold"
              description="We'll email you a one-time code to confirm it's you."
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorAuthentication;

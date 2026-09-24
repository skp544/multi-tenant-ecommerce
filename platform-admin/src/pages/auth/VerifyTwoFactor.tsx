import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { ArrowLeft, ShieldCheckIcon } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAppDispatch, useAppSelector } from "@/hooks/use-store";
import { clearTwoFactor, verifyLogin2FA } from "@/store/auth/auth.slice";
import { toast } from "sonner";

const VerifyTwoFactor = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const email = (location.state as { email?: string | null })?.email || "";
  const [otp, setOtp] = useState<string>("");

  const { twoFactorToken, accessToken, status } = useAppSelector(
    (state) => state.auth,
  );
  const isSubmitting = status === "loading";

  // The token only lives in memory, so a refresh lands back on the login form.
  // After a successful verify it is cleared and AuthLayout moves to the dashboard.
  if (!twoFactorToken) {
    return accessToken ? null : <Navigate to="/auth/login" replace />;
  }

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const result = await dispatch(
        verifyLogin2FA({ twoFactorToken, otp }),
      ).unwrap();

      toast.success(result.message);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error as string);
      setOtp("");
    }
  };

  return (
    <div className="w-full max-w-sm">
      <Link
        to="/auth/login"
        aria-label="Back to sign in"
        className="mb-7 inline-flex text-foreground items-center gap-2"
        onClick={() => dispatch(clearTwoFactor())}
      >
        <ArrowLeft className="size-5" />
        Back
      </Link>

      <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>

      <p className="mt-1.5 text-sm text-muted-foreground">
        {email ? (
          <>
            Enter the 6-digit code we sent to{" "}
            <span className="font-semibold">{email}</span>.
          </>
        ) : (
          "Enter the 6-digit code we sent to your email address."
        )}
      </p>

      <form className="mt-7" onSubmit={handleSubmit}>
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

        <FieldGroup>
          <Button
            type="submit"
            className="mt-6 h-11 w-full "
            disabled={isSubmitting || otp.length < 6}
          >
            {isSubmitting ? (
              <>
                <Spinner className="size-4" /> <span>Verifying...</span>
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </FieldGroup>
      </form>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheckIcon className={"size-3.5"} />
        Protected by SSO and 2-factor authentication.
      </div>
    </div>
  );
};

export default VerifyTwoFactor;

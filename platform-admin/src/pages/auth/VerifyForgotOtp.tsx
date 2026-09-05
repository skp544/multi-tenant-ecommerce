import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowLeft, ShieldCheckIcon } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyForgotOtp = () => {
  const location = useLocation();

  const email = (location.state as { email?: string | null })?.email || "";
  const [otp, setOtp] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    navigate("/auth/reset-password", { state: { email, resetToken } });
  };

  return (
    <div className="w-full max-w-sm">
      <Link
        to="/auth/forgot-password"
        aria-label="Back to sign in"
        className="mb-7 inline-flex text-foreground items-center gap-2"
      >
        <ArrowLeft className="size-5" />
        Back
      </Link>
      <h2 className="text-2xl font-bold">Verify Verification Code</h2>

      <p className="mt-1.5 text-sm text-muted-foreground">
        {email ? (
          <>
            We sent a verification code to{" "}
            <span className="font-semibold">{email}</span>.
          </>
        ) : (
          "We sent a verification code to your email address."
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
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="mt-6 h-11 w-full "
            disabled={isSubmitting}
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

export default VerifyForgotOtp;

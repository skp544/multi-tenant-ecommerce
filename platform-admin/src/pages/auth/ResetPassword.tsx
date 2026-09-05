import { Button } from "@/components/ui/button";
import { useState, type SubmitEvent } from "react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Link, useLocation, useNavigate } from "react-router";
import { CheckCircle2, ShieldCheckIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const ResetPassword = () => {
  const location = useLocation();

  const state = location.state as {
    email?: string | null;
    resetToken?: string | null;
  } | null;

  const email = state?.email;
  const resetToken = state?.resetToken;

  const navigate = useNavigate();

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState<boolean>(true);

  const misMatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (misMatch) return;

      if (!resetToken) return setError("Something went wrong");

      navigate("/auth/login");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setPassword("");
      setConfirmPassword("");
    }
  };

  if (isDone) {
    return (
      <div className="w-full max-w-sm flex flex-col justify-center items-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-accent">
          <CheckCircle2 className="size-6 text-primary " />
        </div>
        <h2 className="mt-4 font-bold text-2xl">Password Updated </h2>
        <p className="mt-2 tex-sm text-muted-foreground text-center">
          Your password has been reset. You can now sign in. with your new
          password
        </p>
        <Button type="button" className="mt-10 h-11 w-full">
          <Link to="/auth/login">Back to Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold">Reset Password</h2>

      <p className="mt-1.5 text-sm text-muted-foreground">
        {email ? (
          <>
            Set a new password for{" "}
            <span className="font-semibold text-foreground">{email}</span>
          </>
        ) : (
          "Set a new password for your account."
        )}
      </p>

      <form className="mt-7" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          autoComplete="username"
          value={email ?? ""}
          readOnly
          hidden
        />

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>

            <PasswordInput
              id="password"
              placeholder="**********"
              autoComplete="new-password"
              className="h-11"
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">
              {" "}
              Confirm Password
            </FieldLabel>

            <PasswordInput
              id="confirm-password"
              placeholder="**********"
              autoComplete="new-password"
              className="h-11"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              disabled={isSubmitting}
            />
            {misMatch && (
              <p className="mt-3 text-sm text-destructive">
                Password does not match
              </p>
            )}
          </Field>

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="mt-6 h-11 w-full "
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="size-4" />{" "}
                <span>Resetting Password...</span>
              </>
            ) : (
              "Reset Password"
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

export default ResetPassword;

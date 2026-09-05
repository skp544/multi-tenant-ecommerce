import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ShieldCheckIcon } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import { Spinner } from "@/components/ui/spinner";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    navigate("/auth/forgot-password/verify", { state: { email } });
  };

  return (
    <div className="w-full max-w-sm">
      <Link
        to="/auth/login"
        aria-label="Back to sign in"
        className="mb-7 inline-flex text-foreground items-center gap-2"
      >
        <ArrowLeft className="size-5" />
        Back
      </Link>
      <h2 className="text-2xl font-bold">Forgot Password</h2>

      <p className="mt-1.5 text-sm text-muted-foreground">
        Please enter the email address associated with your account. If it
        matches our records, we will send you a 6-digit verification code that
        you can use to securely reset your password.
      </p>

      <form className="mt-7" onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>

            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              autoComplete="email"
              className="h-11"
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              disabled={isSubmitting}
            />
          </Field>

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="mt-6 h-11 w-full "
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="size-4" /> <span>Sending Code...</span>
              </>
            ) : (
              "Send Code"
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

export default ForgotPassword;

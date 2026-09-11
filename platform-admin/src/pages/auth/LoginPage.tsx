import { Button } from "@/components/ui/button";
import { useState, type SubmitEvent } from "react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Link, useNavigate } from "react-router";
import { ShieldCheckIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAppDispatch, useAppSelector } from "@/hooks/use-store";
import { fetchLogin } from "@/store/auth/auth.slice";

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { status, error } = useAppSelector((state) => state.auth);
  const isSubmitting = status === "loading";

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await dispatch(fetchLogin({ email, password })).unwrap();
      navigate("/dashboard");
    } catch {
      // fetchLogin.rejected already stored the message in state.auth.error
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold">Sign In</h2>

      <p className="mt-1.5 text-sm text-muted-foreground">
        Access the platform admin panel
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

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>

              <Link
                to="/auth/forgot-password"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <PasswordInput
              id="password"
              placeholder="**********"
              autoComplete="current-password"
              className="h-11"
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
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
                <Spinner className="size-4" /> <span>Signing In...</span>
              </>
            ) : (
              "Sign In"
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

export default LoginPage;

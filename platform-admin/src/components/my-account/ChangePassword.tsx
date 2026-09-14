import { useState, type ChangeEvent, type SubmitEvent } from "react";
import TitleHeading from "../common/TitleHeading";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { PasswordInput } from "../ui/PasswordInput";
import { useAppDispatch } from "@/hooks/use-store";
import { changePassword } from "@/store/auth/auth.slice";
import { toast } from "sonner";

const ChangePassword = () => {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [data, setData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (data.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");

    setIsSubmitting(true);
    try {
      const result = await dispatch(
        changePassword({ password: data.newPassword }),
      ).unwrap();

      toast.success(result.message);
      setData({ newPassword: "", confirmPassword: "" });
      setOpen(false);
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
          Change Password
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full lg:max-w-2xl min-h-28 p-4 lg:p-6">
        <TitleHeading
          title="Change Password"
          classNameTitle="font-semibold"
          description="Change your password here."
        />

        <form onSubmit={handleSubmit} className="my-3 grid gap-4 grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              placeholder="**********"
              className="h-11"
              required
              onChange={handleChange}
              value={data.newPassword}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Enter your password again"
              className="h-11"
              required
              onChange={handleChange}
              value={data.confirmPassword}
              disabled={isSubmitting}
              aria-invalid={!!error}
            />
          </div>

          {error && (
            <p className="col-span-2 text-sm text-destructive">{error}</p>
          )}

          <div className="col-span-2 mt-4">
            <Button className="mx-auto block h-10" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePassword;

import { AuthForm } from "@/features/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="py-4 sm:py-10">
      <AuthForm mode="login" />
    </div>
  );
}

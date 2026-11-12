import { AuthForm } from "@/features/auth/AuthForm";

export default function RegisterPage() {
  return (
    <div className="py-4 sm:py-8">
      <AuthForm mode="register" />
    </div>
  );
}

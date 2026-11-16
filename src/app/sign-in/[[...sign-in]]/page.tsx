import { SignIn } from "@clerk/nextjs";
import { AuthPage } from "@/components/auth-page";

export default function Page() {
  return (
    <AuthPage>
      <SignIn />
    </AuthPage>
  );
}

import { SignUp } from "@clerk/nextjs";
import { AuthPage } from "@/components/auth-page";

export default function Page() {
  return (
    <AuthPage>
      <SignUp />
    </AuthPage>
  );
}

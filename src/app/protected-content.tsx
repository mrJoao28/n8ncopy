"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const ProtectedContent = () => {
  const { data } = authClient.useSession();
  const router = useRouter();

  const handleLogout = () => {
  authClient.signOut({
    fetchOptions: {
      onSuccess: () => router.push("/login"),
    },
  });
};

  return (
    <div>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default ProtectedContent;
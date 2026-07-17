// src/app/page.tsx — Server Component
import { requireAuth } from "@/lib/auth-utils";
import ProtectedContent from "./protected-content";

const Page = async () => {
  await requireAuth();

  return (
    <div className="min-h-screen min-w-screen flex items-center">
      protected page
      <ProtectedContent />
    </div>
  );
};

export default Page;
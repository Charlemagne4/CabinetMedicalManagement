import MainLayout from "@/modules/main/layout/MainLayout";
import type { ReactNode } from "react";

function layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <MainLayout>{children}</MainLayout>
    </div>
  );
}
export default layout;

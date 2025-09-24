import OperationsSection from "../sections/OperationsSection";
import type { Shift } from "@prisma/client";

function MainView({ shift }: { shift: Shift }) {
  console.log(`shift: ${shift}`);
  return (
    <div className="mx-auto mb-10 flex max-w-[2400px] flex-col gap-y-6 px-4 pt-2.5">
      <div>session data: shift, recette actuelle, sort...</div>
      {shift ? <OperationsSection /> : <p>NO shift please start shift</p>}
    </div>
  );
}
export default MainView;

import type { Operation } from "@prisma/client";

interface OperationRowProps {
  entry: Operation;
}

function OperationRow({ entry }: OperationRowProps) {
  return (
    <div className="grid grid-cols-5">
      <div>{entry.type}</div>
      <div>{entry.label}</div>
      <div>{entry.amount}</div>
      <div>{entry.date.getUTCDate()}</div>
      <div>{entry.userId}</div>
    </div>
  );
}
export default OperationRow;

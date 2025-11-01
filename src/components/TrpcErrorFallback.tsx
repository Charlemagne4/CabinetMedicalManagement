"use client";
import { type FallbackProps } from "react-error-boundary";

export function TrpcErrorFallback({ error }: FallbackProps) {
  // Ensure we treat error as unknown then narrow
  const maybeT = error as {
    data?: { code?: string; message?: string };
    message?: string;
  };

  console.log("tRPC Error caught:", error);

  const code = maybeT.data?.code;
  const messageFromData = maybeT.data?.message;
  const message = messageFromData ?? maybeT.message ?? "Something went wrong.";

  if (code === "FORBIDDEN") {
    return (
      <div className="rounded-md border border-yellow-300 bg-yellow-900 p-4 text-yellow-800">
        {message}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-red-300 bg-red-400 p-4 text-red-800">
      {message}
    </div>
  );
}

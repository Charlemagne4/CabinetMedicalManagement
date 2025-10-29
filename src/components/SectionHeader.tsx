// components/SectionHeader.tsx

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
}

export default function SectionHeader({
  icon: Icon,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-gray-400" />
        <h1 className="text-2xl font-semibold tracking-tight text-gray-100">
          {title}
        </h1>
      </div>
      {description && (
        <p className="mt-2 max-w-2xl text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}

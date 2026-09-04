import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/*
 * Parent aside — the quiet register.
 *
 * Camper-voice sections speak to the kid. When a parent reading over their
 * shoulder needs one factual line (supervision, ages, certification), it sits
 * here: smaller, lower alpha, behind a hairline, with a mono "For parents"
 * legend. Never amber, never Caveat, never a separate parent block.
 */
export function ParentAside({
  children,
  className,
  dataSanity,
}: Readonly<{
  children: ReactNode;
  className?: string;
  dataSanity?: string;
}>) {
  return (
    <div
      aria-label="For parents"
      className={cn("grid max-w-xl gap-2 border-l-2 border-birch-bark/25 pl-4", className)}
      data-sanity={dataSanity}
      role="note"
    >
      <span aria-hidden="true" className="text-label text-birch-bark/50">
        For parents
      </span>
      <p className="text-[15px] leading-[1.55] text-birch-bark/72">{children}</p>
    </div>
  );
}

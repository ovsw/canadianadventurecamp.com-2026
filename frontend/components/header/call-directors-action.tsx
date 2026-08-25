import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";
import {
  CALL_DIRECTORS_HREF,
  CALL_DIRECTORS_LABEL,
  CALL_DIRECTORS_PHONE,
} from "./call-directors";
import type { HeaderTheme } from "./theme";

export function CallDirectorsAction({
  className,
  onClick,
  theme,
}: {
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  theme: HeaderTheme;
}) {
  const dark = theme === "dark";

  return (
    <Link
      aria-label={`${CALL_DIRECTORS_LABEL} at ${CALL_DIRECTORS_PHONE}`}
      className={cn(
        "group relative isolate grid min-h-11 grid-cols-[auto_1fr] items-center gap-2 rounded-control px-2 py-1 focus-ring",
        // Hover pill lives on a pseudo-element so it can extend past the
        // link's box without growing the header row.
        "before:absolute before:-inset-x-1.5 before:-inset-y-1.5 before:-z-10 before:rounded-control before:opacity-0 before:transition-opacity before:motion-fast hover:before:opacity-100 motion-reduce:before:transition-none",
        dark ? "before:bg-birch-bark/8" : "before:bg-cedar/10",
        className,
      )}
      href={CALL_DIRECTORS_HREF}
      onClick={onClick}
    >
      <Image
        alt=""
        className="size-10 rounded-full border-2 border-campfire-amber object-cover transition-transform motion-base group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        height={40}
        src="/images/justin-anna-gerson-thumbnail.jpg"
        width={40}
      />
      <span className="grid gap-1.5 text-left">
        <strong className="text-sm leading-none font-bold">
          {CALL_DIRECTORS_LABEL}
        </strong>
        <span
          className={cn(
            "font-mono text-[13px] leading-none font-bold tracking-[0.04em]",
            dark ? "text-campfire-amber" : "text-cedar",
          )}
        >
          {CALL_DIRECTORS_PHONE}
        </span>
      </span>
    </Link>
  );
}

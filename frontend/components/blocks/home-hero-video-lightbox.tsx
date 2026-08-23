"use client";

import { useState } from "react";
import { stegaClean } from "next-sanity";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Extract a YouTube embed URL from a watch/short/youtu.be link. */
function toYouTubeEmbed(url: string): string | null {
  const clean = stegaClean(url)?.trim();
  if (!clean) return null;

  try {
    const parsed = new URL(clean);
    let videoId: string | null = null;

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes("youtube.com")) {
      videoId =
        parsed.searchParams.get("v") ||
        parsed.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1] ||
        null;
    }

    return videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
      : null;
  } catch {
    return null;
  }
}

export default function HomeHeroVideoLightbox({
  buttonKey,
  label,
  href,
}: {
  buttonKey: string;
  label: string;
  href: string;
}) {
  const [open, setOpen] = useState(false);
  const embedUrl = toYouTubeEmbed(href);
  if (!embedUrl) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button key={buttonKey} variant="outline" size="hero" onDark>
          <span aria-hidden="true">▶</span>
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-4xl border-0 bg-black p-0 shadow-2xl"
        showCloseButton
      >
        <DialogTitle className="sr-only">{label}</DialogTitle>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          {open ? (
            <iframe
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
              src={embedUrl}
              title={label}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

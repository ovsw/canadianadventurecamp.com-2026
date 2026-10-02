import type { MetadataRoute } from "next";
import { siteName } from "@/lib/site-name";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: siteName,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-256x256.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
  };
}

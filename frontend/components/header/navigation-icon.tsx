import { isSafeIconSvg } from "./safe-icon-svg";

export type NavigationIconModel = {
  name: string;
  svg: string;
};

/**
 * Two-tone icons carried over from the legacy website are stored under a
 * `camp:` prefix by the Studio picker. They are filled artwork rather than
 * Lucide strokes, so the menus give them more room and no badge behind them.
 */
export function isTwoToneIcon(icon: NavigationIconModel): boolean {
  return icon.name.startsWith("camp:");
}

export function NavigationIcon({
  icon,
}: {
  icon: NavigationIconModel;
}) {
  if (!isSafeIconSvg(icon.svg)) return null;
  return (
    <span
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icon.svg }}
    />
  );
}

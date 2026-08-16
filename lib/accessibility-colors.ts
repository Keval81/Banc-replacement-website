export const BANC_ACCESSIBLE_COLORS = {
  dark: "#2C2A27",
  focus: "#0B657A",
  muted: "#5F5D57",
  pale: "#F4F3F1",
  sky: "#4AC8E8",
  white: "#FFFFFF",
} as const;

export function getContrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(hex: string): number {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`Expected a six-digit hex colour, received: ${hex}`);

  const [red, green, blue] = match.slice(1).map((channel) =>
    toLinearChannel(Number.parseInt(channel, 16) / 255)
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function toLinearChannel(channel: number): number {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

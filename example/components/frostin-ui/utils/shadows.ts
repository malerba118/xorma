import { range } from "lodash";
import { clamp } from "framer-motion";
import { tan, toComponents } from "./math";

export const shadows = {
  standard: ({
    xOffset,
    yOffset,
    blur = 0,
    spread = 0,
    color = "rgba(0,0,0,0.1)",
    inset = false,
  }: {
    xOffset: number;
    yOffset: number;
    blur?: number;
    spread?: number;
    color?: string;
    inset?: boolean;
  }) => {
    let shadow = `${xOffset}px ${yOffset}px ${blur}px ${spread}px ${color}`;
    if (inset) {
      shadow = `inset ${shadow}`;
    }
    return shadow;
  },
  soft: ({
    angle,
    intensity = 0.02,
    distance = 10,
    blurriness = 1,
    color = "black",
    layers = 5,
  }: {
    angle: number;
    intensity: number;
    distance: number;
    blurriness: number;
    color?: string;
    layers: number;
  }) => {
    angle = angle += 90;
    const components = toComponents(angle);
    const base = distance ** (1 / layers);
    const getDistance = (layer: number) => base ** (layer + 1);
    return range(layers)
      .map((layer) => {
        const d = getDistance(layer);
        const xOffset = components.x * d;
        const yOffset = components.y * d;
        const opacity = clamp(0, 1, (10 * intensity) / (50 + d) ** 0.9);
        return shadows.standard({
          xOffset,
          yOffset,
          blur: d * blurriness * 2,
          color: `color-mix(in srgb, ${color}, transparent ${
            (1 - opacity) * 100
          }%)`,
        });
      })
      .join(", ");
  },
};

import { cn } from "../../../utils/css";
import { Mask, MaskProps, masks } from "./mask";

export interface LineMaskProps extends Omit<MaskProps, "image"> {
  opacities?: number[];
  positions?: number[];
  direction?: "to-right" | "to-bottom";
}

export const LineMask = ({
  direction = "to-right",
  opacities = [0, 1, 0],
  positions,
  className,
  ...props
}: LineMaskProps) => {
  return (
    <Mask
      {...props}
      image={masks.linear({
        direction: direction,
        opacities: opacities,
        positions: positions,
      })}
      className={cn(
        "relative flex items-center justify-center",
        direction === "to-right"
          ? "bg-white/30 h-[1px] w-full"
          : "bg-white/30 w-[1px] h-full",
        className
      )}
    />
  );
};

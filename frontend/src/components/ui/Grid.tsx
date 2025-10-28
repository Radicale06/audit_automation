import React from "react";
import { cn } from "../../utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const gridVariants = cva(
  "grid",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        auto: "grid-cols-auto-fill",
      },
      gap: {
        none: "gap-0",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8",
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
      },
      flow: {
        row: "grid-flow-row",
        col: "grid-flow-col",
        dense: "grid-flow-dense",
      },
    },
    defaultVariants: {
      cols: 1,
      gap: "md",
      align: "stretch",
      justify: "start",
      flow: "row",
    },
  }
);

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  responsive?: boolean;
  autoFit?: boolean;
  minChildWidth?: string;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className, 
    cols, 
    gap, 
    align, 
    justify, 
    flow,
    responsive = true,
    autoFit = false,
    minChildWidth = "250px",
    style,
    ...props 
  }, ref) => {
    // Si autoFit est activé, on utilise grid-template-columns avec minmax
    const autoFitStyles = autoFit ? {
      gridTemplateColumns: `repeat(auto-fit, minmax(${minChildWidth}, 1fr))`
    } : {};

    // Si responsive est false, on force le nombre de colonnes sans breakpoints
    const responsiveOverride = !responsive && cols ? {
      gridTemplateColumns: `repeat(${typeof cols === 'string' ? 1 : cols}, 1fr)`
    } : {};

    return (
      <div
        ref={ref}
        className={cn(gridVariants({ cols, gap, align, justify, flow }), className)}
        style={{
          ...style,
          ...autoFitStyles,
          ...responsiveOverride
        }}
        {...props}
      />
    );
  }
);

Grid.displayName = "Grid";

export { Grid, gridVariants };
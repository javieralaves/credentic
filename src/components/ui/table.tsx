import * as React from "react";
import { cn } from "@/lib/utils";

export function Table(
  props: React.HTMLAttributes<HTMLTableElement> & { className?: string },
) {
  const { className, ...rest } = props;
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full text-sm", className)} {...rest} />
    </div>
  );
}

export const TableHead = (
  props: React.HTMLAttributes<HTMLTableSectionElement> & { className?: string },
) => {
  return <thead className={cn("bg-gray-100", props.className)} {...props} />;
};

export const TableRow = (
  props: React.HTMLAttributes<HTMLTableRowElement> & { className?: string },
) => (
  <tr className={cn("border-b last:border-0", props.className)} {...props} />
);

export const TableCell = (
  props: React.TdHTMLAttributes<HTMLTableCellElement> & { className?: string },
) => <td className={cn("p-2 align-middle", props.className)} {...props} />;

export const TableHeader = (
  props: React.ThHTMLAttributes<HTMLTableCellElement> & { className?: string },
) => (
  <th className={cn("p-2 text-left font-medium", props.className)} {...props} />
);

export const TableBody = (
  props: React.HTMLAttributes<HTMLTableSectionElement> & { className?: string },
) => <tbody className={cn("", props.className)} {...props} />;

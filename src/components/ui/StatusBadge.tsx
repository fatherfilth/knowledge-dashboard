type Status = "in-progress" | "stable" | "complete";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { classes: string; dotColor: string; label: string }> = {
  stable: {
    classes: "border-teal/20 bg-teal/10 text-teal",
    dotColor: "bg-teal",
    label: "Stable",
  },
  "in-progress": {
    classes: "border-amber/20 bg-amber/10 text-amber",
    dotColor: "bg-amber",
    label: "In Progress",
  },
  complete: {
    classes: "border-complete/20 bg-complete/10 text-complete",
    dotColor: "bg-complete",
    label: "Complete",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.stable;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-xs font-medium ${config.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

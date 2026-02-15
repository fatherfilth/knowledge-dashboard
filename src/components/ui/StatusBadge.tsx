type Status = "in-progress" | "stable" | "complete";

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClasses = {
    "in-progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "complete": "bg-green-100 text-green-800 border-green-200",
    "stable": "bg-blue-100 text-blue-800 border-blue-200",
  };

  const fallbackClass = "bg-gray-100 text-gray-800 border-gray-200";
  const statusClass = colorClasses[status] || fallbackClass;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusClass}`}
    >
      {status}
    </span>
  );
}

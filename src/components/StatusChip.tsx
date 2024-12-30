import { Chip } from "@mui/material";

interface StatusChipProps {
  label: string;
  icon: React.ReactElement;
  color: "success" | "error" | "warning";
  filter: string;
  filters: string[];
  onToggle: (filter: string) => void;
  count: number;
}

export function StatusChip({
  label,
  icon,
  color,
  filter,
  filters,
  onToggle,
  count,
}: StatusChipProps) {
  return (
    <Chip
      icon={icon}
      label={`${label} (${count})`}
      color={color}
      size="small"
      variant={filters.includes(filter) ? "filled" : "outlined"}
      onClick={() => onToggle(filter)}
      sx={{ minWidth: 100 }}
    />
  );
}

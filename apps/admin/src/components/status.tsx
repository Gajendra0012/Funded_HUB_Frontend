export function Status({ value }: { value: string }) {
  const tone = value === "Active" || value === "Enrolled" ? "positive" : value === "Disabled" ? "neutral" : "pending";
  return <span className={`status status-${tone}`}><span aria-hidden="true"/>{value}</span>;
}

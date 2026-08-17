import { SWSymbol } from "@/swpackage/swutil";

export function ListItem({
  title,
  icon,
  description,
}: {
  title: string;
  icon: string;
  description: string;
}) {
  return (
    <div className="sw-list-item">
      <div className="sw-list-item-title">
        <SWSymbol name={icon} size={18} color="var(--sw-accent)" />
        <span>{title}</span>
      </div>
      <p>{description}</p>
    </div>
  );
}

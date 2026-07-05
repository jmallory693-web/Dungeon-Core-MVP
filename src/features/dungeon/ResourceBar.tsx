import type { DungeonState } from "./dungeonTypes";

type ResourceBarProps = {
  resources: DungeonState["resources"];
  pulseCount: number;
};

export function ResourceBar({ resources, pulseCount }: ResourceBarProps) {
  return (
    <div className="resource-bar">
      <div className="resource-item">
        <span className="resource-label">Mana</span>
        <span className="resource-value">{resources.mana}</span>
      </div>
      <div className="resource-item">
        <span className="resource-label">Stone</span>
        <span className="resource-value">{resources.stone}</span>
      </div>
      <div className="resource-item">
        <span className="resource-label">Pulse</span>
        <span className="resource-value">{pulseCount}</span>
      </div>
    </div>
  );
}

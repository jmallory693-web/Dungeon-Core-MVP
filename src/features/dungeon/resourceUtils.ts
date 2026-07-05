import type { ResourceState } from "./dungeonTypes";

export function canAfford(resources: ResourceState, cost: ResourceState): boolean {
  return (
    resources.mana >= cost.mana &&
    resources.stone >= cost.stone &&
    resources.essence >= cost.essence &&
    resources.food >= cost.food &&
    resources.gold >= cost.gold
  );
}

export function applyCost(
  resources: ResourceState,
  cost: ResourceState,
): ResourceState {
  return {
    mana: resources.mana - cost.mana,
    stone: resources.stone - cost.stone,
    essence: resources.essence - cost.essence,
    food: resources.food - cost.food,
    gold: resources.gold - cost.gold,
  };
}

export function applyBonus(
  resources: ResourceState,
  bonus: Partial<ResourceState>,
): ResourceState {
  return {
    mana: resources.mana + (bonus.mana ?? 0),
    stone: resources.stone + (bonus.stone ?? 0),
    essence: resources.essence + (bonus.essence ?? 0),
    food: resources.food + (bonus.food ?? 0),
    gold: resources.gold + (bonus.gold ?? 0),
  };
}

export function formatResourceCost(cost: ResourceState): string {
  const parts: string[] = [];
  if (cost.mana > 0) {
    parts.push(`${cost.mana} mana`);
  }
  if (cost.stone > 0) {
    parts.push(`${cost.stone} stone`);
  }
  if (cost.essence > 0) {
    parts.push(`${cost.essence} essence`);
  }
  if (cost.food > 0) {
    parts.push(`${cost.food} food`);
  }
  if (cost.gold > 0) {
    parts.push(`${cost.gold} gold`);
  }
  return parts.join(", ");
}

export function zeroResources(): ResourceState {
  return { mana: 0, stone: 0, essence: 0, food: 0, gold: 0 };
}

export function normalizeResources(
  resources: Partial<ResourceState> | undefined,
): ResourceState {
  return {
    mana: resources?.mana ?? 0,
    stone: resources?.stone ?? 0,
    essence: resources?.essence ?? 0,
    food: resources?.food ?? 0,
    gold: resources?.gold ?? 0,
  };
}

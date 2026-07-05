import {
  DEFAULT_PULSE_INTERVAL_MS,
  MANA_PER_PULSE,
  MAX_OFFLINE_PULSES,
  type DungeonState,
  type PulseSpeedMultiplier,
} from "./dungeonTypes";
import { applyBonus } from "./resourceUtils";

const PULSE_LOG_EVERY = 10;

export type ProcessPulseOptions = {
  now?: string;
  logThisPulse?: boolean;
};

export type PulsePlaybackUpdate = {
  isPulsePaused?: boolean;
  pulseSpeedMultiplier?: PulseSpeedMultiplier;
};

export function normalizePulseSpeedMultiplier(
  value: unknown,
): PulseSpeedMultiplier {
  if (value === 0.5 || value === 2) {
    return value;
  }

  return 1;
}

export function getEffectivePulseIntervalMs(dungeon: DungeonState): number {
  return dungeon.pulseIntervalMs / dungeon.pulseSpeedMultiplier;
}

export function processDungeonPulse(
  dungeon: DungeonState,
  options: ProcessPulseOptions = {},
): DungeonState {
  const now = options.now ?? new Date().toISOString();
  const nextPulseCount = dungeon.pulseCount + 1;
  const resources = applyBonus(dungeon.resources, { mana: MANA_PER_PULSE });

  const shouldLog =
    options.logThisPulse ??
    (nextPulseCount === 1 || nextPulseCount % PULSE_LOG_EVERY === 0);

  const log = shouldLog
    ? [`Core pulse ${nextPulseCount}: +${MANA_PER_PULSE} mana.`, ...dungeon.log].slice(
        0,
        50,
      )
    : dungeon.log;

  return {
    ...dungeon,
    pulseCount: nextPulseCount,
    lastPulseAt: now,
    resources,
    log,
    updatedAt: now,
  };
}

export function calculateMissedPulses(
  dungeon: DungeonState,
  nowMs: number = Date.now(),
): number {
  if (dungeon.isPulsePaused) {
    return 0;
  }

  if (!dungeon.lastPulseAt) {
    return 0;
  }

  const lastMs = Date.parse(dungeon.lastPulseAt);
  if (Number.isNaN(lastMs)) {
    return 0;
  }

  const effectiveIntervalMs = getEffectivePulseIntervalMs(dungeon);
  const elapsed = nowMs - lastMs;
  if (elapsed < effectiveIntervalMs) {
    return 0;
  }

  return Math.min(
    MAX_OFFLINE_PULSES,
    Math.floor(elapsed / effectiveIntervalMs),
  );
}

export function applyMissedPulses(
  dungeon: DungeonState,
  pulseCount: number,
  nowMs: number = Date.now(),
): DungeonState {
  if (pulseCount <= 0) {
    return ensurePulseTimestamp(dungeon, nowMs);
  }

  let state = dungeon;
  for (let i = 0; i < pulseCount; i += 1) {
    state = processDungeonPulse(state, {
      now: new Date(nowMs).toISOString(),
      logThisPulse: false,
    });
  }

  const summaryLog = [`The core pulsed ${pulseCount} times while dormant.`, ...state.log].slice(
    0,
    50,
  );

  return {
    ...state,
    log: summaryLog,
  };
}

export function ensurePulseTimestamp(
  dungeon: DungeonState,
  nowMs: number = Date.now(),
): DungeonState {
  if (dungeon.lastPulseAt) {
    return dungeon;
  }

  return {
    ...dungeon,
    lastPulseAt: new Date(nowMs).toISOString(),
  };
}

export function applyOfflineProgress(
  dungeon: DungeonState,
  nowMs: number = Date.now(),
): DungeonState {
  if (dungeon.isPulsePaused) {
    return ensurePulseTimestamp(dungeon, nowMs);
  }

  const missed = calculateMissedPulses(dungeon, nowMs);
  if (missed === 0) {
    return ensurePulseTimestamp(dungeon, nowMs);
  }

  return applyMissedPulses(dungeon, missed, nowMs);
}

export function getSecondsUntilNextPulse(
  dungeon: DungeonState,
  nowMs: number = Date.now(),
): number {
  const effectiveIntervalMs = getEffectivePulseIntervalMs(dungeon);

  if (dungeon.isPulsePaused) {
    return Math.max(1, Math.ceil(effectiveIntervalMs / 1000));
  }

  const lastMs = Date.parse(dungeon.lastPulseAt);
  if (Number.isNaN(lastMs)) {
    return Math.ceil(effectiveIntervalMs / 1000);
  }

  const elapsed = nowMs - lastMs;
  const remainder = elapsed % effectiveIntervalMs;
  const remainingMs =
    remainder === 0 ? effectiveIntervalMs : effectiveIntervalMs - remainder;

  return Math.max(1, Math.ceil(remainingMs / 1000));
}

export function formatPulseSpeedLabel(multiplier: PulseSpeedMultiplier): string {
  return `${multiplier}x`;
}

export function updatePulsePlayback(
  dungeon: DungeonState,
  update: PulsePlaybackUpdate,
  nowMs: number = Date.now(),
): DungeonState {
  const now = new Date(nowMs).toISOString();

  return {
    ...dungeon,
    isPulsePaused: update.isPulsePaused ?? dungeon.isPulsePaused,
    pulseSpeedMultiplier:
      update.pulseSpeedMultiplier ?? dungeon.pulseSpeedMultiplier,
    lastPulseAt: now,
    updatedAt: now,
  };
}

export function createInitialPulseFields(now: string = new Date().toISOString()) {
  return {
    pulseCount: 0,
    lastPulseAt: now,
    pulseIntervalMs: DEFAULT_PULSE_INTERVAL_MS,
    isPulsePaused: false,
    pulseSpeedMultiplier: 1 as PulseSpeedMultiplier,
  };
}

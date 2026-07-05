import { useEffect, useState } from "react";
import type { DungeonState, PulseSpeedMultiplier } from "./dungeonTypes";
import { PULSE_SPEED_OPTIONS } from "./dungeonTypes";
import {
  formatPulseSpeedLabel,
  getSecondsUntilNextPulse,
  type PulsePlaybackUpdate,
} from "./pulseRules";

type PulseControlsProps = {
  dungeon: DungeonState;
  onPlaybackChange: (update: PulsePlaybackUpdate) => void;
};

export function PulseControls({ dungeon, onPlaybackChange }: PulseControlsProps) {
  const [secondsUntilPulse, setSecondsUntilPulse] = useState(() =>
    getSecondsUntilNextPulse(dungeon),
  );

  useEffect(() => {
    setSecondsUntilPulse(getSecondsUntilNextPulse(dungeon));

    if (dungeon.isPulsePaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSecondsUntilPulse(getSecondsUntilNextPulse(dungeon));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    dungeon.isPulsePaused,
    dungeon.pulseCount,
    dungeon.lastPulseAt,
    dungeon.pulseIntervalMs,
    dungeon.pulseSpeedMultiplier,
  ]);

  const handleTogglePause = () => {
    onPlaybackChange({ isPulsePaused: !dungeon.isPulsePaused });
  };

  const handleSpeedChange = (multiplier: PulseSpeedMultiplier) => {
    if (multiplier === dungeon.pulseSpeedMultiplier) {
      return;
    }

    onPlaybackChange({ pulseSpeedMultiplier: multiplier });
  };

  return (
    <div className="pulse-controls">
      <p className="pulse-controls-note">
        The dungeon pulses every 10 seconds at 1x speed.
      </p>

      <div className="pulse-controls-row">
        <button
          type="button"
          className="pulse-control-button pulse-playback-toggle"
          onClick={handleTogglePause}
        >
          {dungeon.isPulsePaused ? "Play" : "Pause"}
        </button>

        <div className="pulse-speed-buttons" role="group" aria-label="Pulse speed">
          {PULSE_SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              type="button"
              className={`pulse-control-button pulse-speed-button${
                dungeon.pulseSpeedMultiplier === speed ? " active" : ""
              }`}
              onClick={() => handleSpeedChange(speed)}
            >
              {formatPulseSpeedLabel(speed)}
            </button>
          ))}
        </div>
      </div>

      <p className="pulse-controls-status">
        Speed: {formatPulseSpeedLabel(dungeon.pulseSpeedMultiplier)}
        {" · "}
        {dungeon.isPulsePaused
          ? "Paused"
          : `Next pulse in: ${secondsUntilPulse}s`}
      </p>
    </div>
  );
}

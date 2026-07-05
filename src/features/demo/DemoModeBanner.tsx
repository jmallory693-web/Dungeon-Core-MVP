import { useState } from "react";
import {
  FIREBASE_ENV_KEYS,
  getMissingFirebaseEnvKeys,
} from "../../services/firebase/firebaseConfig";

type FirebaseSetupPanelProps = {
  compact?: boolean;
};

export function FirebaseSetupPanel({ compact = false }: FirebaseSetupPanelProps) {
  const missingKeys = getMissingFirebaseEnvKeys();

  return (
    <div className={`setup-panel ${compact ? "setup-panel-compact" : ""}`}>
      <h2>Firebase setup</h2>
      <p>
        To enable cloud saves for Netlify deployment, copy <code>.env.example</code>{" "}
        to <code>.env</code> and fill in your Firebase web app config values. Restart
        the dev server after editing <code>.env</code>.
      </p>

      <section className="setup-section">
        <h3>Steps</h3>
        <ol>
          <li>
            Copy <code>.env.example</code> to <code>.env</code>
          </li>
          <li>
            Open the Firebase Console and copy your web app SDK config values
          </li>
          <li>
            Paste each value into the matching <code>VITE_FIREBASE_*</code> variable
          </li>
          <li>Restart the dev server so Vite reloads the environment</li>
        </ol>
      </section>

      {missingKeys.length > 0 && (
        <section className="setup-section">
          <h3>Missing variables</h3>
          <ul className="missing-env-list">
            {missingKeys.map((key) => (
              <li key={key}>
                <code>{key}</code>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="setup-section">
        <h3>Required variables</h3>
        <ul className="missing-env-list">
          {FIREBASE_ENV_KEYS.map((key) => (
            <li key={key}>
              <code>{key}</code>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

type DemoModeBannerProps = {
  onResetDemo?: () => void;
  resetting?: boolean;
};

export function DemoModeBanner({ onResetDemo, resetting = false }: DemoModeBannerProps) {
  const [showSetup, setShowSetup] = useState(false);

  return (
    <div className="demo-mode-banner">
      <div className="demo-mode-banner-main">
        <p>
          <strong>Demo Mode:</strong> saving to this browser only. Firebase is not
          configured.
        </p>
        <div className="demo-mode-banner-actions">
          <button
            type="button"
            className="demo-mode-link-button"
            onClick={() => setShowSetup((open) => !open)}
          >
            {showSetup ? "Hide Firebase setup" : "Firebase setup"}
          </button>
          {onResetDemo && (
            <button
              type="button"
              className="demo-mode-link-button"
              onClick={onResetDemo}
              disabled={resetting}
            >
              {resetting ? "Resetting..." : "Reset demo save"}
            </button>
          )}
        </div>
      </div>

      {showSetup && <FirebaseSetupPanel compact />}
    </div>
  );
}

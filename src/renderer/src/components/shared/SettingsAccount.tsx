import { createSignal, For, onMount, Show, type Component } from "solid-js";
import type { SettingsAccountProps } from "./settingsTypes";
import { STATUS_MESSAGE_CLEAR_MS } from "../../../../shared/ui-constants";

const SettingsAccount: Component<SettingsAccountProps> = (props) => {
  const s = props.sessions;
  const [currentVersion, setCurrentVersion] = createSignal("");

  onMount(() => {
    void window.vessel.updates
      .getCurrentVersion()
      .then(setCurrentVersion)
      .catch(() => setCurrentVersion("Unavailable"));
  });

  return (
    <div class="settings-category-panel">
      <div class="settings-field">
        <label class="settings-label">Vessel</label>
        <p class="settings-hint">
          Version {currentVersion() || "Loading…"}
        </p>
      </div>

      <div class="settings-field">
        <label class="settings-label">Community Edition</label>
        <div class="premium-section">
          <div class="premium-active-badge">
            All Local Features Unlocked
          </div>
          <p class="premium-detail">
            Features included in this build run locally. No Vessel account,
            subscription, activation, or hosted billing is required.
          </p>
        </div>
      </div>

      {/* Saved Sessions */}
      <div class="settings-field">
        <label class="settings-label">Saved Sessions</label>
        <p class="settings-hint" style="margin-bottom: 10px">
          Save the current browser state (tabs, cookies, storage) as a named
          session. Restore it later from this panel.
        </p>
        <div class="premium-activate-row" style="margin-bottom: 8px">
          <input
            class="settings-input premium-email-input"
            placeholder="Session name"
            value={s.saveName()}
            onInput={(e) => s.setSaveName(e.currentTarget.value)}
            spellcheck={false}
          />
          <button
            class="premium-btn premium-btn-activate"
            disabled={!s.saveName().trim()}
            onClick={async () => {
              try {
                await window.vessel.sessions.save(s.saveName().trim());
                s.setSaveName("");
                await s.loadList();
                props.setStatus({ kind: "success", text: "Session saved." });
                setTimeout(() => props.setStatus(null), STATUS_MESSAGE_CLEAR_MS);
              } catch (err) {
                props.setStatus({ kind: "error", text: String(err) });
              }
            }}
          >
            Save Current
          </button>
        </div>
        <Show when={s.list().length > 0}>
          <div class="vault-entries">
            <For each={s.list()}>
              {(session) => (
                <div class="vault-entry">
                  <div class="vault-entry-info">
                    <span class="vault-entry-label">{session.name}</span>
                    <span class="vault-entry-detail">
                      {new Date(session.updatedAt).toLocaleDateString()}
                      {" "}&middot; {session.cookieCount} cookies
                      {" "}&middot; {session.domains.length} domains
                    </span>
                  </div>
                  <div style="display: flex; gap: 6px; align-items: center;">
                    <button
                      class="premium-btn premium-btn-activate"
                      style="padding: 2px 10px; font-size: 12px;"
                      onClick={async () => {
                        try {
                          await window.vessel.sessions.load(session.name);
                          props.setStatus({ kind: "success", text: `Session "${session.name}" restored.` });
                          setTimeout(() => props.setStatus(null), STATUS_MESSAGE_CLEAR_MS);
                        } catch (err) {
                          props.setStatus({ kind: "error", text: String(err) });
                        }
                      }}
                      title="Restore this session (replaces current tabs and cookies)"
                    >
                      Load
                    </button>
                    <button
                      class="vault-entry-remove"
                      onClick={async () => {
                        await window.vessel.sessions.delete(session.name);
                        await s.loadList();
                      }}
                      title="Delete session"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default SettingsAccount;

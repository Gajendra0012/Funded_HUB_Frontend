"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { StatusChip, Toast } from "@funded-hub/ui";
import { MEMBERS_PAGE_SIZE } from "@/lib/admin-users";
import { formatUtc } from "@/lib/api/format";
import { outcomeUnknown } from "@/lib/api/errors";
import type { ApiResult, PageMeta } from "@/lib/api/types";
import { useCursorList } from "@/lib/api/use-cursor-list";
import { actorLabel, actorNames, type ActorNames } from "@/lib/audit";
import {
  SETTING_GROUPS,
  SETTINGS,
  countryChanges,
  countryName,
  draftOf,
  formatValue,
  isChange,
  parseDraft,
  saveErrorMessage,
  searchCountries,
  type Draft,
  type SettingDefinition,
  type SettingRecord,
  type SettingValue,
} from "@/lib/settings";
import { ActionDialog, FormError } from "./action-dialog";
import { useAdminApi } from "./admin-api-provider";
import { ApiErrorPanel } from "./api-error-panel";
import { LoadingPanel } from "./loading-panel";

/** Settings rows carry their key as `id`, for the list hook. */
type SettingRow = SettingRecord & { id: string };
/** The open (or last opened) save dialog. It keeps its content while closing; `id` gives each opening a fresh form. */
type Review = { setting: SettingDefinition; saved: SettingRecord | undefined; value: SettingValue; id: number; open: boolean };

const BYBIT_RESTRICTED = "https://www.bybit.com/en/help-center/article/Service-Restricted-Countries";

/**
 * Settings (ADM-36), live: the 7 settings from `GET /admin/settings`, each saved on its own with
 * `PUT /admin/settings/{key}` after a review. Each says whether anything uses it yet.
 */
export function SettingsScreen() {
  const api = useAdminApi();
  const list = useCursorList("settings", (cursor, signal) =>
    api
      .get("/api/v1/admin/settings", { query: { limit: 100, cursor: cursor ?? undefined }, signal })
      .then((result): ApiResult<SettingRow[], PageMeta> => (result.ok ? { ...result, data: result.data.map((record) => ({ ...record, id: record.key })) } : result)),
  );
  // Who changed a setting: names from the admin list (everyone who may change settings may also see admins).
  const admins = useCursorList("settings-admins", (cursor, signal) =>
    api.get("/api/v1/admin/users", { query: { limit: MEMBERS_PAGE_SIZE, cursor: cursor ?? undefined }, signal }),
  );
  const names = admins.status === "ready" ? actorNames(admins.items) : null;
  const [review, setReview] = useState<Review | null>(null);
  const [toast, setToast] = useState("");

  // No settings.manage: the shared "no permission" panel, and nothing to save.
  if (list.status === "error" && list.error?.code === "FORBIDDEN") return <ApiErrorPanel error={list.error} />;

  const saved = new Map(list.items.map((row) => [row.key, row]));
  function openReview(setting: SettingDefinition, value: SettingValue) {
    setReview((previous) => ({ setting, saved: saved.get(setting.key), value, id: (previous?.id ?? 0) + 1, open: true }));
  }
  const close = () => setReview((previous) => previous && { ...previous, open: false });

  // The dialog and the toast stay mounted while the settings load again (after a save with no answer),
  // so the dialog keeps its message.
  let content: ReactNode;
  if (list.status === "loading") content = <LoadingPanel label="Loading settings" />;
  else if (list.status === "error" && list.error) content = <ApiErrorPanel error={list.error} onRetry={list.retry} />;
  else
    content = SETTING_GROUPS.map((group) => (
      <section className="panel settings-group" key={group.id} data-testid={`settings-group-${group.id}`}>
        <div className="panel-header">
          <div>
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </div>
        </div>
        {SETTINGS.filter((setting) => setting.group === group.id).map((setting) => {
          const record = saved.get(setting.key);
          // A new key after each save: the field starts again from the saved value.
          const rowKey = `${setting.key}:${record?.updated_at ?? "unset"}`;
          return setting.kind === "countries" ? (
            <CountriesSetting key={rowKey} setting={setting} record={record} names={names} onReview={openReview} />
          ) : (
            <SettingRowEditor key={rowKey} setting={setting} record={record} names={names} onReview={openReview} />
          );
        })}
      </section>
    ));

  return (
    <>
      {content}
      <SaveSettingDialog
        review={review}
        onClose={close}
        onSaved={(record) => {
          const setting = review?.setting;
          close();
          if (!setting) return;
          setToast(`${setting.label} saved: ${formatValue(setting, record.value)}.${setting.inUse ? " Sign-up uses it from now on." : " Nothing reads it yet."}`);
          if (saved.has(record.key)) list.replaceItem({ ...record, id: record.key });
          else list.reload();
        }}
        onUncertain={list.reload}
      />
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </>
  );
}

/** Whether anything uses the setting, who changed it last, and when. */
function SettingInfo({ setting, record, names }: { setting: SettingDefinition; record: SettingRecord | undefined; names: ActorNames | null }) {
  const who = record?.updated_by ? actorLabel({ actor_type: "ADMIN", actor_id: record.updated_by }, names) : "the initial setup";
  return (
    <div className="setting-info">
      <h3>
        {setting.label}
        <StatusChip state={setting.inUse ? "profit" : "neutral"}>{setting.inUse ? "In use" : "Not used yet"}</StatusChip>
      </h3>
      <p className="small-note">{setting.usedBy}</p>
      <p className="setting-meta" data-testid={`setting-meta-${setting.key}`}>
        {record ? `Last changed by ${who} · ${formatUtc(record.updated_at)}` : "Not set yet: saving creates it."}
      </p>
    </div>
  );
}

type RowProps = {
  setting: SettingDefinition;
  record: SettingRecord | undefined;
  names: ActorNames | null;
  onReview: (setting: SettingDefinition, value: SettingValue) => void;
};

/** One setting with one field: text, email, time or a whole number. */
function SettingRowEditor({ setting, record, names, onReview }: RowProps) {
  const initial = draftOf(setting, record?.value);
  const [draft, setDraft] = useState<Draft>(initial);
  const parsed = parseDraft(setting, draft);
  const changed = draft !== initial;
  // Only a changed value can be wrong: the saved one (or "not set") is never an error.
  const error = "error" in parsed && changed ? parsed.error : "";
  const ready = "value" in parsed && isChange(setting, record?.value, parsed.value);

  function submit(event: FormEvent) {
    event.preventDefault();
    if ("value" in parsed && ready) onReview(setting, parsed.value);
  }

  const inputType = setting.kind === "number" ? "number" : setting.kind === "time" ? "time" : setting.kind === "email" ? "email" : "text";
  return (
    <form className="setting-row" onSubmit={submit} data-testid={`setting-row-${setting.key}`} noValidate>
      <SettingInfo setting={setting} record={record} names={names} />
      <div className="setting-edit">
        <label className="ops-field">
          <span className="ui-sr">{setting.label}</span>
          <span className="setting-input">
            <input
              type={inputType}
              name={setting.key}
              value={typeof draft === "string" ? draft : ""}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={setting.kind === "text" || setting.kind === "email" ? setting.placeholder : undefined}
              maxLength={setting.kind === "text" || setting.kind === "email" ? setting.maxLength : undefined}
              min={setting.kind === "number" ? setting.min : undefined}
              max={setting.kind === "number" ? setting.max : undefined}
              step={setting.kind === "number" ? 1 : setting.kind === "time" ? 60 : undefined}
              inputMode={setting.kind === "number" ? "numeric" : undefined}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={error ? true : undefined}
              data-testid={`setting-input-${setting.key}`}
            />
            {setting.kind === "number" && <span className="setting-unit">{setting.unit}</span>}
          </span>
        </label>
        {error && (
          <p className="field-error" role="alert" data-testid={`setting-error-${setting.key}`}>
            {error}
          </p>
        )}
        <div className="setting-actions">
          <button type="button" onClick={() => setDraft(initial)} disabled={!changed} data-testid={`setting-undo-${setting.key}`}>
            Undo
          </button>
          <button type="submit" className="ui-primary" disabled={!ready} data-testid={`setting-save-${setting.key}`}>
            Review and save
          </button>
        </div>
      </div>
    </form>
  );
}

/** Restricted countries: pick from the 249 ISO countries, then review what's added and removed. */
function CountriesSetting({ setting, record, names, onReview }: RowProps) {
  const initial = draftOf(setting, record?.value) as string[];
  const [selected, setSelected] = useState<string[]>(initial);
  const [search, setSearch] = useState("");
  const parsed = parseDraft(setting, selected);
  const ready = "value" in parsed && isChange(setting, record?.value, parsed.value);
  const changes = countryChanges(initial, selected);
  const shown = searchCountries(search);
  const toggle = (code: string) => setSelected((codes) => (codes.includes(code) ? codes.filter((item) => item !== code) : [...codes, code]));

  return (
    <div className="setting-row setting-row-wide" data-testid={`setting-row-${setting.key}`}>
      <SettingInfo setting={setting} record={record} names={names} />
      <div className="setting-edit">
        <p className="small-note">
          Client decision: sign-up blocks the countries where Bybit doesn&apos;t offer its service.{" "}
          <a className="quiet-link" href={BYBIT_RESTRICTED} target="_blank" rel="noreferrer">
            Bybit&apos;s official list ↗
          </a>
        </p>
        <div className="selected-chips" aria-label="Restricted countries" data-testid="countries-selected">
          {[...selected].sort((a, b) => countryName(a).localeCompare(countryName(b))).map((code) => (
            <button type="button" key={code} onClick={() => toggle(code)} aria-label={`Remove ${countryName(code)}`} data-testid={`country-chip-${code}`}>
              {countryName(code)} <code>{code}</code> ×
            </button>
          ))}
          {!selected.length && <span>No countries restricted: everyone can sign up.</span>}
        </div>
        <label className="ops-field">
          Find a country
          <input
            type="search"
            name="country-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or code, e.g. Canada or CA…"
            autoComplete="off"
            spellCheck={false}
            data-testid="countries-search"
          />
        </label>
        <div className="country-scroll" tabIndex={0} role="region" aria-label="Countries">
          <fieldset className="country-options">
            <legend>
              {shown.length} {shown.length === 1 ? "country" : "countries"}
            </legend>
            {shown.map((code) => (
              <label key={code}>
                <input type="checkbox" checked={selected.includes(code)} onChange={() => toggle(code)} data-testid={`country-option-${code}`} />
                <span>
                  {countryName(code)}
                  <small>{code}</small>
                </span>
              </label>
            ))}
            {!shown.length && <p role="status">No country matches “{search.trim()}”.</p>}
          </fieldset>
        </div>
        <div className="setting-actions">
          <span className="small-note" data-testid="countries-pending">
            {changes.added.length || changes.removed.length ? `${changes.added.length} to add · ${changes.removed.length} to remove` : "No changes"}
          </span>
          <button type="button" onClick={() => setSelected(initial)} disabled={!ready} data-testid="countries-undo">
            Undo
          </button>
          <button type="button" className="ui-primary" onClick={() => "value" in parsed && ready && onReview(setting, parsed.value)} disabled={!ready} data-testid={`setting-save-${setting.key}`}>
            Review and save
          </button>
        </div>
      </div>
    </div>
  );
}

/** Review a change, then save it with `PUT /admin/settings/{key}`. AO-7 adds the fresh 2FA code here. */
function SaveSettingDialog({ review, onClose, onSaved, onUncertain }: { review: Review | null; onClose: () => void; onSaved: (record: SettingRecord) => void; onUncertain: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <ActionDialog open={review?.open === true} title={review?.setting.label ?? "Save setting"} busy={busy} onClose={onClose}>
      {review && <SaveSettingForm key={review.id} review={review} busy={busy} setBusy={setBusy} onClose={onClose} onSaved={onSaved} onUncertain={onUncertain} />}
    </ActionDialog>
  );
}

function SaveSettingForm({
  review,
  busy,
  setBusy,
  onClose,
  onSaved,
  onUncertain,
}: {
  review: Review;
  busy: boolean;
  setBusy: (busy: boolean) => void;
  onClose: () => void;
  onSaved: (record: SettingRecord) => void;
  onUncertain: () => void;
}) {
  const api = useAdminApi();
  const [error, setError] = useState("");
  const { setting, saved, value } = review;

  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const result = await api.put("/api/v1/admin/settings/{key}", { path: { key: setting.key }, body: { value } });
    setBusy(false);
    if (result.ok) return onSaved(result.data);
    setError(saveErrorMessage(result.error));
    if (outcomeUnknown(result.error)) onUncertain();
  }

  const before = Array.isArray(saved?.value) ? saved.value : [];
  const changes = setting.kind === "countries" && Array.isArray(value) ? countryChanges(before, value) : null;
  return (
    <form className="ops-form" onSubmit={save} data-testid="setting-confirm-form" data-key={setting.key}>
      <p className="dialog-note">{setting.usedBy}</p>
      {changes ? (
        <div className="ops-review-columns">
          <section>
            <h3>Will be restricted</h3>
            {changes.added.length ? (
              <ul data-testid="review-added">
                {changes.added.map((code) => (
                  <li key={code}>
                    {countryName(code)} <code>{code}</code>
                  </li>
                ))}
              </ul>
            ) : (
              <p>None</p>
            )}
          </section>
          <section>
            <h3>Can sign up again</h3>
            {changes.removed.length ? (
              <ul data-testid="review-removed">
                {changes.removed.map((code) => (
                  <li key={code}>
                    {countryName(code)} <code>{code}</code>
                  </li>
                ))}
              </ul>
            ) : (
              <p>None</p>
            )}
          </section>
        </div>
      ) : (
        <dl className="setting-change">
          <div>
            <dt>Now</dt>
            <dd data-testid="review-before">{formatValue(setting, saved?.value)}</dd>
          </div>
          <div>
            <dt>New</dt>
            <dd data-testid="review-after">{formatValue(setting, value)}</dd>
          </div>
        </dl>
      )}
      <p className="small-note">{saved ? "The change is recorded in the audit log." : "This creates the setting. It's recorded in the audit log."}</p>
      <FormError message={error} testId="setting-dialog-error" />
      <footer>
        <button type="button" onClick={onClose} disabled={busy} data-testid="setting-cancel">
          Cancel
        </button>
        <button type="submit" className="ui-primary" disabled={busy} data-testid="setting-confirm">
          {busy ? "Saving…" : "Save setting"}
        </button>
      </footer>
    </form>
  );
}

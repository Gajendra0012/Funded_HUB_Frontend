"use client";

import { useState, type FormEvent } from "react";
import { Button, Input } from "@funded-hub/ui";
import { usePreview } from "@/components/preview-provider";
import { countryOptions, type Settings } from "@/lib/preview";

export default function SettingsPage() {
  const { state, execute } = usePreview();
  const [draft,setDraft] = useState<Settings>(state.settings);
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");
  const changed = JSON.stringify(draft)!==JSON.stringify(state.settings);

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const next = execute({type:"save-settings",settings:draft});
      setDraft(next.settings);
      setError("");
      setMessage("Preview settings saved and recorded in the audit log. The public site and real registration policy are unchanged.");
    } catch(caught) {setError(caught instanceof Error ? caught.message : "Settings could not be saved.");setMessage("");}
  }

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">THE PLATFORM, ALIGNED</span><h1>Platform settings</h1><p>Preview the controls that shape your platform’s identity and eligibility.</p></div><span className="reference-tag">LOCAL SAMPLE SETTINGS</span></div>
      {message && <p role="status" className="feedback feedback-success">{message}</p>}{error && <p role="alert" className="feedback feedback-error">{error}</p>}
      <form onSubmit={saveSettings} className="settings-layout"><div className="settings-main"><section className="panel"><div className="panel-header"><div><h2>Platform identity</h2><p>Sample branding and contact details</p></div><span className="section-index">01</span></div><div className="settings-fields"><Input id="platform-name" label="Platform name" value={draft.platformName} onChange={event=>setDraft({...draft,platformName:event.target.value})} required maxLength={80}/><Input id="support-email" label="Support email" type="email" required value={draft.supportEmail} onChange={event=>setDraft({...draft,supportEmail:event.target.value})} hint="Preview only. No email is sent from this app."/><div className="read-only-setting"><div><strong>System time zone</strong><p>All operational timestamps are displayed in UTC.</p></div><span>UTC</span></div></div></section>
      <section className="panel"><div className="panel-header"><div><h2>Country eligibility preview</h2><p>Example controls, not the approved restricted-country policy</p></div><span className="section-index">02</span></div><div className="settings-fields"><p className="settings-explanation">Choose example countries to exclude in this local preview. No countries are selected by default. The final policy must be approved against the firm’s requirements and Bybit availability.</p><fieldset className="country-options"><legend>Sample exclusion list</legend>{countryOptions.map(country=><label key={country.code}><input type="checkbox" checked={draft.restrictedCountries.includes(country.code)} onChange={event=>setDraft({...draft,restrictedCountries:event.target.checked ? [...draft.restrictedCountries,country.code] : draft.restrictedCountries.filter(code=>code!==country.code)})}/><span>{country.name}<small>{country.code}</small></span></label>)}</fieldset><p className="small-note">{draft.restrictedCountries.length} selected in the preview. This does not block real users.</p></div></section>
      <div className="settings-save"><span>{changed ? "You have unsaved preview changes" : "Preview settings are up to date"}</span><div><Button variant="secondary" disabled={!changed} onClick={()=>{setDraft(state.settings);setError("");setMessage("");}}>Discard changes</Button><Button type="submit" disabled={!changed}>Save preview settings</Button></div></div></div>
      <aside className="panel settings-aside"><span className="eyebrow">BEFORE PRODUCTION</span><h2>Controls that<br/>need a backend.</h2><p>These settings are a design preview. Production changes will require an authenticated Admin, API validation and an append-only audit record.</p><ul><li>Mandatory admin 2FA</li><li>Server-side authorization</li><li>Re-authentication for sensitive actions</li><li>Approved country policy</li><li>Durable audit storage</li></ul><span className="reference-tag">NOT CONNECTED</span></aside></form>
    </>
  );
}

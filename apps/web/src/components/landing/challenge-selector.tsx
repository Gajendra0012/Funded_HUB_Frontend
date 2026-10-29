"use client";

import { useRef, useState } from "react";
import { Button } from "@funded-hub/ui";
import { accountSizes, challengeModels, formatMoney, getChallengePreview, type AccountSize } from "@/data/landing";

export function ChallengeSelector() {
  const [modelIndex, setModelIndex] = useState(0);
  const [size, setSize] = useState<AccountSize>(100000);
  const [dollars, setDollars] = useState(false);
  const reviewDialog = useRef<HTMLDialogElement>(null);
  const model = challengeModels[modelIndex];
  const preview = getChallengePreview(model, size, dollars);
  const rules = [
    ["Profit target", preview.target],
    ["Daily loss limit", preview.dailyLoss],
    ["Maximum loss", `${preview.maxLoss} · ${model.lossType}`],
    ["Minimum trading days", model.minDays ? `${model.minDays} per phase` : "None"],
    ["Reward share", `${model.share}%`],
    ["Reward cycle", model.frequency],
  ];

  return (
    <>
      <div className="challenge-controls">
        <fieldset className="model-picker"><legend className="sr-only">Challenge model</legend>
          {challengeModels.map((item, index) => <label key={item.id} className={index === modelIndex ? "selected" : ""}><input type="radio" name="challenge-model" value={item.id} checked={index === modelIndex} onChange={() => setModelIndex(index)} />{item.name}{index === 0 && <span className="picker-label">POPULAR</span>}</label>)}
        </fieldset>
        <label className="unit-toggle"><span>Show rules in dollars</span><input type="checkbox" checked={dollars} onChange={(event) => setDollars(event.target.checked)} /></label>
      </div>
      <div className="challenge-panel">
        <div className="challenge-options">
          <span className="overline">FIND YOUR FIT</span><h3>{model.title}</h3><p>{model.description}</p>
          <fieldset className="size-picker"><legend>Simulated account size</legend><div>{accountSizes.map((value) => <label key={value} className={value === size ? "selected" : ""}><input type="radio" name="account-size" value={value} checked={value === size} onChange={() => setSize(value)} />${value / 1000}K</label>)}</div></fieldset>
          <dl className="rule-list" aria-label="Selected program rules">{rules.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </div>
        <aside className="challenge-summary" aria-label="Selected challenge summary">
          <span className="summary-tag">YOUR NEXT CHAPTER</span><p className="summary-model">{model.title}</p><p className="summary-size">{formatMoney(size)}</p><p className="summary-caption">simulated capital</p>
          <div className="summary-price"><span>Illustrative one-time fee</span><strong>{formatMoney(preview.price)}</strong></div>
          <ul><li>Trade crypto on Bybit Demo</li><li>Track targets and risk in one place</li><li>Clear rules for every phase</li></ul>
          <Button className="summary-button" onClick={() => reviewDialog.current?.showModal()}>Review this challenge <span aria-hidden="true">↗</span></Button>
          <p className="summary-disclaimer">Design preview · Sample rules and fees.<br />Purchases are not available yet.</p>
        </aside>
      </div>
      <dialog ref={reviewDialog} className="review-dialog" aria-labelledby="review-title">
        <form method="dialog"><button className="dialog-close" aria-label="Close challenge review">×</button></form>
        <span className="overline">CHALLENGE PREVIEW</span><h2 id="review-title">{model.title}</h2><p>{formatMoney(size)} simulated account · {formatMoney(preview.price)} sample fee</p>
        <dl className="rule-list">{rules.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <p className="preview-notice">This is a design preview. The figures come from the reference demo and are not a live offer. Checkout and registration will be connected in a later implementation.</p>
        <form method="dialog"><Button type="submit">Back to comparison</Button></form>
      </dialog>
    </>
  );
}

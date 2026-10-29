export function DashboardPreview({ chartId }: { chartId: string }) {
  return (
    <div className="dashboard-visual" aria-label="Illustrative trader dashboard">
      <div className="dashboard-top"><span className="dashboard-symbol" aria-hidden="true">N</span><strong>Trader overview</strong><span className="demo-label">SAMPLE DATA</span></div>
      <div className="dashboard-body">
        <div className="dashboard-account"><div><span className="dashboard-kicker">2-STEP EVALUATION</span><p>$100K account <span className="phase-tag">Phase 1</span></p></div><span className="connection-tag">Bybit Demo</span></div>
        <div className="equity-row"><div><span className="muted-label">Account equity</span><p>$104,960<span>.00</span></p></div><div className="equity-gain"><span>Sample P/L</span><strong>+$4,960.00 ↗</strong></div></div>
        <div className="equity-chart"><span className="chart-target">PROFIT TARGET · $108,000</span><svg viewBox="0 0 480 150" role="img" aria-label="Illustrative upward equity curve, not live performance"><defs><linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3e7cb1" stopOpacity=".24"/><stop offset="100%" stopColor="#3e7cb1" stopOpacity="0"/></linearGradient></defs><path className="chart-grid" d="M0 30H480M0 75H480M0 120H480"/><path d="M0 125 20 120 40 126 60 108 80 113 100 92 120 103 140 88 160 99 180 73 200 78 220 61 240 69 260 48 280 59 300 43 320 53 340 28 360 34 380 21 400 32 420 18 440 25 460 12 480 18V150H0Z" fill={`url(#${chartId})`}/><path d="M0 125 20 120 40 126 60 108 80 113 100 92 120 103 140 88 160 99 180 73 200 78 220 61 240 69 260 48 280 59 300 43 320 53 340 28 360 34 380 21 400 32 420 18 440 25 460 12 480 18" fill="none" stroke="#3e7cb1" strokeWidth="2.5"/></svg><div className="chart-axis"><span>Day 01</span><span>Day 04</span><span>Day 08</span></div></div>
        <div className="target-row"><span>Profit target progress</span><strong>62%</strong></div><progress value={62} max={100} aria-label="Sample profit target progress" />
        <div className="risk-grid"><div><span>Daily loss allowance</span><strong>$5,000</strong><small>Sample program limit</small></div><div><span>Max loss floor</span><strong>$90,000</strong><small>Static drawdown</small></div><div><span>Trading days</span><strong>3 / 4</strong><small>Sample phase progress</small></div></div>
      </div>
      <div className="dashboard-bottom"><span className="status-dot"/>Illustrative account · Not connected to Bybit</div>
    </div>
  );
}

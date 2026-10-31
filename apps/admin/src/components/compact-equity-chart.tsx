import type { EquityTick } from "@/mocks/types";

export function CompactEquityChart({ values, floor, target, ticks, label }: {
  values: readonly number[]; floor: number; target: number; ticks: readonly EquityTick[]; label: string;
}) {
  const low=Math.min(...values,floor)-2, high=Math.max(...values,target)+2;
  const x=(index:number)=>4+index/Math.max(1,values.length-1)*592;
  const y=(value:number)=>94-(value-low)/(high-low)*78;
  const current=values[values.length-1];
  return <figure className="compact-equity-chart">
    <svg className="compact-equity-svg" role="img" aria-label={label + ". Floor " + floor + ", target " + target + ", current " + current + "."}>
      <svg width="calc(100% - 104px)" height="100%" viewBox="0 0 600 112" preserveAspectRatio="none" aria-hidden="true">
        <line className="compact-equity-floor" x1="0" x2="600" y1={y(floor)} y2={y(floor)} vectorEffect="non-scaling-stroke"/>
        <line className="compact-equity-target" x1="0" x2="600" y1={y(target)} y2={y(target)} vectorEffect="non-scaling-stroke"/>
        <polyline className="compact-equity-line" points={values.map((value,index)=>x(index)+","+y(value)).join(" ")} vectorEffect="non-scaling-stroke"/>
        {values.length>0 && <circle className="compact-equity-current" cx={x(values.length-1)} cy={y(current)} r="3.5" vectorEffect="non-scaling-stroke"/>}
        {ticks.map(tick=><line className="compact-equity-tick" key={tick.at} x1={tick.position*600} x2={tick.position*600} y1="105" y2="110" vectorEffect="non-scaling-stroke"/>)}
      </svg>
      <text x="100%" dx="-2" y={y(target)/112*100+"%"} dy="4" textAnchor="end">Target {target}</text>
      <text x="100%" dx="-2" y={y(floor)/112*100+"%"} dy="4" textAnchor="end">Floor {floor}</text>
    </svg>
    <div className="compact-equity-times" aria-hidden="true">{ticks.map(tick=><time key={tick.at} dateTime={tick.at}>{tick.at.slice(11,16)} UTC</time>)}</div>
  </figure>;
}

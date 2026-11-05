// Élan : les mêmes cartes et données sont rendues dans le secours shell/07.
export interface HcItem { k: string; v: string; user: boolean; w: string }
export interface HcCard { app: string; k: string; label: string; desc: string; items: HcItem[]; count: string; metric: string; functions: {label:string;icon:string}[] }
export function HomeCards({cards,i18n}:{cards:HcCard[];i18n:{tr:(s:string)=>string;L:(s:string)=>string}}){
 const {tr,L}=i18n;
 return <div className="hc-list">{cards.map(c=><button key={c.k} type="button" className="hc" data-app={c.app} data-gapp={c.k}>
  <span className="hc-top"><img className="logo home-applogo hc-logo" src={`icons/${c.app}.svg`} alt="" aria-hidden="true" draggable="false"/><span className="hc-heading"><span className="hc-name">{c.label}</span><span className="hc-desc">{tr(L(c.desc))}</span></span><svg className="hc-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></span>
  <span className="hc-main"><span className="hc-count">{c.count}</span><span className="hc-metric">{tr(L(c.metric))}</span></span>
  <span className="hc-detail">{c.items.slice(0,1).map((it,i)=><span key={i} className="hc-it"><span className="hc-k">{tr(it.k)}</span><span className="hc-v">{it.user?<span className="notr">{it.v}</span>:tr(it.v)}</span></span>)}</span>
  <span className="hc-fns">{c.functions.map(f=><span key={f.label} className="hc-fn"><span dangerouslySetInnerHTML={{__html:f.icon}}/>{tr(L(f.label))}</span>)}</span>
 </button>)}</div>;
}

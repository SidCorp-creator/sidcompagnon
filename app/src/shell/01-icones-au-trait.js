/* ---------- icônes au trait (v24, style Graphite : plus aucun émoji dans l'interface) ---------- */
const ICS={
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  bell:'<path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6"/><path d="M9 17v1a3 3 0 0 0 6 0v-1"/>',
  calendar:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16"/>',
  utensils:'<path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 21V3c-2 1.5-3 4-3 8h3"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M5 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1"/>',
  camera:'<path d="M5 7h1a2 2 0 0 0 2-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2"/><circle cx="12" cy="13" r="3"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  trendup:'<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
  trenddown:'<path d="M3 7l6 6 4-4 8 8"/><path d="M21 10v7h-7"/>',
  equal:'<path d="M5 9h14M5 15h14"/>',
  flame:'<path d="M12 21c3.9 0 7-2.9 7-6.8 0-3.6-2.6-5.8-4-8.7-1.6 1.6-2.6 3.5-2.6 5.5-1.1-.8-1.9-2.2-2-3.8C7.6 9 5 11.6 5 14.2 5 18.1 8.1 21 12 21z"/>',
  target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".6"/>',
  leaf:'<path d="M5 21c.5-4.5 2.5-8 7-10"/><path d="M9 18c6.2 0 10.5-3.3 11-12V4h-4c-7 0-11 4-11 9 0 1.8.4 3.3 1 5"/>',
  sunrise:'<path d="M3 17h18M6 21h12M7 13a5 5 0 0 1 10 0M12 4v3M4.6 8.6l1.4 1.4M19.4 8.6 18 10"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M5.6 5.6 7 7M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  moon:'<path d="M12 3a7 7 0 1 0 9 9 8 8 0 1 1-9-9"/>',
  apple:'<path d="M12 7.5c-1.7-1.4-5.4-1.4-6.4 2.3-1 3.7 1.4 8.9 3.7 9.9 1 .4 1.5-.3 2.7-.3s1.7.7 2.7.3c2.3-1 4.7-6.2 3.7-9.9-1-3.7-4.7-3.7-6.4-2.3z"/><path d="M12 7.5c0-2 .9-3.4 2.9-4"/>',
  book:'<path d="M4 19V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h14v-4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  activity:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  bolt:'<path d="M13 3 4 14h7l-1 7 9-11h-7z"/>',
  alert:'<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  folder:'<path d="M4 5h5l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1"/>',
  file:'<path d="M14 3v5h5"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2"/>',
  database:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  grad:'<path d="M22 9 12 4 2 9l10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>'};
const IC=n=>ICS[n]?`<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICS[n]}</svg>`:"";
// initiales d'un plat à la place de l'émoji : « Poulet riz » → « PR »
const mono=s=>{const w=String(s||"").normalize("NFC").split(/[\s,'’-]+/).filter(x=>x&&/^\p{L}/u.test(x)&&!/^(de|du|des|la|le|les|au|aux|et|à|a|en|of|the|and|with|avec)$/i.test(x));return (w.length?w.slice(0,2).map(x=>x[0]).join(""):"·").toUpperCase()};
const hydrateIcons=root=>(root||document).querySelectorAll("i.ic[data-i]").forEach(e=>{if(!e.firstChild)e.innerHTML=IC(e.dataset.i)});
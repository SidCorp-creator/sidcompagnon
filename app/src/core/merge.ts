// Fusion des données entre appareils (ticket #3, « coquille », étape 1). Traduction fidèle de merge3 / mergeData de site/app.js (v44.6) :
// même comportement, ligne pour ligne. Testé contre l'ancien code par tests/merge.test.js (cas écrits + milliers de cas tirés au hasard).
// Aucune dépendance au navigateur : les fonctions de l'app (forServer, norm, L) sont passées par `env`.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;
type Obj = Record<string, Any>;
export interface MergeEnv {
  forServer: (d: Obj) => Obj; // copie sans les réglages propres à l'appareil (ui)
  norm: (s: unknown) => string;
  L: (fr: string) => string;
  now?: () => number;
}
export interface MergeOpt { since?: number; base?: Obj | null }

const jeq = (a: Any, b: Any) => a === b || JSON.stringify(a) === JSON.stringify(b);
const isObj = (x: Any): x is Obj => !!x && typeof x === "object" && !Array.isArray(x);
const idList = (x: Any) => Array.isArray(x) && x.length > 0 && x.every((e) => isObj(e) && e.id !== undefined && e.id !== null);
// gardés d'un bloc (jamais mélangés champ par champ)
const M3_ATOM = new Set(["plan", "profile", "menu", "vault", "docVault", "noteVault", "phx", "grp", "consent"]);
// changé des deux côtés : le plus récent, sinon cet appareil
const m3pick = (l: Any, r: Any) => { const t = (x: Any) => isObj(x) ? (+x.upd || +x.at || Date.parse(x.createdAt) || 0) : 0; return t(r) > t(l) ? r : l; };

/** Fusion à 3 voies : b = dernière version du serveur connue ici, l = cet appareil, r = serveur. */
export function merge3(b: Any, l: Any, r: Any, key?: string): Any {
  if (jeq(l, r)) return l; if (jeq(l, b)) return r; if (jeq(r, b)) return l;
  if ((idList(l) || idList(r) || idList(b)) && (l === undefined || Array.isArray(l)) && (r === undefined || Array.isArray(r))) {
    const B = new Map((Array.isArray(b) ? b : []).filter(isObj).map((x: Obj) => [x.id, x])), R = new Map((r || []).filter(isObj).map((x: Obj) => [x.id, x]));
    const out: Any[] = [], seen = new Set();
    for (const x of l || []) {
      if (!isObj(x)) { out.push(x); continue; }
      seen.add(x.id); const bx = B.get(x.id), rx = R.get(x.id);
      if (rx) { out.push(jeq(x, bx) ? rx : jeq(rx, bx) ? x : m3pick(x, rx)); continue; }
      if (bx && jeq(x, bx)) continue; // supprimé ailleurs, pas touché ici
      out.push(x);
    }
    for (const x of r || []) {
      if (!isObj(x) || seen.has(x.id)) continue; const bx = B.get(x.id);
      if (bx && jeq(x, bx)) continue; // supprimé ici, pas touché ailleurs
      out.push(x);
    }
    return out;
  }
  if (isObj(l) && isObj(r) && !M3_ATOM.has(key as string)) {
    const bo: Obj = isObj(b) ? b : {}, out: Obj = {};
    for (const k of new Set([...Object.keys(r), ...Object.keys(l)])) { const v = merge3(bo[k], l[k], r[k], k); if (v !== undefined) out[k] = v; }
    return out;
  }
  return m3pick(l, r);
}

/** Fusionne les données d'un autre appareil (rem) avec celles de cet appareil (loc), sans rien perdre. */
export function mergeData(loc: Obj, rem: Obj, opt: MergeOpt | undefined, env: MergeEnv): Obj {
  const { forServer, norm, L } = env;
  loc = loc || {}; rem = rem || {}; const since = (opt && opt.since) || 0;
  // avec la base : la version de cet appareil devient « serveur + ce qui a vraiment changé ici », puis la fusion habituelle s'applique
  if (opt && opt.base && !(rem.wipe || loc.wipe)) {
    const base = opt.base, ui = loc.ui; const l2 = merge3(forServer(base), forServer(loc), forServer(rem));
    if (ui) l2.ui = ui;
    // ce qui a disparu des deux côtés par rapport à la base est vraiment supprimé : on l'enlève aussi de la version du serveur
    const strip = (bb: Any, ll: Any, rr: Any): Any => {
      if (Array.isArray(rr) && idList(bb) && Array.isArray(ll)) {
        const keep = new Set(ll.filter(isObj).map((x: Obj) => x.id)), bi = new Set(bb.map((x: Obj) => x.id));
        return rr.filter((x: Any) => !isObj(x) || keep.has(x.id) || !bi.has(x.id));
      }
      if (isObj(rr) && isObj(bb) && isObj(ll)) {
        const o: Obj = { ...rr };
        for (const k in o) { if (!(k in ll) && (k in bb) && jeq(bb[k], rr[k])) { delete o[k]; continue; } o[k] = strip(bb[k], ll[k], rr[k]); }
        return o;
      }
      return rr;
    };
    rem = strip(forServer(base), l2, forServer(rem)); loc = l2;
  }
  // « Supprimer mes données » sur un autre appareil : l'effacement gagne sur tout le reste
  if ((rem.wipe || "") > (loc.wipe || "")) return { ...JSON.parse(JSON.stringify(rem)), ui: loc.ui || rem.ui };
  if ((loc.wipe || "") > (rem.wipe || "")) return { ...loc };
  const now = (env.now || Date.now)(), del: Obj = {};
  for (const src of [rem.del || {}, loc.del || {}]) for (const k in src) if (now - src[k] < 90 * 864e5) del[k] = Math.max(del[k] || 0, src[k]);
  // élément restauré depuis une sauvegarde (data.res) : il annule une suppression plus ancienne
  const res: Obj = {}; for (const src of [rem.res || {}, loc.res || {}]) for (const k in src) if (now - src[k] < 90 * 864e5) res[k] = Math.max(res[k] || 0, src[k]);
  for (const k in res) if (del[k] && del[k] <= res[k]) delete del[k];
  const arr = (a: Any, b: Any): Any[] => {
    a = Array.isArray(a) ? a : []; b = Array.isArray(b) ? b : []; const ids = new Set(a.map((x: Any) => x && x.id));
    return [...a.filter((x: Any) => x && !del[x.id]), ...b.filter((x: Any) => x && !ids.has(x.id) && !del[x.id])];
  };
  // notes et mots de passe : si les deux appareils ont modifié le même élément, on garde le plus récent
  const arrU = (a: Any, b: Any): Any[] => {
    const rb = new Map((Array.isArray(b) ? b : []).map((x: Any) => [x && x.id, x]));
    return arr(a, b).map((x) => { const r = rb.get(x.id); return r && (r.upd || 0) > (x.upd || 0) ? r : x; });
  };
  const out: Obj = { ...rem, ...loc, del, res };
  out.todos = arr(loc.todos, rem.todos); out.tasks = arr(loc.tasks, rem.tasks);
  out.todoCats = arr(loc.todoCats, rem.todoCats); out.docs = arr(loc.docs, rem.docs); out.docFolders = arr(loc.docFolders, rem.docFolders); out.noteFolders = arr(loc.noteFolders, rem.noteFolders);
  out.notes = arrU(loc.notes, rem.notes); out.pwds = arrU(loc.pwds, rem.pwds); out.pdfAnns = arrU(loc.pdfAnns, rem.pdfAnns);
  // une note modifiée sur les deux appareils depuis la dernière synchro : on garde aussi l'autre version, en copie
  if (since) {
    const ln = new Map((Array.isArray(loc.notes) ? loc.notes : []).map((x: Any) => [x && x.id, x]));
    for (const r of Array.isArray(rem.notes) ? rem.notes : []) {
      const l = r && ln.get(r.id);
      if (!l || del[r.id] || (l.upd || 0) <= since || (r.upd || 0) <= since || (l.upd || 0) === (r.upd || 0)) continue;
      const same = l.secret ? l.ct === r.ct : (l.title || "") === (r.title || "") && (l.body || "") === (r.body || ""); if (same) continue;
      const lose = (r.upd || 0) > (l.upd || 0) ? l : r, cid = lose.id + "-c" + (lose.upd || 0);
      if (!out.notes.some((x: Obj) => x.id === cid) && !del[cid]) out.notes.push({ ...lose, id: cid, ...(lose.secret ? {} : { title: (lose.title || "") + " " + L("(copie de conflit)") }), photos: undefined });
    }
  }
  // nutrition : profil, besoins et menu = version la plus récente ; journal = union des entrées
  const ln = loc.nutri || {}, rn = rem.nutri || {};
  out.nutri = { ...((ln.upd || 0) >= (rn.upd || 0) ? { ...rn, ...ln } : { ...ln, ...rn }), log: arrU(ln.log, rn.log), weights: arrU(ln.weights, rn.weights), weeks: arrU(ln.weeks, rn.weeks) };
  // un document envoyé sur le serveur depuis un autre appareil reste marqué « en ligne »
  const remDocs = new Map((rem.docs || []).map((d: Any) => [d && d.id, d]));
  out.docs = out.docs.map((d: Obj) => { const r: Any = remDocs.get(d.id); return r && r.up && !d.up ? { ...d, up: true, path: r.path } : d; });
  const tn = new Set((loc.types || []).map((t: Obj) => norm(t.name)));
  out.types = [...(loc.types || []), ...(rem.types || []).filter((t: Obj) => !tn.has(norm(t.name)))];
  {
    const lm = loc.muscu || {}, rm = rem.muscu || {}, pu = (x: Any) => (x && x.plan && x.plan.upd) || 0;
    out.muscu = { ...rm, ...lm, sessions: arrU(lm.sessions, rm.sessions), log: arr(lm.log, rm.log), plan: pu(rm) > pu(lm) ? rm.plan : (lm.plan !== undefined ? lm.plan : rm.plan) };
  }
  out.prefs = { ...(rem.prefs || {}), ...(loc.prefs || {}) };
  // coffres et phrase secrète : si les deux appareils en ont un différent, le plus récent gagne
  const vAt = (v: Any) => v ? (v.at || Date.parse(v.createdAt) || 0) : 0;
  for (const k of ["vault", "docVault", "noteVault", "phx"]) { const a = loc[k], b = rem[k]; if (a && b && a.id !== b.id && vAt(b) > vAt(a)) out[k] = b; }
  return out;
}

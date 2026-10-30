// Connexion au serveur et synchronisation (ticket #3, « coquille », étape 3). Traduction fidèle de site/app.js :
// - api() : appel Supabase (Auth GoTrue, PostgREST), mêmes en-têtes, mêmes messages d'erreur (err.status, err.code) ;
// - sessionFrom() : la session gardée sur l'appareil (storeSession) ;
// - pushLoop() : l'écriture « à condition » de push() (v31) avec fusion à 3 voies (v44.6) : on relit la ligne du serveur, on fusionne
//   si quelqu'un a écrit entre-temps, puis on écrit seulement si la ligne n'a pas changé ; sinon on recommence (4 essais).
// L'état de l'app (cache, data, erreurs affichées, nouvel essai) reste dans app.js, qui passe ses fonctions par `deps`.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

export interface ApiOpt { method?: string; body?: unknown; token?: string; headers?: Record<string, string> }
export function createApi(url: string, key: string) {
  return async function api(path: string, { method = "GET", body, token, headers = {} }: ApiOpt = {}): Promise<Any> {
    const r = await fetch(url + path, { method, headers: { apikey: key, "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
    const txt = await r.text(); let j: Any = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) { /* réponse vide ou non JSON */ }
    if (!r.ok) { const err: Any = new Error((j && (j.msg || j.message || j.error_description || j.error)) || ("Erreur " + r.status)); err.status = r.status; err.code = j && (j.error_code || j.code); throw err; }
    return j;
  };
}

const userFeat = (u: Any) => u && u.app_metadata && Array.isArray(u.app_metadata.features) ? u.app_metadata.features.map(String) : null;
/** Session gardée sur l'appareil après une connexion ou un renouvellement du jeton. */
export function sessionFrom(j: Any, name: string, prev: Any, nowSec = Date.now() / 1000) {
  return {
    access_token: j.access_token, refresh_token: j.refresh_token,
    expires_at: j.expires_at || Math.floor(nowSec) + (j.expires_in || 3600), user: { id: j.user.id }, name,
    email: (j.user && j.user.email) || (prev && prev.email) || "", eph: !!(prev && prev.eph),
    feat: userFeat(j.user) || (prev && prev.feat) || [],
  };
}

export interface PushDeps {
  api: (path: string, opt?: ApiOpt) => Promise<Any>;
  fetchRow: () => Promise<{ data: Any; updated_at: string } | null>;
  getData: () => Any; // données de l'app (lues à chaque essai : la fusion les remplace)
  mergeData: (loc: Any, rem: Any, opt: Any) => Any;
  applyRemote: (d: Any) => void;
  setDel: (del: Any) => void;
  forServer: (d: Any) => Any;
  now?: () => string;
}
/** Écriture à condition. Renvoie {rev, sent} ; lève « conflit » si 4 essais n'ont pas suffi. */
export async function pushLoop(uid: string, token: string, known: string, base: Any, since: number, d: PushDeps): Promise<{ rev: string; sent: Any }> {
  let rev: string | null = null, sent: Any = null;
  const now = d.now || (() => new Date().toISOString());
  for (let attempt = 0; attempt < 4 && !rev; attempt++) {
    const row = await d.fetchRow();
    if (row && row.updated_at !== known) {
      const m = d.mergeData(d.getData(), row.data, { since, base });
      if (JSON.stringify(d.forServer(m)) !== JSON.stringify(d.forServer(d.getData()))) d.applyRemote(m); else d.setDel(m.del);
      base = row.data; known = row.updated_at; // cette version est maintenant intégrée ici : elle sert de base si on recommence
    }
    const r = now(); sent = d.forServer(d.getData()); const body = JSON.parse(JSON.stringify(sent));
    if (!row) {
      await d.api("/rest/v1/user_data?on_conflict=user_id", { method: "POST", token, headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: { user_id: uid, data: body, updated_at: r } });
      rev = r; sent = body; break;
    }
    const done = await d.api(`/rest/v1/user_data?user_id=eq.${uid}&updated_at=eq.${encodeURIComponent(row.updated_at)}&select=updated_at`, { method: "PATCH", token, headers: { Prefer: "return=representation" }, body: { data: body, updated_at: r } });
    if (Array.isArray(done) && done.length) { rev = done[0].updated_at || r; sent = body; break; }
    // quelqu'un a écrit entre-temps : on recommence avec sa version
  }
  if (!rev) throw new Error("conflit");
  return { rev, sent };
}

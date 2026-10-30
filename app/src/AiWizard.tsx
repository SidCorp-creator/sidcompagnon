// Assistant « Brancher Claude » (#aiBody), migré en v68 (ticket #3). Même rendu que aiRender de site/app.js.
// Les étapes (none / setup / test), l'adresse et la vérification restent gérées par app.js ; clics délégués sur #aiBody.

export interface AI18n { tr: (fr: string) => string; L: (fr: string) => string }
export interface AiVM { step: "none" | "setup" | "test"; name: string; url: string; urlErr: string; add: string; ok: boolean; test: string; testHref: string; habit: string; habitHref: string }

export function AiWizard({ w, i18n }: { w: AiVM; i18n: AI18n }) {
  const { tr, L } = i18n;
  if (w.step === "none") return <><p>{tr(L("Crée un compte Claude gratuit (e-mail ou Google), puis reviens ici pour continuer."))}</p>
    <div className="ai-acts"><a className="btn" href="https://claude.ai/login" target="_blank" rel="noopener">{tr(L("Créer mon compte Claude"))}</a><button type="button" className="btn ghost" data-aistep="setup">{tr(L("C'est fait, continuer"))}</button></div></>;
  if (w.step === "setup") return <>
    <div className="ai-step"><b>{tr(L("Tout est prêt"))}</b><div className="small muted">{tr(L("Touche le bouton : Claude s'ouvre avec Sid'note déjà rempli. Là-bas, touche simplement « Ajouter », puis reviens ici."))}</div>
      {w.url ? <a className="btn" href={w.add} target="_blank" rel="noopener" style={{ width: "100%", marginTop: "10px" }} data-aiadd="1">{tr(`${L("Ajouter Sid'compagnon à")} ${w.name}`)}</a>
        : <button type="button" className="btn" disabled style={{ width: "100%", marginTop: "10px" }}>{tr(L("Préparation…"))}</button>}
      <div className="small muted" style={{ marginTop: "8px" }}>{tr(L("Si Claude te demande de te connecter, fais-le : la fenêtre s'ouvrira ensuite toute seule."))}</div></div>
    <details className="ai-more"><summary className="small">{tr(L("Voir mon adresse (si besoin)"))}</summary><div className="mcp-url notr" id="aiUrl">{w.url || tr(L(w.urlErr || "Création…"))}</div>
      <button type="button" className="btn ghost" data-aicopy="1" style={{ width: "100%", marginTop: "8px" }}>{tr(L("Copier l'adresse"))}</button></details>
    <div className="ai-acts"><button type="button" className="btn ghost" data-aistep="none">{tr(L("Pas encore de compte Claude ?"))}</button><button type="button" className="btn" data-aistep="test">{tr(L("C'est fait : tester"))}</button></div></>;
  return <>
    <button type="button" className="btn ai-back" data-aistep="setup">{tr(`↺ ${L("Revoir les étapes")}`)}</button>
    <div className="ai-step"><b>{tr(`3. ${L("Envoie ce message à")} ${w.name}`)}</b><div className="ai-prompt notr">{w.test}</div>
      <a className="btn" href={w.testHref} target="_blank" rel="noopener" style={{ width: "100%", marginTop: "8px" }}>{tr(`${L("Envoyer avec")} ${w.name}`)}</a></div>
    <div className="ai-wait" id="aiWait">{w.ok ? <b className="ok">{tr(`✓ ${L("C'est branché !")}`)}</b> : <><span className="spin"></span>{tr(L("En attente de Claude… (accepte l'accès à Sid'note s'il te le demande)"))}</>}</div>
    <div className="ai-step" id="aiHabit" hidden={!w.ok}><b>{tr(L("Dernière astuce"))}</b><div className="small muted">{tr(L("Pour que tes repas arrivent tout seuls dans Sid'note, envoie-lui une fois ce message :"))}</div>
      <div className="ai-prompt notr">{w.habit}</div><a className="btn ghost" href={w.habitHref} target="_blank" rel="noopener" style={{ width: "100%", marginTop: "8px" }}>{tr(`${L("Envoyer avec")} ${w.name}`)}</a>
      <button type="button" className="btn ghost" data-convset="nutri" style={{ width: "100%", marginTop: "8px" }}>{tr(L("Une conversation par app"))}</button></div>
    <div className="ai-acts"><button type="button" className="btn" id="aiDone" hidden={!w.ok}>{tr(L("Terminer"))}</button></div></>;
}

// v68 : boutons de la fenêtre « Envoyer à Claude » (#aaActs, aiHandoff) ; le partage de la photo, la copie et l'envoi restent dans app.js.
export interface AaVM { wiz: boolean; img: string; conv: boolean; proj: boolean; convName: string; ask: string; askOk: boolean; name: string; form: boolean; topic: string }
export function AaActs({ a, i18n }: { a: AaVM; i18n: AI18n }) {
  const { tr, L } = i18n;
  return <>
    {a.wiz ? <button type="button" className="btn" data-aiwiz="1">{tr(L("Brancher Claude"))}</button> : null}
    {a.img ? <><div className="aa-img"><img src={a.img} alt={tr(L("Photo de ton plat"))} /><span className="small muted">{tr(L("La photo part avec le message : choisis Claude dans la liste de partage."))}</span></div>
      <button type="button" className="btn" id="aaShare">{tr(L("Envoyer la photo à Claude"))}</button>
      <button type="button" className="btn" id="aaImgCopy" hidden>{tr(L("Copier la photo et ouvrir Claude"))}</button>
      <a className="btn ghost" id="aaImgSave" href={a.img} download="assiette.jpg">{tr(L("Enregistrer la photo"))}</a></> : null}
    {a.conv && !a.img ? <><button type="button" className="btn" data-aaconv="1">{tr(`${L(a.proj ? "Ouvrir dans le projet" : "Ouvrir la conversation")} ${L(a.convName)}`)}</button>
      <div className="small muted" style={{ textAlign: "center" }}>{tr(L(a.proj ? "Le message sera déjà écrit dans ton projet : il ne reste qu'à l'envoyer." : "Le message sera copié : colle-le dans la conversation."))}</div></> : null}
    {a.ask ? <a className={`btn ${a.askOk ? "" : "ghost"}`} href={a.ask} target="_blank" rel="noopener">{tr(`${L("Envoyer avec")} ${a.name}`)}</a> : null}
    <button type="button" className="btn ghost" id="aaCopy">{tr(L("Copier le message"))}</button>
    {a.form ? <form className="conv-f aa-conv" data-conv={a.topic}><label className="small muted" htmlFor="aaConvIn">{tr(`${L("Ensuite, pour que toutes les demandes")} ${L(a.convName)} ${L("arrivent dans cette même conversation, colle ici son lien :")}`)}</label>
      <div className="conv-row"><input id="aaConvIn" type="url" inputMode="url" placeholder="https://claude.ai/chat/…" autoComplete="off" /><button className="btn ghost" type="submit">{tr(L("Enregistrer"))}</button></div></form> : null}
  </>;
}

export function NuPhotoPrev({ src, i18n }: { src: string; i18n: AI18n }) {
  const { tr, L } = i18n;
  if (!src) return null;
  return <><img src={src} alt={tr(L("Photo du plat"))} /><button type="button" aria-label={tr(L("Retirer la photo"))} data-nuphrm="1">×</button></>;
}

export function ScanPages({ pages, i18n }: { pages: string[]; i18n: AI18n }) {
  const { tr } = i18n;
  return <>{pages.map((u, i) => <div key={i} className="pg"><img src={u} alt={tr(`Page ${i + 1}`)} /><button className="rot" data-scrot={i} aria-label={tr("Pivoter")}>↻</button>
    <button className="rm" data-scrm={i} aria-label={tr("Retirer")}>×</button><span>{i + 1}</span></div>)}</>;
}

import {FormeIcon} from "./FormeIcon";
// v76 : l assistant de branchement Claude est retiré (remplacé par Sid'Bot, shell/32-sidbot.js). Restent les aperçus photo.

export interface AI18n { tr: (fr: string) => string; L: (fr: string) => string }
export function NuPhotoPrev({ src, i18n }: { src: string; i18n: AI18n }) {
  const { tr, L } = i18n;
  if (!src) return null;
  return <><img src={src} alt={tr(L("Photo du plat"))} /><button type="button" aria-label={tr(L("Retirer la photo"))} data-nuphrm="1"><FormeIcon name="close"/></button></>;
}

export function ScanPages({ pages, i18n }: { pages: string[]; i18n: AI18n }) {
  const { tr } = i18n;
  return <>{pages.map((u, i) => <div key={i} className="pg"><img src={u} alt={tr(`Page ${i + 1}`)} /><button className="rot" data-scrot={i} aria-label={tr("Pivoter")}><FormeIcon name="refresh"/></button>
    <button className="rm" data-scrm={i} aria-label={tr("Retirer")}><FormeIcon name="close"/></button><span>{i + 1}</span></div>)}</>;
}

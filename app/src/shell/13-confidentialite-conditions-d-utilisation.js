/* ---------- v35 : confidentialité, conditions d'utilisation, consentement santé, suppression du compte ---------- */
// v43 : textes légaux mis à jour (connecteur Claude, Spotify à la demande, polices hébergées ici) ; version complète dans les pages publiques
const LEGAL={privacy:[
  ["Qui est responsable","Sid'compagnon est édité par SidCorp, qui est responsable du traitement de tes données. Les coordonnées complètes figurent dans la version complète de cette politique. Pas de publicité : aucune donnée n'est vendue ni utilisée à des fins commerciales."],
  ["Ce qui est enregistré, et pourquoi","Ton e-mail, ton pseudo et ton mot de passe (gardé haché par Supabase), pour ton compte. Ce que tu mets dans l'app (agenda, tâches, notes, documents, séances, nutrition, réglages), pour te rendre le service : c'est la base légale « exécution du contrat ». Des rapports d'erreur techniques (version, message d'erreur, type de navigateur, sans ton contenu), pour corriger les bugs : intérêt légitime. Ton abonnement aux notifications, seulement si tu les actives."],
  ["Données de santé","Ton poids, tes repas, ton profil (âge, taille, sport), tes séances et les zones à ménager sont des données de santé. Sid'compagnon ne les utilise qu'avec ton accord explicite, que tu peux retirer à tout moment dans Réglages. Sid'compagnon ne les envoie à aucune IA de lui-même : si tu branches Claude, c'est ton propre compte Claude (Anthropic) qui les lit par le connecteur, quand tu le lui demandes, selon les conditions d'Anthropic. La photo d'assiette que tu envoies à Claude est déposée dans ton dossier privé, lue une seule fois par ton Claude, puis effacée (au plus tard après 24 h). Les aliments sont retenus dans une mémoire commune anonyme (jamais ton nom)."],
  ["Où, et avec qui","Tes données sont dans ton compte chez Supabase, en Europe (Francfort, Allemagne). Le site est hébergé par Netlify, qui garde des journaux techniques (dont ton adresse IP) pour faire tourner le site. Anthropic n'intervient que si tu branches Claude, Spotify seulement si tu charges son lecteur. Plus aucune police ni bibliothèque n'est chargée chez un tiers. Sur ton appareil, l'app garde une copie de tes données pour marcher sans connexion."],
  ["Ce qui est chiffré","Mots de passe, notes secrètes et documents sont chiffrés sur ton appareil avec une clé protégée par le mot de passe de ton compte (ou ta phrase secrète pour les coffres créés avant) avant d'être envoyés : personne d'autre ne peut les lire, pas même SidCorp. Le reste est protégé par ton compte ; l'administrateur pourrait techniquement y accéder pour l'entretien, mais ne le fait pas."],
  ["Combien de temps","Tant que ton compte existe. Les éléments supprimés quittent la synchronisation après 90 jours ; les sauvegardes automatiques sont gardées 14 jours ; les rapports d'erreur 90 jours. « Supprimer mon compte » efface tout de suite ton compte et tes données (les sauvegardes disparaissent dans les 14 jours)."],
  ["Tes droits","Tu peux voir, télécharger, corriger et supprimer tes données à tout moment (Réglages, « Tes données et ta vie privée »), retirer ton accord pour les données de santé, t'opposer à un traitement et supprimer ton compte. Tu peux aussi porter plainte auprès de l'Autorité de protection des données (Belgique, www.autoriteprotectiondonnees.be)."]],
 terms:[
  ["Le service","Sid'compagnon est gratuit, sans achat ni abonnement, et fourni tel quel. Il peut évoluer, être interrompu ou s'arrêter ; tu seras prévenu à l'avance si possible."],
  ["Ton compte","Ton compte est personnel. Garde ton mot de passe pour toi : il protège aussi tes coffres. Si tu le remets à zéro par e-mail, ouvre d'abord tes coffres sur un appareil où ils sont déjà ouverts pour garder l'accès ; sinon, ils ne peuvent pas être rouverts, même par SidCorp."],
  ["Ce que tu y mets","Tu restes propriétaire de ton contenu. N'y mets rien d'illégal. Fais de temps en temps une sauvegarde (Réglages, « Sauvegarde »)."],
  ["Santé : nutrition et musculation","Les calculs, menus et programmes sont donnés à titre indicatif, parfois par une IA qui peut se tromper. Ce n'est pas un avis médical : demande conseil à un médecin, un diététicien ou un coach, surtout en cas de douleur, de grossesse, de maladie ou de troubles alimentaires."],
  ["Claude (facultatif)","Brancher Claude est facultatif. Claude est un service d'Anthropic, utilisé avec ton propre compte et selon ses conditions ; SidCorp n'en est pas responsable. Tu peux débrancher le connecteur à tout moment (Réglages)."],
  ["Fin et droit applicable","Tu peux supprimer ton compte à tout moment. SidCorp peut fermer un compte utilisé de façon abusive. Ces conditions relèvent du droit belge ; elles ne retirent aucun droit que la loi te donne comme consommateur."]],
 cookies:[
  ["Pas de cookie","Sid'compagnon ne dépose aucun cookie : ni publicité, ni mesure d'audience, ni pisteur."],
  ["Ce qui est gardé sur ton appareil","Seulement ce qui est nécessaire pour faire marcher l'app que tu as demandée : ta session (rester connecté), une copie de tes données pour marcher sans connexion, tes fichiers, tes préférences d'affichage (langue, thème, barre latérale), un compteur anti-essais pour la connexion, et le cache de l'app. Ces éléments sont dispensés de consentement (loi belge du 13 juin 2005, art. 129) car strictement nécessaires."],
  ["Contenu tiers : Spotify","Le lecteur Spotify (Focus) n'est chargé que si tu touches « Charger le lecteur Spotify ». Spotify reçoit alors ton adresse IP et peut déposer ses propres cookies, selon sa politique. Tu peux retirer ce choix à tout moment sous le lecteur."],
  ["Pas de bandeau","Comme rien de non nécessaire n'est chargé sans ton action, Sid'compagnon n'affiche pas de bandeau de cookies."]]};
const LEGAL_PAGE={privacy:"confidentialite.html",terms:"conditions.html",cookies:"cookies.html"};
function openLegal(k){k=LEGAL[k]?k:"privacy";
  document.querySelectorAll("#legalSeg [data-legal]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.legal===k)));
  if(shIsl("legalBody")){try{window.SCIslands.legalBody($("legalBody"),{parts:LEGAL[k],page:LEGAL_PAGE[k],i18n:agI18n()})}catch(e){reportErr("island legalBody: "+(e&&e.message))}}
  else $("legalBody").innerHTML=LEGAL[k].map(([h,t])=>`<h3>${esc(L(h))}</h3><p>${esc(L(t))}</p>`).join("")+`<p><a href="${LEGAL_PAGE[k]}" target="_blank" rel="noopener">${L("Lire la version complète")} ↗</a></p><p class="small muted">${esc(L("Mis à jour le 22 octobre 2026."))}</p>`;
  $("legalBody").scrollTop=0;$("legalSheet").hidden=false}
document.addEventListener("click",e=>{const b=e.target.closest("[data-openlegal]");if(b){e.preventDefault();openLegal(b.dataset.openlegal)}});
$("legalSeg").addEventListener("click",e=>{const b=e.target.closest("[data-legal]");if(b)openLegal(b.dataset.legal)});
$("legalClose").addEventListener("click",()=>$("legalSheet").hidden=true);
$("legalSheet").addEventListener("click",e=>{if(e.target.id==="legalSheet")$("legalSheet").hidden=true});
// accord explicite avant le premier envoi de données de santé à l'IA (data.nutri.consent = date) ; retirable dans Réglages
let consentRes=null;
function nuConsent(){if(NU().consent)return Promise.resolve(true);
  return new Promise(res=>{consentRes=res;$("consentSheet").hidden=false})}
const consentEnd=v=>{$("consentSheet").hidden=true;const r=consentRes;consentRes=null;if(r)r(v)};
$("consentYes").addEventListener("click",()=>{const n=NU();n.consent=new Date().toISOString();n.upd=Date.now();save();renderConsent();consentEnd(true)});
$("consentNo").addEventListener("click",()=>consentEnd(false));$("consentClose").addEventListener("click",()=>consentEnd(false));
function renderLockSel(){const v=data.ui&&data.ui.lockDelay,d=String(v===undefined||v===null?-1:v);document.querySelectorAll("#lockSel [data-lock]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.lock===d)))}
$("lockSel").addEventListener("click",e=>{const b=e.target.closest("[data-lock]");if(!b)return;data.ui.lockDelay=+b.dataset.lock;saveUI();renderLockSel();toast("Réglage enregistré")});
function renderConsent(){renderLockSel();try{renderBio();$("mcpSec").hidden=!session||isTrial()}catch(e){}const row=$("nuConsentRow");if(!row)return;row.hidden=!tabAllowed("nutri");const c=NU().consent;
  $("nuConsentState").textContent=c?`${L("accord donné le")} ${fmtDay(c)}`:L("pas d'accord");$("nuConsentBtn").textContent=L(c?"Retirer":"Donner mon accord")}
$("nuConsentBtn").addEventListener("click",async()=>{const n=NU();
  if(n.consent){delete n.consent;n.upd=Date.now();save();renderConsent();toast("Accord retiré : Nutrition ne calculera plus rien")}else{await nuConsent();renderConsent()}});
// suppression du compte, en libre-service (fonction serveur delete-account) ; le mot de passe est redemandé
$("delAccBtn").addEventListener("click",async()=>{
  if(!session||isTrial()||isTestAcc())return;
  const pw=await askAccountPw("Supprimer mon compte","Ton compte et tout ce qu'il contient (agenda, tâches, notes, coffres, documents…) seront effacés définitivement, sur tous tes appareils. Entre ton mot de passe pour confirmer.",
    async pw=>{try{await api("/auth/v1/token?grant_type=password",{method:"POST",body:{email:accEmail(),password:pw}});return null}
      catch(ex){return ex instanceof TypeError?"Pas de connexion internet. Réessaie quand tu es connecté.":"Mot de passe incorrect."}},"Annuler");
  if(!pw)return;
  const b=$("delAccBtn");b.disabled=true;b.textContent="…";
  try{const u=session.user.id;await dropSub().catch(()=>{});
    await api("/functions/v1/delete-account",{method:"POST",token:await token(),body:{}});
    await idbClearUser(u);["sidnote-ical-"+u,"sidnote-icalauth-"+u,cacheKey(u),"sidnote-mk-"+u,"sidnote-bio-"+u,LAST_KEY].forEach(k=>ls.del(k));
    endSession(L("Ton compte a été supprimé. Merci d'avoir utilisé Sid'compagnon."),true);
  }catch(ex){b.disabled=false;b.textContent=L("Supprimer mon compte");toast(ex instanceof TypeError?L("Pas de connexion internet"):(ex.message||L("Suppression impossible")))}});

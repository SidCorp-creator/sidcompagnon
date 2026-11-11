/* ---------- v35 : confidentialité, conditions d'utilisation, consentement santé, suppression du compte ---------- */
// v82.1 : services réels, relais MCP et transferts ; les pages publiques reprennent ces résumés.
const LEGAL={
  "privacy": [
    [
      "Qui est responsable",
      "Sid'Compagnon est édité par SidCorp, qui est responsable du traitement de tes données. Les coordonnées complètes figurent dans la version complète de cette politique. Pas de publicité : aucune donnée n'est vendue ni utilisée à des fins commerciales."
    ],
    [
      "Ce qui est enregistré, et pourquoi",
      "Ton e-mail, ton pseudo et ton mot de passe (gardé haché par Supabase), pour ton compte. Ce que tu mets dans l'app (agenda, tâches, notes, documents, séances, nutrition, réglages), pour te rendre le service : c'est la base légale « exécution du contrat ». Des rapports d'erreur techniques (version, message d'erreur, type de navigateur, sans ton contenu), pour corriger les bugs : intérêt légitime. Ton abonnement aux notifications, seulement si tu les actives."
    ],
    [
      "Données de santé",
      "Ton poids, tes repas, ton profil (âge, taille, sport), tes séances et les zones à ménager sont des données de santé. Leur utilisation dans Nutrition demande ton accord explicite, retirable dans Réglages. Les estimations et questions qui passent par Sid'Bot transmettent à Groq le texte, le contexte choisi et la photo éventuelle pour te répondre. Les conversations de Sid'Bot restent sur ton appareil ; leurs copies éventuelles chez Groq suivent les règles indiquées ci-dessous. Les photos envoyées pour analyse ne sont pas enregistrées comme telles dans ton compte ; une vignette peut rester sur ton appareil. Les aliments déjà connus viennent d'une mémoire d'aliments partagée entre les comptes, sans lien avec le tien (par exemple « 100 g de riz = 130 kcal ») : une recherche n'y est pas enregistrée, mais le nom d'un aliment noté par Claude via le connecteur peut y être ajouté. N'y mets pas d'information personnelle."
    ],
    [
      "Où, et avec qui",
      "Les données de ton compte sont hébergées chez Supabase, dans la région Europe (Francfort, Allemagne), avec une copie sur ton appareil pour fonctionner hors connexion. Vercel héberge le site et relaie les échanges du connecteur Claude vers Supabase : des données transitent donc aussi par Vercel. Vercel traite des données techniques, dont l'adresse IP, pour la fourniture et la sécurité du service. Les services facultatifs Groq, Open Food Facts, Claude et Spotify sont décrits séparément ci-dessous."
    ],
    [
      "Ce qui est chiffré",
      "Mots de passe, notes secrètes et documents sont chiffrés sur ton appareil avec une clé protégée par le mot de passe de ton compte (ou ta phrase secrète pour les coffres créés avant) avant d'être envoyés : personne d'autre ne peut les lire, pas même SidCorp. Le reste est protégé par ton compte ; l'administrateur pourrait techniquement y accéder pour l'entretien, mais ne le fait pas."
    ],
    [
      "Combien de temps",
      "Tant que ton compte existe. Les éléments supprimés quittent la synchronisation après 90 jours ; les sauvegardes automatiques sont gardées 14 jours ; les rapports d'erreur 90 jours. « Supprimer mon compte » efface tout de suite ton compte et tes données (les sauvegardes disparaissent dans les 14 jours)."
    ],
    [
      "Sid'Bot et Groq",
      "Sid'Bot et les analyses nutritionnelles qui demandent une IA utilisent Groq, fournisseur américain, via les serveurs Sid'Compagnon. Selon Groq, le contenu des requêtes d'inférence n'est pas conservé par défaut, mais des entrées et sorties peuvent être journalisées pour la fiabilité ou la lutte contre les abus jusqu'à 30 jours, ou davantage si la loi l'impose. Groq conserve aussi des métadonnées d'usage distinctes du contenu. Les données conservées par Groq se trouvent aux États-Unis. Aucune activation de l'option Zero Data Retention n'est confirmée ici."
    ],
    [
      "Recherche d'aliments",
      "La recherche d'un produit par nom ou code-barres transmet la requête à Open Food Facts par le relais Sid'Compagnon. Ce relais vérifie ta connexion, mais n'envoie ni ton e-mail ni ton identifiant de compte à Open Food Facts. La requête et ses résultats peuvent être mis en cache par le relais jusqu'à 24 heures. Les recherches dans l'index Ciqual se font sur ton appareil, sans envoi de la recherche à l'Anses. Cette recherche de catalogue n'utilise pas Groq."
    ],
    [
      "Claude et le connecteur",
      "Le branchement à Claude est facultatif et utilise ton propre compte Claude (Anthropic). À ta demande et selon les autorisations que tu donnes dans Claude, les outils du connecteur peuvent lire ou modifier les rubriques accessibles de ton compte, notamment notes non secrètes, PDF et photos joints, agenda, tâches, nutrition et musculation. Les notes secrètes et l'ancien coffre ne sont pas exposés. Les échanges passent par le relais Vercel et Supabase. Les données reçues par Anthropic peuvent être traitées aux États-Unis ; leur utilisation et leur conservation dépendent de ton offre et de tes réglages Claude. Retirer l'adresse du connecteur bloque ses prochains accès, sans effacer les données déjà reçues par Anthropic."
    ],
    [
      "Transferts hors de l'Union européenne",
      "Groq, Vercel et Anthropic peuvent traiter des données aux États-Unis. Le DPA de Groq prévoit les clauses contractuelles types de la Commission européenne (modules 2 et 3 selon le rôle du client) pour les transferts concernés. Le DPA de Vercel prévoit aussi ces clauses pour les transferts auxquels elles s'appliquent. Pour Claude, l'encadrement et les choix disponibles dépendent du contrat et des paramètres de ton compte Anthropic. Les notifications de ton navigateur et Spotify suivent également les conditions de leurs fournisseurs. La version complète donne les liens vers ces documents."
    ],
    [
      "Services externes facultatifs",
      "Spotify n'est chargé que lorsque tu ouvres son lecteur dans Focus. Les échanges que tu déclenches avec Claude ou Spotify relèvent aussi de leurs propres politiques de confidentialité. Les polices et bibliothèques de l'interface sont hébergées avec le site."
    ],
    [
      "Tes droits",
      "Tu peux voir, télécharger, corriger et supprimer tes données à tout moment (Réglages, « Tes données et ta vie privée »), retirer ton accord pour les données de santé, t'opposer à un traitement et supprimer ton compte. Tu peux aussi porter plainte auprès de l'Autorité de protection des données (Belgique, www.autoriteprotectiondonnees.be)."
    ]
  ],
  "terms": [
    [
      "Le service",
      "Sid'Compagnon est gratuit, sans achat ni abonnement, et fourni tel quel. Il peut évoluer, être interrompu ou s'arrêter ; tu seras prévenu à l'avance si possible."
    ],
    [
      "Ton compte",
      "Ton compte est personnel. Garde ton mot de passe pour toi : il protège aussi tes coffres. Si tu le remets à zéro par e-mail, ouvre d'abord tes coffres sur un appareil où ils sont déjà ouverts pour garder l'accès ; sinon, ils ne peuvent pas être rouverts, même par SidCorp."
    ],
    [
      "Ce que tu y mets",
      "Tu restes propriétaire de ton contenu. N'y mets rien d'illégal. Fais de temps en temps une sauvegarde (Réglages, « Sauvegarde »)."
    ],
    [
      "Santé : nutrition et musculation",
      "Les calculs, menus et programmes sont donnés à titre indicatif, parfois par une IA qui peut se tromper. Ce n'est pas un avis médical : demande conseil à un médecin, un diététicien ou un coach, surtout en cas de douleur, de grossesse, de maladie ou de troubles alimentaires."
    ],
    [
      "Sid'Bot (facultatif)",
      "Sid'Bot utilise Groq pour ses réponses et ses analyses IA. Il est facultatif et peut se tromper : vérifie ce qui compte avant de valider ses propositions. Il est gratuit dans la limite d'un quota quotidien, sans facturation quand le quota est atteint. Dans Sid'Note, le parcours Claude utilise ton propre compte Anthropic, selon les conditions et l'offre de ce fournisseur. Les outils du connecteur peuvent agir sur tes données selon les autorisations que tu donnes dans Claude. Les destinataires et les transferts sont détaillés dans la politique de confidentialité."
    ],
    [
      "Fin et droit applicable",
      "Tu peux supprimer ton compte à tout moment. SidCorp peut fermer un compte utilisé de façon abusive. Ces conditions relèvent du droit belge ; elles ne retirent aucun droit que la loi te donne comme consommateur."
    ]
  ],
  "cookies": [
    [
      "Pas de cookie",
      "Sid'Compagnon ne dépose aucun cookie : ni publicité, ni mesure d'audience, ni pisteur."
    ],
    [
      "Ce qui est gardé sur ton appareil",
      "Seulement ce qui est nécessaire pour faire marcher l'app que tu as demandée : ta session (rester connecté), une copie de tes données pour marcher sans connexion, tes fichiers, tes préférences d'affichage (langue, thème, barre latérale), un compteur anti-essais pour la connexion, et le cache de l'app. Ces éléments sont dispensés de consentement (loi belge du 13 juin 2005, art. 129) car strictement nécessaires."
    ],
    [
      "Contenu tiers : Spotify",
      "Le lecteur Spotify (Focus) n'est chargé que si tu touches « Charger le lecteur Spotify ». Spotify reçoit alors ton adresse IP et peut déposer ses propres cookies, selon sa politique. Tu peux retirer ce choix à tout moment sous le lecteur."
    ],
    [
      "Pas de bandeau",
      "Comme rien de non nécessaire n'est chargé sans ton action, Sid'Compagnon n'affiche pas de bandeau de cookies."
    ]
  ]
};
const LEGAL_PAGE={privacy:"confidentialite.html",terms:"conditions.html",cookies:"cookies.html"};
function openLegal(k){k=LEGAL[k]?k:"privacy";
  document.querySelectorAll("#legalSeg [data-legal]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.legal===k)));
  if(shIsl("legalBody")){try{window.SCIslands.legalBody($("legalBody"),{parts:LEGAL[k],page:LEGAL_PAGE[k],i18n:agI18n()})}catch(e){reportErr("island legalBody: "+(e&&e.message))}}
  else $("legalBody").innerHTML=LEGAL[k].map(([h,t])=>`<h3>${esc(L(h))}</h3><p>${esc(L(t))}</p>`).join("")+`<p><a href="${LEGAL_PAGE[k]}" target="_blank" rel="noopener">${L("Lire la version complète")} ↗</a></p><p class="small muted">${esc(L("Mis à jour le 11 novembre 2026."))}</p>`;
  $("legalBody").scrollTop=0;$("legalSheet").hidden=false}
document.addEventListener("click",e=>{const b=e.target.closest("[data-openlegal]");if(b){e.preventDefault();openLegal(b.dataset.openlegal)}});
$("legalSeg").addEventListener("click",e=>{const b=e.target.closest("[data-legal]");if(b)openLegal(b.dataset.legal)});
$("legalClose").addEventListener("click",()=>$("legalSheet").hidden=true);
$("legalSheet").addEventListener("click",e=>{if(e.target.id==="legalSheet")$("legalSheet").hidden=true});
// accord explicite avant le premier envoi de données de santé à l'IA (data.nutri.consent = date) ; retirable dans Réglages
// v74.5 (relecture de Codex) : une seule demande à la fois ; un deuxième appel reçoit la même réponse (avant : la première restait sans réponse)
let consentRes=null,consentP=null;
function nuConsent(){if(NU().consent)return Promise.resolve(true);if(consentP)return consentP;
  consentP=new Promise(res=>{consentRes=res;$("consentSheet").hidden=false});return consentP}
const consentEnd=v=>{$("consentSheet").hidden=true;const r=consentRes;consentRes=null;consentP=null;if(r)r(v)};
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
    endSession(L("Ton compte a été supprimé. Merci d'avoir utilisé Sid'Compagnon."),true);
  }catch(ex){b.disabled=false;b.textContent=L("Supprimer mon compte");toast(ex instanceof TypeError?L("Pas de connexion internet"):(ex.message||L("Suppression impossible")))}});

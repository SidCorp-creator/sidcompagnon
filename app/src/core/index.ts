// « Coquille » (ticket #3) : fonctions de fond de l'app (fusion des données, puis chiffrement…) en TypeScript testé.
// Construit en script classique site/react/core.js (window.SCCore), chargé AVANT app.js : disponible dès le démarrage,
// contrairement aux écrans React (module chargé après coup). app.js garde son ancien code en secours si ce fichier manque.
import { merge3, mergeData } from "./merge";
import * as crypto from "./crypto";

declare global { interface Window { SCCore?: { version: number; merge3: typeof merge3; mergeData: typeof mergeData; crypto: typeof crypto } } }
window.SCCore = { version: 2, merge3, mergeData, crypto };

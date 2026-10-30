// Types pour la vérification par TypeScript des sources de app/src/shell/ (v72, ticket #3).
// Ces sources sont des scripts classiques (portée globale partagée, comme l'ancien app.js) : ce fichier n'est pas assemblé dans site/app.js.
// Le DOM est volontairement permissif ici (l'ancien code lit e.target.closest, el.dataset, el.value… sans conversion) ;
// les vérifications utiles restent actives : noms inconnus, fautes de frappe dans les fonctions, nombre d'arguments, variables non déclarées.
declare const DICT: Record<string, string>, PATS: any[], DICT_NL: Record<string, string>, PATS_NL: any[];
interface Window { [k: string]: any }
interface EventTarget { closest(sel: string): any; matches(sel: string): boolean; classList: DOMTokenList; dataset: DOMStringMap; [k: string]: any }
interface Node { closest(sel: string): any; [k: string]: any }
interface Element { [k: string]: any }
interface Event { touches: TouchList; [k: string]: any }
interface Navigator { standalone?: boolean }
interface Error { [k: string]: any }
interface Credential { [k: string]: any }
interface AuthenticationExtensionsClientInputs { prf?: any }
interface Element { setAttribute(name: string, value: any): void }
interface Storage { setItem(key: string, value: any): void }

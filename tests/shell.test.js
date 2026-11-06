// v71 (ticket #3) : site/app.js est généré à partir de app/src/shell/. Ce test échoue si on l'a modifié à la main
// (ou si on a oublié « npm run build » dans app/ après avoir changé une source).
// Lance : node tests/shell.test.js
require("child_process").execFileSync(process.execPath, [require("path").join(__dirname, "..", "app", "scripts", "build-shell.mjs"), "--check"], { stdio: "inherit" });
// T16 E : la version vue par l'app (BUILD) doit être celle du cache de sw.js, sinon l'app se recharge seule au démarrage.
{const fs=require("fs"),p=require("path"),site=p.join(__dirname,"..","site");
 const sw=/CACHE = "([^"]+)"/.exec(fs.readFileSync(p.join(site,"sw.js"),"utf8"))[1],app=/const BUILD="([^"]+)"/.exec(fs.readFileSync(p.join(site,"app.js"),"utf8"))[1];
 if(sw!==app){console.error(`ECHEC : BUILD (${app}) différent du cache de sw.js (${sw})`);process.exit(1)}console.log("OK : version de l'app identique au cache ("+sw+")")}

// v71 (ticket #3) : site/app.js est généré à partir de app/src/shell/. Ce test échoue si on l'a modifié à la main
// (ou si on a oublié « npm run build » dans app/ après avoir changé une source).
// Lance : node tests/shell.test.js
require("child_process").execFileSync(process.execPath, [require("path").join(__dirname, "..", "app", "scripts", "build-shell.mjs"), "--check"], { stdio: "inherit" });

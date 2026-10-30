// v43 : l'app s'ouvre toujours en haut d'Aujourd'hui. Le navigateur ne doit pas restaurer l'ancien défilement,
// et tant que la personne n'a pas touché l'écran, on remet en haut après chaque étape asynchrone (animation, polices, synchro).
try{history.scrollRestoration="manual"}catch(e){}
let bootFresh=true;
["wheel","touchstart","keydown","pointerdown"].forEach(t=>addEventListener(t,()=>{bootFresh=false},{once:true,passive:true}));
function bootTop(){if(bootFresh&&typeof data!=="undefined"&&data.ui&&data.ui.view==="home")window.scrollTo(0,0)}
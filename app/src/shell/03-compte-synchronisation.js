/* ---------- compte & synchronisation ---------- */
const SUPABASE_URL="https://eloeoaidgbkygazwjwiu.supabase.co";
const SUPABASE_KEY="sb_publishable_IpzPmZmRdVxkOjSBOLNtGw_40TsVfSg";
const CONFIGURED=!SUPABASE_URL.startsWith("__");
const SESSION_KEY="sidnote-session",LAST_KEY="sidnote-last-user",EMAIL_DOMAIN="sidnote.netlify.app";
const cacheKey=uid=>"sidnote-u-"+uid;
const ls={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
          set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}},
          del(k){try{localStorage.removeItem(k)}catch(e){}}};
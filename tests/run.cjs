const {spawn,spawnSync}=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'..'),env={...process.env,NODE_PATH:path.join(root,'app/node_modules')};
for(const d of [path.join(require('node:os').homedir(),'.local/share/refonte-libs/usr/lib/x86_64-linux-gnu'),'/tmp/refonte-libs/usr/lib/x86_64-linux-gnu'])if(!env.LD_LIBRARY_PATH&&require('node:fs').existsSync(d))env.LD_LIBRARY_PATH=d;
(async()=>{let server;try{for(const name of ['crypto','memory','merge','rappels','shell']){const r=spawnSync(process.execPath,[`tests/${name}.test.js`],{cwd:root,env,stdio:'inherit'});if(r.status)throw Error(name+' a échoué')}
try{await fetch('http://localhost:8766')}catch{server=spawn(process.execPath,['tests/serve.js'],{cwd:root,env,stdio:'inherit'});await new Promise((resolve,reject)=>{const timer=setTimeout(resolve,500);server.once('error',reject);server.once('exit',()=>{clearTimeout(timer);reject(Error('serveur arrêté'))})})}
const status=await new Promise(resolve=>{const p=spawn(process.execPath,['tests/elan.js'],{cwd:root,env,stdio:'inherit'});p.on('exit',resolve)});if(status)throw Error('Parcours Élan en échec');
for(const name of ['sidbot','accueil','agenda-minuit','chrono-persistant','muscu-chrono','nutrition-catalog','notes-v81','sidnote-claude','notif-planning']){const st=await new Promise(resolve=>{const p=spawn(process.execPath,[`tests/${name}.test.cjs`],{cwd:root,env,stdio:'inherit'});p.on('exit',resolve)});if(st)throw Error(name+' en échec')}
}finally{if(server)server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});

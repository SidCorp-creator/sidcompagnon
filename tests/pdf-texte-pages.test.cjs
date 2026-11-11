// Regression: four image-only cover pages do not imply that the rest of a PDF lacks text.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('../app/node_modules/typescript');
const source=fs.readFileSync('app/src/shell/29-notes-libres.js','utf8'),ast=ts.createSourceFile('pdf.js',source,ts.ScriptTarget.Latest,true);
const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name.text==='pvScanCheck');assert.ok(fn);
(async()=>{for(const textPage of [5,null]){let pages=[],hints=0;const ctx={pv:{tok:1,scan:false,tool:'read'},pvTool:()=>hints++};vm.createContext(ctx);vm.runInContext(fn.getText(ast),ctx);
 await ctx.pvScanCheck({numPages:6,getPage:async i=>{pages.push(i);return {getTextContent:async()=>({items:i===textPage?[{str:'Text begins on page five'}]:[]})}}},1);
 assert.deepEqual(pages,textPage?[1,2,3,4,5]:[1,2,3,4,5,6]);assert.equal(ctx.pv.scan,textPage===null);assert.equal(hints,textPage===null?1:0);
}console.log('PDF: cover pages 1–4 without text, text on page 5, and fully textless PDF checked OK')})().catch(e=>{console.error(e);process.exitCode=1});

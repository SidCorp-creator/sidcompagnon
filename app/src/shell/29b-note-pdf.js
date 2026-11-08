/* v78 — Pure note PDF writer. No DOM, network, external dependency or data write.
 * Helvetica advances (1/1000 em) from Adobe AFM distributed in foliojs/pdfkit/lib/font/data/.
 * AFM notice: Copyright (c) 1985, 1987, 1989, 1990, 1997 Adobe Systems Incorporated. All Rights Reserved.
 * Glyph names mapped via the Adobe Glyph List. Only numeric metric facts are included, not font programs.
 * Sources and limits: docs/refonte/relais-codex-13.md.
 */
const NOTE_PDF_WIDTHS=[[556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,556,556,556,222,556,333,1000,556,556,333,1000,667,333,1000,556,611,556,556,222,222,333,333,350,556,1000,556,1000,500,333,944,556,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,556,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500],[611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,611,556,611,278,556,500,1000,556,556,333,1000,667,333,1000,611,611,611,611,278,278,500,500,350,556,1000,611,1000,556,333,944,611,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,611,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556],[556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,556,278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,556,556,556,222,556,333,1000,556,556,333,1000,667,333,1000,556,611,556,556,222,222,333,333,350,556,1000,556,1000,500,333,944,556,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,556,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500],[611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,611,278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,611,556,611,278,556,500,1000,556,556,333,1000,667,333,1000,611,611,611,611,278,278,500,500,350,556,1000,611,1000,556,333,944,611,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,611,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556]];
/** @param {any} input @returns {Uint8Array} */
function notePdf(input){
  const locale=input&&input.locale==='en'?'en':'fr',en=locale==='en';
  const error=(large=false)=>{throw Object.assign(new Error(large?(en?'This note is too large to export as a PDF.':"Cette note est trop volumineuse pour l'export PDF."):(en?'The note content cannot be exported.':"Le contenu de la note ne peut pas être exporté.")),{code:large?'note_pdf_too_large':'note_pdf_invalid'})};
  if(!input||!Array.isArray(input.blocks)||input.blocks.length>5000)return error(!!input&&Array.isArray(input.blocks));
  if(input.photosOmitted!==undefined&&typeof input.photosOmitted!=='boolean'||input.locale!==undefined&&!['fr','en'].includes(input.locale))return error();
  const extras=[0x20ac,0,0x201a,0x192,0x201e,0x2026,0x2020,0x2021,0x2c6,0x2030,0x160,0x2039,0x152,0,0x17d,0,0,0x2018,0x2019,0x201c,0x201d,0x2022,0x2013,0x2014,0x2dc,0x2122,0x161,0x203a,0x153,0,0x17e,0x178];
  const enc=new Map(extras.flatMap((v,i)=>v?[[v,128+i]]:[]));
  const byte=ch=>{const c=ch.codePointAt(0);return c>=32&&c<=126||c>=160&&c<=255?c:enc.get(c)};
  let total=0;
  const clean=value=>{if(typeof value!=='string')return error();total+=value.length;if(total>250000)return error(true);
    let out='';for(const ch of value.normalize('NFC').replace(/\r\n?/g,'\n').replace(/\t/g,'    ').replace(/\u202f/g,'\u00a0')){
      if(ch==='\n')out+=ch;else if(ch==='\u200d'||ch==='\ufe0f')continue;else out+=byte(ch)!==undefined?ch:'?'}return out};
  const title=clean(input.title==null?'':input.title);if(title.length>2000)return error(true);
  const date=clean(input.date==null?'':input.date);if(date.length>200)return error(true);
  const W=595.2756,H=841.8898,M=56.6929,contentWidth=W-2*M;
  const width=(s,f,size)=>Array.from(s).reduce((sum,ch)=>sum+(NOTE_PDF_WIDTHS[f][byte(ch)]||0)*size/1000,0);
  const hex=s=>Array.from(s,ch=>byte(ch).toString(16).padStart(2,'0')).join('');
  const utf16=s=>{let h='feff';for(let i=0;i<s.length;i++)h+=s.charCodeAt(i).toString(16).padStart(4,'0');return '<'+h+'>'};
  const num=n=>Number(n.toFixed(3)).toString();
  const streams=[''];let page=0,y=H-M;
  const put=s=>{streams[page]+=s+'\n'};
  const space=h=>{if(y-h<M){if(streams.length>=500)return error(true);streams.push('');page++;y=H-M}};
  const text=(s,x,baseline,font,size)=>{if(s)put(`BT /F${font+1} ${num(size)} Tf 1 0 0 1 ${num(x)} ${num(baseline)} Tm <${hex(s)}> Tj ET`)};
  function wrap(runs,limit,size){const chars=[];for(const r of runs)for(const ch of r.text)chars.push({ch,font:(r.b?1:0)+(r.i?2:0)});
    const tokens=[];for(const c of chars){const type=c.ch==='\n'?'nl':c.ch===' '?'space':'word',last=tokens[tokens.length-1];if(type!=='nl'&&last&&last.type===type)last.chars.push(c);else tokens.push({type,chars:[c]})}
    const result=[];let line=[],used=0,pending=[];
    const measure=a=>a.reduce((s,c)=>s+width(c.ch,c.font,size),0);
    const emit=()=>{result.push(line);line=[];used=0;pending=[]};
    for(const t of tokens){if(t.type==='nl'){emit();continue}if(t.type==='space'){pending=t.chars;continue}
      const w=measure(t.chars),p=line.length?measure(pending):0;
      if(line.length&&used+p+w>limit)emit();
      if(line.length&&pending.length){line.push(...pending);used+=p}pending=[];
      // Long URLs/words wrap by glyph, never overflow the margin.
      for(const c of t.chars){const cw=width(c.ch,c.font,size);if(line.length&&used+cw>limit)emit();line.push(c);used+=cw}
    }
    if(line.length||!result.length)result.push(line);return result
  }
  function draw(runs,size,lineHeight,indent=0,prefix=''){
    const lines=wrap(runs,contentWidth-indent,size);
    lines.forEach((line,i)=>{space(lineHeight);const base=y-size;let x=M+indent;
      if(i===0&&prefix)text(prefix,M,base,0,size);
      let segment='',font=-1;
      const flush=()=>{if(segment){text(segment,x,base,font,size);x+=width(segment,font,size);segment=''}};
      for(const c of line){if(font!==c.font){flush();font=c.font}segment+=c.ch}flush();y-=lineHeight})
  }
  if(title){draw([{text:title,b:true}],20,26);y-=7}
  if(date){draw([{text:date}],10,14);y-=10}
  let ordinal=0;
  for(const block of input.blocks){
    if(!block||!['h','p','li','oli','hr'].includes(block.t)||block.runs!==undefined&&!Array.isArray(block.runs))return error();
    if(block.t==='hr'){space(14);put(`0.65 G 0.5 w ${num(M)} ${num(y-6)} m ${num(W-M)} ${num(y-6)} l S 0 G`);y-=14;ordinal=0;continue}
    if((block.runs||[]).length>5000)return error(true);
    const runs=(block.runs||[]).map(r=>{if(!r||typeof r.text!=='string'||r.b!==undefined&&typeof r.b!=='boolean'||r.i!==undefined&&typeof r.i!=='boolean')return error();return {text:clean(r.text),b:block.t==='h'||!!r.b,i:!!r.i}});
    const size=block.t==='h'?15:11,lineHeight=block.t==='h'?21:16;let prefix='',indent=0;
    if(block.t==='li')prefix='• ';
    if(block.t==='oli'){if(block.n!==undefined&&(!Number.isInteger(block.n)||Math.abs(block.n)>999999))return error();ordinal=block.n===undefined?ordinal+1:block.n;prefix=ordinal+'. '}
    else ordinal=0;
    if(prefix)indent=Math.max(18,width(prefix,0,size)+5);
    if(block.t==='h'){space(lineHeight+6);y-=4}
    draw(runs,size,lineHeight,indent,prefix);y+=block.t==='li'||block.t==='oli'?-3:-7;
  }
  streams.forEach((s,i)=>{const footer="Sid'Compagnon · page "+(i+1)+' / '+streams.length+(input.photosOmitted?(en?' · Photos not included':' · Photos non incluses'):'');
    page=i;text(footer,(W-width(footer,0,8.5))/2,28.346,0,8.5)});
  // One explicit ToUnicode map shared by all four WinAnsi base fonts.
  const mappings=[];for(let b=32;b<256;b++){const u=b<127||b>=160?b:extras[b-128];if(u)mappings.push('<'+b.toString(16).padStart(2,'0')+'> <'+u.toString(16).padStart(4,'0')+'>')}
  let cmap='/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /SidNoteWinAnsi def\n/CMapType 2 def\n1 begincodespacerange\n<00> <FF>\nendcodespacerange\n';
  for(let i=0;i<mappings.length;i+=100){const group=mappings.slice(i,i+100);cmap+=group.length+' beginbfchar\n'+group.join('\n')+'\nendbfchar\n'}cmap+='endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend';
  const objects=[''],add=s=>{objects.push(s);return objects.length-1},catalog=add(''),pages=add('');
  const unicode=add(`<< /Length ${cmap.length} >>\nstream\n${cmap}\nendstream`);
  const fonts=['Helvetica','Helvetica-Bold','Helvetica-Oblique','Helvetica-BoldOblique'].map(name=>add(`<< /Type /Font /Subtype /Type1 /BaseFont /${name} /Encoding /WinAnsiEncoding /ToUnicode ${unicode} 0 R >>`));
  const info=add(`<< /Title ${utf16(title)} /Producer ${utf16("Sid'Compagnon")} >>`),kids=[];
  for(const s of streams){const content=add(`<< /Length ${s.length} >>\nstream\n${s}endstream`);kids.push(add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << ${fonts.map((f,i)=>'/F'+(i+1)+' '+f+' 0 R').join(' ')} >> >> /Contents ${content} 0 R >>`))}
  objects[catalog]=`<< /Type /Catalog /Pages ${pages} 0 R /Lang (${en?'en':'fr'}) >>`;objects[pages]=`<< /Type /Pages /Count ${kids.length} /Kids [${kids.map(n=>n+' 0 R').join(' ')}] >>`;
  let pdf='%PDF-1.4\n% Sid\'Note text export\n';const offsets=[0];
  for(let i=1;i<objects.length;i++){offsets.push(pdf.length);pdf+=i+' 0 obj\n'+objects[i]+'\nendobj\n'}const xref=pdf.length;
  pdf+='xref\n0 '+objects.length+'\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Uint8Array.from(pdf,c=>c.charCodeAt(0));
}

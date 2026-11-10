/* ---------- recherche d’aliments Sid’Nutrition ---------- */
const CIQUAL_SOURCE="Anses. 2025. Table de composition nutritionnelle des aliments Ciqual";
let ciqualRequest=null,catalogSearch=0,catalogItems=[],catalogFood=null;

function ciqualFoods(){
  return ciqualRequest||(ciqualRequest=fetch("./ciqual-2025.json").then(response=>{
    if(!response.ok)throw new Error("Ciqual");
    return response.json();
  }).then(data=>data.foods.map(([code,name,kcal,p,c,f])=>({
    code,name,kcal,p,c,f,basis:"100g",source:CIQUAL_SOURCE,key:nz(name).replace(/œ/g,"oe")
  }))).catch(error=>{ciqualRequest=null;throw error}));
}

async function ciqualSearch(query){
  const key=nz(query).replace(/œ/g,"oe"),terms=key.match(/[a-z0-9]+/g)||[];
  if(!terms.length)return [];
  const foods=await ciqualFoods();
  return foods.filter(food=>terms.every(term=>food.key.includes(term)))
    .sort((a,b)=>Number(b.key.startsWith(key))-Number(a.key.startsWith(key))||a.name.length-b.name.length)
    .slice(0,6);
}

async function offCatalog(body){
  if(isTrial())return {};
  const result=await api("/functions/v1/aliments",{method:"POST",token:await token(),body:{...body,lang:LANG}});
  if(result?.error&&!["introuvable","incomplet"].includes(result.error))throw new Error(result.error);
  return result||{};
}

function catalogStatus(text){$("foodCatalogStatus").textContent=L(text)}
function catalogShowOff(result){
  if(result.product){catalogShowPortion({...result.product,source:"Open Food Facts"});return}
  catalogStatus(result.error==="incomplet"?"Les valeurs nutritionnelles de cet aliment sont incomplètes.":"Aucun aliment trouvé.");
}
function catalogReset(){
  ++catalogSearch;catalogItems=[];catalogFood=null;
  $("foodCatalogList").replaceChildren();$("foodCatalogPortion").hidden=true;
  catalogStatus("");
}
function catalogUnit(food){return food.basis==="100ml"?"ml":"g"}
function catalogShowPortion(food){
  if(!food||!["100g","100ml"].includes(food.basis)||!["kcal","p","c","f"].every(k=>Number.isFinite(food[k])&&food[k]>=0)){
    catalogStatus("Les valeurs nutritionnelles de cet aliment sont incomplètes.");return
  }
  catalogFood=food;
  const unit=catalogUnit(food),serving=unit==="ml"?food.servingMl:food.servingGrams;
  $("foodCatalogName").textContent=food.name;
  $("foodCatalogSource").textContent=food.source;
  $("foodCatalogSource").href=food.source===CIQUAL_SOURCE?"https://doi.org/10.57745/RDMHWY":
    "https://world.openfoodfacts.org/product/"+encodeURIComponent(food.code);
  $("foodCatalogUnit").textContent=unit;
  $("foodCatalogAmount").value="100";
  $("foodCatalogServing").hidden=!(Number.isFinite(serving)&&serving>0);
  $("foodCatalogServing").textContent=`${L("Portion indiquée")} · ${fmtN(serving||0)} ${unit}`;
  $("foodCatalogServing").dataset.amount=String(serving||0);
  $("foodCatalogPortion").hidden=false;catalogStatus("");
}

$("foodCatalogSearch").addEventListener("submit",async e=>{
  e.preventDefault();
  const query=$("foodCatalogQuery").value.trim();
  if(!query||!nutriAllowed())return;
  catalogReset();
  const seq=catalogSearch,barcode=/^\d{8,14}$/.test(query);
  catalogStatus("Recherche en cours…");
  try{
    if(barcode){
      const result=await offCatalog({code:query});
      if(seq!==catalogSearch)return;
      catalogShowOff(result);return;
    }
    const [local,online]=await Promise.allSettled([ciqualSearch(query),offCatalog({query})]);
    if(seq!==catalogSearch)return;
    const brands=online.status==="fulfilled"&&Array.isArray(online.value.items)?online.value.items:[];
    catalogItems=[...(local.status==="fulfilled"?local.value:[]),
      ...brands.filter(item=>typeof item.name==="string"&&/^\d{8,14}$/.test(item.code)).slice(0,6).map(item=>({...item,source:"Open Food Facts"}))];
    const list=$("foodCatalogList");
    catalogItems.forEach((item,i)=>{
      const button=document.createElement("button");
      button.type="button";button.className="btn ghost notr";button.dataset.foodCatalog=String(i);
      button.textContent=[item.name,item.brand,item.source===CIQUAL_SOURCE?"Ciqual":"Open Food Facts"].filter(Boolean).join(" · ");
      list.appendChild(button);
    });
    catalogStatus(local.status==="rejected"||online.status==="rejected"?"Une source est momentanément indisponible.":
      catalogItems.length?"":"Aucun aliment trouvé.");
  }catch(e){if(seq===catalogSearch)catalogStatus("La recherche est momentanément indisponible.")}
});

$("foodCatalogList").addEventListener("click",async e=>{
  const button=e.target.closest("[data-food-catalog]");
  if(!button)return;
  const item=catalogItems[Number(button.dataset.foodCatalog)];
  if(!item)return;
  const seq=++catalogSearch;
  catalogFood=null;$("foodCatalogPortion").hidden=true;
  if(item.source===CIQUAL_SOURCE){catalogShowPortion(item);return}
  catalogStatus("Recherche en cours…");
  try{
    const result=await offCatalog({code:item.code});
    if(seq!==catalogSearch)return;
    catalogShowOff(result);
  }catch(e){if(seq===catalogSearch)catalogStatus("La recherche est momentanément indisponible.")}
});
$("foodCatalogServing").addEventListener("click",()=>$("foodCatalogAmount").value=$("foodCatalogServing").dataset.amount);
$("foodCatalogPortion").addEventListener("submit",e=>{
  e.preventDefault();
  const food=catalogFood,amount=$("foodCatalogAmount").valueAsNumber;
  if(!food||!Number.isFinite(amount)||amount<=0||nuBusy)return;
  const ratio=amount/100,unit=catalogUnit(food);
  const item={name:food.name,qty:`${amount} ${unit}`,kcal:r0(food.kcal*ratio),p:r1(food.p*ratio),
    c:r1(food.c*ratio),f:r1(food.f*ratio),source:food.source,basis:food.basis,
    per100:{kcal:food.kcal,p:food.p,c:food.c,f:food.f}};
  nuPending={title:food.name,items:[item],note:food.source};
  $("foodCatalog").open=false;
  renderNuResult();
  $("nuResult").scrollIntoView({block:"nearest"});
});

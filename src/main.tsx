import React,{useEffect,useState}from'react';import{createRoot}from'react-dom/client';import{createClient}from'@supabase/supabase-js';import{Home,BookOpen,Heart,ShoppingCart,ChefHat,Scale,Wrench,Settings,Clock,Users,Search,ChevronLeft,ChevronRight,Play,Pause,Square}from'lucide-react';import'./style.css';

const fallbackRecipe={title:'Velouté de butternut',category:'Entrée',yield:'2,3 kg',prep:'15 min',cook:'≈ 30 min',ingredients:['200 g d’oignons','1 kg de butternut','200 g de blancs de poireaux','Curcuma','Eau','Sel','Poivre','Beurre'],utensils:['Couteau','Économe','Planche','Casserole','Louche','Mixeur'],steps:[
{title:'Préparer les légumes',text:'Laver tous les légumes, puis les éplucher.',help:'Éplucher consiste à retirer la peau extérieure avec un économe ou un couteau adapté.'},
{title:'Découper les légumes',text:'Couper le butternut en gros morceaux et émincer les oignons puis les poireaux.',help:'Émincer signifie couper finement et régulièrement.'},
{title:'Faire fondre le beurre',text:'Faire fondre une noix de beurre dans une casserole.'},
{title:'Faire revenir oignons et poireaux',text:'Ajouter les oignons et les faire revenir doucement, sans coloration, puis ajouter les poireaux.',help:'Faire revenir doucement : cuire à feu modéré sans brunir.'},
{title:'Ajouter le butternut',text:'Ajouter les morceaux de butternut dans la casserole.'},
{title:'Assaisonner',text:'Ajouter le sel, le poivre et le curcuma.'},
{title:'Ajouter l’eau',text:'Recouvrir d’eau à hauteur.',help:'À hauteur : le liquide arrive au niveau des aliments.'},
{title:'Cuire les légumes',text:'Laisser cuire environ 30 minutes, jusqu’à ce que les légumes soient bien tendres.',timer:30},
{title:'Mixer le velouté',text:'Mixer pour obtenir une texture lisse et ajuster l’eau selon la consistance souhaitée.',help:'Mixer jusqu’à obtenir une texture homogène puis ajuster progressivement.'}
]};

const supabaseUrl=import.meta.env.VITE_SUPABASE_URL;
const supabaseKey=import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase=(supabaseUrl&&supabaseKey)?createClient(supabaseUrl,supabaseKey):null;

function normalizeRecipe(row:any,ings:any[],steps:any[]){
 return {
  ...fallbackRecipe,
  title:row?.title||fallbackRecipe.title,
  category:row?.category?.name||fallbackRecipe.category,
  yield:[row?.final_quantity,row?.final_quantity_unit].filter(Boolean).join(' ')||fallbackRecipe.yield,
  prep:row?.preparation_minutes?`${row.preparation_minutes} min`:fallbackRecipe.prep,
  cook:row?.cooking_minutes?`≈ ${row.cooking_minutes} min`:fallbackRecipe.cook,
  ingredients:(ings||[]).map((x:any)=>{
    const q=x.quantity===null||x.quantity===undefined?'':`${Number(x.quantity).toLocaleString('fr-FR')} `;
    const u=x.unit?`${x.unit} `:'';
    return `${q}${u}${x.ingredients?.name||''}`.trim();
  }).filter(Boolean).length?(ings||[]).map((x:any)=>{
    const q=x.quantity===null||x.quantity===undefined?'':`${Number(x.quantity).toLocaleString('fr-FR')} `;
    const u=x.unit?`${x.unit} `:'';
    return `${q}${u}${x.ingredients?.name||''}`.trim();
  }):fallbackRecipe.ingredients,
  steps:(steps||[]).length?(steps||[]).map((s:any)=>({
    title:s.title,text:s.instruction,help:s.technical_help||undefined,timer:s.timer_minutes||undefined
  })):fallbackRecipe.steps
 };
}

function App(){const[page,setPage]=useState('home'),[step,setStep]=useState(0),[help,setHelp]=useState(false),[sec,setSec]=useState(1800),[run,setRun]=useState(false),[search,setSearch]=useState(''),[amount,setAmount]=useState('1'),[from,setFrom]=useState('L'),[to,setTo]=useState('mL'),[recipe,setRecipe]=useState(fallbackRecipe),[dbState,setDbState]=useState('connexion…'),[adminUser,setAdminUser]=useState<any>(null),[adminRole,setAdminRole]=useState(false),[adminLoading,setAdminLoading]=useState(true),[adminEmail,setAdminEmail]=useState(''),[adminPassword,setAdminPassword]=useState(''),[adminError,setAdminError]=useState(''),[adminRecipes,setAdminRecipes]=useState<any[]>([]);
useEffect(()=>{if(!run)return;const id=setInterval(()=>setSec(s=>s>0?s-1:0),1000);return()=>clearInterval(id)},[run]);useEffect(()=>{if(!supabase){setDbState('mode local');return;}let live=true;(async()=>{try{
 const {data:r,error:re}=await supabase.from('recipes').select('*,category:categories(name)').eq('slug','veloute-de-butternut').eq('status','published').single();
 if(re)throw re;
 const [{data:ings,error:ie},{data:steps,error:se}]=await Promise.all([
  supabase.from('recipe_ingredients').select('quantity,unit,sort_order,ingredients(name)').eq('recipe_id',r.id).order('sort_order'),
  supabase.from('recipe_steps').select('step_number,title,instruction,technical_help,timer_minutes').eq('recipe_id',r.id).order('step_number')
 ]);
 if(ie)throw ie;if(se)throw se;
 if(live){setRecipe(normalizeRecipe(r,ings||[],steps||[]));setDbState('Supabase connecté');}
 }catch(e){console.error(e);if(live)setDbState('mode local — vérifier Supabase');}})();return()=>{live=false}},[]);

useEffect(()=>{if(!supabase){setAdminLoading(false);return;}let mounted=true;(async()=>{
 const {data:{session}}=await supabase.auth.getSession();
 if(!mounted)return;
 if(session?.user){
   const {data:p}=await supabase.from('profiles').select('role').eq('id',session.user.id).single();
   if(p?.role==='admin'){setAdminUser(session.user);setAdminRole(true);await loadAdminRecipes();}
 }
 setAdminLoading(false);
})();const {data:sub}=supabase.auth.onAuthStateChange(async(_e,session)=>{
 if(session?.user){
   const {data:p}=await supabase.from('profiles').select('role').eq('id',session.user.id).single();
   if(p?.role==='admin'){setAdminUser(session.user);setAdminRole(true);await loadAdminRecipes();}
   else{setAdminRole(false);setAdminUser(null);}
 }else{setAdminRole(false);setAdminUser(null);}
});return()=>{mounted=false;sub.subscription.unsubscribe()}},[]);

async function loadAdminRecipes(){
 if(!supabase)return;
 const {data,error}=await supabase.from('recipes').select('id,title,slug,status,updated_at').order('updated_at',{ascending:false});
 if(!error)setAdminRecipes(data||[]);
}
async function adminLogin(e:any){
 e.preventDefault();setAdminError('');
 if(!supabase){setAdminError('Connexion Supabase indisponible.');return;}
 const {data,error}=await supabase.auth.signInWithPassword({email:adminEmail,password:adminPassword});
 if(error){setAdminError('Identifiants incorrects.');return;}
 const {data:p}=await supabase.from('profiles').select('role').eq('id',data.user.id).single();
 if(p?.role!=='admin'){await supabase.auth.signOut();setAdminError('Ce compte n’est pas administrateur.');return;}
 setAdminUser(data.user);setAdminRole(true);await loadAdminRecipes();
}
async function adminLogout(){if(supabase)await supabase.auth.signOut();setAdminUser(null);setAdminRole(false);}
const isAdminPath=window.location.pathname.startsWith('/admin');
if(isAdminPath){
 if(adminLoading)return <main className="adminGate"><div className="adminCard"><div className="adminLogo"><img src="/daq2630-logo.png"/><img src="/online-formapro-logo.png"/></div><h1>Administration</h1><p>Chargement…</p></div></main>;
 if(!adminRole)return <main className="adminGate"><form className="adminCard" onSubmit={adminLogin}><div className="adminLogo"><img src="/daq2630-logo.png"/><img src="/online-formapro-logo.png"/></div><span className="kicker">ESPACE SÉCURISÉ</span><h1>Administration</h1><p>Connectez-vous avec votre compte administrateur DAQ2630 Cuisine.</p><label>E-mail<input type="email" value={adminEmail} onChange={e=>setAdminEmail(e.target.value)} required/></label><label>Mot de passe<input type="password" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} required/></label>{adminError&&<div className="adminError">{adminError}</div>}<button className="blue big" type="submit">SE CONNECTER</button><a href="/">← Retour au site</a></form></main>;
 return <main className="adminShell"><aside className="adminSide"><div className="brand"><img src="/daq2630-logo.png"/><img src="/online-formapro-logo.png"/></div><b>Administration</b><button className="nav active"><BookOpen size={18}/><span>Recettes</span></button><button className="nav"><Wrench size={18}/><span>Ustensiles</span></button><button className="nav"><Scale size={18}/><span>Techniques</span></button><button className="nav"><Settings size={18}/><span>Réglages</span></button><button className="nav bottom" onClick={adminLogout}>Se déconnecter</button></aside><section className="adminMain"><div className="adminHeader"><div><span className="kicker">DAQ2630 CUISINE</span><h1>Tableau de bord</h1><p>Gestion des recettes et du contenu du site.</p></div><div className="adminUser">{adminUser?.email}</div></div><div className="adminStats"><div><strong>{adminRecipes.length}</strong><span>Recettes</span></div><div><strong>{adminRecipes.filter(r=>r.status==='published').length}</strong><span>Publiées</span></div><div><strong>{adminRecipes.filter(r=>r.status==='draft').length}</strong><span>Brouillons</span></div></div><div className="adminToolbar"><h2>Recettes</h2><button className="blue">+ Nouvelle recette</button></div><div className="adminTable">{adminRecipes.map(r=><div className="adminRow" key={r.id}><div><b>{r.title}</b><small>/{r.slug}</small></div><span className={'status '+r.status}>{r.status==='published'?'Publiée':'Brouillon'}</span><button className="outline">Modifier</button></div>)}</div><div className="adminNote"><b>V4 Admin</b><p>La connexion et le tableau de bord sont opérationnels. L’édition complète, les photos et Supabase Storage seront ajoutés à l’étape suivante.</p></div></section></main>;
}

const nav=(p,l,I)=><button className={'nav '+(page===p?'active':'')} onClick={()=>setPage(p)}><I size={18}/><span>{l}</span></button>;
const convert=()=>{const v=Number(amount)||0,u={L:1000,cL:10,mL:1,kg:1000,g:1,mg:.001},vol=['L','cL','mL'],mass=['kg','g','mg'];if((vol.includes(from)&&vol.includes(to))||(mass.includes(from)&&mass.includes(to)))return (v*u[from]/u[to]).toLocaleString('fr-FR')+' '+to;return '—'};
if(page==='cook'){const s=recipe.steps[step];return <main className="cook"><header><button onClick={()=>setPage('recipe')}><ChevronLeft/></button><b>Étape {step+1} / 9</b><div className="progress"><i style={{width:(step+1)/9*100+'%'}}/></div><Clock size={18}/><span>{run?Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'):'12:00'}</span></header><section><img className="cookImg" src="/butternut.png"/><div className="cookText"><span className="kicker">ÉTAPE {step+1}</span><h1>{s.title}</h1><p>{s.text}</p>{s.help&&<><button className="outline" onClick={()=>setHelp(!help)}>👩‍🍳 JE NE SAIS PAS FAIRE</button>{help&&<div className="tip"><img src="/chef-daq.png"/><div><b>Astuce de Chef DAQ</b><p>{s.help}</p></div></div>}</>}{s.timer&&<div className="timer"><Clock/><div><small>MINUTEUR</small><strong>{String(Math.floor(sec/60)).padStart(2,'0')}:{String(sec%60).padStart(2,'0')}</strong></div><button onClick={()=>setRun(!run)}>{run?<Pause/>:<Play/>}</button><button onClick={()=>{setRun(false);setSec(1800)}}><Square/></button></div>}</div></section><footer><button disabled={!step} onClick={()=>{setStep(step-1);setHelp(false)}}><ChevronLeft/> Étape précédente</button>{step<8?<button className="blue" onClick={()=>{setStep(step+1);setHelp(false)}}>Étape suivante <ChevronRight/></button>:<button className="blue" onClick={()=>setPage('home')}>Recette terminée</button>}</footer></main>}
return <div className="app"><aside><div className="brand"><img src="/daq2630-logo.png"/><img src="/online-formapro-logo.png"/></div>{nav('home','Catalogue',BookOpen)}{nav('shopping','Ma liste de courses',ShoppingCart)}<button className="nav"><Heart size={18}/><span>Mes favoris</span></button><small>JE CUISINE</small>{nav('recipe','Mode pas à pas',ChefHat)}<small>OUTILS</small>{nav('convert','Convertisseur',Scale)}{nav('utensils','Ustensiles',Wrench)}{nav('chef','Chef DAQ',ChefHat)}<button className="nav bottom"><Settings size={18}/><span>Paramètres</span></button></aside><main className="main">
{page==='home'&&<><div className="titleRow"><div><span className="dbBadge">● {dbState}</span><span className="kicker">LIVRE DE RECETTES NUMÉRIQUE PÉDAGOGIQUE</span><h1>Catalogue des recettes</h1><p>Des recettes pédagogiques, testées et expliquées pas à pas.</p></div><div className="miniChef"><img src="/chef-daq.png"/><div><b>Chef DAQ</b><small>Votre guide pédagogique</small></div></div></div><div className="search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une recette…"/></div><div className="chips"><b>Toutes les recettes</b><span>Entrées</span><span>Plats</span><span>Accompagnements</span><span>Desserts</span><span>Pâtisseries</span><span>Bases</span></div><div className="cards"><article onClick={()=>setPage('recipe')}><img src="/butternut.png"/><div><span>Entrée</span><h3>Velouté de butternut</h3><p><Users size={14}/> 4 pers. <Clock size={14}/> 45 min</p></div></article>{['Gratin dauphinois','Moelleux au chocolat','Pâte à choux'].filter(x=>x.toLowerCase().includes(search.toLowerCase())).map((x,i)=><article className="soon" key={x}><div className="placeholder">{['🥔','🍫','🥐'][i]}</div><div><span>À venir</span><h3>{x}</h3><p>Prochaine recette du catalogue</p></div></article>)}</div><section className="book" onClick={()=>setPage('book')}><div><span className="kicker">CATALOGUE STYLE LIVRE DE CHEF</span><h2>Soupes & Veloutés</h2><p>Parcourez les recettes comme dans un vrai livre de cuisine.</p><button className="blue">Ouvrir le livre</button></div><img src="/butternut.png"/></section></>}
{page==='recipe'&&<><button className="back" onClick={()=>setPage('home')}>← Catalogue</button><section className="hero"><div><span className="kicker">{recipe.category}</span><h1>{recipe.title}</h1><p>Un velouté doux et réconfortant, conçu pour apprendre les gestes de base en cuisine.</p><div className="facts"><span><Clock/>Préparation <b>{recipe.prep}</b></span><span><Clock/>Cuisson <b>{recipe.cook}</b></span><span><Users/>Quantité <b>{recipe.yield}</b></span></div></div><img src="/butternut.png"/></section><div className="cols"><section className="panel"><h2>Ingrédients</h2><ul>{recipe.ingredients.map(x=><li key={x}>{x}</li>)}</ul><button className="outline" onClick={()=>setPage('shopping')}><ShoppingCart/> Ajouter à ma liste</button></section><section className="panel"><h2>Ustensiles nécessaires</h2><div className="utensils">{recipe.utensils.map((x,i)=><span key={x}>{['🔪','🥕','🪵','🍲','🥄','⚡'][i]}<b>{x}</b></span>)}</div><div className="tip"><img src="/chef-daq.png"/><div><b>Chef DAQ vous accompagne</b><p>Utilisez « Je ne sais pas faire » lorsqu’un geste vous pose problème.</p></div></div><button className="blue big" onClick={()=>{setStep(0);setPage('cook')}}>COMMENCER LA RECETTE <ChevronRight/></button></section></div></>}
{page==='shopping'&&<><span className="kicker">OUTIL</span><h1>Ma liste de courses</h1><section className="panel shopping">{recipe.ingredients.map(x=><label key={x}><input type="checkbox"/> {x}</label>)}</section></>}
{page==='convert'&&<><span className="kicker">OUTIL</span><h1>Convertisseur</h1><section className="panel converter"><input value={amount} onChange={e=>setAmount(e.target.value)}/><select value={from} onChange={e=>setFrom(e.target.value)}>{['L','cL','mL','kg','g','mg'].map(x=><option>{x}</option>)}</select><b>→</b><select value={to} onChange={e=>setTo(e.target.value)}>{['L','cL','mL','kg','g','mg'].map(x=><option>{x}</option>)}</select><strong>{convert()}</strong><small>Les conversions volume ↔ poids seront liées à l’ingrédient plus tard.</small></section></>}
{page==='utensils'&&<><span className="kicker">OUTILS</span><h1>Ustensiles de cuisine</h1><div className="utensils large">{recipe.utensils.map((x,i)=><span key={x}>{['🔪','🥕','🪵','🍲','🥄','⚡'][i]}<b>{x}</b></span>)}</div></>}
{page==='chef'&&<section className="chefPage"><img src="/chef-daq.png"/><div><span className="kicker">VOTRE COMMIS PÉDAGOGIQUE</span><h1>Chef DAQ</h1><p>Je vous aide à comprendre les gestes, à réussir vos étapes et à prendre confiance en cuisine.</p><div className="skills"><span>✓ J’explique les gestes</span><span>✓ Je donne des astuces</span><span>✓ Je vérifie vos étapes</span><span>✓ Je vous encourage</span></div></div></section>}
{page==='book'&&<section className="openBook"><div><span className="kicker">CHAPITRE 01</span><h1>Soupes & Veloutés</h1><p>Des recettes réconfortantes pour toutes les saisons.</p><span className="decor">🎃 🥕 🌿</span></div><div><img src="/butternut.png"/><h2>Velouté de butternut</h2><button className="blue" onClick={()=>setPage('recipe')}>Voir la recette</button></div></section>}
</main></div>}
createRoot(document.getElementById('root')).render(<App/>);
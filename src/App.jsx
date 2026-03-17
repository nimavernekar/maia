import { useState, useEffect } from "react";
// v2.1 - supabase integration
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
         ReferenceLine, CartesianGrid, ComposedChart, Area } from "recharts";

// ═══════════════════════════════════════════════════════════
//  LIFE STAGES
// ═══════════════════════════════════════════════════════════
const LIFE_STAGES = [
  { id:"reproductive", icon:"🌱", label:"Reproductive Years",   sub:"Regular or irregular cycle",            color:"#c084fc" },
  { id:"pcos",         icon:"〰",  label:"PCOS",                 sub:"Polycystic ovary syndrome",             color:"#f472b6" },
  { id:"endo",         icon:"🌸", label:"Endometriosis",         sub:"Painful periods, inflammation",         color:"#fb923c" },
  { id:"peri",         icon:"🌊", label:"Perimenopause",         sub:"Cycles becoming irregular or changing", color:"#38bdf8" },
  { id:"meno",         icon:"🌙", label:"Menopause",             sub:"12+ months without a period",           color:"#a78bfa" },
];

const DIET_OPTIONS = [
  { id:"omnivore",   label:"Omnivore",    sub:"I eat everything",         icon:"🍗" },
  { id:"vegetarian", label:"Vegetarian",  sub:"No meat, dairy & eggs ok", icon:"🥚" },
  { id:"vegan",      label:"Vegan",       sub:"100% plant-based",         icon:"🌱" },
  { id:"glutenfree", label:"Gluten-free", sub:"Avoiding gluten",          icon:"🌾" },
];
const FOCUS_OPTIONS = [
  { id:"physical", label:"Physical symptoms", icon:"🌊", sub:"Pain, cramps, bloating"  },
  { id:"mood",     label:"Mood & emotions",   icon:"🌙", sub:"Anxiety, irritability"   },
  { id:"energy",   label:"Energy & fatigue",  icon:"⚡", sub:"Motivation, brain fog"   },
  { id:"food",     label:"Nutrition & food",  icon:"🍃", sub:"What to eat & when"      },
];

// Stage-specific symptom lists
const SYMPTOMS_BY_STAGE = {
  reproductive: [
    {id:"cramps",   label:"Cramps",         icon:"🌊"},{id:"mood",     label:"Mood swings",    icon:"🌙"},
    {id:"bloating", label:"Bloating",       icon:"🌿"},{id:"fatigue",  label:"Fatigue",        icon:"⚡"},
    {id:"skin",     label:"Skin breakouts", icon:"🌸"},{id:"sleep",    label:"Sleep issues",   icon:"✨"},
    {id:"anxiety",  label:"Anxiety",        icon:"🔮"},{id:"headache", label:"Headaches",      icon:"💫"},
  ],
  pcos: [
    {id:"irregular",  label:"Irregular cycles",    icon:"〰" },{id:"acne",     label:"Acne / oily skin",   icon:"🌸"},
    {id:"hair_loss",  label:"Hair thinning",        icon:"💫"},{id:"hair_face",label:"Facial hair",        icon:"✨"},
    {id:"weight",     label:"Weight gain",          icon:"🌿"},{id:"fatigue",  label:"Fatigue",            icon:"⚡"},
    {id:"mood",       label:"Mood swings",          icon:"🌙"},{id:"cravings", label:"Sugar cravings",     icon:"🔮"},
  ],
  endo: [
    {id:"pain_severe",label:"Severe period pain",   icon:"🌊"},{id:"pain_sex", label:"Pain during sex",    icon:"💫"},
    {id:"pain_bowl",  label:"Bowel pain",            icon:"🌿"},{id:"bloating", label:"Endo belly",         icon:"🌸"},
    {id:"fatigue",    label:"Chronic fatigue",       icon:"⚡"},{id:"mood",     label:"Mood swings",        icon:"🌙"},
    {id:"heavy",      label:"Heavy bleeding",        icon:"🩸"},{id:"nausea",   label:"Nausea",             icon:"🔮"},
  ],
  peri: [
    {id:"hot_flash",  label:"Hot flashes",           icon:"🔥"},{id:"night_sw", label:"Night sweats",       icon:"🌊"},
    {id:"sleep",      label:"Sleep disruption",      icon:"✨"},{id:"mood",     label:"Mood changes",       icon:"🌙"},
    {id:"brain_fog",  label:"Brain fog",             icon:"🔮"},{id:"irregular",label:"Irregular cycles",   icon:"〰" },
    {id:"joint",      label:"Joint aches",           icon:"💫"},{id:"low_libido",label:"Low libido",        icon:"🌸"},
  ],
  meno: [
    {id:"hot_flash",  label:"Hot flashes",           icon:"🔥"},{id:"night_sw", label:"Night sweats",       icon:"🌊"},
    {id:"sleep",      label:"Sleep disruption",      icon:"✨"},{id:"mood",     label:"Mood / anxiety",     icon:"🌙"},
    {id:"brain_fog",  label:"Brain fog",             icon:"🔮"},{id:"dry",      label:"Vaginal dryness",    icon:"💧"},
    {id:"joint",      label:"Joint & bone aches",    icon:"💫"},{id:"weight",   label:"Weight changes",     icon:"🌿"},
  ],
};

// ═══════════════════════════════════════════════════════════
//  GLOBALS
// ═══════════════════════════════════════════════════════════
const G = {
  bg:   "radial-gradient(ellipse at 25% 15%, #160a2e 0%, #08040f 55%, #090d1f 100%)",
  font: "'Palatino Linotype', Georgia, serif",
  body: { fontSize:14, color:"rgba(210,190,255,.75)", lineHeight:1.75 },
};
const PHASES = {
  menstrual:  {name:"Menstrual",  icon:"🩸",color:"#ff6b8a",archetype:"The Wise Woman",  season:"Winter",shortDesc:"Rest, release & deep nourishment"},
  follicular: {name:"Follicular", icon:"🌱",color:"#c084fc",archetype:"The Maiden",       season:"Spring",shortDesc:"Rising energy, fresh starts"},
  ovulation:  {name:"Ovulation",  icon:"✨",color:"#fbbf24",archetype:"The Mother",       season:"Summer",shortDesc:"Peak confidence & magnetism"},
  luteal:     {name:"Luteal",     icon:"🌙",color:"#34d399",archetype:"The Enchantress",  season:"Autumn",shortDesc:"Inward reflection, prep for release"},
};
const MOOD_MAPS = {
  menstrual:  [{days:"Day 1–2",mood:"Heavy & low",      icon:"🌊",note:"Prostaglandins peak. Rest is medicine. Cancel what you can."},{days:"Day 3",mood:"Quiet withdrawal",  icon:"😶",note:"Sacred introversion. Your body asks to be still."},{days:"Day 4–5",mood:"Slowly emerging",   icon:"🌤",note:"Fog starts lifting. Energy tiptoes back. Don't rush."}],
  follicular: [{days:"Early",mood:"Curious & light",    icon:"🌱",note:"Estrogen rising clears brain fog. You'll feel like yourself."},{days:"Mid",mood:"Social & sparkly",   icon:"✨",note:"Great for fresh starts, new projects, social plans."},{days:"Late",mood:"Confident & driven", icon:"💪",note:"Peak focus. Brain sharp, communication flows easily."}],
  ovulation:  [{days:"Day of",mood:"Electric & magnetic",icon:"🌕",note:"Peak estrogen + LH surge. Unusually confident and magnetic. Use it."}],
  luteal:     [{days:"Early",mood:"Calm & cosy",         icon:"🌿",note:"Progesterone rises. Warmer, more inward. That's healthy."},{days:"Mid",mood:"Reflective",           icon:"🤔",note:"Intuition sharpens. Your BS detector is at full power."},{days:"Late",mood:"Edgy & sensitive",   icon:"😤",note:"PMS zone. Magnesium & B6 are your friends."},{days:"Final",mood:"Deeply low",          icon:"🌑",note:"Both hormones crashing. You're not broken — you're resetting."}],
};
const RITUALS = {
  menstrual:  ["🛁 Long warm bath with Epsom salts","🔥 Heat pad on lower belly","📓 Journal what you're releasing","🧘 Yoga Nidra or restorative yoga","📵 Reduce screens after 8pm"],
  follicular: ["💃 Dance, run, cycle — intensity welcome","🤝 Schedule social plans","📚 Learn something new","🧠 Deep work in the mornings","🌱 Start that thing you've postponed"],
  ovulation:  ["💋 Express yourself — speak, create, connect","🎤 Give that talk","🤸 HIIT, boxing, dancing","🌸 Wear something you love","📸 Photos — you look and feel your best"],
  luteal:     ["🛁 Magnesium salt baths every 2 days","📓 Daily journaling — intuition is peak","🕯 Dim lights, slow evenings","🧘 Yin yoga or slow stretching","😴 Prioritise 8–9 hours sleep"],
  pcos:       ["🌿 Morning walk before breakfast — lowers cortisol & insulin","💊 Inositol supplement (myo-inositol + D-chiro)","🧘 Stress reduction is critical — cortisol worsens PCOS","🍳 Protein-first breakfast to stabilise blood sugar","💤 8hrs sleep — sleep deprivation raises androgens"],
  endo:       ["🔥 Heat therapy at first sign of pain","🌿 Anti-inflammatory supplements: omega-3, turmeric, NAC","🧘 Gentle yin yoga — reduces pelvic tension","📓 Pain log: track severity, location, triggers","🛁 Warm Epsom salt baths — magnesium absorbs transdermally"],
  peri:       ["❄️ Cool room + light bedding for night sweats","🧘 Slow, grounding exercise: yoga, pilates, swimming","📓 Track your symptoms daily — patterns emerge","💊 Discuss HRT with your doctor — evidence is strong","🌿 Phytoestrogen foods: flaxseed, soy, legumes daily"],
  meno:       ["🏋️ Weight-bearing exercise — critical for bone density","🧘 Mindfulness for hot flash triggers","💊 Calcium + Vitamin D3 daily — non-negotiable","🌿 Phytoestrogen-rich foods every day","❤️ Cardiovascular exercise 150 min/week — heart protection"],
};

const STAGE_INFO = {
  pcos: {
    title:"PCOS — Polycystic Ovary Syndrome",
    what:"PCOS is a hormonal condition affecting 1 in 10 women. The key issues are elevated androgens (testosterone), insulin resistance, and often a higher LH:FSH ratio. Cycles may be long, absent, or irregular because ovulation is suppressed.",
    hormone_note:"Your hormone graph shows the typical PCOS pattern: elevated LH relative to FSH, persistently high androgens, and estrogen that doesn't follow the clean rise-and-fall pattern. Ovulation may happen but is unpredictable.",
    key_focus:["Stabilise blood sugar — insulin resistance drives most PCOS symptoms","Reduce androgens through diet & lifestyle before medication","Support ovulation through inositol, omega-3, and stress reduction","Track cycles — even irregular ones reveal patterns over time"],
  },
  endo: {
    title:"Endometriosis",
    what:"Endometriosis affects 1 in 9 women. Endometrial-like tissue grows outside the uterus, causing inflammation, pain, and often scarring. Cycles may be regular, but the experience of them is severe. Estrogen dominance feeds endo tissue.",
    hormone_note:"Your cycle phases and hormone curves may be similar to a standard cycle, but estrogen dominance is the key driver. The focus is reducing systemic inflammation and supporting estrogen clearance.",
    key_focus:["Anti-inflammatory diet is the most powerful self-care tool","Reducing estrogen dominance helps slow tissue growth","Pain tracking helps identify your worst days and plan around them","Magnesium, omega-3, and NAC have strong evidence for endo"],
  },
  peri: {
    title:"Perimenopause",
    what:"Perimenopause is the transition to menopause — it can start in the late 30s and last 2–10 years. Progesterone declines first. Then estrogen becomes erratic — fluctuating wildly rather than following a predictable pattern. FSH rises as the body tries harder to stimulate the ovaries.",
    hormone_note:"The graph shows the perimenopause pattern: progesterone declining early, estrogen spiking and crashing unpredictably, and FSH rising. This volatility is what causes most symptoms — not just low estrogen, but the erratic swings.",
    key_focus:["Track symptoms daily — perimenopausal symptoms are often dismissed as stress or anxiety","Progesterone support first: sleep, magnesium, reduce alcohol","Discuss HRT early — progesterone-inclusive HRT has strong safety evidence","Bone density starts declining here — weight bearing exercise and calcium now"],
  },
  meno: {
    title:"Menopause",
    what:"Menopause is confirmed after 12 consecutive months without a period. The ovaries have largely stopped producing estrogen and progesterone. This is not an ending — it's a physiological transition with profound opportunities for health optimisation.",
    hormone_note:"Post-menopause: estrogen and progesterone are at baseline low. FSH remains elevated. The focus shifts from cycle management to long-term wellbeing — bone health, cardiovascular protection, cognitive function, and quality of life.",
    key_focus:["Bone density is the #1 long-term priority — weight training + calcium + D3","Cardiovascular risk increases post-menopause — diet and exercise are critical","HRT is the most effective treatment for symptoms and has strong safety data for most women","Cognitive changes are common and real — sleep, omega-3, and social connection all help"],
  },
};

// ═══════════════════════════════════════════════════════════
//  HORMONE CURVES
// ═══════════════════════════════════════════════════════════
function generateReproductiveCurve(cLen, pLen) {
  const ov = Math.round(cLen * 0.5);
  return Array.from({length:cLen},(_,i)=>{
    const d=i+1, fEnd=ov-1;
    let e,p,lh,fsh;
    if(d<=pLen) e=8+d*(12/pLen); else if(d<=fEnd) e=20+((d-pLen)/(fEnd-pLen))*70; else if(d===ov) e=95; else if(d===ov+1) e=55; else {const lp=cLen-ov,mid=Math.round(lp*.45);e=d<=ov+mid?55+((d-ov-1)/mid)*24:Math.max(8,79-((d-ov-mid)/(lp-mid))*71);}
    if(d<=ov) p=4+d*(4/ov); else{const lp=cLen-ov,mid=Math.round(lp*.5);p=d<=ov+mid?8+((d-ov)/mid)*82:Math.max(3,90-((d-ov-mid)/(lp-mid+1))*87);}
    if(d===ov-1) lh=45; else if(d===ov) lh=98; else if(d===ov+1) lh=30; else if(d<=pLen) lh=12; else if(d<=fEnd) lh=12+((d-pLen)/(fEnd-pLen))*15; else lh=Math.max(10,22-((d-ov-1)/(cLen-ov))*12);
    if(d<=3) fsh=22; else if(d<=pLen) fsh=22-((d-3)/(pLen-2))*6; else if(d<=fEnd) fsh=16+((d-pLen)/(fEnd-pLen))*40; else if(d===ov) fsh=65; else if(d===ov+1) fsh=30; else fsh=Math.max(10,24-((d-ov-1)/(cLen-ov))*14);
    return {day:d,estrogen:Math.max(4,Math.min(100,Math.round(e))),progesterone:Math.max(3,Math.min(100,Math.round(p))),lh:Math.max(8,Math.min(100,Math.round(lh))),fsh:Math.max(8,Math.min(100,Math.round(fsh)))};
  });
}

function generatePCOSCurve(cLen=35) {
  return Array.from({length:cLen},(_,i)=>{
    const d=i+1,p=d/cLen;
    const e=Math.max(25,35+Math.sin(p*Math.PI*2)*18+Math.random()*8);
    const prog=Math.max(5,12+Math.sin(p*Math.PI)*10);
    const lh=Math.max(22,30+Math.sin(p*Math.PI*1.5)*15);
    const fsh=Math.max(8,16+Math.cos(p*Math.PI)*6);
    const androgen=Math.max(35,45+Math.sin(p*Math.PI*.8)*12);
    return {day:d,estrogen:Math.round(e),progesterone:Math.round(prog),lh:Math.round(lh),fsh:Math.round(fsh),androgen:Math.round(androgen)};
  });
}

function generateEndoCurve(cLen=28,pLen=5) {
  const base=generateReproductiveCurve(cLen,pLen);
  return base.map(d=>({...d,estrogen:Math.min(100,Math.round(d.estrogen*1.15)),inflammation:d.day<=pLen?85:d.day<=Math.round(cLen*.5)?40:60}));
}

function generatePeriCurve(months=6) {
  const days=months*28;
  return Array.from({length:days},(_,i)=>{
    const d=i+1,cycle=d%28,prog=28-d/days*20;
    const eBase=50-d/days*25;
    const eSpike=Math.sin(d*.8)*20+Math.sin(d*.3)*12;
    return {day:d,estrogen:Math.max(5,Math.round(eBase+eSpike)),progesterone:Math.max(3,Math.round(prog+Math.sin(d*.5)*8)),fsh:Math.min(100,Math.round(18+d/days*55+Math.sin(d*.4)*8))};
  }).filter((_,i)=>i%3===0).map((d,i)=>({...d,day:i+1}));
}

function generateMenoCurve() {
  return Array.from({length:52},(_,i)=>({day:i+1,estrogen:Math.max(8,22-i*.2+Math.sin(i*.5)*4),progesterone:Math.max(3,8-i*.08+Math.sin(i*.3)*2),fsh:Math.min(100,Math.round(65+i*.5+Math.sin(i*.4)*5))}));
}

function generateIrregularBands(short,long,pLen) {
  const s=generateReproductiveCurve(short,pLen),l=generateReproductiveCurve(long,pLen);
  return Array.from({length:long},(_,i)=>{const sd=s[Math.min(i,s.length-1)],ld=l[i];return{day:i+1,e_min:Math.min(sd.estrogen,ld.estrogen),e_max:Math.max(sd.estrogen,ld.estrogen),e_mid:Math.round((sd.estrogen+ld.estrogen)/2),p_min:Math.min(sd.progesterone,ld.progesterone),p_max:Math.max(sd.progesterone,ld.progesterone),p_mid:Math.round((sd.progesterone+ld.progesterone)/2),lh_min:Math.min(sd.lh,ld.lh),lh_max:Math.max(sd.lh,ld.lh),lh_mid:Math.round((sd.lh+ld.lh)/2)};});
}

// ═══════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════
function stageColor(stage){return LIFE_STAGES.find(s=>s.id===stage)?.color||"#c084fc";}
function cycleLen(p){return p.isIrregular?Math.round(((+p.shortCycle)+(+p.longCycle))/2):(p.cycleLen||28);}
function computeDay(p){
  if(!p?.cycleDate) return 1;
  const s=new Date(p.cycleDate),t=new Date();s.setHours(0,0,0,0);t.setHours(0,0,0,0);
  const diff=Math.floor((t-s)/86400000)+1,len=cycleLen(p);
  return((diff-1)%len+len)%len+1;
}
function getPhase(day,p){
  const pLen=p?.periodLen||5,cLen=cycleLen(p),ov=Math.round(cLen*.5);
  if(day<=pLen) return "menstrual"; if(day<ov) return "follicular"; if(day===ov) return "ovulation"; return "luteal";
}
function addDays(str,n){const d=new Date(str);d.setDate(d.getDate()+n);return d;}
function fmt(d,o={month:"short",day:"numeric"}){return new Date(d).toLocaleDateString("en-US",o);}
function fmtFull(d){return new Date(d).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});}
function todayKey(){return new Date().toISOString().split("T")[0];}
function getMoon(d=new Date()){
  const age=(((d-new Date("2025-01-29"))/86400000)%29.53+29.53)%29.53;
  if(age<1.85) return {name:"New Moon",emoji:"🌑",illum:Math.round(age/1.85*5),energy:"Seeding intentions, fresh starts"};
  if(age<7.38) return {name:"Waxing Crescent",emoji:"🌒",illum:Math.round(age/7.38*40),energy:"Curiosity, gathering momentum"};
  if(age<9.22) return {name:"First Quarter",emoji:"🌓",illum:50,energy:"Decision-making, courage"};
  if(age<14.77) return {name:"Waxing Gibbous",emoji:"🌔",illum:Math.round(50+(age-9.22)/5.55*49),energy:"Refinement, anticipation"};
  if(age<16.61) return {name:"Full Moon",emoji:"🌕",illum:100,energy:"Peak emotions, illumination, release"};
  if(age<22.15) return {name:"Waning Gibbous",emoji:"🌖",illum:Math.round(100-(age-16.61)/5.54*50),energy:"Gratitude, integrating lessons"};
  if(age<23.99) return {name:"Last Quarter",emoji:"🌗",illum:50,energy:"Letting go, clearing space"};
  return {name:"Waning Crescent",emoji:"🌘",illum:Math.round((29.53-age)/5.54*40),energy:"Rest, release, dissolving"};
}
function phaseRanges(p){
  const pLen=p.periodLen||5,cLen=cycleLen(p),ov=Math.round(cLen*.5);
  return {menstrual:{start:addDays(p.cycleDate,0),end:addDays(p.cycleDate,pLen-1)},follicular:{start:addDays(p.cycleDate,pLen),end:addDays(p.cycleDate,ov-2)},ovulation:{start:addDays(p.cycleDate,ov-1),end:addDays(p.cycleDate,ov-1)},luteal:{start:addDays(p.cycleDate,ov),end:addDays(p.cycleDate,cLen-1)}};
}
function phaseLabel(p,id){const r=phaseRanges(p)[id];if(!r) return "";const s=fmt(r.start),e=fmt(r.end);return s===e?s:`${s}–${e}`;}
function getMilestones(p){
  const today=new Date();today.setHours(0,0,0,0);
  const cLen=cycleLen(p),pLen=p.periodLen||5,ov=Math.round(cLen*.5),day=computeDay(p);
  return Object.entries({"Follicular starts":pLen+1,"Ovulation":ov,"Luteal starts":ov+1,"Next period":cLen+1})
    .map(([label,d])=>{let away=d-day;if(away<=0)away+=cLen;const dt=new Date(today);dt.setDate(dt.getDate()+away);return{label,date:fmt(dt),daysAway:away};})
    .sort((a,b)=>a.daysAway-b.daysAway).slice(0,4);
}

// ═══════════════════════════════════════════════════════════
//  MEALS — stage-aware
// ═══════════════════════════════════════════════════════════
function getMeals(phaseId,diet,stage="reproductive"){
  const vegan=diet==="vegan",veg=diet==="vegetarian"||vegan,gf=diet==="glutenfree";
  if(stage==="pcos") return getPCOSMeals(phaseId,veg,vegan,gf);
  if(stage==="endo") return getEndoMeals(phaseId,veg,vegan,gf);
  if(stage==="peri"||stage==="meno") return getMenoMeals(stage,veg,vegan,gf);
  return getReproMeals(phaseId,veg,vegan,gf);
}

function getReproMeals(phaseId,veg,vegan,gf){
  const m={
    menstrual:{focus:"Replenish iron · reduce inflammation · ease cramps",breakfast:{name:vegan?"Warming Oat Congee":"Warming Congee Bowl",items:vegan?["Oats + veg broth","Mushrooms","Ginger","Turmeric","Sesame oil"]:["Rice + bone broth","Soft-boiled egg","Ginger","Turmeric","Sesame oil"],why:"Warming foods reduce prostaglandins. Ginger is nature's anti-inflammatory."},lunch:{name:"Lentil & Spinach Soup",items:["Red lentils","Baby spinach","Tomatoes","Cumin",gf?"GF bread":"Sourdough"],why:"Iron + vitamin C = maximum absorption. Fights period fatigue."},dinner:{name:veg?"Beet & Walnut Bowl":"Salmon with Roasted Beets",items:veg?["Roasted beets","Walnuts","Quinoa","Tahini","Spinach"]:["Omega-3 salmon","Roasted beets","Broccoli","Olive oil"],why:veg?"Walnuts provide plant Omega-3s. Beets boost blood quality.":"Omega-3s reduce inflammation. Beets boost blood quality."},snacks:["Dark chocolate 70%+ — magnesium","Dates — iron + energy","Chamomile tea","Walnuts"],avoid:["Caffeine","Alcohol","Salty processed foods","Cold raw foods"]},
    follicular:{focus:"Support estrogen metabolism · gut health · rising energy",breakfast:{name:"Green Goddess Smoothie Bowl",items:["Spinach + banana","Flaxseeds","Berries","Granola","Chia"],why:"Flaxseeds help process estrogen. Berries prevent estrogen dominance."},lunch:{name:"Fermented Grain Bowl",items:[gf?"Quinoa":"Farro","Broccoli & asparagus",vegan?"Edamame":"Soft-boiled egg","Kimchi","Tahini"],why:"Fermented foods clear excess estrogen. Cruciferous veg are key."},dinner:{name:vegan?"Tofu Ginger Stir-Fry":veg?"Paneer & Zucchini Stir-Fry":"Chicken & Zucchini Stir-Fry",items:[vegan?"Firm tofu":veg?"Paneer":"Lean chicken","Zucchini, snap peas",gf?"Rice noodles":"Brown rice","Ginger-garlic-tamari"],why:"Light proteins support tissue rebuilding. B vitamins fuel rising energy."},snacks:["Edamame — phytoestrogen","Apple + almond butter","Green tea","Pumpkin seeds"],avoid:["Excess sugar","Alcohol","Ultra-processed foods"]},
    ovulation:{focus:"Support LH surge · reduce inflammation · peak energy",breakfast:{name:"Açaí Power Bowl",items:["Açaí + banana","Hemp seeds","Mango & kiwi","Bee pollen"],why:"Antioxidants protect the egg. Zinc from hemp supports LH."},lunch:{name:veg?"Rainbow Buddha Bowl":"Rainbow Salad with Salmon",items:veg?["Mixed greens","Avocado","Pumpkin seeds","Chickpeas","Lemon dressing"]:["Wild salmon","Mixed greens","Avocado","Pumpkin seeds"],why:veg?"Chickpeas & pumpkin seeds are excellent zinc sources.":"Zinc + Omega-3s support healthy ovulation."},dinner:{name:veg?"Lentil & Beet Salad":"Lamb with Root Veg",items:veg?["French lentils","Roasted beets","Spinach","Walnut dressing"]:["Grass-fed lamb","Roasted beets & carrots","Spinach","Chimichurri"],why:veg?"Lentils + walnuts are zinc-rich plant sources.":"Zinc is crucial for LH surge quality."},snacks:[veg?"Pumpkin seeds":"Oysters or pumpkin seeds","Dark berries","Coconut water","Almonds"],avoid:["Alcohol (disrupts LH)","Heavy greasy foods","Excess sugar"]},
    luteal:{focus:"Support progesterone · ease PMS · reduce bloating",breakfast:{name:vegan?"Sweet Potato Porridge":"Sweet Potato & Egg Hash",items:vegan?["Sweet potato","Oat porridge","Pumpkin seeds","Cinnamon"]:["Sweet potato","2 fried eggs","Spinach","Pumpkin seeds"],why:"Sweet potato B6 is #1 for progesterone production."},lunch:{name:vegan?"Chickpea & Cauliflower Bowl":veg?"Paneer & Chickpea Bowl":"Turkey & Chickpea Bowl",items:vegan?["Chickpeas","Cauliflower","Brown rice","Turmeric tahini"]:veg?["Paneer","Cauliflower","Brown rice","Turmeric tahini"]:["Turkey","Cauliflower","Brown rice","Turmeric tahini"],why:veg?"Paneer sustains serotonin. Chickpeas add magnesium.":"Tryptophan → serotonin → calmer mood."},dinner:{name:"Lentil Dal",items:["Red lentils","Coconut milk","Turmeric, ginger","Kale","Brown rice"],why:"Magnesium from lentils eases cramps and anxiety."},snacks:["Dark chocolate + almond butter","Banana — B6","Pumpkin seeds","Golden milk"],avoid:["Alcohol","Caffeine after noon","Salty foods","Ultra-processed sugar"]},
  };
  return m[phaseId]||m.menstrual;
}

function getPCOSMeals(phaseId,veg,vegan,gf){
  const base={
    focus:"Low-GI · anti-androgen · insulin sensitivity",
    breakfast:{name:vegan?"Protein Chia Pudding":"Greek Yoghurt Protein Bowl",items:vegan?["Chia seeds + oat milk","Hemp protein","Berries","Cinnamon (insulin sensitiser)","Walnuts"]:["Full-fat Greek yoghurt","Hemp seeds","Mixed berries","Cinnamon","Almonds"],why:"High-protein, low-GI breakfast is the single most impactful meal for PCOS. Stabilises insulin for the whole day."},
    lunch:{name:veg?"Lentil & Avocado Bowl":"Chicken & Quinoa Power Bowl",items:veg?["Red lentils","Avocado","Cucumber","Pumpkin seeds","Lemon tahini"]:["Grilled chicken","Quinoa","Roasted veg","Avocado","Olive oil"],why:"Protein + healthy fats at lunch prevents the afternoon blood sugar spike that worsens androgen production."},
    dinner:{name:"Anti-Androgen Stir-Fry",items:[vegan?"Firm tofu":veg?"Tempeh":"Salmon or chicken","Spearmint (anti-androgen)","Broccoli & kale","Brown rice or cauliflower rice","Ginger-garlic"],why:"Spearmint has clinically proven anti-androgen effects. Cruciferous veg help clear excess testosterone."},
    snacks:["Spearmint tea — proven to reduce androgens","Walnuts — omega-3 reduces inflammation","Apple + almond butter — low GI","Pumpkin seeds — zinc supports ovulation"],
    avoid:["White sugar & refined carbs — spikes insulin","Dairy (for some PCOS) — test your response","Alcohol — raises androgens","Processed soy in large amounts"],
  };
  return base;
}

function getEndoMeals(phaseId,veg,vegan,gf){
  const isBleed=phaseId==="menstrual"||phaseId==="luteal";
  return {
    focus:"Anti-inflammatory · reduce estrogen dominance · pain management",
    breakfast:{name:"Anti-Inflammatory Golden Bowl",items:vegan?["Oats + coconut milk","Turmeric + black pepper","Berries (antioxidants)","Flaxseeds","Ginger"]:["Eggs + turmeric","Smoked salmon","Avocado","Flaxseeds","Berries"],why:"Turmeric + black pepper = curcumin, one of the most powerful anti-inflammatory compounds. Flaxseeds support estrogen clearance."},
    lunch:{name:"Omega-Rich Greens Bowl",items:[veg?"Chickpeas + walnuts":"Wild salmon","Leafy greens: kale, spinach, rocket","Roasted broccoli","Olive oil + lemon","Pumpkin seeds"],why:"Omega-3s directly reduce prostaglandins — the hormones that drive endo pain. Aim for omega-3 every day during your cycle."},
    dinner:{name:"Gut-Healing Bone Broth Bowl",items:[vegan?"Miso soup base":"Bone broth base","Roasted root veg","Dark leafy greens","Brown rice","Anti-inflammatory spices"],why:"Gut health is deeply connected to estrogen clearance. 40% of estrogen is cleared via the gut — a healthy microbiome is essential for endo management."},
    snacks:["Turmeric golden milk — anti-inflammatory","Dark berries — antioxidants","Walnuts — omega-3","Green tea — reduces estrogen dominance"],
    avoid:["Red meat in excess — increases prostaglandins","Gluten — worsens inflammation for many endo women","Alcohol — raises estrogen","Trans fats — highly inflammatory","Excess dairy — increases estrogen load"],
  };
}

function getMenoMeals(stage,veg,vegan,gf){
  return {
    focus:stage==="peri"?"Stabilise erratic estrogen · support progesterone · bone health":"Bone density · heart health · cognitive function · symptom relief",
    breakfast:{name:"Bone-Building Power Breakfast",items:vegan?["Fortified oat milk porridge","Ground flaxseed (phytoestrogen)","Almonds (calcium)","Berries","Pumpkin seeds"]:["Greek yoghurt (calcium)","Flaxseeds","Mixed berries","Walnuts","Hemp seeds"],why:"Calcium + phytoestrogens every morning. Flaxseeds are the most studied phytoestrogen for menopausal symptom relief."},
    lunch:{name:"Heart-Protective Grain Bowl",items:[veg?"Edamame + quinoa":"Sardines or salmon","Leafy greens","Roasted veg","Olive oil","Seeds mix"],why:stage==="peri"?"Omega-3s and phytoestrogens are your best friends during peri. Edamame provides isoflavones that gently mimic estrogen.":"Cardiovascular risk increases post-menopause. Omega-3s, olive oil, and leafy greens are heart-protective staples."},
    dinner:{name:"Hormone-Supportive Stir-Fry",items:[veg?"Tempeh (phytoestrogen)":"Lean protein","Broccoli & bok choy","Brown rice or quinoa","Sesame oil","Ginger + garlic"],why:"Tempeh is the richest food source of phytoestrogens after flaxseed. Regular soy intake reduces hot flash frequency by up to 26%."},
    snacks:["Flaxseed crackers — phytoestrogens","Almonds — calcium + vitamin E","Green tea — antioxidants + mild caffeine","Dark chocolate + walnuts — mood + omega-3"],
    avoid:["Alcohol — triggers hot flashes and disrupts sleep","Caffeine excess — worsens hot flashes","Ultra-processed food — inflammation","High salt — worsens bone loss","Excess sugar — worsens mood and weight"],
  };
}

// ═══════════════════════════════════════════════════════════
//  STYLE HELPERS
// ═══════════════════════════════════════════════════════════
const iS={width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(200,160,255,.2)",borderRadius:14,padding:"15px 18px",color:"#ede0ff",fontSize:16,fontFamily:G.font,transition:"border-color .2s"};
const bS=(c,off=false)=>({background:off?"rgba(255,255,255,.04)":`linear-gradient(135deg,${c}45,${c}20)`,border:`1px solid ${off?"rgba(200,160,255,.1)":c+"55"}`,borderRadius:14,padding:"14px 28px",color:off?"rgba(200,175,255,.3)":"#e8d8ff",fontSize:14,fontFamily:G.font,cursor:off?"default":"pointer",boxShadow:off?"none":`0 4px 20px ${c}20`,transition:"all .2s ease"});
const cS=(c)=>({background:"rgba(255,255,255,.028)",border:`1px solid ${c}22`,borderTop:`2px solid ${c}45`,borderRadius:18,padding:"20px"});

// ═══════════════════════════════════════════════════════════
//  SHARED UI
// ═══════════════════════════════════════════════════════════
function Chip({color,icon,label}){return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:20,background:`${color}15`,border:`1px solid ${color}35`,fontSize:12,color}}>{icon} {label}</span>;}
function Card({color,title,sub,children}){return <div style={cS(color)}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:600,color,marginBottom:sub?4:14}}>{title}</div>{sub&&<div style={{fontSize:11,color:"rgba(200,175,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>{sub}</div>}{children}</div>;}
function ABox({color,text}){return <div style={{marginTop:12,padding:"12px 16px",background:`${color}10`,border:`1px solid ${color}30`,borderLeft:`3px solid ${color}`,borderRadius:12,fontSize:13,color:"rgba(215,200,255,.8)",lineHeight:1.6}}>🌟 {text}</div>;}
function MealCard({meal,color}){
  const [o,sO]=useState(false);
  return <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${color}20`}}>
    <button onClick={()=>sO(x=>!x)} style={{width:"100%",background:"rgba(255,255,255,.04)",border:"none",padding:"12px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:G.font}}>
      <div style={{textAlign:"left"}}><div style={{fontSize:11,color,textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>{meal.label}</div><div style={{fontSize:14,fontWeight:600,color:"#f0e0ff"}}>{meal.name}</div></div>
      <span style={{color,fontSize:16,transition:"transform .2s",transform:o?"rotate(180deg)":"none"}}>⌄</span>
    </button>
    {o&&<div style={{padding:"0 16px 14px",background:"rgba(0,0,0,.15)"}}>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,margin:"10px 0 8px"}}>{meal.items.map((x,i)=><span key={i} style={{padding:"3px 10px",background:`${color}12`,border:`1px solid ${color}25`,borderRadius:20,fontSize:12,color:"rgba(220,200,255,.7)"}}>{x}</span>)}</div>
      <div style={{fontSize:12,color:"rgba(200,180,255,.55)",fontStyle:"italic",lineHeight:1.6,borderLeft:`2px solid ${color}40`,paddingLeft:10}}>💡 {meal.why}</div>
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════
//  MOOD LOG COMPONENT
// ═══════════════════════════════════════════════════════════
const MOOD_LABELS=["😞 Very low","😔 Low","😐 Okay","🙂 Good","✨ Great"];
function MoodLogger({profile,moodLog,setMoodLog}){
  const key=todayKey(),today=moodLog[key]||{score:null,note:""};
  const save=(updates)=>{const nl={...moodLog,[key]:{...today,...updates}};setMoodLog(nl);try{localStorage.setItem(`maia_mood_${profile.name}`,JSON.stringify(nl));}catch{}};
  const entries=Object.entries(moodLog).sort((a,b)=>new Date(b[0])-new Date(a[0]));
  const avg=entries.length?Math.round(entries.slice(0,7).reduce((s,[,v])=>s+(v.score||0),0)/Math.min(7,entries.length)*10)/10:null;
  const sc=stageColor(profile.lifeStage||"reproductive");
  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <Card color={sc} title="📊 Daily Mood Log" sub="Track how you feel each day">
      <div style={{marginBottom:14}}>
        <div style={{fontSize:13,color:"rgba(200,180,255,.6)",marginBottom:10}}>How are you feeling today?</div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          {MOOD_LABELS.map((l,i)=><button key={i} onClick={()=>save({score:i+1})} style={{flex:1,padding:"10px 4px",borderRadius:12,background:today.score===i+1?`${sc}25`:"rgba(255,255,255,.04)",border:`1px solid ${today.score===i+1?sc+"50":"rgba(200,160,255,.1)"}`,color:today.score===i+1?sc:"rgba(200,180,255,.4)",fontSize:11,fontFamily:G.font,cursor:"pointer",textAlign:"center",lineHeight:1.4}}>{l}</button>)}
        </div>
        <textarea value={today.note||""} onChange={e=>save({note:e.target.value})} placeholder="Optional note — what's on your mind?" style={{...iS,height:70,resize:"none",fontSize:13}} />
      </div>
      {avg&&<div style={{padding:"10px 14px",background:"rgba(255,255,255,.04)",borderRadius:12,fontSize:13,color:"rgba(210,190,255,.7)"}}>📈 Your 7-day average: <strong style={{color:sc}}>{avg}/5</strong></div>}
    </Card>
    {entries.length>0&&<Card color="#818cf8" title="📅 Mood History" sub={`${entries.length} day${entries.length!==1?"s":""} logged`}>
      <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:220,overflowY:"auto"}}>
        {entries.map(([date,entry])=>(
          <div key={date} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 12px",background:"rgba(255,255,255,.03)",borderRadius:10}}>
            <div style={{fontSize:12,color:"rgba(200,175,255,.5)",minWidth:56}}>{fmt(new Date(date))}</div>
            <div style={{fontSize:16}}>{entry.score?MOOD_LABELS[entry.score-1].split(" ")[0]:"—"}</div>
            {entry.note&&<div style={{fontSize:11,color:"rgba(200,180,255,.55)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{entry.note}</div>}
          </div>
        ))}
      </div>
    </Card>}
  </div>;
}

// ═══════════════════════════════════════════════════════════
//  CYCLE HISTORY COMPONENT
// ═══════════════════════════════════════════════════════════
function CycleHistory({profile,cycleHistory,setCycleHistory}){
  const [newDate,setNewDate]=useState("");
  const sc=stageColor(profile.lifeStage||"reproductive");
  const sorted=cycleHistory.slice().sort((a,b)=>new Date(b)-new Date(a));
  const lengths=sorted.slice(0,-1).map((d,i)=>Math.round((new Date(d)-new Date(sorted[i+1]))/86400000)).filter(l=>l>10&&l<90);
  const avg=lengths.length?Math.round(lengths.reduce((s,l)=>s+l,0)/lengths.length):null;
  const min=lengths.length?Math.min(...lengths):null,max=lengths.length?Math.max(...lengths):null;
  const add=()=>{if(!newDate) return;if(!cycleHistory.includes(newDate)){const nl=[...cycleHistory,newDate];setCycleHistory(nl);try{localStorage.setItem(`maia_history_${profile.name}`,JSON.stringify(nl));}catch{}}setNewDate("");};
  const remove=(d)=>{const nl=cycleHistory.filter(x=>x!==d);setCycleHistory(nl);try{localStorage.setItem(`maia_history_${profile.name}`,JSON.stringify(nl));}catch{}};
  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <Card color={sc} title="🗓 Cycle History" sub="Log past period start dates to calculate your personal average">
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} max={todayKey()} style={{...iS,flex:1,fontSize:14}} />
        <button onClick={add} style={{...bS(sc),padding:"14px 18px",whiteSpace:"nowrap"}}>+ Add</button>
      </div>
      {avg&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
        {[{l:"Average",v:`${avg} days`,c:sc},{l:"Shortest",v:`${min} days`,c:"#c084fc"},{l:"Longest",v:`${max} days`,c:"#fbbf24"}].map(r=>(
          <div key={r.l} style={{padding:"10px",background:"rgba(255,255,255,.04)",borderRadius:12,textAlign:"center"}}>
            <div style={{fontSize:10,color:"rgba(200,175,255,.4)",textTransform:"uppercase",marginBottom:4}}>{r.l}</div>
            <div style={{fontSize:15,color:r.c,fontWeight:700}}>{r.v}</div>
          </div>
        ))}
      </div>}
      {min&&max&&max-min>=7&&<div style={{padding:"10px 13px",background:"rgba(251,191,36,.08)",border:"1px solid rgba(251,191,36,.2)",borderRadius:12,fontSize:12,color:"rgba(255,220,130,.75)",marginBottom:12}}>〰 Your cycle varies by {max-min} days — this qualifies as irregular. Consider switching to irregular tracking in your profile.</div>}
      <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:180,overflowY:"auto"}}>
        {sorted.map((d,i)=>(
          <div key={d} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 12px",background:"rgba(255,255,255,.03)",borderRadius:10}}>
            <div style={{fontSize:16}}>{i===0?"🔴":"🩸"}</div>
            <div style={{flex:1}}><div style={{fontSize:13,color:"#e0d0ff"}}>{fmtFull(d)}</div>{i<sorted.length-1&&lengths[i]&&<div style={{fontSize:11,color:"rgba(200,180,255,.45)"}}>{lengths[i]} days from previous</div>}</div>
            <button onClick={()=>remove(d)} style={{background:"none",border:"none",color:"rgba(255,130,130,.4)",cursor:"pointer",fontSize:16}}>×</button>
          </div>
        ))}
      </div>
      {sorted.length===0&&<div style={{fontSize:13,color:"rgba(200,175,255,.4)",textAlign:"center",padding:"20px 0"}}>No cycle history yet. Add your past period start dates above.</div>}
    </Card>
  </div>;
}

// ═══════════════════════════════════════════════════════════
//  PAIN LOG (ENDO)
// ═══════════════════════════════════════════════════════════
const PAIN_LOCATIONS=["Pelvis/uterus","Lower back","Bowel/rectum","Thighs","Shoulders"];
function PainLogger({profile,painLog,setPainLog}){
  const key=todayKey(),today=painLog[key]||{score:null,locations:[],note:""};
  const save=(updates)=>{const nl={...painLog,[key]:{...today,...updates}};setPainLog(nl);try{localStorage.setItem(`maia_pain_${profile.name}`,JSON.stringify(nl));}catch{}};
  const togLoc=(loc)=>{const locs=today.locations||[];save({locations:locs.includes(loc)?locs.filter(l=>l!==loc):[...locs,loc]});};
  const sc="#fb923c";
  return <Card color={sc} title="🌊 Pain Log" sub="Track severity and location daily">
    <div style={{marginBottom:12}}>
      <div style={{fontSize:12,color:"rgba(200,180,255,.6)",marginBottom:8}}>Today's pain level</div>
      <div style={{display:"flex",gap:6}}>
        {[1,2,3,4,5,6,7,8,9,10].map(n=><button key={n} onClick={()=>save({score:n})} style={{flex:1,padding:"8px 2px",borderRadius:8,background:today.score===n?`${sc}30`:"rgba(255,255,255,.04)",border:`1px solid ${today.score===n?sc+"60":"rgba(200,160,255,.1)"}`,color:today.score===n?sc:"rgba(200,180,255,.4)",fontSize:12,fontFamily:G.font,cursor:"pointer"}}>{n}</button>)}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"rgba(200,175,255,.3)",marginTop:4}}><span>No pain</span><span>Severe</span></div>
    </div>
    <div style={{marginBottom:12}}>
      <div style={{fontSize:12,color:"rgba(200,180,255,.6)",marginBottom:8}}>Location</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {PAIN_LOCATIONS.map(loc=>{const sel=(today.locations||[]).includes(loc);return<button key={loc} onClick={()=>togLoc(loc)} style={{padding:"6px 12px",borderRadius:20,background:sel?`${sc}20`:"rgba(255,255,255,.04)",border:`1px solid ${sel?sc+"50":"rgba(200,160,255,.1)"}`,color:sel?sc:"rgba(200,180,255,.5)",fontSize:12,fontFamily:G.font,cursor:"pointer"}}>{loc}{sel&&" ✓"}</button>;})}
      </div>
    </div>
    <textarea value={today.note||""} onChange={e=>save({note:e.target.value})} placeholder="Notes — triggers, medications taken, anything useful..." style={{...iS,height:60,resize:"none",fontSize:13}} />
    {Object.keys(painLog).length>2&&(
      <div style={{marginTop:12,padding:"10px 13px",background:"rgba(251,147,35,.08)",borderRadius:12,fontSize:12,color:"rgba(255,200,150,.75)",lineHeight:1.6}}>
        💡 Share your pain log with your gynaecologist — a pattern of {Object.values(painLog).filter(e=>e.score>=7).length} high-pain days recorded so far.
      </div>
    )}
  </Card>;
}

// ═══════════════════════════════════════════════════════════
//  HORMONE GRAPH — stage-aware
// ═══════════════════════════════════════════════════════════
function HGraph({profile}){
  const [active,setActive]=useState(["estrogen","progesterone","lh","fsh"]);
  const stage=profile.lifeStage||"reproductive";
  const sc=stageColor(stage);
  const irr=profile.isIrregular,cLen=irr?Math.round(((+profile.shortCycle)+(+profile.longCycle))/2):(profile.cycleLen||28),pLen=profile.periodLen||5;
  const ov=Math.round(cLen*.5);
  const curDay=["reproductive","endo"].includes(stage)||stage==="pcos"?computeDay(profile):null;

  let data=[],xLabel="Day",showBands=false,extraLines=[];
  if(stage==="pcos"){data=generatePCOSCurve(+(profile.cycleLen||35));extraLines=[{key:"androgen",label:"Androgens",color:"#f97316"}];if(!active.includes("androgen")&&active.length===4) setActive(a=>[...a,"androgen"]);}
  else if(stage==="endo"){data=generateEndoCurve(cLen,pLen);extraLines=[{key:"inflammation",label:"Inflammation",color:"#ef4444"}];}
  else if(stage==="peri"){data=generatePeriCurve();xLabel="Week (approx)";}
  else if(stage==="meno"){data=generateMenoCurve();xLabel="Week";}
  else if(irr){data=generateIrregularBands(+profile.shortCycle,+profile.longCycle,pLen);showBands=true;}
  else {data=generateReproductiveCurve(cLen,pLen);}

  const allLines=[{key:"estrogen",label:"Estrogen",color:"#f472b6"},{key:"progesterone",label:"Progesterone",color:"#34d399"},{key:"lh",label:"LH",color:"#fbbf24"},{key:"fsh",label:"FSH",color:"#818cf8"},...extraLines];
  const tog=(k)=>setActive(p=>p.includes(k)?(p.length>1?p.filter(x=>x!==k):p):[...p,k]);
  const TTip=({active:a,payload,label})=>{
    if(!a||!payload?.length) return null;
    return <div style={{background:"rgba(8,5,20,.97)",border:`1px solid ${sc}50`,borderRadius:14,padding:"14px 18px",minWidth:160}}>
      <div style={{fontSize:12,color:sc,marginBottom:8,fontWeight:600}}>{xLabel} {label}</div>
      {payload.filter(p=>p.value!==undefined&&!["e_min","e_max","p_min","p_max","lh_min","lh_max"].includes(p.dataKey)).map(p=><div key={p.dataKey} style={{display:"flex",justifyContent:"space-between",gap:16,marginBottom:3}}><span style={{color:p.color,fontSize:12}}>{allLines.find(h=>h.key===p.dataKey||p.dataKey===h.key+"_mid")?.label}</span><span style={{color:"#fff",fontSize:12,fontWeight:700}}>{p.value}%</span></div>)}
    </div>;
  };

  return <div style={cS(sc)}>
    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:600,color:sc,marginBottom:4}}>📊 {stage==="pcos"?"PCOS Hormone Pattern":stage==="endo"?"Endo Hormone & Inflammation Map":stage==="peri"?"Perimenopause Hormone Transition":stage==="meno"?"Post-Menopause Hormone Baseline":"Your Personalised Hormone Map"}</div>
    <div style={{fontSize:11,color:"rgba(200,175,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>
      {stage==="pcos"?"Elevated androgens · flattened LH/FSH ratio · erratic estrogen":stage==="endo"?"Regular cycle · estrogen dominance · systemic inflammation overlay":stage==="peri"?"Declining progesterone · erratic estrogen · rising FSH over time":stage==="meno"?"Post-menopausal baseline · low estrogen & progesterone · elevated FSH":`${cLen}-day cycle · personalised to you`}
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
      {allLines.map(h=><button key={h.key} onClick={()=>tog(h.key)} style={{background:active.includes(h.key)?`${h.color}20`:"rgba(255,255,255,.04)",border:`1px solid ${active.includes(h.key)?h.color+"60":"rgba(200,160,255,.12)"}`,borderRadius:20,padding:"6px 14px",fontSize:12,color:active.includes(h.key)?h.color:"rgba(200,180,255,.35)",fontFamily:G.font,cursor:"pointer",display:"flex",alignItems:"center",gap:7,transition:"all .2s"}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:active.includes(h.key)?h.color:"rgba(200,180,255,.2)",display:"inline-block",flexShrink:0,boxShadow:active.includes(h.key)?`0 0 6px ${h.color}`:"none"}}/>{h.label}
      </button>)}
    </div>
    {!["peri","meno"].includes(stage)&&!showBands&&<div style={{display:"flex",paddingLeft:38,paddingRight:6,marginBottom:4}}>
      {[{l:"Menstrual",s:1,e:pLen,c:PHASES.menstrual.color},{l:"Follicular",s:pLen+1,e:ov-1,c:PHASES.follicular.color},{l:"Ovulation",s:ov,e:ov,c:PHASES.ovulation.color},{l:"Luteal",s:ov+1,e:cLen,c:PHASES.luteal.color}].map((b,i)=><div key={i} style={{width:`${((b.e-b.s+1)/cLen)*100}%`,textAlign:"center",fontSize:9,color:b.c,textTransform:"uppercase",letterSpacing:".05em",overflow:"hidden",opacity:.8}}>{b.l}</div>)}
    </div>}
    <ResponsiveContainer width="100%" height={260}>
      {showBands?(
        <ComposedChart data={data} margin={{top:8,right:10,bottom:8,left:0}}>
          <CartesianGrid strokeDasharray="2 6" stroke="rgba(200,160,255,.05)" vertical={false}/>
          {[pLen+.5,ov-.5,ov+.5].map(x=><ReferenceLine key={x} x={x} stroke="rgba(200,160,255,.1)" strokeDasharray="3 3"/>)}
          {curDay&&<ReferenceLine x={curDay} stroke="rgba(255,255,255,.35)" strokeWidth={1.5} label={{value:"TODAY",position:"top",fill:"rgba(255,255,255,.4)",fontSize:9}}/>}
          <XAxis dataKey="day" tick={{fill:"rgba(200,180,255,.35)",fontSize:10}} tickLine={false} axisLine={{stroke:"rgba(200,160,255,.08)"}}/>
          <YAxis tick={{fill:"rgba(200,180,255,.35)",fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`} width={34}/>
          <Tooltip content={<TTip/>} cursor={{stroke:"rgba(200,160,255,.15)",strokeWidth:1}}/>
          {active.includes("estrogen")&&<><Area type="monotone" dataKey="e_max" fill="#f472b618" stroke="none"/><Area type="monotone" dataKey="e_min" fill="#0a0515" stroke="none"/><Line type="monotone" dataKey="e_mid" stroke="#f472b6" strokeWidth={2} dot={false} style={{filter:"drop-shadow(0 0 5px #f472b660)"}}/></>}
          {active.includes("progesterone")&&<><Area type="monotone" dataKey="p_max" fill="#34d39915" stroke="none"/><Area type="monotone" dataKey="p_min" fill="#0a0515" stroke="none"/><Line type="monotone" dataKey="p_mid" stroke="#34d399" strokeWidth={2} dot={false} style={{filter:"drop-shadow(0 0 5px #34d39960)"}}/></>}
          {active.includes("lh")&&<Line type="monotone" dataKey="lh_mid" stroke="#fbbf24" strokeWidth={2} dot={false} style={{filter:"drop-shadow(0 0 5px #fbbf2460)"}}/>}
        </ComposedChart>
      ):(
        <LineChart data={data} margin={{top:8,right:10,bottom:8,left:0}}>
          <CartesianGrid strokeDasharray="2 6" stroke="rgba(200,160,255,.05)" vertical={false}/>
          {!["peri","meno"].includes(stage)&&[pLen+.5,ov-.5,ov+.5].map(x=><ReferenceLine key={x} x={x} stroke="rgba(200,160,255,.1)" strokeDasharray="3 3"/>)}
          {curDay&&<ReferenceLine x={curDay} stroke="rgba(255,255,255,.35)" strokeWidth={1.5} label={{value:"TODAY",position:"top",fill:"rgba(255,255,255,.4)",fontSize:9}}/>}
          <XAxis dataKey="day" tick={{fill:"rgba(200,180,255,.35)",fontSize:10}} tickLine={false} axisLine={{stroke:"rgba(200,160,255,.08)"}} label={{value:["peri","meno"].includes(stage)?xLabel:"",position:"insideBottom",offset:-2,fill:"rgba(200,180,255,.3)",fontSize:10}}/>
          <YAxis tick={{fill:"rgba(200,180,255,.35)",fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`} width={34}/>
          <Tooltip content={<TTip/>} cursor={{stroke:"rgba(200,160,255,.15)",strokeWidth:1}}/>
          {allLines.map(h=>active.includes(h.key)?<Line key={h.key} type="monotone" dataKey={h.key} stroke={h.color} strokeWidth={2.5} dot={false} activeDot={{r:5,fill:h.color,stroke:"#080310",strokeWidth:2}} style={{filter:`drop-shadow(0 0 5px ${h.color}55)`}}/>:null)}
        </LineChart>
      )}
    </ResponsiveContainer>
    {stage==="pcos"&&<div style={{marginTop:8,padding:"9px 13px",background:"rgba(249,115,22,.08)",borderRadius:10,fontSize:12,color:"rgba(255,200,150,.7)",lineHeight:1.5}}>⚠️ PCOS hormone patterns vary significantly. This shows a typical pattern — your individual levels may differ. Blood tests (LH:FSH ratio, androgens, insulin) give the most accurate picture.</div>}
    {stage==="endo"&&<div style={{marginTop:8,padding:"9px 13px",background:"rgba(239,68,68,.08)",borderRadius:10,fontSize:12,color:"rgba(255,160,160,.7)",lineHeight:1.5}}>🔴 Red line shows relative inflammation level through your cycle — typically peaking during menstruation and luteal phase for endo sufferers.</div>}
    {stage==="peri"&&<div style={{marginTop:8,padding:"9px 13px",background:"rgba(56,189,248,.08)",borderRadius:10,fontSize:12,color:"rgba(150,220,255,.7)",lineHeight:1.5}}>📈 This graph shows the typical hormone trajectory over months, not a single cycle. The key pattern: progesterone declines first, then estrogen becomes erratic, then FSH rises as your body tries to stimulate the ovaries more.</div>}
    {stage==="meno"&&<div style={{marginTop:8,padding:"9px 13px",background:"rgba(167,139,250,.08)",borderRadius:10,fontSize:12,color:"rgba(200,180,255,.7)",lineHeight:1.5}}>🌙 Post-menopause baseline. Low estrogen & progesterone with elevated FSH. The focus now shifts from cycle management to long-term bone, heart, and cognitive health.</div>}
    <div style={{textAlign:"center",fontSize:11,color:"rgba(200,180,255,.25)",marginTop:8}}>Toggle lines above · Hover to see values · Relative levels (%) not absolute</div>
  </div>;
}

// ═══════════════════════════════════════════════════════════
//  STAGE INFO PANEL
// ═══════════════════════════════════════════════════════════
function StageInfoPanel({stage}){
  const info=STAGE_INFO[stage]; if(!info) return null;
  const sc=stageColor(stage);
  return <Card color={sc} title={`${LIFE_STAGES.find(s=>s.id===stage)?.icon} ${info.title}`}>
    <p style={{...G.body,fontSize:13,marginBottom:14}}>{info.what}</p>
    <div style={{padding:"12px 14px",background:"rgba(255,255,255,.03)",borderRadius:12,marginBottom:14}}>
      <div style={{fontSize:11,color:"rgba(200,175,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Hormone Pattern</div>
      <p style={{fontSize:13,color:"rgba(210,190,255,.7)",lineHeight:1.6}}>{info.hormone_note}</p>
    </div>
    <div style={{fontSize:11,color:"rgba(200,175,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Key Focus Areas</div>
    {info.key_focus.map((f,i)=><div key={i} style={{display:"flex",gap:10,fontSize:13,color:"rgba(210,190,255,.75)",padding:"8px 0",borderBottom:i<info.key_focus.length-1?"1px solid rgba(200,160,255,.07)":"none",lineHeight:1.5}}><span style={{color:sc,flexShrink:0}}>◦</span>{f}</div>)}
  </Card>;
}

// ═══════════════════════════════════════════════════════════
//  ONBOARDING
// ═══════════════════════════════════════════════════════════
function Onboarding({onComplete}){
  const [step,sStep]=useState(0),[dir,sDir]=useState(1),[anim,sAnim]=useState(true);
  const [form,sForm]=useState({lifeStage:"",name:"",cycleDate:"",isIrregular:false,cycleLen:28,shortCycle:21,longCycle:35,periodLen:5,periStage:"still_cycling",symptoms:[],diet:"",focus:""});
  const go=(n)=>{sDir(n>step?1:-1);sAnim(false);setTimeout(()=>{sStep(n);sAnim(true);},200);};
  const set=(k,v)=>sForm(f=>({...f,[k]:v}));
  const togS=(id)=>set("symptoms",form.symptoms.includes(id)?form.symptoms.filter(s=>s!==id):[...form.symptoms,id]);
  const stage=form.lifeStage;
  const sympList=SYMPTOMS_BY_STAGE[stage]||SYMPTOMS_BY_STAGE.reproductive;
  // Steps: 0=welcome, 1=lifeStage, 2=name, 3=cycleInfo(if applicable), 4=symptoms, 5=diet, 6=focus, 7=ready
  const hasCycle=["reproductive","pcos","endo"].includes(stage);
  const ok=()=>{if(step===1)return stage!=="";if(step===2)return form.name.trim().length>0;if(step===3&&hasCycle)return form.cycleDate!=="";if(step===4)return form.symptoms.length>0;if(step===5)return form.diet!=="";if(step===6)return form.focus!=="";return true;};
  const nextStep=(cur)=>{
    if(cur===2&&!hasCycle) return 4; // skip cycle step for peri/meno
    if(cur===3&&hasCycle) return 4;
    return cur+1;
  };
  const backStep=(cur)=>{
    if(cur===4&&!hasCycle) return 2;
    return cur-1;
  };
  const totalSteps=hasCycle?6:5;
  const stepNum=(s)=>{if(s<=2)return s;if(s===3)return 3;if(s===4)return hasCycle?4:3;if(s===5)return hasCycle?5:4;if(s===6)return hasCycle?6:5;return totalSteps;};
  const prog=step<=0?0:step>=7?100:Math.round((stepNum(step)/totalSteps)*100);
  const td=new Date().toISOString().split("T")[0];
  const sc=stageColor(stage||"reproductive");

  const content=()=>{switch(step){
    case 0:return <div style={{textAlign:"center"}}>
      <div style={{fontSize:54,marginBottom:20}}>🌸</div>
      <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(32px,7vw,50px)",fontWeight:300,lineHeight:1.1,background:"linear-gradient(135deg,#fda4d4,#c084fc,#93c5fd)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:18}}>Maia</h1>
      <p style={{fontSize:15,color:"rgba(210,185,255,.6)",lineHeight:1.8,marginBottom:10}}>Your cycle, understood.</p>
      <p style={{fontSize:13,color:"rgba(210,185,255,.45)",lineHeight:1.7,marginBottom:28,maxWidth:340,margin:"0 auto 28px"}}>Personalised hormone tracking, mood forecasts & nutrition for every stage of a woman's life — reproductive years, PCOS, endometriosis, perimenopause & menopause.</p>
      <button onClick={()=>go(1)} style={{...bS("#c084fc"),width:"100%"}}>Begin →</button>
      <p style={{marginTop:14,fontSize:11,color:"rgba(200,175,255,.25)"}}>~90 seconds · Completely private · Saves automatically</p>
    </div>;
    case 1:return <div>
      <OHd t="Where are you in your journey?" s="Maia adapts everything — graph, meals, mood map, and advice — to your life stage"/>
      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
        {LIFE_STAGES.map(ls=>{const sel=stage===ls.id;return<button key={ls.id} onClick={()=>set("lifeStage",ls.id)} style={{padding:"15px 18px",borderRadius:14,background:sel?`${ls.color}18`:"rgba(255,255,255,.04)",border:`1px solid ${sel?ls.color+"50":"rgba(200,160,255,.1)"}`,display:"flex",alignItems:"center",gap:14,color:sel?ls.color:"rgba(200,180,255,.55)",fontFamily:G.font,textAlign:"left",cursor:"pointer"}}>
          <span style={{fontSize:26}}>{ls.icon}</span>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,marginBottom:2}}>{ls.label}</div><div style={{fontSize:12,opacity:.7}}>{ls.sub}</div></div>
          {sel&&<span style={{color:ls.color,fontSize:16}}>✓</span>}
        </button>;})}
      </div>
      <ONv back={()=>go(0)} next={()=>go(2)} ok={ok()}/>
    </div>;
    case 2:return <div>
      <OHd t="What should we call you?" s={stage?`${LIFE_STAGES.find(s=>s.id===stage)?.icon} ${LIFE_STAGES.find(s=>s.id===stage)?.label} · personalised for you`:""}/>
      <input autoFocus value={form.name} onChange={e=>set("name",e.target.value)} onKeyDown={e=>e.key==="Enter"&&ok()&&go(nextStep(2))} placeholder="Your name…" style={iS}/>
      <ONv back={()=>go(1)} next={()=>go(nextStep(2))} ok={ok()}/>
    </div>;
    case 3:return <div>
      {stage==="pcos"&&<OHd t="Your PCOS cycle" s="PCOS cycles are often longer or irregular — tell us what's typical for you"/>}
      {stage==="endo"&&<OHd t="Your cycle" s="Endo often affects a regular cycle — when did your last period start?"/>}
      {stage==="reproductive"&&<OHd t="When did your last period start?" s={`Hi ${form.name} 🌸 — this is Day 1 of your current cycle`}/>}
      <input type="date" value={form.cycleDate} max={td} onChange={e=>set("cycleDate",e.target.value)} style={{...iS,fontFamily:G.font}}/>
      {form.cycleDate&&<div style={{padding:"11px 15px",background:`${sc}15`,border:`1px solid ${sc}30`,borderRadius:12,fontSize:13,color:"rgba(210,185,255,.75)",marginBottom:12}}>📅 <strong style={{color:sc}}>{fmtFull(form.cycleDate)}</strong></div>}
      {(stage==="pcos"||stage==="reproductive")&&<div style={{marginTop:8}}>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
          {[{v:false,icon:"🌙",l:"Regular-ish",s:"Fairly predictable (±4 days)"},{v:true,icon:"🌊",l:"Irregular / unpredictable",s:"Varies a lot — hard to know when it'll come"}].map(o=>{const sel=form.isIrregular===o.v;return<button key={String(o.v)} onClick={()=>set("isIrregular",o.v)} style={{padding:"13px 16px",borderRadius:14,background:sel?`${sc}15`:"rgba(255,255,255,.04)",border:`1px solid ${sel?sc+"45":"rgba(200,160,255,.1)"}`,display:"flex",alignItems:"center",gap:12,color:sel?sc:"rgba(200,180,255,.55)",fontFamily:G.font,textAlign:"left",cursor:"pointer"}}>
            <span style={{fontSize:22}}>{o.icon}</span><div><div style={{fontSize:14,fontWeight:600,marginBottom:1}}>{o.l}</div><div style={{fontSize:12,opacity:.7}}>{o.s}</div></div>
            {sel&&<span style={{marginLeft:"auto",color:sc,fontSize:14}}>✓</span>}
          </button>;})}
        </div>
        {!form.isIrregular?<div>
          <div style={{textAlign:"center",marginBottom:10}}><div style={{fontSize:56,fontFamily:"'Cormorant Garamond',serif",fontWeight:300,background:`linear-gradient(135deg,#fda4d4,${sc})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>{form.cycleLen}</div><div style={{fontSize:13,color:"rgba(200,175,255,.5)",marginTop:2}}>days average</div></div>
          <p style={{fontSize:13,color:"rgba(200,175,255,.65)",textAlign:"center",marginBottom:10,lineHeight:1.5}}>Drag the slider below to set your average cycle length — counting from the first day of one period to the first day of the next.</p>
          <input type="range" min={stage==="pcos"?25:21} max={stage==="pcos"?60:40} value={form.cycleLen} onChange={e=>set("cycleLen",+e.target.value)} style={{width:"100%",accentColor:sc,marginBottom:8,cursor:"pointer",height:6}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"rgba(200,175,255,.5)"}}><span>{stage==="pcos"?"25 days":"21 days"}</span><span style={{color:sc,fontWeight:600}}>↑ drag to set</span><span>{stage==="pcos"?"60 days":"40 days"}</span></div>
        </div>:<div style={{padding:"14px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(200,160,255,.12)",borderRadius:14}}>
          <div style={{fontSize:12,color:"rgba(200,180,255,.6)",marginBottom:10}}>What range does your cycle fall in?</div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{flex:1}}><div style={{fontSize:10,color:"rgba(200,175,255,.4)",marginBottom:4}}>SHORTEST</div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20,fontWeight:700,color:sc,minWidth:28}}>{form.shortCycle}</span><input type="range" min={18} max={45} value={form.shortCycle} onChange={e=>set("shortCycle",Math.min(+e.target.value,form.longCycle-3))} style={{flex:1,accentColor:sc,cursor:"pointer"}}/></div></div>
            <span style={{color:"rgba(200,175,255,.3)",fontSize:16}}>→</span>
            <div style={{flex:1}}><div style={{fontSize:10,color:"rgba(200,175,255,.4)",marginBottom:4}}>LONGEST</div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20,fontWeight:700,color:"#fbbf24",minWidth:28}}>{form.longCycle}</span><input type="range" min={25} max={90} value={form.longCycle} onChange={e=>set("longCycle",Math.max(+e.target.value,form.shortCycle+3))} style={{flex:1,accentColor:"#fbbf24",cursor:"pointer"}}/></div></div>
          </div>
          <div style={{marginTop:8,fontSize:11,color:`${sc}`,opacity:.7}}>📐 Average: {Math.round(((+form.shortCycle)+(+form.longCycle))/2)} days</div>
        </div>}
        <div style={{marginTop:12}}>
          <div style={{fontSize:11,color:"rgba(200,175,255,.4)",marginBottom:8}}>Period duration</div>
          <div style={{display:"flex",gap:6,justifyContent:"center"}}>
            {[2,3,4,5,6,7,8].map(n=><button key={n} onClick={()=>set("periodLen",n)} style={{width:42,height:42,borderRadius:10,background:form.periodLen===n?"rgba(255,107,138,.22)":"rgba(255,255,255,.05)",border:`1px solid ${form.periodLen===n?"rgba(255,107,138,.55)":"rgba(200,160,255,.1)"}`,color:form.periodLen===n?"#ff8fa3":"rgba(200,180,255,.5)",fontSize:15,fontWeight:600,fontFamily:G.font,cursor:"pointer"}}>{n}</button>)}
          </div>
        </div>
      </div>}
      {(stage==="peri")&&<div style={{marginTop:8}}>
        <div style={{fontSize:12,color:"rgba(200,180,255,.6)",marginBottom:10}}>Where are you in perimenopause?</div>
        {[{v:"still_cycling",l:"Still getting periods",s:"Irregular or changing cycles"},{v:"rare_cycles",l:"Very infrequent periods",s:"Every few months or less"},{v:"almost_meno",l:"Almost there",s:"No period in 6–11 months"}].map(o=>{const sel=form.periStage===o.v;return<button key={o.v} onClick={()=>set("periStage",o.v)} style={{padding:"11px 14px",borderRadius:12,background:sel?`${sc}15`:"rgba(255,255,255,.04)",border:`1px solid ${sel?sc+"45":"rgba(200,160,255,.1)"}`,display:"flex",alignItems:"center",gap:10,color:sel?sc:"rgba(200,180,255,.55)",fontFamily:G.font,textAlign:"left",cursor:"pointer",width:"100%",marginBottom:7}}>
          <div><div style={{fontSize:13,fontWeight:600,marginBottom:1}}>{o.l}</div><div style={{fontSize:11,opacity:.7}}>{o.s}</div></div>{sel&&<span style={{marginLeft:"auto",color:sc}}>✓</span>}
        </button>;})}
      </div>}
      <ONv back={()=>go(backStep(3))} next={()=>go(nextStep(3))} ok={ok()}/>
    </div>;
    case 4:return <div>
      <OHd t="What usually bothers you most?" s={`${LIFE_STAGES.find(s=>s.id===stage)?.label} — select all that apply`}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {sympList.map(s=>{const sel=form.symptoms.includes(s.id);return<button key={s.id} onClick={()=>togS(s.id)} style={{padding:"13px 12px",borderRadius:14,background:sel?`${sc}18`:"rgba(255,255,255,.04)",border:`1px solid ${sel?sc+"50":"rgba(200,160,255,.1)"}`,display:"flex",alignItems:"center",gap:9,color:sel?`${sc}`:"rgba(200,180,255,.5)",fontSize:13,fontFamily:G.font,textAlign:"left",cursor:"pointer"}}>
          <span style={{fontSize:18}}>{s.icon}</span>{s.label}{sel&&<span style={{marginLeft:"auto",fontSize:11}}>✓</span>}
        </button>;})}
      </div>
      <ONv back={()=>go(backStep(4))} next={()=>go(5)} ok={ok()} label={`Continue (${form.symptoms.length} selected)`}/>
    </div>;
    case 5:return <div>
      <OHd t="How do you eat?" s="So your meal suggestions are actually usable"/>
      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
        {DIET_OPTIONS.map(d=>{const sel=d.id===form.diet;return<button key={d.id} onClick={()=>set("diet",d.id)} style={{padding:"15px 18px",borderRadius:14,background:sel?"rgba(52,211,153,.14)":"rgba(255,255,255,.04)",border:`1px solid ${sel?"rgba(52,211,153,.45)":"rgba(200,160,255,.1)"}`,display:"flex",alignItems:"center",gap:14,color:sel?"#6ee7b7":"rgba(200,180,255,.55)",fontFamily:G.font,textAlign:"left",cursor:"pointer"}}>
          <span style={{fontSize:24}}>{d.icon}</span><div><div style={{fontSize:15,fontWeight:600,marginBottom:2}}>{d.label}</div><div style={{fontSize:12,opacity:.7}}>{d.sub}</div></div>
          {sel&&<span style={{marginLeft:"auto",color:"#34d399",fontSize:16}}>✓</span>}
        </button>;})}
      </div>
      <ONv back={()=>go(backStep(5))} next={()=>go(6)} ok={ok()}/>
    </div>;
    case 6:return <div>
      <OHd t="What do you most want help with?" s="We'll lead your dashboard with this"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:20}}>
        {FOCUS_OPTIONS.map(f=>{const sel=f.id===form.focus;return<button key={f.id} onClick={()=>set("focus",f.id)} style={{padding:"16px 14px",borderRadius:14,background:sel?"rgba(251,191,36,.14)":"rgba(255,255,255,.04)",border:`1px solid ${sel?"rgba(251,191,36,.45)":"rgba(200,160,255,.1)"}`,color:sel?"#fde68a":"rgba(200,180,255,.5)",fontFamily:G.font,textAlign:"left",cursor:"pointer",display:"flex",flexDirection:"column",gap:5}}>
          <span style={{fontSize:24}}>{f.icon}</span><div style={{fontSize:14,fontWeight:600}}>{f.label}</div><div style={{fontSize:11,opacity:.6,lineHeight:1.4}}>{f.sub}</div>{sel&&<div style={{fontSize:11,color:"#fbbf24"}}>✓ Selected</div>}
        </button>;})}
      </div>
      <ONv back={()=>go(5)} next={()=>go(7)} ok={ok()} label="Build my dashboard →"/>
    </div>;
    case 7:return <div style={{textAlign:"center"}}>
      <div style={{fontSize:52,marginBottom:18}}>✨</div>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(26px,5vw,38px)",fontWeight:300,lineHeight:1.2,background:"linear-gradient(135deg,#fda4d4,#c084fc,#93c5fd)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:16}}>{form.name}, your<br/>map is ready 🌸</h2>
      <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(200,160,255,.13)",borderRadius:18,padding:20,marginBottom:22,textAlign:"left"}}>
        {[{l:"Life Stage",v:`${LIFE_STAGES.find(s=>s.id===stage)?.icon} ${LIFE_STAGES.find(s=>s.id===stage)?.label}`,c:sc},{l:"Period started",v:form.cycleDate?fmtFull(form.cycleDate):"N/A",c:"#ff8fa3"},{l:"Cycle",v:hasCycle?(form.isIrregular?`Irregular · ${form.shortCycle}–${form.longCycle} days`:`Regular · ${form.cycleLen} days`):"Not tracking",c:"#c084fc"},{l:"Top concerns",v:form.symptoms.map(s=>sympList.find(x=>x.id===s)?.label).join(", ")||"—",c:"#818cf8"},{l:"Diet",v:DIET_OPTIONS.find(d=>d.id===form.diet)?.label||"—",c:"#34d399"},{l:"Focus",v:FOCUS_OPTIONS.find(f=>f.id===form.focus)?.label||"—",c:"#fbbf24"}].map(r=>(
          <div key={r.l} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:9}}><span style={{fontSize:13,color:"rgba(200,180,255,.45)"}}>{r.l}</span><span style={{fontSize:13,color:r.c,fontWeight:600,textAlign:"right",maxWidth:"60%"}}>{r.v}</span></div>
        ))}
      </div>
      <button onClick={()=>onComplete(form)} style={{...bS(sc),width:"100%"}}>Open my dashboard →</button>
      <button onClick={()=>go(1)} style={{display:"block",margin:"12px auto 0",fontSize:12,color:"rgba(200,175,255,.35)",background:"none",border:"none",fontFamily:G.font,cursor:"pointer"}}>← Edit my details</button>
    </div>;
    default:return null;
  }};

  return <div style={{minHeight:"100vh",background:G.bg,fontFamily:G.font,color:"#ede0ff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",position:"relative",overflow:"hidden"}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      @keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes dn{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      .card-in{animation:fadeUp .35s ease both;}
      input:focus{outline:none;border-color:rgba(192,132,252,.6)!important;box-shadow:0 0 0 3px rgba(192,132,252,.12);}
      input::placeholder{color:rgba(200,175,255,.35);}
      input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.6) sepia(1) hue-rotate(240deg);}
      textarea:focus{outline:none;border-color:rgba(192,132,252,.6)!important;}
      textarea::placeholder{color:rgba(200,175,255,.35);}
      ::-webkit-scrollbar{width:3px;height:3px;} ::-webkit-scrollbar-thumb{background:rgba(200,150,255,.3);border-radius:2px;}
    `}</style>
    {[{w:500,h:500,t:"-15%",l:"-10%",c:"rgba(160,80,220,.09)"},{w:350,h:350,b:"-10%",r:"-8%",c:"rgba(80,130,255,.07)"}].map((o,i)=><div key={i} style={{position:"fixed",width:o.w,height:o.h,borderRadius:"50%",background:o.c,top:o.t,left:o.l,bottom:o.b,right:o.r,filter:"blur(70px)",pointerEvents:"none",zIndex:0}}/>)}
    {step>0&&step<7&&<><div style={{position:"fixed",top:0,left:0,right:0,height:2,background:"rgba(255,255,255,.05)",zIndex:10}}><div style={{height:"100%",width:`${prog}%`,background:`linear-gradient(90deg,${sc},#f472b6)`,transition:"width .4s ease"}}/></div><div style={{position:"fixed",top:16,right:20,fontSize:11,color:"rgba(200,175,255,.3)",zIndex:10}}>{stepNum(step)} / {totalSteps}</div></>}
    <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:480,animation:anim?(dir>=0?"up .28s ease":"dn .28s ease"):"none"}}>{content()}</div>
  </div>;
}
function OHd({t,s}){return <div style={{marginBottom:22}}><h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(22px,4vw,32px)",fontWeight:300,background:"linear-gradient(135deg,#fda4d4,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.2,marginBottom:8}}>{t}</h2>{s&&<p style={{fontSize:14,color:"rgba(200,180,255,.55)",lineHeight:1.6}}>{s}</p>}</div>;}
function ONv({back,next,ok,label="Continue →"}){return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16,gap:12}}><button onClick={back} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(200,160,255,.3)",borderRadius:14,color:"rgba(230,210,255,.85)",fontSize:15,fontFamily:G.font,cursor:"pointer",padding:"13px 22px",fontWeight:500,transition:"all .2s"}}>← Back</button><button disabled={!ok} onClick={next} style={bS("#c084fc",!ok)}>{label}</button></div>;}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════
function Dashboard({profile,onReset}){
  const [tab,sTab]=useState(0);
  const [moodLog,sMoodLog]=useState({});
  const [painLog,sPainLog]=useState({});
  const [cycleHistory,setCycleHistory]=useState([]);

  const stage=profile.lifeStage||"reproductive";
  const sc=stageColor(stage);
  const hasCycle=["reproductive","pcos","endo"].includes(stage);
  const curDay=hasCycle?computeDay(profile):null;
  const phId=hasCycle?getPhase(curDay,profile):null;
  const ph=phId?PHASES[phId]:null;
  const meals=getMeals(phId||"menstrual",profile.diet,stage);
  const ms=hasCycle?getMilestones(profile):[];
  const stageInfo=LIFE_STAGES.find(s=>s.id===stage);

  useEffect(()=>{
    try{const m=localStorage.getItem(`maia_mood_${profile.name}`);if(m)sMoodLog(JSON.parse(m));}catch{}
    try{const p=localStorage.getItem(`maia_pain_${profile.name}`);if(p)sPainLog(JSON.parse(p));}catch{}
    try{const h=localStorage.getItem(`maia_history_${profile.name}`);if(h)setCycleHistory(JSON.parse(h));}catch{}
  },[profile.name]);

  const TABS=["Today","My Graph","Mood","Nourish",...(stage==="endo"?["Pain Log"]:[]),...(hasCycle?["Prepare"]:[]),hasCycle?"My Cycle":"Wellness"];

  return <div style={{minHeight:"100vh",background:G.bg,fontFamily:G.font,color:"#ede0ff"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}.card-in{animation:fadeUp .35s ease both;}.dtab{transition:all .2s ease;cursor:pointer;white-space:nowrap;}.dtab:hover{opacity:.8;}textarea:focus{outline:none;}textarea::placeholder{color:rgba(200,175,255,.35);} ::-webkit-scrollbar{width:3px;height:3px;} ::-webkit-scrollbar-thumb{background:rgba(200,150,255,.25);border-radius:2px;}`}</style>
    {[{w:500,h:500,t:"-15%",l:"-10%",c:"rgba(160,80,220,.08)"},{w:350,h:350,b:"-10%",r:"-8%",c:"rgba(80,130,255,.07)"}].map((o,i)=><div key={i} style={{position:"fixed",width:o.w,height:o.h,borderRadius:"50%",background:o.c,top:o.t,left:o.l,bottom:o.b,right:o.r,filter:"blur(70px)",pointerEvents:"none",zIndex:0}}/>)}

    <div style={{position:"relative",zIndex:1,maxWidth:780,margin:"0 auto",padding:"28px 18px 80px"}}>
      {/* Header */}
      <div style={{marginBottom:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,marginBottom:12}}>
          <div><div style={{fontSize:11,letterSpacing:".3em",color:"rgba(200,160,255,.4)",textTransform:"uppercase",marginBottom:6}}>Welcome back</div><h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(24px,4vw,38px)",fontWeight:300,background:"linear-gradient(135deg,#fda4d4,#c084fc,#93c5fd)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.15}}>{profile.name}'s Maia</h1></div>
          <button onClick={onReset} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(200,160,255,.15)",borderRadius:10,padding:"7px 14px",fontSize:12,color:"rgba(200,175,255,.4)",fontFamily:G.font,cursor:"pointer"}}>✦ New profile</button>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <Chip color={sc} icon={stageInfo?.icon} label={stageInfo?.label}/>
          {ph&&<Chip color={ph.color} icon={ph.icon} label={`${ph.name} · Day ${curDay}`}/>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:22,paddingBottom:4}}>
        {TABS.map((t,i)=><button key={i} className="dtab" onClick={()=>sTab(i)} style={{background:tab===i?`${sc}22`:"rgba(255,255,255,.04)",border:`1px solid ${tab===i?sc+"55":"rgba(200,160,255,.12)"}`,borderRadius:20,padding:"8px 16px",fontSize:13,color:tab===i?sc:"rgba(200,175,255,.45)",fontFamily:G.font}}>{t}</button>)}
      </div>

      {/* TAB 0: TODAY */}
      {tab===0&&<div style={{display:"flex",flexDirection:"column",gap:14}} className="card-in">
        {/* Stage hero */}
        <div style={{...cS(sc),background:`linear-gradient(135deg,${sc}12,rgba(255,255,255,.02))`,padding:24}}>
          <div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:180}}>
              <div style={{fontSize:11,color:sc,letterSpacing:".2em",textTransform:"uppercase",marginBottom:6}}>{stageInfo?.icon} {stageInfo?.label}</div>
              {ph&&<><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#f0e0ff",marginBottom:6}}>{ph.archetype} · Day {curDay}</div><div style={{fontSize:13,color:"rgba(210,190,255,.65)",marginBottom:8}}>Inner {ph.season} · {phaseLabel(profile,phId)}</div><div style={{fontSize:14,color:"rgba(215,195,255,.75)",lineHeight:1.7}}>{ph.shortDesc}</div></>}
              {!hasCycle&&<div style={{fontSize:14,color:"rgba(215,195,255,.75)",lineHeight:1.7}}>{stage==="peri"?"Tracking your transition with personalised support.":"Focus on long-term wellbeing — bone health, heart, cognition."}</div>}
            </div>
            {hasCycle&&ms.slice(0,2).map((m,i)=><div key={i} style={{padding:"9px 14px",background:"rgba(0,0,0,.2)",borderRadius:12,border:`1px solid ${sc}20`,minWidth:130}}><div style={{fontSize:10,color:sc,marginBottom:2,textTransform:"uppercase",letterSpacing:".06em"}}>{m.label}</div><div style={{fontSize:13,color:"#e8d8ff",fontWeight:600}}>{m.date}</div><div style={{fontSize:11,color:"rgba(200,180,255,.4)"}}>{m.daysAway===0?"Today":`in ${m.daysAway} day${m.daysAway!==1?"s":""}`}</div></div>)}
          </div>
        </div>
        {/* Graph inline on Today for reproductive/pcos/endo */}
        {hasCycle&&<HGraph profile={profile}/>}
        {/* Symptom tips */}
        {profile.symptoms?.length>0&&<Card color={sc} title="🎯 Your Focus Areas Today" sub={`Personalised for your reported symptoms`}>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {profile.symptoms.map(sid=>{
              const allSymptoms=Object.values(SYMPTOMS_BY_STAGE).flat();
              const s=allSymptoms.find(x=>x.id===sid);
              const tips={cramps:"🌊 Heat pad + ginger tea + magnesium glycinate tonight",mood:"🌙 Honour the feeling without acting on it. Journal 5 mins.",bloating:"🌿 Avoid salt & carbonated drinks. Peppermint tea + gentle walk.",fatigue:"⚡ Iron-rich foods today. Short rest > pushing through.",hot_flash:"🌊 Cool cloth on wrists & neck. Peppermint tea. Avoid alcohol today.",night_sw:"🌙 Keep bedroom cool, light layers. Magnesium before bed.",brain_fog:"🔮 Short walk + omega-3 today. Most powerful tools for cognitive clarity.",pain_severe:"🌊 Heat + ibuprofen timed with meals. Turmeric supplement today.",acne:"🌸 Spearmint tea today — clinically shown to reduce androgens.",irregular:"〰 Log this cycle in your history. Patterns reveal themselves over time.",weight:"🌿 Protein-first every meal today — stabilises insulin and reduces cravings.",sleep:"✨ Magnesium glycinate 30 min before bed. Screens off by 9pm.",joint:"💫 Omega-3 + turmeric today. Gentle movement > rest for joint aches.",anxiety:"🔮 Box breathing: 4 in · 4 hold · 4 out · 4 hold. Repeat 4×.",headache:"💫 Hydrate first — magnesium deficiency is often the cause."};
              return<div key={sid} style={{padding:"10px 14px",background:`${sc}10`,border:`1px solid ${sc}25`,borderRadius:12,fontSize:13,color:"rgba(220,200,255,.8)",lineHeight:1.6,width:"100%"}}>{tips[sid]||`${s?.icon||"✨"} Support for ${s?.label||sid} is prioritised in your plan today.`}</div>;
            })}
          </div>
        </Card>}
        {/* Rituals */}
        <Card color={sc} title="✨ Today's Rituals">
          <div style={{display:"flex",flexDirection:"column",gap:7}}>{(RITUALS[phId]||RITUALS[stage]||RITUALS.luteal).map((r,i)=><div key={i} style={{padding:"9px 14px",background:"rgba(255,255,255,.04)",borderRadius:10,fontSize:13,color:"rgba(225,205,255,.8)"}}>{r}</div>)}</div>
        </Card>
      </div>}

      {/* TAB 1: MY GRAPH */}
      {tab===1&&<div style={{display:"flex",flexDirection:"column",gap:14}} className="card-in">
        <HGraph profile={profile}/>
        {["pcos","endo","peri","meno"].includes(stage)&&<StageInfoPanel stage={stage}/>}
        {!["pcos","endo","peri","meno"].includes(stage)&&<Card color="#818cf8" title="What each hormone does" sub="Your reference guide">
          {[{k:"estrogen",c:"#f472b6",d:"The feel-good hormone. Drives energy, mood, libido & skin glow."},{k:"progesterone",c:"#34d399",d:"The calming hormone. Rises after ovulation. When it drops, PMS begins."},{k:"lh",c:"#fbbf24",d:"Luteinizing Hormone — the ovulation trigger. Spikes dramatically at mid-cycle."},{k:"fsh",c:"#818cf8",d:"Follicle-Stimulating Hormone. Matures egg follicles. High FSH signals perimenopause."}].map(h=>(
            <div key={h.k} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 0",borderBottom:"1px solid rgba(200,160,255,.07)"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:h.c,marginTop:5,flexShrink:0,boxShadow:`0 0 8px ${h.c}`}}/>
              <div><div style={{fontSize:13,color:h.c,fontWeight:600,marginBottom:3}}>{["Estrogen","Progesterone","LH","FSH"].find((_,i)=>["estrogen","progesterone","lh","fsh"][i]===h.k)}</div><div style={{fontSize:13,color:"rgba(200,180,255,.6)",lineHeight:1.6}}>{h.d}</div></div>
            </div>
          ))}
        </Card>}
      </div>}

      {/* TAB 2: MOOD */}
      {tab===2&&<div style={{display:"flex",flexDirection:"column",gap:14}} className="card-in">
        <MoodLogger profile={profile} moodLog={moodLog} setMoodLog={sMoodLog}/>
        {hasCycle&&ph&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{padding:"14px 18px",background:"rgba(255,255,255,.03)",borderRadius:14,border:"1px solid rgba(200,160,255,.1)"}}><p style={{...G.body,fontSize:13}}>Your mood follows your hormones with remarkable consistency. The more you anticipate, the less you'll be blindsided.</p></div>
          {[phId,...Object.keys(PHASES).filter(pid=>pid!==phId)].map(pid=>{const p=PHASES[pid];const isCur=pid===phId;return<Card key={pid} color={p.color} title={`${p.icon} ${p.name}${isCur?" · Now":""}`} sub={phaseLabel(profile,pid)}>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>{MOOD_MAPS[pid].map((m,i)=><div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 12px",background:"rgba(255,255,255,.03)",borderRadius:10}}><span style={{fontSize:20,flexShrink:0}}>{m.icon}</span><div><div style={{fontSize:13,fontWeight:600,color:p.color,marginBottom:3}}>{m.days} — {m.mood}</div><div style={{fontSize:13,color:"rgba(210,190,255,.7)",lineHeight:1.6}}>{m.note}</div></div></div>)}</div>
            {isCur&&<div style={{marginTop:10,padding:"9px 13px",background:`${p.color}15`,borderRadius:10,fontSize:12,color:p.color,fontWeight:600}}>← You are here right now</div>}
          </Card>;})}
        </div>}
        {!hasCycle&&<Card color={sc} title={`${stageInfo?.icon} ${stageInfo?.label} — Mood Patterns`} sub="What to expect and why">
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {(stage==="peri"?[{icon:"🌊",t:"The Volatility Phase",n:"Erratic estrogen causes mood to swing unpredictably — from fine to tearful to irritable within hours. This is neurological, not psychological."},{icon:"🌙",t:"Progesterone Decline",n:"Lower progesterone means less GABA activity in the brain — the calming neurotransmitter. Anxiety, sleep disruption, and overwhelm are common."},{icon:"✨",t:"The Clear Days",n:"When estrogen is stable and relatively higher, you'll feel sharp, confident and yourself. These days exist — note when they happen."},{icon:"🔮",t:"Perimenopause Rage",n:"Real and underdiscussed. Estrogen fluctuation directly affects serotonin and dopamine. Not character — chemistry."}]:stage==="meno"?[{icon:"🌿",t:"The Settling",n:"Many women report feeling calmer post-menopause once the hormonal volatility stops. The storm often precedes a new kind of clarity."},{icon:"🌊",t:"Mood Challenges",n:"Low estrogen affects serotonin and dopamine. Depression, anxiety, and emotional flatness are real symptoms — not weakness."},{icon:"✨",t:"Cognitive Changes",n:"Brain fog and memory lapses are estrogen-related. They are temporary and manageable with sleep, omega-3, exercise, and sometimes HRT."},{icon:"💫",t:"Identity Shift",n:"Many women experience a meaningful shift in priorities, confidence, and self-knowledge. This chapter has its own power."}]:[]).map((m,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 12px",background:"rgba(255,255,255,.03)",borderRadius:10}}>
                <span style={{fontSize:20,flexShrink:0}}>{m.icon}</span>
                <div><div style={{fontSize:13,fontWeight:600,color:sc,marginBottom:3}}>{m.t}</div><div style={{fontSize:13,color:"rgba(210,190,255,.7)",lineHeight:1.6}}>{m.n}</div></div>
              </div>
            ))}
          </div>
        </Card>}
      </div>}

      {/* TAB 3: NOURISH */}
      {tab===3&&<div style={{display:"flex",flexDirection:"column",gap:14}} className="card-in">
        <div style={{padding:"14px 18px",background:"rgba(255,255,255,.03)",borderRadius:14,border:"1px solid rgba(200,160,255,.1)"}}><p style={{...G.body,fontSize:13}}>Personalised for your <strong style={{color:"#34d399"}}>{DIET_OPTIONS.find(d=>d.id===profile.diet)?.label||"diet"}</strong> and <strong style={{color:sc}}>{stageInfo?.label}</strong>.</p></div>
        {hasCycle?[phId,...Object.keys(PHASES).filter(pid=>pid!==phId)].map(pid=>{const p=PHASES[pid];const isCur=pid===phId;const m=getMeals(pid,profile.diet,stage);return<Card key={pid} color={p.color} title={`${p.icon} ${p.name}${isCur?" · Now":""}`} sub={`${phaseLabel(profile,pid)} · ${m.focus}`}>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>{[{label:"🌅 Breakfast",...m.breakfast},{label:"☀️ Lunch",...m.lunch},{label:"🌙 Dinner",...m.dinner}].map((meal,i)=><MealCard key={i} meal={meal} color={p.color}/>)}</div>
          <div style={{marginBottom:10}}><div style={{fontSize:11,color:"rgba(200,175,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Snacks</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{m.snacks?.map((s,i)=><span key={i} style={{padding:"4px 10px",background:`${p.color}12`,border:`1px solid ${p.color}25`,borderRadius:20,fontSize:12,color:"rgba(220,200,255,.7)"}}>{s}</span>)}</div></div>
          <div><div style={{fontSize:11,color:"rgba(255,107,138,.5)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Avoid</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{m.avoid?.map((a,i)=><span key={i} style={{padding:"4px 10px",background:"rgba(255,107,138,.07)",border:"1px solid rgba(255,107,138,.2)",borderRadius:20,fontSize:12,color:"rgba(255,150,170,.65)"}}>{a}</span>)}</div></div>
        </Card>;}):
        <Card color={sc} title={`${stageInfo?.icon} ${stageInfo?.label} Nutrition`} sub={meals.focus}>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>{[{label:"🌅 Breakfast",...meals.breakfast},{label:"☀️ Lunch",...meals.lunch},{label:"🌙 Dinner",...meals.dinner}].map((meal,i)=><MealCard key={i} meal={meal} color={sc}/>)}</div>
          <div style={{marginBottom:10}}><div style={{fontSize:11,color:"rgba(200,175,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Snacks</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{meals.snacks?.map((s,i)=><span key={i} style={{padding:"4px 10px",background:`${sc}12`,border:`1px solid ${sc}25`,borderRadius:20,fontSize:12,color:"rgba(220,200,255,.7)"}}>{s}</span>)}</div></div>
          <div><div style={{fontSize:11,color:"rgba(255,107,138,.5)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Avoid</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{meals.avoid?.map((a,i)=><span key={i} style={{padding:"4px 10px",background:"rgba(255,107,138,.07)",border:"1px solid rgba(255,107,138,.2)",borderRadius:20,fontSize:12,color:"rgba(255,150,170,.65)"}}>{a}</span>)}</div></div>
        </Card>}
      </div>}

      {/* TAB 4: PAIN LOG (endo only) */}
      {tab===4&&stage==="endo"&&<div style={{display:"flex",flexDirection:"column",gap:14}} className="card-in">
        <PainLogger profile={profile} painLog={painLog} setPainLog={sPainLog}/>
      </div>}

      {/* PREPARE TAB */}
      {tab===TABS.indexOf("Prepare")&&TABS.includes("Prepare")&&<div style={{display:"flex",flexDirection:"column",gap:14}} className="card-in">
        <div style={{padding:"14px 18px",background:"rgba(255,255,255,.03)",borderRadius:14,border:"1px solid rgba(200,160,255,.1)"}}><p style={{...G.body,fontSize:13}}>The best thing you can do is prepare for each transition before it arrives.</p></div>
        <Card color={ph?.color||sc} title="⏰ Your Upcoming Transitions">
          <div style={{display:"flex",flexDirection:"column",gap:9}}>{ms.map((m,i)=><div key={i} style={{display:"flex",gap:14,alignItems:"center",padding:"12px 14px",background:"rgba(255,255,255,.04)",borderRadius:12,borderLeft:`3px solid ${ph?.color||sc}50`}}><div style={{minWidth:50,textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:ph?.color||sc}}>{m.daysAway===0?"Now":m.daysAway}</div><div style={{fontSize:10,color:"rgba(200,175,255,.4)"}}>{m.daysAway===0?"today":"days"}</div></div><div><div style={{fontSize:14,color:"#e8d8ff",fontWeight:600,marginBottom:2}}>{m.label}</div><div style={{fontSize:12,color:"rgba(200,180,255,.5)"}}>{m.date}</div></div></div>)}</div>
        </Card>
      </div>}

      {/* MY CYCLE / WELLNESS TAB */}
      {tab===TABS.length-1&&<div style={{display:"flex",flexDirection:"column",gap:14}} className="card-in">
        {/* Profile */}
        <div style={{...cS(sc),background:`linear-gradient(135deg,${sc}10,rgba(255,255,255,.02))`}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#f0e0ff",marginBottom:16}}>{profile.name}'s Profile</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[{l:"Life Stage",v:`${stageInfo?.icon} ${stageInfo?.label}`,c:sc},{l:"Cycle",v:hasCycle?(profile.isIrregular?`${profile.shortCycle}–${profile.longCycle} days`:`${profile.cycleLen} days`):"Not tracking",c:"#c084fc"},{l:"Current Day",v:curDay?`Day ${curDay}`:"N/A",c:"#fbbf24"},{l:"Diet",v:DIET_OPTIONS.find(d=>d.id===profile.diet)?.label||"—",c:"#34d399"},{l:"Focus",v:FOCUS_OPTIONS.find(f=>f.id===profile.focus)?.label||"—",c:"#818cf8"},{l:"Symptoms tracked",v:`${profile.symptoms?.length||0} logged`,c:sc}].map(r=>(
              <div key={r.l} style={{padding:"11px 13px",background:"rgba(255,255,255,.04)",borderRadius:12}}><div style={{fontSize:11,color:"rgba(200,175,255,.4)",marginBottom:3,textTransform:"uppercase",letterSpacing:".05em"}}>{r.l}</div><div style={{fontSize:14,color:r.c,fontWeight:600}}>{r.v}</div></div>
            ))}
          </div>
        </div>
        {/* Cycle history */}
        {hasCycle&&<CycleHistory profile={profile} cycleHistory={cycleHistory} setCycleHistory={setCycleHistory}/>}
        {/* Phase calendar */}
        {hasCycle&&<Card color="#c084fc" title="📅 Your Phase Calendar" sub="This cycle">
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {Object.entries(PHASES).map(([pid,p])=>{const isCur=pid===phId;return<div key={pid} style={{display:"flex",gap:12,alignItems:"center",padding:"12px 14px",background:isCur?`${p.color}12`:"rgba(255,255,255,.03)",borderRadius:12,border:`1px solid ${isCur?p.color+"40":"rgba(200,160,255,.08)"}`}}>
              <span style={{fontSize:20}}>{p.icon}</span>
              <div style={{flex:1}}><div style={{fontSize:14,color:p.color,fontWeight:isCur?700:400,marginBottom:2}}>{p.name}{isCur&&<span style={{fontSize:11,marginLeft:8,background:`${p.color}20`,padding:"2px 8px",borderRadius:10}}>now</span>}</div><div style={{fontSize:12,color:"rgba(200,180,255,.5)"}}>{phaseLabel(profile,pid)}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:12,color:"rgba(200,180,255,.4)"}}>{p.archetype}</div></div>
            </div>;})}
          </div>
        </Card>}
        {/* Wellness goals for peri/meno */}
        {!hasCycle&&<Card color={sc} title={`${stageInfo?.icon} Wellness Priorities`} sub={`Evidence-based focus areas for ${stageInfo?.label}`}>
          {(stage==="meno"?["🦴 Bone density — weight training 3×/week + calcium 1200mg + D3 2000IU daily","❤️ Cardiovascular health — 150 min moderate exercise/week, Mediterranean diet","🧠 Cognitive function — omega-3, quality sleep, social connection, learning new skills","🌿 Symptom management — discuss HRT with your doctor; evidence is strong for most women","💊 Key supplements: Calcium, D3, Magnesium, Omega-3, Vitamin B12"]:(stage==="peri"?["🌙 Progesterone support first — magnesium, quality sleep, reduce alcohol","🦴 Start bone protection now — don't wait for menopause","🌿 Phytoestrogens daily — flaxseed, soy, legumes to buffer estrogen swings","💊 Discuss HRT early — progesterone-inclusive HRT has strong safety evidence","📓 Track your symptoms — perimenopause is often misdiagnosed as depression or anxiety"]:[]))
            .map((tip,i)=><div key={i} style={{display:"flex",gap:10,fontSize:13,color:"rgba(210,190,255,.75)",padding:"9px 0",borderBottom:i<4?"1px solid rgba(200,160,255,.07)":"none",lineHeight:1.6}}><span style={{color:sc,flexShrink:0}}>◦</span>{tip}</div>)}
        </Card>}
        <div style={{padding:"14px 18px",background:"rgba(255,255,255,.03)",borderRadius:14,border:"1px solid rgba(200,160,255,.1)",textAlign:"center"}}>
          <p style={{fontSize:13,color:"rgba(200,175,255,.4)",lineHeight:1.7}}>Your profile is saved in this browser. Return anytime.</p>
          <button onClick={onReset} style={{marginTop:12,...bS("#ff6b8a"),fontSize:13,padding:"10px 20px"}}>Start fresh</button>
        </div>
      </div>}
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════
//  ROOT
// ═══════════════════════════════════════════════════════════
const SK="maia_v2_profile";
export default function App(){
  const [profile,sProfile]=useState(null),[loading,sLoading]=useState(true);
  useEffect(()=>{try{const s=localStorage.getItem(SK);if(s)sProfile(JSON.parse(s));}catch{} sLoading(false);},[]);
  const done=(f)=>{try{localStorage.setItem(SK,JSON.stringify(f));}catch{} sProfile(f);};
  const reset=()=>{try{localStorage.removeItem(SK);}catch{} sProfile(null);};
  if(loading) return <div style={{minHeight:"100vh",background:"#08040f",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:32}}>🌸</div></div>;
  return profile?<Dashboard profile={profile} onReset={reset}/>:<Onboarding onComplete={done}/>;
}

import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const MINT_PRICE_SOL   = 1;
const GOOGLE_SHEET_PUBLISHED = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQI1k_ALrpC5TowV2EiLqKQK7FPoME0IYIVQfvAno7P_HGMUkc7T6vz8EPrOSivMfTDnwa2xQ0uvBmT/pub";
const R2_BASE_URL      = "https://pub-3e06ecff65d04bde885d3d4485d0c630.r2.dev";
const SESSION_DURATION = 30 * 60 * 1000;
const ONE_OF_ONE_CATEGORY = "Special";
const ONE_OF_ONE_TRAIT    = "Ear";

// ═══════════════════════════════════════════════════════════════════════════════
// COLUMNS & STOP ORDER
// ═══════════════════════════════════════════════════════════════════════════════
const LEFT_COL    = ["Direction","Ghost 1","Head","Right Eye","Left Eye"];
const RIGHT_COL   = ["Base","Ghost 2","Mouth","Nose","Special"];
const STOP_ORDER  = ["Direction","Left Eye","Right Eye","Nose","Mouth","Head","Ghost 2","Ghost 1","Base","Special"];
const LAYER_ORDER = ["Base","Ghost 1","Ghost 2","Head","Mouth","Nose","Right Eye","Left Eye","Special"];
const SPECIAL_BLEND_MAP = {
  "Normal":     "normal",
  "Multiply":   "multiply",
  "Screen":     "screen",
  "Overlay":    "overlay",
  "Darken":     "darken",
  "Lighten":    "lighten",
  "Color Dodge":"color-dodge",
  "Color Burn": "color-burn",
  "Hard Light": "hard-light",
  "Soft Light": "soft-light",
  "Difference": "difference",
  "Exclusion":  "exclusion",
  "Hue":        "hue",
  "Saturation": "saturation",
  "Color":      "color",
  "Luminosity": "luminosity",
  "Ear":        "color-dodge",
};

const GHOST_LAYERS = ["Ghost 1","Ghost 2"];

// ═══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER TRAITS
// ═══════════════════════════════════════════════════════════════════════════════
const mk = (prefix, n) => Array.from({length:n},(_,i)=>`${prefix} ${String(i+1).padStart(2,"0")}`);
const DEFAULT_TRAITS = {
  Direction:   ["CENTER"],
  Base:        ["1636_Rembrandt_van_Rijn","1785_Philippe_Laurent_Roland","1796_Francisco_de_Goya_y_Lucientes","1825_Sarah_Goodridge","1855_Honore_Daumier","1860_James_McNeill_Whistler","1870_Marie_Bracquemond","1875_Kenyon_Cox","1907_Julio_Ruelas","1909_Hans_Thoma","1909_William_Merritt_Chase","1910_Umberto_Boccioni","1913_Anne_Goldthwaite","1917_Egon_Schiele","1918_Elihu_Vedder","1919_Enrico_Caruso","1919_Walter_Gramatte","1921_George_Wesley_Bellows","1921_Heinrich_Tischler","1922_Jerome_Myers","1922_Lovis_Corinth","1922_Walter_Gramatte","1922_Walter_Gramatte_2","1923_Ernst_Ludwig_Kirchner","1923_Walter_Gramatte","1926_Samuel_Jessurun_de_Mesquita","1928_Enrico_Glicenstein","1930_A_Stirling_Calder"],
  "Ghost 1":   ["1636_Rembrandt_van_Rijn","1785_Philippe_Laurent_Roland","1796_Francisco_de_Goya_y_Lucientes","1825_Sarah_Goodridge","1855_Honore_Daumier","1860_James_McNeill_Whistler","1870_Marie_Bracquemond","1875_Kenyon_Cox","1907_Julio_Ruelas","1909_Hans_Thoma","1909_William_Merritt_Chase","1910_Umberto_Boccioni","1913_Anne_Goldthwaite","1917_Egon_Schiele","1918_Elihu_Vedder","1919_Enrico_Caruso","1919_Walter_Gramatte","1921_George_Wesley_Bellows","1921_Heinrich_Tischler","1922_Jerome_Myers","1922_Lovis_Corinth","1922_Walter_Gramatte","1922_Walter_Gramatte_2","1923_Ernst_Ludwig_Kirchner","1923_Walter_Gramatte","1926_Samuel_Jessurun_de_Mesquita","1928_Enrico_Glicenstein","1930_A_Stirling_Calder"],
  "Ghost 2":   ["1636_Rembrandt_van_Rijn","1785_Philippe_Laurent_Roland","1796_Francisco_de_Goya_y_Lucientes","1825_Sarah_Goodridge","1855_Honore_Daumier","1860_James_McNeill_Whistler","1870_Marie_Bracquemond","1875_Kenyon_Cox","1907_Julio_Ruelas","1909_Hans_Thoma","1909_William_Merritt_Chase","1910_Umberto_Boccioni","1913_Anne_Goldthwaite","1917_Egon_Schiele","1918_Elihu_Vedder","1919_Enrico_Caruso","1919_Walter_Gramatte","1921_George_Wesley_Bellows","1921_Heinrich_Tischler","1922_Jerome_Myers","1922_Lovis_Corinth","1922_Walter_Gramatte","1922_Walter_Gramatte_2","1923_Ernst_Ludwig_Kirchner","1923_Walter_Gramatte","1926_Samuel_Jessurun_de_Mesquita","1928_Enrico_Glicenstein","1930_A_Stirling_Calder"],
  Head:        ["1636_Rembrandt_van_Rijn_head","1785_Philippe_Laurent_Roland_head","1796_Francisco_de_Goya_y_Lucientes_head","1825_Sarah_Goodridge_head","1855_Honore_Daumier_head","1860_James_McNeill_Whistler_head","1870_Marie_Bracquemond_head","1875_Kenyon_Cox_head","1907_Julio_Ruelas_head","1909_Hans_Thoma_head","1909_William_Merritt_Chase_head","1910_Umberto_Boccioni_head","1913_Anne_Goldthwaite_head","1917_Egon_Schiele_head","1918_Elihu_Vedder_head","1919_Enrico_Caruso_head","1919_Walter_Gramatte_head","1921_George_Wesley_Bellows_head","1921_Heinrich_Tischler_head","1922_Jerome_Myers_head","1922_Lovis_Corinth_head","1922_Walter_Gramatte_head","1922_Walter_Gramatte_2_head","1923_Ernst_Ludwig_Kirchner_head","1923_Walter_Gramatte_head","1926_Samuel_Jessurun_de_Mesquita_head","1928_Enrico_Glicenstein_head","1930_A_Stirling_Calder_head"],
  "Right Eye": ["1636_Rembrandt_van_Rijn_r_eye","1785_Philippe_Laurent_Roland_r_eye","1796_Francisco_de_Goya_y_Lucientes_r_eye","1825_Sarah_Goodridge_r_eye","1855_Honore_Daumier_r_eye","1860_James_McNeill_Whistler_r_eye","1870_Marie_Bracquemond_r_eye","1875_Kenyon_Cox_r_eye","1907_Julio_Ruelas_r_eye","1909_Hans_Thoma_r_eye","1909_William_Merritt_Chase_r_eye","1910_Umberto_Boccioni_r_eye","1913_Anne_Goldthwaite_r_eye","1917_Egon_Schiele_r_eye","1918_Elihu_Vedder_r_eye","1919_Enrico_Caruso_r_eye","1919_Walter_Gramatte_r_eye","1921_George_Wesley_Bellows_r_eye","1921_Heinrich_Tischler_r_eye","1922_Jerome_Myers_r_eye","1922_Lovis_Corinth_r_eye","1922_Walter_Gramatte_r_eye","1922_Walter_Gramatte_2_r_eye","1923_Ernst_Ludwig_Kirchner_r_eye","1923_Walter_Gramatte_r_eye","1926_Samuel_Jessurun_de_Mesquita_r_eye","1928_Enrico_Glicenstein_r_eye","1930_A_Stirling_Calder_r_eye"],
  "Left Eye":  ["1636_Rembrandt_van_Rijn_l_eye","1785_Philippe_Laurent_Roland_l_eye","1796_Francisco_de_Goya_y_Lucientes_l_eye","1825_Sarah_Goodridge_l_eye","1855_Honore_Daumier_l_eye","1860_James_McNeill_Whistler_l_eye","1870_Marie_Bracquemond_l_eye","1875_Kenyon_Cox_l_eye","1907_Julio_Ruelas_l_eye","1909_Hans_Thoma_l_eye","1909_William_Merritt_Chase_l_eye","1910_Umberto_Boccioni_l_eye","1913_Anne_Goldthwaite_l_eye","1917_Egon_Schiele_l_eye","1918_Elihu_Vedder_l_eye","1919_Enrico_Caruso_l_eye","1919_Walter_Gramatte_l_eye","1921_George_Wesley_Bellows_l_eye","1921_Heinrich_Tischler_l_eye","1922_Jerome_Myers_l_eye","1922_Lovis_Corinth_l_eye","1922_Walter_Gramatte_l_eye","1922_Walter_Gramatte_2_l_eye","1923_Ernst_Ludwig_Kirchner_l_eye","1923_Walter_Gramatte_l_eye","1926_Samuel_Jessurun_de_Mesquita_l_eye","1928_Enrico_Glicenstein_l_eye","1930_A_Stirling_Calder_l_eye"],
  Mouth:       ["1636_Rembrandt_van_Rijn_jaw","1785_Philippe_Laurent_Roland_jaw","1796_Francisco_de_Goya_y_Lucientes_jaw","1825_Sarah_Goodridge_jaw","1855_Honore_Daumier_jaw","1860_James_McNeill_Whistler_jaw","1870_Marie_Bracquemond_jaw","1875_Kenyon_Cox_jaw","1907_Julio_Ruelas_jaw","1909_Hans_Thoma_jaw","1909_William_Merritt_Chase_jaw","1910_Umberto_Boccioni_jaw","1913_Anne_Goldthwaite_jaw","1917_Egon_Schiele_jaw","1918_Elihu_Vedder_jaw","1919_Enrico_Caruso_jaw","1919_Walter_Gramatte_jaw","1921_George_Wesley_Bellows_jaw","1921_Heinrich_Tischler_jaw","1922_Jerome_Myers_jaw","1922_Lovis_Corinth_jaw","1922_Walter_Gramatte_jaw","1922_Walter_Gramatte_2_jaw","1923_Ernst_Ludwig_Kirchner_jaw","1923_Walter_Gramatte_jaw","1926_Samuel_Jessurun_de_Mesquita_jaw","1928_Enrico_Glicenstein_jaw","1930_A_Stirling_Calder_jaw"],
  Nose:        ["1636_Rembrandt_van_Rijn_nose","1785_Philippe_Laurent_Roland_nose","1796_Francisco_de_Goya_y_Lucientes_nose","1825_Sarah_Goodridge_nose","1855_Honore_Daumier_nose","1860_James_McNeill_Whistler_nose","1870_Marie_Bracquemond_nose","1875_Kenyon_Cox_nose","1907_Julio_Ruelas_nose","1909_Hans_Thoma_nose","1909_William_Merritt_Chase_nose","1910_Umberto_Boccioni_nose","1913_Anne_Goldthwaite_nose","1917_Egon_Schiele_nose","1918_Elihu_Vedder_nose","1919_Enrico_Caruso_nose","1919_Walter_Gramatte_nose","1921_George_Wesley_Bellows_nose","1921_Heinrich_Tischler_nose","1922_Jerome_Myers_nose","1922_Lovis_Corinth_nose","1922_Walter_Gramatte_nose","1922_Walter_Gramatte_2_nose","1923_Ernst_Ludwig_Kirchner_nose","1923_Walter_Gramatte_nose","1926_Samuel_Jessurun_de_Mesquita_nose","1928_Enrico_Glicenstein_nose","1930_A_Stirling_Calder_nose"],
  Special:     ["Golden Hour","Silver Lining","Copper Tone","Oxide Bloom","Patina A","Patina B","Gilt Edge","Bronze Cast","Verdigris","Tarnish Light","Mercury Trace","Foil Flat","Lustre A","Lustre B","Sheen Cast","Chrome Veil","Iridescent A","Iridescent B","Metallic Haze","Burnish Soft","Leaf Gold","Leaf Silver","Luminous A","Luminous B","Glow Cast","Radiant Trace","Bright Field","Warm Bloom","Cool Sheen","Ear"],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE SHEETS
// ═══════════════════════════════════════════════════════════════════════════════
function buildTraitPool(artists) {
  return {
    Base:        artists,
    "Ghost 1":   artists,
    "Ghost 2":   artists,
    Head:        artists.map(a => a + "_head"),
    "Right Eye": artists.map(a => a + "_r_eye"),
    "Left Eye":  artists.map(a => a + "_l_eye"),
    Mouth:       artists.map(a => a + "_jaw"),
    Nose:        artists.map(a => a + "_nose"),
  };
}

async function fetchTraitsFromSheet() {
  try {
    const res = await fetch(GOOGLE_SHEET_PUBLISHED + "?output=csv");
    const text = await res.text();
    const rows = text
      .split("\n")
      .map(r => r.replace(/[\r"]/g, "").trim())
      .filter(r => r.length > 0 && r[0] !== "<");

    // Column A = Center, Column B = Left (future: Column C = Right)
    const center = [];
    const left   = [];
    rows.forEach(row => {
      const cols = row.split(",").map(c => c.trim());
      if (cols[0] && cols[0].length > 3) center.push(cols[0]);
      if (cols[1] && cols[1].length > 3) left.push(cols[1]);
    });

    if (center.length < 2) return DEFAULT_TRAITS;
    console.log("Sheet OK — Center:", center.length, "Left:", left.length);

    const directions = left.length > 0 ? ["CENTER", "LEFT"] : ["CENTER"];
    return {
      Direction: directions,
      Special:   DEFAULT_TRAITS.Special,
      _pools: {
        CENTER: buildTraitPool(center),
        LEFT:   left.length > 0 ? buildTraitPool(left) : buildTraitPool(center),
      },
      // Default to CENTER pool so app works before direction is rolled
      ...buildTraitPool(center),
    };
  } catch(e) {
    console.error("Sheet failed:", e);
    return DEFAULT_TRAITS;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════════════
function deriveSessionAddress(seed) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789";
  let s = seed, out = "";
  for (let i = 0; i < 44; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    out += chars[Math.abs(s) % chars.length];
  }
  return out;
}
function formatValidUntil(expiry) {
  const d  = new Date(expiry);
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  const mo = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  const yy = String(d.getFullYear()).slice(2);
  return `${hh}:${mm} · ${mo}·${dd}·${yy}`;
}
function formatDateDisplay(d = new Date()) {
  const mo = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${mo} · ${dd} · ${d.getFullYear()}`;
}
function rollTraits(traits) {
  const t = {};
  // Roll Direction first
  const dirList = traits.Direction || ["CENTER"];
  const dirIdx = Math.floor(Math.random() * dirList.length);
  t["Direction"] = dirIdx;
  const dir = dirList[dirIdx];
  // Use the correct pool for this direction
  const pool = (traits._pools && traits._pools[dir]) ? traits._pools[dir] : traits;
  // Roll all other traits from the correct pool
  const cats = ["Base","Ghost 1","Ghost 2","Head","Right Eye","Left Eye","Mouth","Nose","Special"];
  cats.forEach(cat => {
    const list = pool[cat] || traits[cat] || [];
    if (!list || list.length === 0) return;
    t[cat] = Math.floor(Math.random() * list.length);
  });
  return t;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRAIT DISPLAY NAME — strips category suffix, replaces underscores with spaces
// e.g. "1636_Rembrandt_van_Rijn_head" → "1636 Rembrandt van Rijn"
// ═══════════════════════════════════════════════════════════════════════════════
const STRIP_SUFFIXES = ["_head","_r_eye","_l_eye","_r.eye","_l.eye","_jaw","_nose"];
function displayName(traitName) {
  if (!traitName) return "";
  let name = traitName;
  for (const s of STRIP_SUFFIXES) {
    if (name.endsWith(s)) { name = name.slice(0, -s.length); break; }
  }
  return name.replace(/_/g, " ");
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE URL — traitName is the full filename (minus .png) as stored in sheet
// ═══════════════════════════════════════════════════════════════════════════════
function imgUrl(category, traitName) {
  const folder = category.replace(/ /g, "%20"); const file = traitName.replace(/ /g, "_"); return `${R2_BASE_URL}/${folder}/${file}.png`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// html2canvas LOADER — loads once from CDN
// ═══════════════════════════════════════════════════════════════════════════════
let html2canvasPromise = null;
function loadHtml2Canvas() {
  if (html2canvasPromise) return html2canvasPromise;
  html2canvasPromise = new Promise((resolve, reject) => {
    if (window.html2canvas) { resolve(window.html2canvas); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.onload  = () => resolve(window.html2canvas);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return html2canvasPromise;
}

// ═══════════════════════════════════════════════════════════════════════════════
// QR CODE
// ═══════════════════════════════════════════════════════════════════════════════
function QRCode({ value, size = 180 }) {
  const cells = 21, cell = size / cells;
  const h = value.split("").reduce((a,c,i)=>a^(c.charCodeAt(0)<<(i%8)),0x5A3F1B);
  const mods = Array.from({length:cells},(_,r)=>Array.from({length:cells},(_,c)=>{
    const inF=(r<8&&c<8)||(r<8&&c>=cells-8)||(r>=cells-8&&c<8);
    if(inF){const lr=r<8?r:r-(cells-8),lc=c<8?c:c-(cells-8);if(lr===0||lr===6||lc===0||lc===6)return true;if(lr>=2&&lr<=4&&lc>=2&&lc<=4)return true;return false;}
    const n=(h^(r*31+c*17+r*c))&0xFFFF;return(n^(r*0x45+c*0x23))%3!==0;
  }));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:"block"}}>
      <rect width={size} height={size} fill="#EDEAE5"/>
      {mods.map((row,r)=>row.map((on,c)=>on?<rect key={`${r}-${c}`} x={c*cell} y={r*cell} width={cell} height={cell} fill="#1A1A18"/>:null))}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER LAYER VISUALS — replace with <img src={imgUrl(...)}> once R2 is set up
// ═══════════════════════════════════════════════════════════════════════════════
const LAYER_COLORS = {
  "Base":      i => `hsl(${40+i*4},${15+i%8}%,${82-i%6}%)`,
  "Ghost 1":   i => `hsla(${200+i*5},20%,80%,0.3)`,
  "Ghost 2":   i => `hsla(${220+i*5},15%,70%,0.3)`,
  "Head":      i => `hsl(${30+i*3},${20+i%5}%,${70-i%8}%)`,
  "Mouth":     i => `hsl(${10+i*6},${30+i%10}%,${60-i%5}%)`,
  "Nose":      i => `hsl(${25+i*4},${18+i%6}%,${65-i%4}%)`,
  "Right Eye": i => `hsl(${210+i*5},${25+i%8}%,${50-i%6}%)`,
  "Left Eye":  i => `hsl(${210+i*5},${25+i%8}%,${50-i%6}%)`,
  "Special":   i => `hsl(${45+i*8},${40+i%15}%,${60+i%10}%)`,
};
function PlaceholderLayer({ layer, traitName }) {
  const list  = DEFAULT_TRAITS[layer] || [];
  const idx   = Math.max(0, list.indexOf(traitName));
  const color = LAYER_COLORS[layer] ? LAYER_COLORS[layer](idx) : "#ccc";
  if (layer==="Head") return (
    <svg viewBox="0 0 400 400" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
      <ellipse cx="200" cy="210" rx="110" ry="125" fill={color}/>
    </svg>
  );
  if (layer==="Right Eye") return (
    <svg viewBox="0 0 400 400" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
      <ellipse cx="162" cy="190" rx="16" ry="11" fill={color}/>
      <ellipse cx="162" cy="190" rx="8"  ry="8"  fill="#2A2520"/>
    </svg>
  );
  if (layer==="Left Eye") return (
    <svg viewBox="0 0 400 400" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
      <ellipse cx="238" cy="190" rx="16" ry="11" fill={color}/>
      <ellipse cx="238" cy="190" rx="8"  ry="8"  fill="#2A2520"/>
    </svg>
  );
  if (layer==="Nose") return (
    <svg viewBox="0 0 400 400" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
      <ellipse cx="200" cy="222" rx="10" ry="7" fill={color}/>
    </svg>
  );
  if (layer==="Mouth") return (
    <svg viewBox="0 0 400 400" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
      <path d={`M 174 245 Q 200 ${258+idx%8} 226 245`} stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (layer==="Special") return (
    <svg viewBox="0 0 400 400" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
      <rect width="400" height="400" fill={color} opacity="0.12"/>
    </svg>
  );
  return <div style={{position:"absolute",inset:0,background:color,transition:"background 0.1s"}}/>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE COMPOSITE
// ═══════════════════════════════════════════════════════════════════════════════
function ImageComposite({ traits, spinning, stoppedCats, rolledTraits, cycleIndices }) {
  const CUTOUT_LAYERS = ["Ghost 1","Ghost 2","Head","Mouth","Nose","Right Eye","Left Eye"];
  return (
    <div style={{position:"absolute",inset:0,background:"#EDEAE5"}}>
      {LAYER_ORDER.map((layer,z) => {
        const list      = traits[layer] || [];
        const isStopped = !!stoppedCats[layer];
        const isGhost   = GHOST_LAYERS.includes(layer);
        const traitName = isStopped
          ? list[rolledTraits[layer] ?? 0]
          : spinning ? list[cycleIndices[layer] ?? 0] : null;
        const visible   = spinning || isStopped;
        const url       = traitName ? imgUrl(layer, traitName) : null;
        const isBase    = layer === "Base";
        const isCutout  = CUTOUT_LAYERS.includes(layer);
        if (!isBase && !isCutout) return null;
        return (
          <div key={layer} style={{
            position:"absolute",inset:0,
            opacity: visible ? (isBase ? 1 : isGhost ? 0.6 : 0.9) : 0,
            transition:"opacity 0.5s ease",
            zIndex: z+1,
          }}>
            {url && <img
              src={url}
              alt=""
              crossOrigin="anonymous"
              style={{
                width:"100%",height:"100%",
                objectFit: isBase ? "cover" : "contain",
                display:"block",
              }}
            />}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FRAME
// ═══════════════════════════════════════════════════════════════════════════════
function Frame({
  frameRef, flow, sessionAddr,
  traits, spinning, stoppedCats, rolledTraits, cycleIndices,
  mintDate, isMinted, mintNumber, onSpin,
}) {
  const showQR    = ["paying","ready"].includes(flow);
  const showArt   = ["spinning","minting","minted","casino"].includes(flow);
  const isMinting = flow === "minting";

  return (
    <div ref={frameRef} style={{border:"1px solid #1A1A18",padding:"14px 14px 0",background:"#FAF9F7"}}>

      {/* Canvas */}
      <div style={{position:"relative",width:"100%",paddingBottom:"100%",background:"#EDEAE5",overflow:"hidden"}}>

        {/* QR */}
        <div style={{
          position:"absolute",inset:0,
          display:"flex",alignItems:"center",justifyContent:"center",
          opacity: showQR?1:0,
          transition:"opacity 0.6s ease",
          zIndex:30,background:showQR?"#EDEAE5":"#000",
          pointerEvents:showQR?"all":"none",
        }}>
          <QRCode value={`solana:${sessionAddr}?amount=${MINT_PRICE_SOL}&label=Public+Facing`} size={180}/>
        </div>

        {/* SPIN overlay — appears on top of QR after payment confirmed */}
        {flow==="ready" && (
          <div style={{
            position:"absolute",inset:0,zIndex:35,
            display:"flex",alignItems:"center",justifyContent:"center",
            background:"#1A1A18",
            cursor:"pointer",
          }} onClick={onSpin}>
            <span style={{
              color:"#FAF9F7",
              fontSize:11,letterSpacing:6,
              textTransform:"uppercase",
              fontFamily:"'EB Garamond',Georgia,serif",
            }}>
                <span style={{display:"block",textAlign:"center",letterSpacing:6}}>C L I C K</span>
                <span style={{display:"block",textAlign:"center",letterSpacing:6}}>T O</span>
                <span style={{display:"block",textAlign:"center",letterSpacing:6}}>M I N T</span>
              </span>
          </div>
        )}

        {/* Artwork */}
        <div style={{
          position:"absolute",inset:0,
          opacity:showArt?1:0,
          transition:"opacity 0.6s ease",
          zIndex:10,
        }}>
          <ImageComposite
            traits={traits} spinning={spinning}
            stoppedCats={stoppedCats} rolledTraits={rolledTraits}
            cycleIndices={cycleIndices}
          />
        </div>



        {/* Minting overlay */}
        {isMinting && (
          <div style={{
            position:"absolute",inset:0,zIndex:40,
            display:"flex",alignItems:"center",justifyContent:"center",
            background:"rgba(250,249,247,0.65)",
            animation:"mintPulse 0.9s infinite",
          }}>
            <div style={{fontSize:9,letterSpacing:6,color:"#6B5020",textTransform:"uppercase",fontFamily:"'EB Garamond',Georgia,serif"}}>
              Minting
            </div>
          </div>
        )}
      </div>

      {/* Matte label — blank until minted, no wallet address */}

      <div style={{
        borderTop:"1px solid #E0DDD8",
        padding:"12px 4px 14px",
        minHeight:54,
        display:"flex",justifyContent:"space-between",alignItems:"flex-start",
      }}>
        <div style={{
          flex:1,
          opacity:isMinted?1:0,
          transform:isMinted?"translateY(0)":"translateY(4px)",
          transition:"opacity 0.9s ease 0.3s,transform 0.9s ease 0.3s",
        }}>
          <div style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:14,fontStyle:"italic",color:"#1A1A18",lineHeight:1.4}}>
            Public Facing: Test
          </div>
          <div style={{fontSize:8,letterSpacing:2,color:"#6A6A65",textTransform:"uppercase",marginTop:3,fontFamily:"'EB Garamond',Georgia,serif"}}>
            Lampwrecked 2026
          </div>
        </div>
        {/* Date */}
        <div style={{
          textAlign:"right",marginLeft:12,
          opacity:isMinted?1:0,
          animation:isMinted?"dateReveal 0.9s ease 0.7s forwards":"none",
        }}>
          <div style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:13,fontStyle:"italic",color:"#1A1A18"}}>
            {mintDate ? formatDateDisplay(mintDate) : ""}
          </div>
          <div style={{fontSize:8,letterSpacing:2,color:"#6A6A65",textTransform:"uppercase",marginTop:2,fontFamily:"'EB Garamond',Georgia,serif"}}>
            Date Minted
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HORIZONTAL REEL
// ═══════════════════════════════════════════════════════════════════════════════
function HorizontalReel({ category, traits, spinning, stopped, targetIdx, isOneOfOne }) {
  const [visIdx, setVisIdx] = useState(0);
  const [landed, setLanded] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!spinning || stopped) return;
    let last = 0;
    const INTERVAL = 110;
    const cycle = (ts) => {
      if (ts - last >= INTERVAL) {
        setVisIdx(p=>(p+1)%traits.length);
        last = ts;
      }
      timerRef.current = requestAnimationFrame(cycle);
    };
    timerRef.current = requestAnimationFrame(cycle);
    return () => cancelAnimationFrame(timerRef.current);
  }, [spinning, stopped, traits.length]);

  useEffect(() => {
    if (!stopped) return;
    clearTimeout(timerRef.current);
    let count = 0;
    const slow = () => {
      count++;
      setVisIdx(p=>(p+1)%traits.length);
      if (count < 4) { timerRef.current = setTimeout(slow, 90+count*80); }
      else { setTimeout(()=>{ setVisIdx(targetIdx); setLanded(true); setTimeout(()=>setLanded(false),900); },150); }
    };
    timerRef.current = setTimeout(slow,80);
    return () => clearTimeout(timerRef.current);
  }, [stopped, targetIdx]);

  const isIdle    = !spinning && !stopped;
  const rawName   = stopped ? traits[targetIdx] : spinning ? traits[visIdx] : null;
  const reelLabel = rawName ? displayName(rawName) : "—";

  return (
    <div style={{
      display:"flex",flexDirection:"column",
      borderBottom:"1px solid #E8E5E0",
      padding:"10px 0",
      background:landed&&isOneOfOne?"rgba(180,150,60,0.05)":"transparent",
      transition:"background 0.4s",
    }}>
      <div style={{fontSize:8,letterSpacing:2.5,textTransform:"uppercase",color:"#6A6A65",fontFamily:"'EB Garamond',Georgia,serif",marginBottom:4}}>
        {category}
      </div>
      <div style={{overflow:"hidden",position:"relative",height:24}}>
        <div style={{
          position:"absolute",inset:0,
          display:"flex",alignItems:"center",
          fontFamily:"'EB Garamond',Georgia,serif",fontStyle:"italic",fontSize:16,
          color:isIdle?"#D8D5D0":stopped?(landed?"#6B5020":"#1A1A18"):"#888880",
          transition:"color 0.4s",
          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
          animation:stopped&&landed?"reelLand 0.8s cubic-bezier(0.34,1.56,0.64,1)":"none",transition:"color 0.6s ease",
        }}>
          {reelLabel}
        </div>
      </div>
      {landed && (
        <div style={{width:4,height:4,borderRadius:"50%",background:"#8B7040",marginLeft:8,flexShrink:0,animation:"dotPop 0.9s ease forwards"}}/>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CASINO EXPLOSION
// ═══════════════════════════════════════════════════════════════════════════════
function CasinoExplosion({ onDone }) {
  const [phase, setPhase] = useState("burst");
  useEffect(() => {
    const t1=setTimeout(()=>setPhase("text"),300);
    const t2=setTimeout(()=>setPhase("fade"),3400);
    const t3=setTimeout(onDone,4200);
    return ()=>[t1,t2,t3].forEach(clearTimeout);
  }, [onDone]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:phase==="fade"?"rgba(0,0,0,0)":"rgba(8,6,0,0.94)",transition:phase==="fade"?"background 0.8s ease":"none",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",pointerEvents:phase==="fade"?"none":"all"}}>
      {phase!=="fade"&&Array.from({length:14},(_,i)=>(
        <div key={i} style={{position:"absolute",top:"50%",left:"50%",width:2,height:"65vh",background:"linear-gradient(to top,rgba(212,175,55,0.9),transparent)",transformOrigin:"0 0",transform:`rotate(${i*(360/14)}deg)`,animation:"rayPulse 0.45s ease-in-out infinite alternate",animationDelay:`${i*0.03}s`}}/>
      ))}
      {Array.from({length:30},(_,i)=>(
        <div key={i} style={{position:"absolute",top:"50%",left:"50%",width:10,height:10,borderRadius:"50%",background:"radial-gradient(circle at 35% 35%,#FFE97A,#C09020)",border:"1px solid #907010",animation:`coinFly ${0.7+Math.random()*1.4}s cubic-bezier(0.25,0.46,0.45,0.94) forwards`,animationDelay:`${Math.random()*0.35}s`,"--tx":`${(Math.random()-0.5)*320}px`,"--ty":`${(Math.random()-0.5)*280}px`,"--rot":`${(Math.random()-0.5)*1080}deg`,opacity:0}}/>
      ))}
      <div style={{textAlign:"center",position:"relative",zIndex:2,opacity:phase==="text"?1:0,transform:phase==="text"?"scale(1) translateY(0)":"scale(0.85) translateY(12px)",transition:"opacity 0.5s cubic-bezier(0.34,1.56,0.64,1),transform 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:11,letterSpacing:10,textTransform:"uppercase",color:"rgba(212,175,55,0.65)",marginBottom:14,animation:phase==="text"?"shimmerText 1.2s ease infinite alternate":"none"}}>One of One</div>
        <div style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:58,letterSpacing:4,fontStyle:"italic",color:"#D4AF37",textShadow:"0 0 80px rgba(212,175,55,0.9),0 0 160px rgba(212,175,55,0.4)",lineHeight:1,animation:phase==="text"?"goldPulse 0.5s ease infinite alternate":"none"}}>{ONE_OF_ONE_TRAIT}</div>
        <div style={{marginTop:16,fontFamily:"'EB Garamond',Georgia,serif",fontSize:10,letterSpacing:6,fontStyle:"italic",color:"rgba(212,175,55,0.45)"}}>Public Facing · Special</div>
      </div>
      {phase==="burst"&&<div style={{position:"absolute",inset:0,background:"rgba(212,175,55,0.2)",animation:"flashOut 0.4s ease-out forwards"}}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT PANEL
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// SOURCES PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const SOURCES = [
  { year:"1636", name:"Rembrandt van Rijn",              file:"1636_Rembrandt_van_Rijn" },
  { year:"1785", name:"Philippe Laurent Roland",         file:"1785_Philippe_Laurent_Roland" },
  { year:"1796", name:"Francisco de Goya y Lucientes",   file:"1796_Francisco_de_Goya_y_Lucientes" },
  { year:"1825", name:"Sarah Goodridge",                 file:"1825_Sarah_Goodridge" },
  { year:"1855", name:"Honoré Daumier",                  file:"1855_Honore_Daumier" },
  { year:"1860", name:"James McNeill Whistler",          file:"1860_James_McNeill_Whistler" },
  { year:"1870", name:"Marie Bracquemond",               file:"1870_Marie_Bracquemond" },
  { year:"1875", name:"Kenyon Cox",                      file:"1875_Kenyon_Cox" },
  { year:"1907", name:"Julio Ruelas",                    file:"1907_Julio_Ruelas" },
  { year:"1909", name:"Hans Thoma",                      file:"1909_Hans_Thoma" },
  { year:"1909", name:"William Merritt Chase",           file:"1909_William_Merritt_Chase" },
  { year:"1910", name:"Umberto Boccioni",                file:"1910_Umberto_Boccioni" },
  { year:"1913", name:"Anne Goldthwaite",                file:"1913_Anne_Goldthwaite" },
  { year:"1917", name:"Egon Schiele",                    file:"1917_Egon_Schiele" },
  { year:"1918", name:"Elihu Vedder",                    file:"1918_Elihu_Vedder" },
  { year:"1919", name:"Enrico Caruso",                   file:"1919_Enrico_Caruso" },
  { year:"1919", name:"Walter Gramatte",                 file:"1919_Walter_Gramatte" },
  { year:"1921", name:"George Wesley Bellows",           file:"1921_George_Wesley_Bellows" },
  { year:"1921", name:"Heinrich Tischler",               file:"1921_Heinrich_Tischler" },
  { year:"1922", name:"Jerome Myers",                    file:"1922_Jerome_Myers" },
  { year:"1922", name:"Lovis Corinth",                   file:"1922_Lovis_Corinth" },
  { year:"1922", name:"Walter Gramatte",                 file:"1922_Walter_Gramatte" },
  { year:"1922", name:"Walter Gramatte (II)",            file:"1922_Walter_Gramatte_2" },
  { year:"1923", name:"Ernst Ludwig Kirchner",           file:"1923_Ernst_Ludwig_Kirchner" },
  { year:"1923", name:"Walter Gramatte",                 file:"1923_Walter_Gramatte" },
  { year:"1926", name:"Samuel Jessurun de Mesquita",     file:"1926_Samuel_Jessurun_de_Mesquita" },
  { year:"1928", name:"Enrico Glicenstein",              file:"1928_Enrico_Glicenstein" },
  { year:"1930", name:"A. Stirling Calder",              file:"1930_A_Stirling_Calder" },
];

function SourcesPage() {
  const [query,    setQuery]    = useState("");
  const [lightbox, setLightbox] = useState(null); // { src, name, year }
  const q = query.toLowerCase().trim();
  const filtered = q
    ? SOURCES.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.year.includes(q)
      )
    : SOURCES;

  return (
    <div style={{padding:"32px 32px 52px",animation:"fadeIn 0.4s ease"}}>
      <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"#6A6A65",fontFamily:"'EB Garamond',Georgia,serif",marginBottom:20}}>Sources</div>

      {/* Search */}
      <div style={{position:"relative",marginBottom:20}}>
        <input
          type="text"
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="Search by name or year…"
          style={{
            width:"100%",padding:"10px 36px 10px 14px",
            border:"1px solid #1A1A18",background:"#FAF9F7",
            fontSize:11,fontFamily:"'EB Garamond',Georgia,serif",
            fontStyle:"italic",color:"#1A1A18",letterSpacing:0.5,
            outline:"none",boxSizing:"border-box",
          }}
        />
        {query && (
          <button onClick={()=>setQuery("")} style={{
            position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
            background:"none",border:"none",cursor:"pointer",
            fontSize:14,color:"#A0A09A",lineHeight:1,padding:0,
          }}>×</button>
        )}
      </div>

      {/* Count */}
      <div style={{fontSize:8,letterSpacing:2,color:"#A0A09A",textTransform:"uppercase",fontFamily:"'EB Garamond',Georgia,serif",marginBottom:16}}>
        {filtered.length === SOURCES.length ? SOURCES.length + " artists" : filtered.length + " of " + SOURCES.length + " artists"}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"40px 0",fontFamily:"'EB Garamond',Georgia,serif",fontSize:13,fontStyle:"italic",color:"#B0ADA8"}}>
          No results for "{query}"
        </div>
      ) : (
        <div>
          {filtered.map((s, i) => (
            <div key={s.file + i} style={{
              display:"flex",alignItems:"center",gap:16,
              padding:"12px 0",
              borderBottom:"1px solid #E8E5E0",
            }}>
              {/* Thumbnail */}
              <div
                onClick={()=>setLightbox({src:R2_BASE_URL+"/Sources/"+s.file+".png",name:s.name,year:s.year})}
                style={{flexShrink:0,width:52,height:52,overflow:"hidden",background:"#EDEAE5",position:"relative",cursor:"pointer"}}
              >
                <img
                  src={R2_BASE_URL + "/Sources/" + s.file + ".png"}
                  alt={s.name}
                  crossOrigin="anonymous"
                  style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
                  onError={e=>e.target.style.opacity="0"}
                />
              </div>
              {/* Text */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:15,fontStyle:"italic",color:"#1A1A18",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {s.name}
                </div>
                <div style={{fontSize:8,letterSpacing:2,color:"#A0A09A",textTransform:"uppercase",fontFamily:"'EB Garamond',Georgia,serif",marginTop:3}}>
                  {s.year}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={()=>setLightbox(null)}
          style={{
            position:"fixed",inset:0,zIndex:500,
            background:"rgba(0,0,0,0.92)",
            display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center",
            padding:24,
            animation:"fadeIn 0.2s ease",
          }}
        >
          <img
            src={lightbox.src}
            alt={lightbox.name}
            style={{maxWidth:"100%",maxHeight:"80vh",objectFit:"contain",display:"block"}}
          />
          <div style={{marginTop:16,textAlign:"center"}}>
            <div style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:16,fontStyle:"italic",color:"#FAF9F7"}}>
              {lightbox.name}
            </div>
            <div style={{fontSize:8,letterSpacing:3,color:"rgba(250,249,247,0.5)",textTransform:"uppercase",fontFamily:"'EB Garamond',Georgia,serif",marginTop:6}}>
              {lightbox.year} · Tap to close
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function GalleryPage({ traits }) {
  const [query,  setQuery]  = useState("");
  const [sortNew, setSortNew] = useState(false);

  // Generate mock collection from DEFAULT_TRAITS for now
  const allArtists = DEFAULT_TRAITS.Base;
  const mockMints = Array.from({length: 48}, (_, i) => {
    const rolled = {};
    Object.keys(DEFAULT_TRAITS).forEach(cat => {
      rolled[cat] = (i * 7 + Object.keys(DEFAULT_TRAITS).indexOf(cat) * 3) % DEFAULT_TRAITS[cat].length;
    });
    const baseArtist = DEFAULT_TRAITS.Base[rolled["Base"] ?? 0] ?? "";
    return { mintNumber: i + 1, rolled, baseArtist };
  });

  const q = query.toLowerCase().trim();
  const sorted = sortNew ? [...mockMints].reverse() : mockMints;
  const filtered = q
    ? sorted.filter(m =>
        String(m.mintNumber).includes(q) ||
        m.baseArtist.toLowerCase().replace(/_/g," ").includes(q)
      )
    : sorted;

  return (
    <div style={{padding:"32px 32px 52px",animation:"fadeIn 0.4s ease"}}>
      <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"#6A6A65",fontFamily:"'EB Garamond',Georgia,serif",marginBottom:20}}>Gallery</div>

      {/* Search bar */}
      <div style={{position:"relative",marginBottom:24}}>
        <input
          type="text"
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="Search by number or artist…"
          style={{
            width:"100%",
            padding:"10px 36px 10px 14px",
            border:"1px solid #1A1A18",
            background:"#FAF9F7",
            fontSize:11,
            fontFamily:"'EB Garamond',Georgia,serif",
            fontStyle:"italic",
            color:"#1A1A18",
            letterSpacing:0.5,
            outline:"none",
            boxSizing:"border-box",
          }}
        />
        {query && (
          <button onClick={()=>setQuery("")} style={{
            position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
            background:"none",border:"none",cursor:"pointer",
            fontSize:14,color:"#A0A09A",lineHeight:1,padding:0,
          }}>×</button>
        )}
      </div>

      {/* Results count + sort toggle */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:8,letterSpacing:2,color:"#A0A09A",textTransform:"uppercase",fontFamily:"'EB Garamond',Georgia,serif"}}>
          {filtered.length === mockMints.length ? mockMints.length + " mints" : filtered.length + " of " + mockMints.length + " mints"}
        </div>
        <button onClick={()=>setSortNew(s=>!s)} style={{
          border:"1px solid #D8D5D0",cursor:"pointer",
          padding:"5px 12px",fontSize:8,letterSpacing:2,textTransform:"uppercase",
          fontFamily:"'EB Garamond',Georgia,serif",
          color: sortNew ? "#FAF9F7" : "#6A6A65",
          background: sortNew ? "#1A1A18" : "transparent",
          transition:"all 0.2s",
        }}>
          {sortNew ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"40px 0",fontFamily:"'EB Garamond',Georgia,serif",fontSize:13,fontStyle:"italic",color:"#B0ADA8"}}>
          No results for "{query}"
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {filtered.map(m => (
            <div key={m.mintNumber} style={{display:"flex",flexDirection:"column"}}>
              <div style={{position:"relative",paddingBottom:"100%",background:"#EDEAE5",overflow:"hidden"}}>
                {LAYER_ORDER.map((layer, z) => {
                  const isBase  = layer === "Base";
                  const isGhost = GHOST_LAYERS.includes(layer);
                  const isCutout = ["Ghost 1","Ghost 2","Head","Mouth","Nose","Right Eye","Left Eye"].includes(layer);
                  if (!isBase && !isCutout) return null;
                  const list = traits[layer] || DEFAULT_TRAITS[layer] || [];
                  const traitName = list[m.rolled[layer] ?? 0];
                  if (!traitName) return null;
                  const url = imgUrl(layer, traitName);
                  return (
                    <div key={layer} style={{position:"absolute",inset:0,zIndex:z+1,opacity:isGhost?0.6:1}}>
                      <img src={url} alt="" crossOrigin="anonymous" style={{width:"100%",height:"100%",objectFit:isBase?"cover":"contain",display:"block"}}/>
                    </div>
                  );
                })}
              </div>
              <div style={{fontSize:7,letterSpacing:1,color:"#A0A09A",fontFamily:"'EB Garamond',Georgia,serif",marginTop:4,textAlign:"center"}}>
                #{m.mintNumber}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAVE DROPDOWN
// ═══════════════════════════════════════════════════════════════════════════════
function SaveDropdown({ downloading, downloadFrame, completedMints, traits, mintNumber }) {
  const [open,    setOpen]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [progress,setProgress]= useState(0);
  const isMulti = completedMints.length > 1;

  // Save each mint as individual PNGs
  const saveIndividual = async () => {
    setOpen(false);
    if (saving) return;
    setSaving(true);
    setProgress(0);
    try {
      const h2c = await loadHtml2Canvas();
      for (let i = 0; i < completedMints.length; i++) {
        setProgress(i + 1);
        const m = completedMints[i];
        const container = document.createElement("div");
        container.style.cssText = "position:fixed;left:-9999px;top:0;width:400px;background:#FAF9F7;font-family:'EB Garamond',Georgia,serif;";
        const imgArea = document.createElement("div");
        imgArea.style.cssText = "position:relative;width:400px;height:400px;background:#EDEAE5;overflow:hidden;";
        const CUTOUT = ["Ghost 1","Ghost 2","Head","Mouth","Nose","Right Eye","Left Eye"];
        ["Base","Ghost 1","Ghost 2","Head","Mouth","Nose","Right Eye","Left Eye"].forEach((layer, z) => {
          const isBase = layer === "Base";
          const isGhost = ["Ghost 1","Ghost 2"].includes(layer);
          if (!isBase && !CUTOUT.includes(layer)) return;
          const list = traits[layer] || [];
          const traitName = list[m.rolledTraits[layer] ?? 0];
          if (!traitName) return;
          const div = document.createElement("div");
          div.style.cssText = `position:absolute;inset:0;z-index:${z+1};opacity:${isGhost?0.6:isBase?1:0.9};`;
          const img = document.createElement("img");
          img.crossOrigin = "anonymous";
          img.src = imgUrl(layer, traitName);
          img.style.cssText = `width:100%;height:100%;object-fit:${isBase?"cover":"contain"};display:block;`;
          div.appendChild(img);
          imgArea.appendChild(div);
        });
        container.appendChild(imgArea);
        const d = m.mintDate ? new Date(m.mintDate) : new Date();
        const dateStr = String(d.getMonth()+1).padStart(2,"0")+" · "+String(d.getDate()).padStart(2,"0")+" · "+d.getFullYear();
        const matte = document.createElement("div");
        matte.style.cssText = "padding:12px 4px 14px;display:flex;justify-content:space-between;border-top:1px solid #E0DDD8;";
        matte.innerHTML = `<div><div style="font-family:'EB Garamond',Georgia,serif;font-size:14px;font-style:italic;color:#1A1A18;">Public Facing #${m.mintNumber}</div><div style="font-size:8px;letter-spacing:2px;color:#6A6A65;text-transform:uppercase;margin-top:3px;font-family:'EB Garamond',Georgia,serif;">Lampwrecked 2026</div></div><div style="text-align:right;"><div style="font-family:'EB Garamond',Georgia,serif;font-size:13px;font-style:italic;color:#1A1A18;">${dateStr}</div><div style="font-size:8px;letter-spacing:2px;color:#6A6A65;text-transform:uppercase;margin-top:2px;font-family:'EB Garamond',Georgia,serif;">Date Minted</div></div>`;
        container.appendChild(matte);
        document.body.appendChild(container);
        await new Promise(res => setTimeout(res, 800));
        const canvas = await h2c(container, { backgroundColor:"#FAF9F7",scale:2,useCORS:true,allowTaint:false,logging:false });
        document.body.removeChild(container);
        const link = document.createElement("a");
        link.download = `public-facing-${m.mintNumber}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        await new Promise(res => setTimeout(res, 400));
      }
    } catch(e) { console.error("Save individual failed:", e); }
    finally { setSaving(false); setProgress(0); }
  };

  // Save all mints as one collage PNG
  const saveCollage = async () => {
    setOpen(false);
    if (saving) return;
    setSaving(true);
    try {
      const h2c = await loadHtml2Canvas();
      const COLS = Math.min(completedMints.length, 3);
      const ROWS = Math.ceil(completedMints.length / COLS);
      const CELL = 300;
      const GAP  = 8;
      const PAD  = 24;
      const W = PAD*2 + COLS*CELL + (COLS-1)*GAP;
      const H = PAD*2 + ROWS*CELL + (ROWS-1)*GAP + 60;
      const container = document.createElement("div");
      container.style.cssText = `position:fixed;left:-9999px;top:0;width:${W}px;background:#FAF9F7;padding:${PAD}px;box-sizing:border-box;font-family:'EB Garamond',Georgia,serif;`;
      const grid = document.createElement("div");
      grid.style.cssText = `display:grid;grid-template-columns:repeat(${COLS},${CELL}px);gap:${GAP}px;`;
      completedMints.forEach(m => {
        const cell = document.createElement("div");
        cell.style.cssText = `position:relative;width:${CELL}px;height:${CELL}px;background:#EDEAE5;overflow:hidden;`;
        const CUTOUT = ["Ghost 1","Ghost 2","Head","Mouth","Nose","Right Eye","Left Eye"];
        ["Base","Ghost 1","Ghost 2","Head","Mouth","Nose","Right Eye","Left Eye"].forEach((layer, z) => {
          const isBase = layer === "Base";
          const isGhost = ["Ghost 1","Ghost 2"].includes(layer);
          if (!isBase && !CUTOUT.includes(layer)) return;
          const list = traits[layer] || [];
          const traitName = list[m.rolledTraits[layer] ?? 0];
          if (!traitName) return;
          const div = document.createElement("div");
          div.style.cssText = `position:absolute;inset:0;z-index:${z+1};opacity:${isGhost?0.6:isBase?1:0.9};`;
          const img = document.createElement("img");
          img.crossOrigin = "anonymous";
          img.src = imgUrl(layer, traitName);
          img.style.cssText = `width:100%;height:100%;object-fit:${isBase?"cover":"contain"};display:block;`;
          div.appendChild(img);
          cell.appendChild(div);
        });
        grid.appendChild(cell);
      });
      container.appendChild(grid);
      const footer = document.createElement("div");
      footer.style.cssText = "margin-top:16px;display:flex;justify-content:space-between;";
      footer.innerHTML = `<div style="font-family:'EB Garamond',Georgia,serif;font-size:12px;font-style:italic;color:#1A1A18;">Public Facing Project</div><div style="font-size:8px;letter-spacing:2px;color:#6A6A65;text-transform:uppercase;font-family:'EB Garamond',Georgia,serif;">${completedMints.length} mints · Lampwrecked 2026</div>`;
      container.appendChild(footer);
      document.body.appendChild(container);
      await new Promise(res => setTimeout(res, 1200));
      const canvas = await h2c(container, { backgroundColor:"#FAF9F7",scale:2,useCORS:true,allowTaint:false,logging:false });
      document.body.removeChild(container);
      const link = document.createElement("a");
      link.download = "public-facing-collection.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch(e) { console.error("Save collage failed:", e); }
    finally { setSaving(false); }
  };

  if (saving) return (
    <button disabled style={{padding:"7px 16px",border:"1px solid #D8D5D0",background:"transparent",fontSize:8,letterSpacing:3,fontFamily:"'EB Garamond',Georgia,serif",color:"#A0A09A",textTransform:"uppercase",cursor:"wait"}}>
      {progress > 0 ? `Saving ${progress} of ${completedMints.length}…` : "Saving…"}
    </button>
  );

  return (
    <div style={{position:"relative"}}>
      <button
        onClick={()=>setOpen(o=>!o)}
        style={{padding:"7px 16px",border:"1px solid #D8D5D0",background:"transparent",fontSize:8,letterSpacing:3,cursor:"pointer",fontFamily:"'EB Garamond',Georgia,serif",color:"#555",textTransform:"uppercase"}}
      >
        Save ↓
      </button>
      {open && (
        <div style={{position:"absolute",bottom:"110%",left:0,background:"#FAF9F7",border:"1px solid #1A1A18",zIndex:50,minWidth:180,animation:"fadeIn 0.15s ease"}}>
          {isMulti && (
            <button onClick={saveIndividual} style={{display:"block",width:"100%",textAlign:"left",padding:"12px 16px",background:"transparent",border:"none",borderBottom:"1px solid #E8E5E0",fontSize:8,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"'EB Garamond',Georgia,serif",color:"#1A1A18"}}>
              Save Each as PNG
            </button>
          )}
          {isMulti && (
            <button onClick={saveCollage} style={{display:"block",width:"100%",textAlign:"left",padding:"12px 16px",background:"transparent",border:"none",borderBottom:"1px solid #E8E5E0",fontSize:8,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"'EB Garamond',Georgia,serif",color:"#1A1A18"}}>
              Save as Collage
            </button>
          )}
          {!isMulti && (
            <button onClick={()=>{setOpen(false);downloadFrame();}} style={{display:"block",width:"100%",textAlign:"left",padding:"12px 16px",background:"transparent",border:"none",fontSize:8,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"'EB Garamond',Georgia,serif",color:"#1A1A18"}}>
              Save PNG
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAVE ALL BUTTON
// ═══════════════════════════════════════════════════════════════════════════════
function SaveAllButton({ completedMints, traits }) {
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const saveAll = async () => {
    if (saving) return;
    setSaving(true);
    setProgress(0);
    try {
      const h2c = await loadHtml2Canvas();
      for (let i = 0; i < completedMints.length; i++) {
        setProgress(i + 1);
        const m = completedMints[i];
        // Build a temporary off-screen composite div
        const container = document.createElement("div");
        container.style.cssText = "position:fixed;left:-9999px;top:0;width:400px;background:#FAF9F7;font-family:'EB Garamond',Georgia,serif;";
        // Image area
        const imgArea = document.createElement("div");
        imgArea.style.cssText = "position:relative;width:400px;height:400px;background:#EDEAE5;overflow:hidden;";
        const CUTOUT_LAYERS = ["Ghost 1","Ghost 2","Head","Mouth","Nose","Right Eye","Left Eye"];
        const layerOrder = ["Base","Ghost 1","Ghost 2","Head","Mouth","Nose","Right Eye","Left Eye"];
        layerOrder.forEach((layer, z) => {
          const isBase  = layer === "Base";
          const isGhost = ["Ghost 1","Ghost 2"].includes(layer);
          const isCutout = CUTOUT_LAYERS.includes(layer);
          if (!isBase && !isCutout) return;
          const list = traits[layer] || [];
          const traitName = list[m.rolledTraits[layer] ?? 0];
          if (!traitName) return;
          const url = imgUrl(layer, traitName);
          const div = document.createElement("div");
          div.style.cssText = `position:absolute;inset:0;z-index:${z+1};opacity:${isGhost?0.6:isBase?1:0.9};`;
          const img = document.createElement("img");
          img.crossOrigin = "anonymous";
          img.src = url;
          img.style.cssText = `width:100%;height:100%;object-fit:${isBase?"cover":"contain"};display:block;`;
          div.appendChild(img);
          imgArea.appendChild(div);
        });
        container.appendChild(imgArea);
        // Matte label
        const matte = document.createElement("div");
        matte.style.cssText = "padding:12px 4px 14px;display:flex;justify-content:space-between;border-top:1px solid #E0DDD8;";
        const d = m.mintDate ? new Date(m.mintDate) : new Date();
        const dateStr = String(d.getMonth()+1).padStart(2,"0") + " · " + String(d.getDate()).padStart(2,"0") + " · " + d.getFullYear();
        matte.innerHTML = `
          <div>
            <div style="font-family:'EB Garamond',Georgia,serif;font-size:14px;font-style:italic;color:#1A1A18;">Public Facing #${m.mintNumber}</div>
            <div style="font-size:8px;letter-spacing:2px;color:#6A6A65;text-transform:uppercase;margin-top:3px;font-family:'EB Garamond',Georgia,serif;">Lampwrecked 2026</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:'EB Garamond',Georgia,serif;font-size:13px;font-style:italic;color:#1A1A18;">${dateStr}</div>
            <div style="font-size:8px;letter-spacing:2px;color:#6A6A65;text-transform:uppercase;margin-top:2px;font-family:'EB Garamond',Georgia,serif;">Date Minted</div>
          </div>
        `;
        container.appendChild(matte);
        document.body.appendChild(container);
        // Wait for images to load
        await new Promise(res => setTimeout(res, 800));
        const canvas = await h2c(container, {
          backgroundColor: "#FAF9F7",
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
        });
        document.body.removeChild(container);
        const link = document.createElement("a");
        link.download = `public-facing-${m.mintNumber}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        await new Promise(res => setTimeout(res, 400));
      }
    } catch(e) {
      console.error("Save all failed:", e);
    } finally {
      setSaving(false);
      setProgress(0);
    }
  };

  return (
    <button
      onClick={saveAll}
      disabled={saving}
      style={{
        marginTop:8,
        width:"100%",
        padding:"10px 0",
        background: saving ? "#E8E5E0" : "#1A1A18",
        color: saving ? "#A0A09A" : "#FAF9F7",
        border:"none",
        fontSize:8,letterSpacing:3,
        textTransform:"uppercase",
        cursor: saving ? "wait" : "pointer",
        fontFamily:"'EB Garamond',Georgia,serif",
        transition:"background 0.2s",
      }}
    >
      {saving ? `Saving ${progress} of ${completedMints.length}…` : `Save All ${completedMints.length} Mints ↓`}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINT THUMBNAIL — small composite shown in strip after each mint completes
// ═══════════════════════════════════════════════════════════════════════════════
const MintThumbnail = React.memo(function MintThumbnail({ rolled, resolvedFiles, mintNumber, traits }) {
  const CUTOUT_LAYERS = ["Ghost 1","Ghost 2","Head","Mouth","Nose","Right Eye","Left Eye"];
  const size = 64;
  return (
    <div style={{flexShrink:0,width:size,textAlign:"center"}}>
      <div style={{width:size,height:size,position:"relative",border:"1px solid #D8D5D0",overflow:"hidden",background:"#EDEAE5"}}>
        {LAYER_ORDER.map((layer, z) => {
          const isBase   = layer === "Base";
          const isGhost  = GHOST_LAYERS.includes(layer);
          const isCutout = CUTOUT_LAYERS.includes(layer);
          if (!isBase && !isCutout) return null;
          // Use resolvedFiles if available, otherwise fall back to current traits
          const traitName = resolvedFiles ? resolvedFiles[layer] : (traits[layer]||[])[rolled[layer]??0];
          if (!traitName) return null;
          const url = imgUrl(layer, traitName);
          return (
            <div key={layer} style={{position:"absolute",inset:0,zIndex:z+1,opacity:isGhost?0.6:1}}>
              <img src={url} alt="" crossOrigin="anonymous" style={{width:"100%",height:"100%",objectFit:isBase?"cover":"contain",display:"block"}}/>
            </div>
          );
        })}
      </div>
      <div style={{fontSize:7,letterSpacing:1,color:"#A0A09A",fontFamily:"'EB Garamond',Georgia,serif",marginTop:3}}>
        #{mintNumber}
      </div>
    </div>
  );
}, (prev, next) => prev.mintNumber === next.mintNumber && prev.resolvedFiles === next.resolvedFiles);

function PaymentPanel({ sessionAddr, validUntil, expired, onNewSession, payState, amountRcvd }) {
  const [copied, setCopied] = useState(false);
  const MINT_PRICE = 5;
  const mintsQueued = Math.floor(amountRcvd / MINT_PRICE);
  const progress = Math.min((amountRcvd % MINT_PRICE) / MINT_PRICE, 1);
  const copy = () => {
    navigator.clipboard.writeText(sessionAddr).catch(()=>{});
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };

  if (expired) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"8px 0",animation:"fadeIn 0.6s ease"}}>
      <div style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:13,fontStyle:"italic",color:"#B0ADA8",textAlign:"center"}}>
        This address has expired.
      </div>
      <button onClick={onNewSession} style={{padding:"10px 36px",background:"transparent",color:"#1A1A18",border:"1px solid #1A1A18",fontSize:9,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",fontFamily:"'EB Garamond',Georgia,serif"}}>
        Generate New Address
      </button>
    </div>
  );

  const showProgress = payState === "detecting" || payState === "confirmed";

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:"4px 0",animation:"fadeIn 0.5s ease"}}>

      {/* Progress bar — only shows once payment detected */}
      {showProgress && (
        <div style={{width:"100%",animation:"fadeIn 0.4s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#6A6A65",textTransform:"uppercase",fontFamily:"'EB Garamond',Georgia,serif"}}>
              {payState==="confirmed" ? "Payment complete" : "Processing payment"}
            </div>
            <div style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:22,fontStyle:"italic",color:"#1A1A18"}}>
              {mintsQueued > 0 ? `${mintsQueued} mint${mintsQueued>1?"s":""}` : ""}
            </div>
          </div>
          <div style={{width:"100%",height:3,background:"#E8E5E0",borderRadius:2,overflow:"hidden"}}>
            <div style={{
              height:"100%",
              background: payState==="confirmed" ? "#1A1A18" : "#6B5020",
              borderRadius:2,
              width: payState==="confirmed" ? "100%" : `${progress*100}%`,
              transition:"width 0.6s ease",
            }}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:5,fontSize:8,letterSpacing:1,color:"#B0ADA8",fontFamily:"'EB Garamond',Georgia,serif"}}>
            <span>${amountRcvd.toFixed(0)} received</span>
            <span>{payState==="confirmed" ? "Ready to spin" : "Awaiting confirmation…"}</span>
          </div>
        </div>
      )}

      {/* QR + address — always shown */}
      <div style={{width:"100%"}}>
        <div style={{fontSize:8,letterSpacing:3,color:"#C8C5C0",textAlign:"center",marginBottom:6,textTransform:"uppercase",fontFamily:"'EB Garamond',Georgia,serif"}}>
          {payState==="watching" ? "Awaiting payment" : "Send to"}
        </div>
        <div onClick={copy} style={{border:"1px solid #E8E5E0",padding:"10px 14px",fontSize:9,letterSpacing:0.8,color:"#555",cursor:"pointer",textAlign:"center",wordBreak:"break-all",lineHeight:1.9,position:"relative",fontFamily:"'EB Garamond',Georgia,serif",background:"#FAF9F7"}}>
          {sessionAddr}
          <span style={{position:"absolute",top:8,right:10,fontSize:8,letterSpacing:2,color:copied?"#6B5020":"#C8C5C0",transition:"color 0.3s",fontFamily:"'EB Garamond',Georgia,serif"}}>{copied?"Copied":"Copy"}</span>
        </div>
      </div>

      <div style={{fontSize:8,letterSpacing:2,color:"#C8C5C0",textTransform:"uppercase",fontFamily:"'EB Garamond',Georgia,serif",textAlign:"center"}}>
        Address valid until {formatValidUntil(validUntil)}
      </div>

      {/* Pricing hint */}
      <div style={{textAlign:"center",borderTop:"1px solid #E8E5E0",paddingTop:12,width:"100%"}}>
        <div style={{fontSize:9,letterSpacing:0.5,color:"#A0A09A",fontFamily:"'EB Garamond',Georgia,serif",fontStyle:"italic",lineHeight:1.8}}>
          Send any dollar amount · $1 per mint
        </div>
        <div style={{fontSize:8,letterSpacing:1,color:"#C0BDB8",fontFamily:"'EB Garamond',Georgia,serif",marginTop:3}}>
          $1 · $13 · $47 · $100 · $2026
        </div>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
export default function PublicFacing() {
  const [page,         setPage]         = useState("mint"); // mint | about | gallery | lampwrecked
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [traits,       setTraits]       = useState(DEFAULT_TRAITS);
  const [flow,         setFlow]         = useState("paying");
  const [rolledTraits, setRolledTraits] = useState({});
  const [stoppedCats,  setStoppedCats]  = useState({});
  const [cycleIndices, setCycleIndices] = useState({});
  const [mintDate,     setMintDate]     = useState(null);
  const [sessionAddr,  setSessionAddr]  = useState(()=>deriveSessionAddress(Date.now()));
  const [validUntil,   setValidUntil]   = useState(()=>Date.now()+SESSION_DURATION);
  const [expired,      setExpired]      = useState(false);
  const [payState,     setPayState]     = useState("watching");
  const [amountRcvd,   setAmountRcvd]   = useState(0);
  const [mintNumber,   setMintNumber]   = useState(null);
  const [downloading,  setDownloading]  = useState(false);
  // Multi-mint
  const [selectedMintIdx, setSelectedMintIdx] = useState(null);
  const [mintPopup,       setMintPopup]       = useState(null); // {rolled, mintNumber, mintDate} // null = current mint
  const [mintQueue,       setMintQueue]       = useState([]); // array of rolledTraits objects
  const [mintQueueIdx,    setMintQueueIdx]    = useState(0);  // which mint we're on
  const [completedMints,  setCompletedMints]  = useState([]); // [{rolledTraits, mintNumber, mintDate}]
  const [betweenMints,    setBetweenMints]    = useState(false); // black interstitial screen
  const [showBatchChoice, setShowBatchChoice] = useState(false); // offer Continue/Reveal All after mint 10

  const frameRef  = useRef(null);
  const timersRef = useRef([]);
  const cycleRef  = useRef(null);

  // Load Google Sheet
  useEffect(() => {
    fetchTraitsFromSheet()
      .then(t => { console.log("Sheet loaded"); setTraits(t); })
      .catch(() => { console.log("Sheet failed, using defaults"); setTraits(DEFAULT_TRAITS); });
  }, []);

  // Preload html2canvas
  useEffect(() => { loadHtml2Canvas().catch(()=>{}); }, []);

  // Session expiry
  useEffect(() => {
    if (flow !== "paying") return;
    const remaining = validUntil - Date.now();
    if (remaining <= 0) { setExpired(true); return; }
    const t = setTimeout(()=>setExpired(true), remaining);
    return () => clearTimeout(t);
  }, [validUntil, flow]);

  // Keep a ref to latest traits so mock always uses current pool
  const traitsRef = useRef(traits);
  useEffect(() => { traitsRef.current = traits; }, [traits]);

  // Mock payment watcher — replace with real RPC polling in prod
  useEffect(() => {
    if (flow !== "paying" || expired) return;
    const t1 = setTimeout(() => {
      setPayState("detecting");
      setAmountRcvd(10);
    }, 2000);
    const t2 = setTimeout(() => {
      const currentTraits = traitsRef.current; // always latest
      const count = 15;
      const baseNum = Math.floor(Math.random() * 500) + 1;
      const queue = Array.from({length: count}, (_, i) => {
        const rolled = rollTraits(currentTraits);
        // Resolve filenames immediately using the correct pool for this roll
        const dirIdx = rolled["Direction"] ?? 0;
        const dir = (currentTraits.Direction || ["CENTER"])[dirIdx];
        const pool = (currentTraits._pools && currentTraits._pools[dir]) ? currentTraits._pools[dir] : currentTraits;
        const resolvedFiles = {};
        ["Base","Ghost 1","Ghost 2","Head","Right Eye","Left Eye","Mouth","Nose","Special","Direction"].forEach(cat => {
          const list = cat === "Direction" ? (currentTraits.Direction||[]) : (pool[cat] || currentTraits[cat] || []);
          resolvedFiles[cat] = list[rolled[cat] ?? 0] || null;
        });
        return { rolled, resolvedFiles, mintNumber: baseNum + i };
      });
      setMintQueue(queue);
      setMintQueueIdx(0);
      setRolledTraits(queue[0].rolled);
      setMintNumber(queue[0].mintNumber);
      setPayState("confirmed");
      setTimeout(() => setFlow("ready"), 1200);
    }, 5000); // slight delay to ensure sheet has loaded
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [sessionAddr, flow, expired]);

  const newSession = useCallback(() => {
    const seed = Date.now();
    setSessionAddr(deriveSessionAddress(seed));
    setValidUntil(Date.now() + SESSION_DURATION);
    setExpired(false);
    setPayState("watching");
    setAmountRcvd(0);
  }, []);

  // Image layer cycling
  useEffect(() => {
    if (flow !== "spinning") { clearInterval(cycleRef.current); return; }
    cycleRef.current = setInterval(() => {
      const next = {};
      LAYER_ORDER.forEach(layer => {
        if (!stoppedCats[layer]) {
          const list = traits[layer] || [];
          next[layer] = Math.floor(Math.random() * list.length);
        }
      });
      setCycleIndices(prev => ({...prev,...next}));
    }, 80);
    return () => clearInterval(cycleRef.current);
  }, [flow, stoppedCats, traits]);

  const revealAll = useCallback((fromIdx, queue) => {
    // Instantly resolve all remaining mints
    const date = new Date();
    const remaining = queue.slice(fromIdx).map((m, i) => ({
      rolledTraits: m.rolled,
      mintNumber: m.mintNumber,
      mintDate: new Date(date.getTime() + i * 1000),
    }));
    setCompletedMints(prev => [...prev, ...remaining]);
    const last = queue[queue.length - 1];
    setRolledTraits(last.rolled);
    setMintNumber(last.mintNumber);
    setMintDate(date);
    setShowBatchChoice(false);
    setBetweenMints(false);
    setFlow("minted");
  }, []);

  const advanceToNextMint = useCallback((completedIdx, completedRolled, completedNum) => {
    const date = new Date();
    setCompletedMints(prev => {
      if (prev.some(m => m.mintNumber === completedNum)) return prev;
      // Use resolvedFiles from the queue which were locked in at roll time
      const queueItem = mintQueue.find(q => q.mintNumber === completedNum);
      const resolvedFiles = queueItem ? queueItem.resolvedFiles : {};
      return [...prev, { rolledTraits: completedRolled, resolvedFiles, mintNumber: completedNum, mintDate: date }];
    });
    const nextIdx = completedIdx + 1;
    if (nextIdx < mintQueue.length) {
      setMintQueueIdx(nextIdx); // always update index
      if (nextIdx === 10) {
        setShowBatchChoice(true);
      } else {
        setBetweenMints(true);
        setTimeout(()=>{
          setMintQueueIdx(ni => {
            const m = mintQueue[ni];
            if (m) {
              setRolledTraits(m.rolled);
              setMintNumber(m.mintNumber);
              setBetweenMints(false);
              setTimeout(()=>startSpinSequence(m.rolled, m.mintNumber, ni), 50);
            }
            return ni;
          });
        }, 2000);
      }
    } else {
      setMintDate(date);
      setFlow("minted");
    }
  }, [mintQueue]);

  const startSpinSequence = useCallback((rolled, num, idx) => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setStoppedCats({});
    setSelectedMintIdx(null);
    setFlow("spinning");
    const isOneOfOne = traits[ONE_OF_ONE_CATEGORY]?.[rolled[ONE_OF_ONE_CATEGORY]] === ONE_OF_ONE_TRAIT;
    STOP_ORDER.forEach((cat, i) => {
      const t = setTimeout(() => {
        setStoppedCats(prev => ({...prev,[cat]:true}));
        if (cat === "Direction") {
          setTraits(prev => {
            if (!prev._pools) return prev;
            const dir = prev.Direction[rolled["Direction"] ?? 0] || "CENTER";
            const pool = prev._pools[dir] || prev._pools["CENTER"];
            return { ...prev, ...pool };
          });
        }
        if (i === STOP_ORDER.length - 1) {
          clearInterval(cycleRef.current);
          if (isOneOfOne) {
            setTimeout(()=>setFlow("casino"), 800);
          } else {
            setTimeout(()=>{
              setFlow("minting");
              setTimeout(()=> advanceToNextMint(idx, rolled, num), 1800);
            }, 800);
          }
        }
      }, 1200 + i * 1100);
      timersRef.current.push(t);
    });
  }, [traits, advanceToNextMint]);

  const spin = () => {
    if (flow !== "ready") return;
    startSpinSequence(rolledTraits, mintNumber, mintQueueIdx);
  };

  const onCasinoDone = useCallback(() => {
    setMintDate(new Date());
    setFlow("minting");
    setTimeout(()=>setFlow("minted"), 1800);
  }, []);

  // ── DOWNLOAD FRAME ──────────────────────────────────────────────────────────
  const downloadFrame = useCallback(async () => {
    if (downloading || !frameRef.current) return;
    setDownloading(true);
    try {
      const h2c = await loadHtml2Canvas();
      const canvas = await h2c(frameRef.current, {
        backgroundColor: "#FAF9F7",
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = "public-facing-test.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [mintNumber, downloading]);

  const reset = () => {
    timersRef.current.forEach(clearTimeout);
    clearInterval(cycleRef.current);
    setStoppedCats({});
    setRolledTraits({});
    setCycleIndices({});
    setMintDate(null);
    setMintNumber(null);
    setMintQueue([]);
    setMintQueueIdx(0);
    setCompletedMints([]);
    setBetweenMints(false);
    newSession();
    setFlow("paying");
  };

  const isSpinning = flow === "spinning";
  const isMinted   = flow === "minted";
  const showReels  = ["ready","spinning","minting","minted"].includes(flow);

  return (
    <div style={{minHeight:"100vh",background:"#FAF9F7",fontFamily:"'EB Garamond',Georgia,serif",color:"#1A1A18"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap');
        * { box-sizing:border-box; }
        body { margin:0; background:#FAF9F7; }
        button:focus { outline:none; }
        @keyframes reelSlide  { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes reelLand   { from{transform:translateX(8px) scale(1.015)} to{transform:translateX(0) scale(1)} }
        @keyframes dotPop     { 0%{opacity:1;transform:scale(2)} 100%{opacity:0;transform:scale(1)} }
        @keyframes dateReveal { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn     { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rayPulse   { from{opacity:0.25} to{opacity:0.85} }
        @keyframes flashOut   { from{opacity:1} to{opacity:0} }
        @keyframes goldPulse  { from{text-shadow:0 0 40px rgba(212,175,55,0.7)} to{text-shadow:0 0 100px rgba(212,175,55,1),0 0 200px rgba(212,175,55,0.5)} }
        @keyframes shimmerText{ from{opacity:0.55;letter-spacing:9px} to{opacity:1;letter-spacing:11px} }
        @keyframes coinFly    { 0%{opacity:1;transform:translate(0,0) rotate(0)} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) rotate(var(--rot))} }
        @keyframes mintPulse  { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
      `}</style>

      {flow==="casino" && <CasinoExplosion onDone={onCasinoDone}/>}

      {/* Between-mint interstitial */}
      {betweenMints && (
        <div style={{position:"fixed",inset:0,zIndex:900,background:"#1A1A18",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,animation:"fadeIn 0.3s ease"}}>
          <div style={{fontSize:9,letterSpacing:6,color:"rgba(250,249,247,0.4)",textTransform:"uppercase",fontFamily:"'EB Garamond',Georgia,serif"}}>
            Next
          </div>
          <div style={{fontSize:42,fontStyle:"italic",color:"#FAF9F7",fontFamily:"'EB Garamond',Georgia,serif",letterSpacing:2}}>
            {completedMints.length + 1} <span style={{fontSize:18,color:"rgba(250,249,247,0.4)"}}>of {mintQueue.length}</span>
          </div>

        </div>
      )}

      {/* Batch choice — appears after mint 10 when there are more */}
      {showBatchChoice && (
        <div style={{position:"fixed",inset:0,zIndex:900,background:"#1A1A18",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:32,animation:"fadeIn 0.4s ease",padding:40}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:9,letterSpacing:6,color:"rgba(250,249,247,0.4)",textTransform:"uppercase",fontFamily:"'EB Garamond',Georgia,serif",marginBottom:16}}>
              10 of {mintQueue.length} revealed
            </div>
            <div style={{fontSize:36,fontStyle:"italic",color:"#FAF9F7",fontFamily:"'EB Garamond',Georgia,serif",letterSpacing:1}}>
              {mintQueue.length - 10} remaining
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:280}}>
            <button
              onClick={()=>{
                setShowBatchChoice(false);
                setBetweenMints(true);
        setTimeout(()=>{
          setMintQueueIdx(ni => {
            const m = mintQueue[ni];
            if (m) {
              setRolledTraits(m.rolled);
              setMintNumber(m.mintNumber);
              setBetweenMints(false);
              setTimeout(()=>startSpinSequence(m.rolled, m.mintNumber, ni), 50);
            }
            return ni;
          });
        }, 2000);
                setTimeout(()=>{
                  setBetweenMints(false);
                  setRolledTraits(mintQueue[mintQueueIdx].rolled);
                  setMintNumber(mintQueue[mintQueueIdx].mintNumber);
                  setStoppedCats({});
                  setFlow("ready");
                },1800);
              }}
              style={{padding:"16px 0",background:"transparent",color:"#FAF9F7",border:"1px solid rgba(250,249,247,0.3)",fontSize:9,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",fontFamily:"'EB Garamond',Georgia,serif"}}
            >
              Continue Watching
            </button>
            <button
              onClick={()=>revealAll(mintQueueIdx, mintQueue)}
              style={{padding:"16px 0",background:"#FAF9F7",color:"#1A1A18",border:"none",fontSize:9,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",fontFamily:"'EB Garamond',Georgia,serif"}}
            >
              Reveal All
            </button>
          </div>
        </div>
      )}

      <div style={{maxWidth:580,margin:"0 auto"}}>

        {/* HEADER */}
        <header style={{padding:"32px 32px 22px",borderBottom:"1px solid #1A1A18",position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <h1 style={{margin:0,textTransform:"uppercase",fontWeight:400,lineHeight:1.15}}>
                <span style={{display:"block",fontSize:28,letterSpacing:9}}>Public</span>
                <span style={{display:"block",fontSize:28,letterSpacing:9}}>Facing</span>
                <span style={{display:"block",fontSize:24,letterSpacing:8}}>Project</span>
              </h1>
              <div style={{fontSize:10,letterSpacing:2,color:"#6A6A65",marginTop:5,fontStyle:"italic"}}>
                Lampwrecked 2026
              </div>
            </div>
            <div style={{fontSize:8,letterSpacing:2,color:"#C8C5C0",textTransform:"uppercase",textAlign:"right"}}>
              Open Edition<br/>
              <span style={{color:"#D0CCC8"}}>$1 USDC</span>
            </div>
          </div>

          {/* Hamburger — fixed top right */}
          <button onClick={()=>setMenuOpen(o=>!o)} style={{position:"fixed",top:20,right:20,zIndex:200,background:"none",border:"none",cursor:"pointer",padding:8,display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end"}}>
            <span style={{display:"block",width:22,height:1,background:"#1A1A18",transition:"all 0.3s",transform:menuOpen?"rotate(45deg) translate(4px,4px)":"none"}}/>
            <span style={{display:"block",width:16,height:1,background:"#1A1A18",opacity:menuOpen?0:1,transition:"opacity 0.2s"}}/>
            <span style={{display:"block",width:22,height:1,background:"#1A1A18",transition:"all 0.3s",transform:menuOpen?"rotate(-45deg) translate(4px,-4px)":"none"}}/>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div style={{position:"fixed",top:52,right:20,background:"#FAF9F7",border:"1px solid #1A1A18",zIndex:200,minWidth:160,animation:"fadeIn 0.2s ease"}}>
              {[["mint","Mint"],["about","About"],["gallery","Gallery"],["sources","Sources"]].map(([key,label])=>(
                <button key={key} onClick={()=>{setPage(key);setMenuOpen(false);}} style={{
                  display:"block",width:"100%",textAlign:"left",
                  padding:"14px 24px",
                  background: page===key ? "#1A1A18" : "transparent",
                  color: page===key ? "#FAF9F7" : "#1A1A18",
                  border:"none",borderBottom:"1px solid #E8E5E0",
                  fontSize:9,letterSpacing:4,textTransform:"uppercase",
                  cursor:"pointer",fontFamily:"'EB Garamond',Georgia,serif",
                }}>
                  {label}
                </button>
              ))}
              <a
                href="https://www.lampwrecked.art"
                target="_blank"
                rel="noopener noreferrer"
                onClick={()=>setMenuOpen(false)}
                style={{
                  display:"block",width:"100%",textAlign:"left",
                  padding:"14px 24px",
                  background:"transparent",
                  color:"#1A1A18",
                  borderBottom:"1px solid #E8E5E0",
                  fontSize:9,letterSpacing:4,textTransform:"uppercase",
                  cursor:"pointer",fontFamily:"'EB Garamond',Georgia,serif",
                  textDecoration:"none",boxSizing:"border-box",
                }}>
                  Lampwrecked ↗
              </a>
            </div>
          )}
        </header>

        {/* PAGE CONTENT */}
        {page === "about" && (
          <div style={{padding:"40px 32px 52px",animation:"fadeIn 0.4s ease"}}>
            <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"#6A6A65",fontFamily:"'EB Garamond',Georgia,serif",marginBottom:24}}>About</div>

            {/* Stats table */}
            <div style={{borderTop:"1px solid #E0DDD8",borderLeft:"1px solid #E0DDD8",marginBottom:36,fontFamily:"'EB Garamond',Georgia,serif"}}>
              {[
                ["Artists","28"],
                ["Traits","224"],
                ["Minted","—"],
                ["Possible Combinations","380,000,000,000+"],
              ].map(([label, value]) => (
                <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"12px 16px",borderBottom:"1px solid #E0DDD8",borderRight:"1px solid #E0DDD8"}}>
                  <div style={{fontSize:8,letterSpacing:2.5,textTransform:"uppercase",color:"#6A6A65"}}>{label}</div>
                  <div style={{fontSize:16,fontStyle:"italic",color:"#1A1A18",letterSpacing:0.5}}>{value}</div>
                </div>
              ))}
            </div>

            {/* Body copy */}
            <p style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:15,lineHeight:1.9,color:"#1A1A18",margin:"0 0 20px"}}>
              Public Facing Project is an open edition generative portrait collection with no supply cap. Each mint draws from a pool of 28 historical artists, assembling a unique composite from eight independently randomized trait categories — head, eyes, nose, mouth, and two ghosted underlayers. With similarity constraints applied, the number of distinct possible combinations exceeds 380 billion. The collection will never close.
            </p>
            <p style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:15,lineHeight:1.9,color:"#1A1A18",margin:"0 0 20px"}}>
              Every portrait source was located, scaled, and digitally cut by hand — bone structure matched across centuries. As works enter the public domain each year, new artists join the pool. The collection grows. One exception exists: a single Van Gogh ear.
            </p>
            <p style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:13,lineHeight:1.9,color:"#6A6A65",margin:0,fontStyle:"italic",borderTop:"1px solid #E8E5E0",paddingTop:20}}>
              No wallet connection required. Send USDC, receive art.
            </p>
          </div>
        )}
        {page === "gallery" && (
          <GalleryPage traits={traits}/>
        )}
        {page === "sources" && (
          <SourcesPage/>
        )}
        {page === "lampwrecked" && (
          <div style={{padding:"40px 32px",animation:"fadeIn 0.4s ease",textAlign:"center"}}>
            <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"#6A6A65",fontFamily:"'EB Garamond',Georgia,serif",marginBottom:40}}>Lampwrecked</div>
            <a
              href="https://www.lampwrecked.art"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily:"'EB Garamond',Georgia,serif",
                fontSize:13,fontStyle:"italic",
                color:"#1A1A18",
                letterSpacing:1,
                textDecoration:"none",
                borderBottom:"1px solid #1A1A18",
                paddingBottom:2,
              }}
            >
              www.lampwrecked.art ↗
            </a>
          </div>
        )}

        {page === "mint" && <>

        {/* FRAME */}
        <div style={{padding:"20px 32px 0"}}>
          {(() => {
            const sel = selectedMintIdx !== null ? completedMints[selectedMintIdx] : null;
            const displayRolled = sel ? sel.rolledTraits : rolledTraits;
            const displayNumber = sel ? sel.mintNumber : mintNumber;
            const displayDate   = sel ? sel.mintDate   : mintDate;
            return (
              <Frame
                frameRef={frameRef}
                flow={flow}
                sessionAddr={sessionAddr}
                traits={traits}
                spinning={isSpinning}
                stoppedCats={stoppedCats}
                rolledTraits={displayRolled}
                cycleIndices={cycleIndices}
                mintDate={displayDate}
                isMinted={isMinted}
                mintNumber={displayNumber}
                onSpin={spin}
              />
            );
          })()}
        </div>

        {/* COMPLETED MINTS STRIP */}
        {completedMints.length > 0 && (
          <div style={{padding:"12px 32px 0"}}>
            <div style={{overflowX:"auto",paddingBottom:8}}>
              <div style={{display:"flex",gap:8}}>
                {completedMints.map((m, i) => (
                  <MintThumbnail key={i} rolled={m.rolledTraits} mintNumber={m.mintNumber} traits={traits}/>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* SLOT MACHINE */}
        <div style={{padding:"20px 32px 52px"}}>

          {flow==="paying" && (
            <PaymentPanel
              sessionAddr={sessionAddr}
              validUntil={validUntil}
              expired={expired}
              onNewSession={newSession}
              payState={payState}
              amountRcvd={amountRcvd}
            />
          )}

          {showReels && (
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,paddingBottom:14,borderBottom:"1px solid #1A1A18"}}>
                <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"#6A6A65",fontStyle:"italic",fontFamily:"'EB Garamond',Georgia,serif"}}>
                  {isSpinning?"Randomizing…":flow==="minting"?"Minting on-chain…":isMinted && mintQueue.length<=1?`Token #${mintNumber}`:isMinted?`${completedMints.length} of ${mintQueue.length} minted`:"Traits locked · ready to spin"}
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>

                  {isMinted && (
                    <>
                      <SaveDropdown
                        downloading={downloading}
                        downloadFrame={downloadFrame}
                        completedMints={completedMints}
                        traits={traits}
                        mintNumber={mintNumber}
                      />
                      <button onClick={reset} style={{padding:"7px 16px",border:"1px solid #D8D5D0",background:"transparent",fontSize:8,letterSpacing:3,cursor:"pointer",fontFamily:"'EB Garamond',Georgia,serif",color:"#555",textTransform:"uppercase"}}>
                        Mint Again
                      </button>
                      <button style={{padding:"7px 16px",border:"1px solid #C8A84B",background:"transparent",fontSize:8,letterSpacing:3,cursor:"pointer",fontFamily:"'EB Garamond',Georgia,serif",color:"#6B5020",textTransform:"uppercase"}}>
                        Explorer ↗
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                {["Direction","Left Eye","Right Eye","Nose","Mouth","Head","Ghost 2","Ghost 1","Base","Special"].map(cat=>(
                  <HorizontalReel key={cat} category={cat} traits={traits[cat]||["—"]} spinning={isSpinning} stopped={!!stoppedCats[cat]} targetIdx={(selectedMintIdx!==null?completedMints[selectedMintIdx].rolledTraits:rolledTraits)[cat]??0} isOneOfOne={cat===ONE_OF_ONE_CATEGORY}/>
                ))}
              </div>
            </>
          )}
        </div>

        </> /* end page === mint */}

        {/* MINT POPUP */}
        {mintPopup && (
          <div
            onClick={()=>setMintPopup(null)}
            style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn 0.2s ease"}}
          >
            <div
              onClick={e=>e.stopPropagation()}
              style={{width:"100%",maxWidth:580,background:"#FAF9F7",maxHeight:"90vh",overflowY:"auto",animation:"slideUp 0.3s ease"}}
            >
              {/* Composite image */}
              <div style={{position:"relative",width:"100%",paddingBottom:"100%",background:"#EDEAE5",overflow:"hidden"}}>
                {LAYER_ORDER.map((layer,z)=>{
                  const isBase=layer==="Base";
                  const isGhost=GHOST_LAYERS.includes(layer);
                  const isCutout=["Ghost 1","Ghost 2","Head","Mouth","Nose","Right Eye","Left Eye"].includes(layer);
                  if(!isBase&&!isCutout) return null;
                  const traitName=mintPopup.resolvedFiles ? mintPopup.resolvedFiles[layer] : (traits[layer]||[])[mintPopup.rolledTraits[layer]??0];
                  if(!traitName) return null;
                  return (
                    <div key={layer} style={{position:"absolute",inset:0,zIndex:z+1,opacity:isBase?1:isGhost?0.6:0.9}}>
                      <img src={imgUrl(layer,traitName)} alt="" crossOrigin="anonymous" style={{width:"100%",height:"100%",objectFit:isBase?"cover":"contain",display:"block"}}/>
                    </div>
                  );
                })}
              </div>
              {/* Matte */}
              <div style={{padding:"12px 20px 8px",borderBottom:"1px solid #E0DDD8",display:"flex",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:14,fontStyle:"italic",color:"#1A1A18"}}>Public Facing #{mintPopup.mintNumber}</div>
                  <div style={{fontSize:8,letterSpacing:2,color:"#6A6A65",textTransform:"uppercase",marginTop:2,fontFamily:"'EB Garamond',Georgia,serif"}}>Lampwrecked 2026</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:13,fontStyle:"italic",color:"#1A1A18"}}>{mintPopup.mintDate ? formatDateDisplay(new Date(mintPopup.mintDate)) : ""}</div>
                  <div style={{fontSize:8,letterSpacing:2,color:"#6A6A65",textTransform:"uppercase",marginTop:2,fontFamily:"'EB Garamond',Georgia,serif"}}>Date Minted</div>
                </div>
              </div>
              {/* Traits */}
              <div style={{padding:"0 20px 8px"}}>
                {["Direction","Left Eye","Right Eye","Nose","Mouth","Head","Ghost 2","Ghost 1","Base","Special"].map(cat=>{
                  const traitName=mintPopup.resolvedFiles ? mintPopup.resolvedFiles[cat] : (traits[cat]||[])[mintPopup.rolledTraits[cat]??0];
                  if(!traitName) return null;
                  return (
                    <div key={cat} style={{borderBottom:"1px solid #E8E5E0",padding:"10px 0"}}>
                      <div style={{fontSize:8,letterSpacing:2.5,textTransform:"uppercase",color:"#6A6A65",fontFamily:"'EB Garamond',Georgia,serif",marginBottom:3}}>{cat}</div>
                      <div style={{fontFamily:"'EB Garamond',Georgia,serif",fontStyle:"italic",fontSize:15,color:"#1A1A18"}}>{displayName(traitName)}</div>
                    </div>
                  );
                })}
              </div>
              {/* Close */}
              <button onClick={()=>setMintPopup(null)} style={{width:"100%",padding:"16px",background:"#1A1A18",color:"#FAF9F7",border:"none",fontSize:9,letterSpacing:4,textTransform:"uppercase",cursor:"pointer",fontFamily:"'EB Garamond',Georgia,serif"}}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{borderTop:"1px solid #E0DDD8",padding:"14px 32px",display:"flex",justifyContent:"space-between"}}>
          <div style={{fontSize:8,letterSpacing:2,color:"#D0CCC8",textTransform:"uppercase",fontFamily:"'EB Garamond',Georgia,serif"}}>Open Edition · No Supply Cap</div>
          <div style={{fontSize:8,letterSpacing:2,color:"#D0CCC8",textTransform:"uppercase",fontFamily:"'EB Garamond',Georgia,serif"}}>No Wallet Required</div>
        </div>

      </div>
    </div>
  );
}

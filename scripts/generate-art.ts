/**
 * AI champion portrait generator using fal.ai Flux Pro Ultra.
 *
 * Setup:
 *   1. npm install @fal-ai/client
 *   2. Add FAL_KEY=your_key_here to .env.local
 *   3. npm run generate-art
 *
 * Output: public/champions/<id>.png
 * Cost: ~$0.06/image with Flux Pro Ultra (vs $0.003 for Schnell)
 * Full set of 16: ~$1.00
 *
 * To regenerate specific portraits, delete their PNG files first.
 */

import { fal } from "@fal-ai/client";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";

// ─── Configuration ────────────────────────────────────────────────────────────

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("FAL_KEY environment variable is required. Add it to .env.local.");
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

const OUTPUT_DIR = path.join(process.cwd(), "public", "champions");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ─── Style guide ─────────────────────────────────────────────────────────────
// Targeting the aesthetic of RAID Shadow Legends / Omniheros / Legend City:
// attractive humanoid characters, detailed fantasy costumes, dramatic lighting,
// confident/powerful poses, high production mobile RPG card art quality.

const BASE_STYLE =
  "fantasy mobile RPG card art, high detail character portrait, " +
  "dramatic cinematic lighting, dark atmospheric background with subtle glow, " +
  "gorgeous detailed costume design, confident powerful pose, " +
  "professional digital painting, sharp focus on face and upper body, " +
  "rich saturated colors, no text, no border, no watermark";

const QUALITY_NEGATIVE =
  "ugly, deformed, blurry, low quality, cartoon, anime, chibi, " +
  "watermark, text, border, frame, extra limbs, bad anatomy";

const AFFINITY_STYLE: Record<string, string> = {
  Fire:
    "fire and ember color palette, molten cracks of light, " +
    "warm red-orange glow illuminating the face, heat haze, " +
    "volcanic background hints, smoldering intensity",
  Water:
    "deep ocean and ice color palette, cool blue-cyan luminescence, " +
    "water droplets catching light, frozen crystal accents, " +
    "bioluminescent glow, ethereal underwater atmosphere",
  Earth:
    "deep forest and stone color palette, rich green-brown earth tones, " +
    "bioluminescent moss and vines, ancient stone textures, " +
    "nature magic particles, dappled golden light through canopy",
  Lightning:
    "electric purple-gold color palette, crackling arc lightning, " +
    "neon electricity outlining the silhouette, storm energy, " +
    "charged particles in the air, dramatic dark storm sky",
};

// ─── Archetype definitions ────────────────────────────────────────────────────

interface Archetype {
  id: string;
  name: string;
  affinity: "Fire" | "Water" | "Earth" | "Lightning";
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  characterPrompt: string;
}

const ARCHETYPES: Archetype[] = [
  // ── Fire ──────────────────────────────────────────────────────────────────
  {
    id: "fire-common-warrior",
    name: "Ash Soldier",
    affinity: "Fire",
    rarity: "Common",
    characterPrompt:
      "attractive young woman, fierce determined expression, " +
      "battle-worn leather armor with exposed midriff, flame-red hair loose in the wind, " +
      "hand resting on sword hilt, soot and ember marks on skin",
  },
  {
    id: "fire-rare-knight",
    name: "Ember Knight",
    affinity: "Fire",
    rarity: "Rare",
    characterPrompt:
      "beautiful athletic woman in ornate molten-iron plate armor, " +
      "pauldrons shaped like phoenix wings, breastplate revealing décolletage, " +
      "fiery amber eyes glowing, long crimson hair braided with gold, " +
      "commanding confident smile, flaming sword raised",
  },
  {
    id: "fire-epic-dragon",
    name: "Pyrewing",
    affinity: "Fire",
    rarity: "Epic",
    characterPrompt:
      "stunning half-dragon woman, small elegant horns curving back from temples, " +
      "iridescent red-gold scales along jaw and collarbones, " +
      "revealing draconic armor with scales and gemstones, " +
      "smoldering amber eyes with slit pupils, fire breathing between lips, " +
      "powerful dragon wings unfurling behind her, imperious regal expression",
  },
  {
    id: "fire-legendary-phoenix",
    name: "Phoenix Lord",
    affinity: "Fire",
    rarity: "Legendary",
    characterPrompt:
      "divine goddess of fire, impossibly beautiful ageless face, " +
      "celestial armor of pure solidified sunlight with golden phoenix motifs, " +
      "hair flowing upward like living flames, glowing phoenix wings of golden fire, " +
      "transcendent serene power, body wreathed in sacred white-gold flame, " +
      "floating above mortal concerns, eyes like twin suns",
  },

  // ── Water ─────────────────────────────────────────────────────────────────
  {
    id: "water-common-mage",
    name: "Tide Caller",
    affinity: "Water",
    rarity: "Common",
    characterPrompt:
      "attractive young man with tousled silver-blue hair, " +
      "open flowing coastal robes partly unlaced showing chest, " +
      "intelligent earnest expression, water orb floating in palm, " +
      "silver earrings, bare shoulders, ocean spray glistening on skin",
  },
  {
    id: "water-rare-knight",
    name: "Frost Warden",
    affinity: "Water",
    rarity: "Rare",
    characterPrompt:
      "beautiful pale woman in ice-forged crystalline armor, " +
      "form-fitting frost plate revealing curves, glacial blue eyes " +
      "cold and calculating, long white hair with ice crystals woven in, " +
      "elegant elongated fingers gripping a frozen lance, cool half-smile",
  },
  {
    id: "water-epic-siren",
    name: "Deep Siren",
    affinity: "Water",
    rarity: "Epic",
    characterPrompt:
      "breathtaking sea goddess, flowing iridescent scales fading to flawless skin, " +
      "coral and pearl armor draped elegantly over curves, " +
      "long dark teal hair floating as if underwater, " +
      "luminous blue-green eyes with an otherworldly pull, " +
      "bioluminescent markings along neck and shoulders, " +
      "expression of alluring dangerous beauty",
  },
  {
    id: "water-legendary-kraken",
    name: "Tidal Sovereign",
    affinity: "Water",
    rarity: "Legendary",
    characterPrompt:
      "ancient sea king, ruggedly handsome weathered face with ageless authority, " +
      "deep ocean armor of abyssal black and silver with bioluminescent runes, " +
      "silver-white long hair flowing in invisible currents, " +
      "abyss-dark eyes containing entire oceans, " +
      "tentacle motifs coiling along massive shoulders and arms, " +
      "radiating crushing oceanic power, god of the deep",
  },

  // ── Earth ─────────────────────────────────────────────────────────────────
  {
    id: "earth-common-druid",
    name: "Sprout Keeper",
    affinity: "Earth",
    rarity: "Common",
    characterPrompt:
      "charming young man, earthy handsome face, warm genuine smile, " +
      "simple open linen tunic with leaf-weave patterns, " +
      "braided brown hair with tiny wildflowers tucked in, " +
      "staff of living wood with sprouting leaves, sun-kissed freckled skin",
  },
  {
    id: "earth-rare-golem",
    name: "Stone Sentinel",
    affinity: "Earth",
    rarity: "Rare",
    characterPrompt:
      "strikingly beautiful woman made partially of living stone and earth, " +
      "smooth grey-green stone skin cracked with glowing green veins, " +
      "organic stone armor formed around her figure, mossy accents, " +
      "face human and gorgeous with glowing emerald eyes, " +
      "expression of serene immovable strength",
  },
  {
    id: "earth-epic-treant",
    name: "Ancient Bough",
    affinity: "Earth",
    rarity: "Epic",
    characterPrompt:
      "magnificent nature spirit woman, ancient bark skin that flows to flawless " +
      "human skin at her face and décolletage, glowing golden sap in the cracks, " +
      "crown of flowering branches, armored in overlapping oak leaves and dark wood, " +
      "amber forest eyes, long green-brown hair entwined with living vines, " +
      "aura of deep ancient power and wild beauty",
  },
  {
    id: "earth-legendary-gaia",
    name: "World Root",
    affinity: "Earth",
    rarity: "Legendary",
    characterPrompt:
      "primordial earth goddess, hauntingly perfect face of ageless beauty, " +
      "armor grown from living world-tree wood, emerald gems and gold veins, " +
      "flowing hair that cascades into roots and wildflowers, " +
      "skin faintly glowing with inner earth light, " +
      "eyes swirling with forests and mountains, " +
      "absolute serenity and overwhelming natural power, " +
      "flowers blooming in her wake",
  },

  // ── Lightning ─────────────────────────────────────────────────────────────
  {
    id: "lightning-common-scout",
    name: "Spark Scout",
    affinity: "Lightning",
    rarity: "Common",
    characterPrompt:
      "attractive young woman, sharp mischievous expression, " +
      "sleek form-fitting light leather bodysuit with electric-blue trim, " +
      "short platinum hair with purple streaks, " +
      "small sparks crackling at fingertips, athletic agile build, " +
      "goggles pushed up on forehead, cocky grin",
  },
  {
    id: "lightning-rare-duelist",
    name: "Arc Duelist",
    affinity: "Lightning",
    rarity: "Rare",
    characterPrompt:
      "devastatingly handsome man with silver hair and an electric charge in the air, " +
      "sleek close-fitting duelist jacket open at chest, " +
      "twin electrified rapiers with purple lightning arcing between them, " +
      "smirking with absolute confidence, eyes crackling with electricity, " +
      "lightning tattoos along jawline and neck, lithe athletic frame",
  },
  {
    id: "lightning-epic-storm",
    name: "Storm Caller",
    affinity: "Lightning",
    rarity: "Epic",
    characterPrompt:
      "gorgeous storm mage, wild violet-silver hair whipping in electrical wind, " +
      "revealing dark bodysuit with arcing lightning patterns, " +
      "storm-grey eyes fully consumed by swirling electricity, " +
      "multiple lightning bolts orbiting her like a crown, " +
      "one hand outstretched commanding a thunderhead, " +
      "intense expression of barely-controlled power",
  },
  {
    id: "lightning-legendary-zeus",
    name: "Thunder God",
    affinity: "Lightning",
    rarity: "Legendary",
    characterPrompt:
      "divine thunder deity, impossibly handsome chiseled face of divine authority, " +
      "gilded divine armor with thunderbolt motifs, open at chest revealing golden glowing skin, " +
      "white-gold hair lit from within by lightning, " +
      "eyes of pure white electricity, " +
      "golden thunderbolt weapon crackling with divine power, " +
      "surrounded by a corona of sacred lightning, " +
      "expression of absolute sovereign power and divine beauty",
  },
];

// ─── Generation ───────────────────────────────────────────────────────────────

async function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", reject);
  });
}

async function generatePortrait(archetype: Archetype): Promise<void> {
  const outputPath = path.join(OUTPUT_DIR, `${archetype.id}.png`);
  if (fs.existsSync(outputPath)) {
    console.log(`  ⏭  ${archetype.id} already exists, skipping`);
    return;
  }

  const prompt = [
    archetype.characterPrompt,
    AFFINITY_STYLE[archetype.affinity],
    BASE_STYLE,
    `${archetype.rarity.toLowerCase()} rarity power, ${archetype.rarity === "Legendary" ? "godlike presence, awe-inspiring" : archetype.rarity === "Epic" ? "epic power, breathtaking" : archetype.rarity === "Rare" ? "impressive rare quality" : "capable competent"}`,
  ].join(", ");

  console.log(`  🎨 Generating ${archetype.name} (${archetype.affinity} ${archetype.rarity})…`);

  const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
    input: {
      prompt,
      negative_prompt: QUALITY_NEGATIVE,
      num_images: 1,
      aspect_ratio: "3:4",
      output_format: "png",
      safety_tolerance: "5",
    },
  });

  const data = result.data as { images: Array<{ url: string }> };
  const imageUrl = data.images[0].url;
  await downloadImage(imageUrl, outputPath);
  console.log(`  ✅ Saved ${archetype.id}.png`);
}

async function main() {
  console.log(`\nChampion Forge — Art Generator (Flux Pro Ultra)`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Model: fal-ai/flux-pro/v1.1-ultra (~$0.06/image)`);
  console.log(`Generating up to ${ARCHETYPES.length} portraits (skips existing)...\n`);

  let generated = 0;
  let skipped = 0;

  for (const archetype of ARCHETYPES) {
    const outputPath = path.join(OUTPUT_DIR, `${archetype.id}.png`);
    if (fs.existsSync(outputPath)) { skipped++; continue; }
    try {
      await generatePortrait(archetype);
      generated++;
    } catch (err) {
      console.error(`  ❌ Failed ${archetype.id}:`, err);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\n✨ Done. Generated: ${generated}  Skipped: ${skipped}`);
  if (generated > 0) {
    console.log(`\nEstimated cost: ~$${(generated * 0.06).toFixed(2)}`);
  }
}

main().catch(console.error);

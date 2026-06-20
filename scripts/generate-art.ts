/**
 * AI champion portrait generator using fal.ai Flux.
 *
 * Setup:
 *   1. npm install @fal-ai/client
 *   2. Add FAL_KEY=your_key_here to .env.local
 *   3. npx tsx scripts/generate-art.ts
 *
 * Output: public/champions/<id>.png
 * After running, set imageUrl on champion archetypes in src/data/archetypes.ts
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

const BASE_STYLE =
  "fantasy RPG card art, dark painterly style, dramatic lighting, " +
  "character portrait, black gradient background, game card illustration, " +
  "high detail, cinematic, no text, no border";

const AFFINITY_STYLE: Record<string, string> = {
  Fire: "fire elemental warrior, red and orange flames, molten armor, ember glow",
  Water: "water elemental mage, blue and cyan ice crystals, flowing robes, frost aura",
  Earth: "earth elemental guardian, stone armor, green vines, nature magic",
  Lightning: "lightning elemental striker, purple and yellow electricity, storm energy, arc lightning",
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
  // Fire
  { id: "fire-common-warrior", name: "Ash Soldier", affinity: "Fire", rarity: "Common", characterPrompt: "young human soldier in simple fire-scorched armor" },
  { id: "fire-rare-knight", name: "Ember Knight", affinity: "Fire", rarity: "Rare", characterPrompt: "armored knight with flaming sword and molten shield" },
  { id: "fire-epic-dragon", name: "Pyrewing", affinity: "Fire", rarity: "Epic", characterPrompt: "half-dragon champion with wings of fire, imposing stance" },
  { id: "fire-legendary-phoenix", name: "Phoenix Lord", affinity: "Fire", rarity: "Legendary", characterPrompt: "celestial phoenix-human hybrid, crown of eternal flames, transcendent power" },

  // Water
  { id: "water-common-mage", name: "Tide Caller", affinity: "Water", rarity: "Common", characterPrompt: "young mage in simple blue robes holding a water orb" },
  { id: "water-rare-knight", name: "Frost Warden", affinity: "Water", rarity: "Rare", characterPrompt: "armored knight with ice-forged sword and frozen shield" },
  { id: "water-epic-siren", name: "Deep Siren", affinity: "Water", rarity: "Epic", characterPrompt: "powerful sea goddess, coral armor, commanding presence, ocean depths behind her" },
  { id: "water-legendary-kraken", name: "Tidal Sovereign", affinity: "Water", rarity: "Legendary", characterPrompt: "ancient sea lord, tentacle armor, tsunami energy, godlike presence" },

  // Earth
  { id: "earth-common-druid", name: "Sprout Keeper", affinity: "Earth", rarity: "Common", characterPrompt: "young druid in simple leaf armor with a wooden staff" },
  { id: "earth-rare-golem", name: "Stone Sentinel", affinity: "Earth", rarity: "Rare", characterPrompt: "living stone golem guardian, mossy armor, glowing green eyes" },
  { id: "earth-epic-treant", name: "Ancient Bough", affinity: "Earth", rarity: "Epic", characterPrompt: "massive ancient treant warrior, bark armor, nature power radiating" },
  { id: "earth-legendary-gaia", name: "World Root", affinity: "Earth", rarity: "Legendary", characterPrompt: "primordial earth deity, mountain-sized presence compressed to human form, world tree" },

  // Lightning
  { id: "lightning-common-scout", name: "Spark Scout", affinity: "Lightning", rarity: "Common", characterPrompt: "nimble scout in light leather armor with crackling electricity" },
  { id: "lightning-rare-duelist", name: "Arc Duelist", affinity: "Lightning", rarity: "Rare", characterPrompt: "fast duelist with twin electrified blades, lightning trail" },
  { id: "lightning-epic-storm", name: "Storm Caller", affinity: "Lightning", rarity: "Epic", characterPrompt: "storm mage with thundercloud cloak, lightning staff, eyes of electricity" },
  { id: "lightning-legendary-zeus", name: "Thunder God", affinity: "Lightning", rarity: "Legendary", characterPrompt: "divine thunder deity, golden armor crackling with pure lightning, divine storm" },
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
    `${archetype.rarity.toLowerCase()} tier power level`,
  ].join(", ");

  console.log(`  🎨 Generating ${archetype.name} (${archetype.affinity} ${archetype.rarity})…`);

  const result = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt,
      image_size: "portrait_4_3",
      num_images: 1,
      num_inference_steps: 4,
    },
  });

  const data = result.data as { images: Array<{ url: string }> };
  const imageUrl = data.images[0].url;
  await downloadImage(imageUrl, outputPath);
  console.log(`  ✅ Saved ${archetype.id}.png`);
}

async function main() {
  console.log(`\nChampion Forge — Art Generator`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Generating ${ARCHETYPES.length} portraits...\n`);

  for (const archetype of ARCHETYPES) {
    try {
      await generatePortrait(archetype);
    } catch (err) {
      console.error(`  ❌ Failed ${archetype.id}:`, err);
    }
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log("\n✨ Done. Add imageUrl fields to src/data/archetypes.ts:\n");
  for (const a of ARCHETYPES) {
    console.log(`  ${a.id}: "/champions/${a.id}.png"`);
  }
}

main().catch(console.error);

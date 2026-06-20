import { fal } from "@fal-ai/client";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error("FAL_KEY required in .env.local"); process.exit(1); }
fal.config({ credentials: FAL_KEY });

const OUTPUT_DIR = path.join(process.cwd(), "public", "champions", "previews");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const CHARACTER =
  "stunningly beautiful human woman, " +
  "long wavy auburn-red hair, " +
  "heavy-lidded bedroom eyes with glowing amber irises, full pouty lips slightly parted, " +
  "high cheekbones, seductive expression, " +
  "two large curved red-gold dragon horns growing from forehead, " +
  "large bat-like dragon wings, long dragon tail, " +
  "iridescent red-gold dragon scale micro-bikini top — tiny triangles barely covering areola, " +
  "nipples clearly visible at edges pressing against fabric, " +
  "micro string thong bikini bottom — thin strings over hips, barely covering, " +
  "dragon scales decorating collarbone and outer thighs, " +
  "molten orange light cracking along skin, athletic voluptuous figure, " +
  "large full breasts, wide hips, toned stomach";

const ATMOSPHERE =
  "volcanic dark background, lava glow from below lighting her body, " +
  "dramatic warm rim lighting emphasizing every curve, " +
  "fantasy RPG character art, cinematic digital painting, " +
  "full body head to toe completely visible, feet at bottom of frame, head at top, " +
  "no text no border no watermark";

const NEGATIVE =
  "dragon snout, animal face, monster face, non-human face, face in strict sideways profile, " +
  "ugly, deformed, extra limbs, bad anatomy, blurry, low quality, cartoon, chibi, " +
  "fully clothed, covered, prudish, modest, text, border, watermark, censored";

const VIEWS = [
  {
    id: "pyrewing-front",
    label: "Front",
    pose:
      "full frontal pose facing viewer, " +
      "standing with legs apart, one hand pulling down bikini string suggestively, " +
      "other hand resting on stomach, chest thrust forward and upward, " +
      "back dramatically arched, biting lower lip seductively, " +
      "direct heavy-lidded eye contact with viewer, wings spread wide",
  },
  {
    id: "pyrewing-left-quarter",
    label: "Left ¾",
    pose:
      "three-quarter view from left, body angled left, face turned toward viewer, " +
      "both hands running through hair above head, " +
      "chest pushed dramatically forward and upward, " +
      "back arched deeply, hip cocked to one side, " +
      "bikini top barely in place, parted lips, seductive gaze toward camera",
  },
  {
    id: "pyrewing-right-quarter",
    label: "Right ¾",
    pose:
      "three-quarter view from right, body angled right, human face turned toward viewer, " +
      "one hand on hip pulling thong string, other hand resting on chest, " +
      "arching backward, head tilted back then turning to smirk at camera, " +
      "showing right side of body, side of breast, hip and thigh, tail curling forward between legs",
  },
  {
    id: "pyrewing-back",
    label: "Back",
    pose:
      "back view body facing away, " +
      "bent slightly forward, backside prominently displayed toward viewer, " +
      "thong string disappearing between cheeks fully visible, " +
      "looking back over shoulder with heavy-lidded seductive smirk, human face clearly visible, " +
      "one hand reaching back touching hip, " +
      "wings spread framing her back, glowing dragon spine down back, tail sweeping low",
  },
];

async function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", reject);
  });
}

async function main() {
  console.log(`\nPyrewing — 4-angle preview (v4: more titillating, consistent auburn hair)\n`);

  for (const view of VIEWS) {
    const outputPath = path.join(OUTPUT_DIR, `${view.id}.png`);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    console.log(`  🎨 ${view.label}…`);
    try {
      const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
        input: {
          prompt: `${view.pose}, ${CHARACTER}, ${ATMOSPHERE}`,
          negative_prompt: NEGATIVE,
          num_images: 1,
          aspect_ratio: "3:4",
          output_format: "png",
          safety_tolerance: "6",
        },
      });
      const data = result.data as { images: Array<{ url: string }> };
      await downloadImage(data.images[0].url, outputPath);
      console.log(`  ✅ ${view.id}.png`);
    } catch (err) {
      console.error(`  ❌`, err);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\n✨ Done — public/champions/previews/`);
}

main().catch(console.error);

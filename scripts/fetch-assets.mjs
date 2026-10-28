import fs from "node:fs";
import path from "node:path";

const ORIGIN = "https://www.dapizzahub.in";
const PUBLIC_DIR = path.join(process.cwd(), "public");

const ASSETS = [
  "images/branches/jhinjhak.webp",
  "images/branches/panki.webp",
  "images/branches/raniya.webp",
  "images/branches/rasulabad.webp",
  "images/bread/cheesy-paneer-spicy-twists.webp",
  "images/bread/cheesy-spicy-twists.webp",
  "images/bread/chesseg.webp",
  "images/bread/garlic-bread.webp",
  "images/bread/stuff-garlic.webp",
  "images/bread/tandoori.webp",
  "images/burger/aloo-tikki.webp",
  "images/burger/cheese-burger.webp",
  "images/burger/crispy-veggie.webp",
  "images/burger/king-special.webp",
  "images/burger/maharaja-burger.webp",
  "images/burger/paneer-burger.webp",
  "images/burger/pizza-burger.webp",
  "images/burger/spicy-burger.webp",
  "images/burger/spicy-veggie-burger.webp",
  "images/burger/tandoori-burger.webp",
  "images/combos/combo-1.webp",
  "images/combos/combo-2.webp",
  "images/combos/combo-3.webp",
  "images/combos/combo-4.webp",
  "images/combos/combo-5.webp",
  "images/combos/combo-6.webp",
  "images/dessert/choco-lava-cake.webp",
  "images/dips/cheese.webp",
  "images/dips/jalapeno.webp",
  "images/fries/cheese-fries.webp",
  "images/fries/crispers-fries.webp",
  "images/fries/kungfu-fries.webp",
  "images/fries/lemon-peri-peri-fries.webp",
  "images/fries/masala-fries.webp",
  "images/gallery/insta-11.webp",
  "images/gallery/insta-12.webp",
  "images/gallery/insta-13.webp",
  "images/gallery/insta-14.webp",
  "images/gallery/insta-15.webp",
  "images/gallery/insta-16.webp",
  "images/gallery/insta-17.webp",
  "images/gallery/insta-18.webp",
  "images/gallery/insta-19.webp",
  "images/gallery/insta-20.webp",
  "images/hero/hero-main.webp",
  "images/mocktail/mocktail-1.webp",
  "images/offers/offer-1.webp",
  "images/offers/offer-2.webp",
  "images/offers/offer-3.webp",
  "images/pasta/red-sauce-pasta.webp",
  "images/pasta/tandoori-sauce-pasta.webp",
  "images/pasta/white-sauce-pasta.webp",
  "images/pizza-generic/pizza-1.webp",
  "images/pizza-generic/pizza-6.webp",
  "images/pizza-named/cheese-and-corn.webp",
  "images/pizza-named/cheese-and-paneer.webp",
  "images/pizza-named/cheese-and-redpepper.webp",
  "images/pizza-named/cheese-mushroom.webp",
  "images/pizza-named/chefs-special.webp",
  "images/pizza-named/country-special.webp",
  "images/pizza-named/da-paneer-special.webp",
  "images/pizza-named/deluxe-veggie-delight.webp",
  "images/pizza-named/double-cheese-margherita.webp",
  "images/pizza-named/farm-house-pizza.webp",
  "images/pizza-named/fresh-veggie.webp",
  "images/pizza-named/gourmet-pizza.webp",
  "images/pizza-named/margherita-cheese-tomato.webp",
  "images/pizza-named/margherita.webp",
  "images/pizza-named/maxican-green.webp",
  "images/pizza-named/peppy-paneer-special.webp",
  "images/pizza-named/spicy-triple-tangy-twist.webp",
  "images/pizza-named/spicy-veggie.webp",
  "images/pizza-named/super-soft-pizza.webp",
  "images/pizza-named/tandoori-paneer-pizza.webp",
  "images/pizza-named/tandoori-pizza.webp",
  "images/pizza-named/veg-exotica.webp",
  "images/pizza-named/veg-extra-vaganza.webp",
  "images/pizza-named/veggie-paradise.webp",
  "images/pocket parcel/calzone.webp",
  "images/pocket parcel/pocket-parcel.webp",
  "images/quick/delivery.webp",
  "images/quick/dinein.webp",
  "images/quick/party.webp",
  "images/quick/takeaway.webp",
  "images/shake/chocolate-shake.webp",
  "images/shake/vanilla-shake.webp",
  "images/wrap/indian-paneer-wrap.webp",
  "images/wrap/indian-veg-wrap.webp",
  "images/wrap/mexican-aloo-tikki-wrap.webp"
];

async function loadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default || mod;
  } catch {
    return null;
  }
}

async function downloadOne(relPath, sharpLib) {
  const dest = path.join(PUBLIC_DIR, relPath);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 100) {
    return "cached";
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  const encodedPath = relPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  const url = `${ORIGIN}/${encodedPath}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let buf = Buffer.from(await res.arrayBuffer());

      if (sharpLib && relPath.endsWith(".webp") && buf.length > 260 * 1024) {
        const maxW = relPath.includes("hero") ? 1400 : 900;
        buf = await sharpLib(buf)
          .resize({ width: maxW, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
      }
      fs.writeFileSync(dest, buf);
      return "downloaded";
    } catch (err) {
      if (attempt === 3) {
        console.warn(`[fetch-assets] Failed ${relPath}:`, err.message);
        return "failed";
      }
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
}

async function main() {
  const missing = ASSETS.filter((rel) => {
    const p = path.join(PUBLIC_DIR, rel);
    return !fs.existsSync(p) || fs.statSync(p).size <= 100;
  });

  const sharpLib = missing.length > 0 ? await loadSharp() : null;

  if (missing.length > 0) {
    console.log(`[fetch-assets] Downloading ${missing.length} assets...`);
    let idx = 0;
    const concurrency = 10;
    const workers = Array.from({ length: concurrency }, async () => {
      while (idx < missing.length) {
        const current = missing[idx++];
        await downloadOne(current, sharpLib);
      }
    });
    await Promise.all(workers);
  }

  const ogDest = path.join(PUBLIC_DIR, "brand/og-image.jpg");
  const heroSrc = path.join(PUBLIC_DIR, "images/hero/hero-main.webp");
  if (!fs.existsSync(ogDest) && fs.existsSync(heroSrc)) {
    fs.mkdirSync(path.dirname(ogDest), { recursive: true });
    const s = sharpLib || (await loadSharp());
    if (s) {
      const jpg = await s(heroSrc)
        .resize(1200, 630, { fit: "cover" })
        .jpeg({ quality: 84 })
        .toBuffer();
      fs.writeFileSync(ogDest, jpg);
    } else {
      fs.copyFileSync(heroSrc, ogDest);
    }
  }
  console.log("[fetch-assets] Ready.");
}

main().catch((err) => {
  console.error("[fetch-assets] Unexpected error:", err);
});

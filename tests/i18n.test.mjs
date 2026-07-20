import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { ENTITY_TRANSLATIONS, LANGUAGES, MESSAGES, entity, localeCoverage, numberLocale, resolvePreferredLanguage, translate } from "../game/src/i18n.js";

const expectedLanguages = ["en", "pt-BR", "de", "fr", "ja", "ko", "zh-Hans", "zh-Hant"];
const i18nContextSource = fs.readFileSync(new URL("../game/src/I18nContext.jsx", import.meta.url), "utf8");
const entityIds = {
  port: ["driftwood", "coral", "mist"],
  route: ["nearshore", "coral", "abyss"],
  routeHint: ["nearshore", "coral", "abyss"],
  fish: ["silver_dart", "coral_snapper", "moonfin_tuna", "ghost_ray", "sunscale_oarfish", "lagoon_blenny", "reef_butterfly", "ember_lionfish", "ribbon_moray", "mist_sardine", "frostfin_hake", "glass_squid", "lantern_angler", "crown_coelacanth"],
  rarity: ["common", "uncommon", "rare", "epic", "legendary"],
  vessel: ["skiff", "trawler", "ocean", "deepsea"],
  equipment: ["engine", "hull", "net", "sonar", "cooler", "cannon"],
  crew: ["captain", "fisher", "engineer"],
  facility: ["berth", "coldStorage", "market", "lighthouse"],
  order: ["morning-market", "dockside-cafe", "reef-banquet", "harbor-hotel", "collector-cooler", "ocean-research"],
  period: ["dawn", "day", "dusk", "night"],
  weather: ["clear", "cloudy", "fog", "rain", "storm"]
};

test("ships the exact eight requested interface languages", () => {
  assert.deepEqual(LANGUAGES.map((language) => language.id), expectedLanguages);
});

test("every locale covers every interface message", () => {
  assert.deepEqual(localeCoverage(), Object.fromEntries(expectedLanguages.map((locale) => [locale, []])));
});

test("device language selection is global-first with English fallback", () => {
  assert.equal(resolvePreferredLanguage(["de-DE"]), "de");
  assert.equal(resolvePreferredLanguage(["zh-MO"]), "zh-Hant");
  assert.equal(resolvePreferredLanguage(["zh-CN"]), "zh-Hans");
  assert.equal(resolvePreferredLanguage(["pt-PT"]), "pt-BR");
  assert.equal(resolvePreferredLanguage(["es-ES"]), "en");
  assert.equal(translate("es-ES", "nav.harbor"), "Harbor");
  assert.equal(entity("es-ES", "fish", "ghost_ray"), "Ghost Ray");
  assert.equal(numberLocale("es-ES"), "en-US");
});

test("game language hydrates from and persists to the shared harbor preference", () => {
  assert.match(i18nContextSource, /fetch\("\/api\/state"/);
  assert.match(i18nContextSource, /state\?\.preferences\?\.language/);
  assert.match(i18nContextSource, /type: "set_language", language/);
  assert.match(i18nContextSource, /localStorage\.setItem\(LANGUAGE_STORAGE_KEY, language\)/);
});

test("every locale covers all stable game entities", () => {
  for (const locale of expectedLanguages) {
    const dictionary = ENTITY_TRANSLATIONS[locale];
    assert.ok(dictionary, `missing entity dictionary for ${locale}`);
    for (const [group, ids] of Object.entries(entityIds)) {
      for (const id of ids) assert.ok(dictionary[group]?.[id], `missing ${locale}.${group}.${id}`);
    }
  }
});

test("compact navigation and command labels stay within fixed controls", () => {
  const compactKeys = ["nav.harbor", "nav.voyages", "nav.warehouse", "nav.orders", "nav.progression", "nav.settings", "orders.done", "orders.deliver", "orders.short", "progress.active", "progress.use"];
  for (const locale of expectedLanguages) {
    for (const key of compactKeys) assert.ok(translate(locale, key).length <= 16, `${locale}.${key} is too long`);
  }
});

test("interpolation preserves concise localized meaning", () => {
  assert.equal(translate("en", "voyage.cost", { value: 20 }), "20 power");
  assert.equal(translate("pt-BR", "fish.hit", { damage: 2 }), "Acerto -2");
  assert.equal(translate("zh-Hans", "port.invest", { value: 10 }), "投入 10 航力");
});

test("translations contain no corrupt or private-use characters", () => {
  const flatten = (value) => Object.values(value).flatMap((item) => {
    if (Array.isArray(item)) return item;
    if (item && typeof item === "object") return flatten(item);
    return [item];
  });
  const forbidden = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uE000-\uF8FF\uFFFD]/u;
  for (const locale of expectedLanguages) {
    for (const value of [...flatten(MESSAGES[locale]), ...flatten(ENTITY_TRANSLATIONS[locale])]) {
      assert.doesNotMatch(String(value), forbidden, `${locale} contains a corrupt character`);
    }
  }
});

test("every locale preserves English interpolation variables", () => {
  const variables = (value) => [...String(value).matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const locale of expectedLanguages) {
    for (const key of Object.keys(MESSAGES.en)) {
      assert.deepEqual(variables(MESSAGES[locale][key]), variables(MESSAGES.en[key]), `${locale}.${key} has mismatched variables`);
    }
  }
});

test("Simplified Chinese does not inherit known Traditional glyphs", () => {
  const simplified = JSON.stringify({ messages: MESSAGES["zh-Hans"], entities: ENTITY_TRANSLATIONS["zh-Hans"] });
  assert.doesNotMatch(simplified, /[傷燈隊]/u);
});

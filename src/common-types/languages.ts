import { z } from "zod";

/**
 * We have three different lists of languages:
 * - transcriptionLanguageCodes: Languages supported by Speechmatics for real-time transcription.
 * - batchTranscriptionLanguageCodes: Languages supported by Speechmatics for batch transcription (including "auto" for automatic language detection).
 * - outputLanguageCodes: Languages we support for generating summaries and analyses. This is a hand-picked subset of the languages supported by Speechmatics.
 */

/**
 * Notes:
 * - Unfortunately, Speechmatics' packages do not include a list of languages supported by them, so we need to manually add them here
 * - We do not expose multilingual options (e.g., Mandarin and English)
 *
 * @see https://docs.speechmatics.com/speech-to-text/languages
 */
export const languages = [
  {
    code: "id",
    englishName: "Indonesian",
    localizedName: "Bahasa Indonesia",
    icon: "id",
  },
  {
    code: "ms",
    englishName: "Malay",
    localizedName: "Bahasa Melayu",
    icon: "my",
  },
  {
    code: "ca",
    englishName: "Catalan",
    localizedName: "Català",
    icon: "es-ct",
  },
  {
    code: "cs",
    englishName: "Czech",
    localizedName: "Čeština",
    icon: "cz",
  },
  {
    code: "cy",
    englishName: "Welsh",
    localizedName: "Cymraeg",
    icon: "gb-wls",
  },
  {
    code: "da",
    englishName: "Danish",
    localizedName: "Dansk",
    icon: "dk",
  },
  {
    code: "de",
    englishName: "German",
    localizedName: "Deutsch",
    icon: "de",
  },
  {
    code: "et",
    englishName: "Estonian",
    localizedName: "Eesti",
    icon: "ee",
  },
  {
    code: "en",
    englishName: "English",
    localizedName: "English",
    icon: "gb",
  },
  {
    code: "es",
    englishName: "Spanish",
    localizedName: "Español",
    icon: "es",
  },
  {
    code: "eo",
    englishName: "Esperanto",
    localizedName: "Esperanto",
    icon: "esperanto",
  },
  {
    code: "eu",
    englishName: "Basque",
    localizedName: "Euskara",
    icon: "es-pv",
  },
  {
    code: "fr",
    englishName: "French",
    localizedName: "Français",
    icon: "fr",
  },
  {
    code: "ga",
    englishName: "Irish",
    localizedName: "Gaeilge",
    icon: "ie",
  },
  {
    code: "gl",
    englishName: "Galician",
    localizedName: "Galego",
    icon: "es-ga",
  },
  {
    code: "hr",
    englishName: "Croatian",
    localizedName: "Hrvatski",
    icon: "hr",
  },
  {
    code: "it",
    englishName: "Italian",
    localizedName: "Italiano",
    icon: "it",
  },
  {
    code: "sw",
    englishName: "Swahili",
    localizedName: "Kiswahili",
    icon: "tz",
  },
  {
    code: "lv",
    englishName: "Latvian",
    localizedName: "Latviešu",
    icon: "lv",
  },
  {
    code: "lt",
    englishName: "Lithuanian",
    localizedName: "Lietuvių",
    icon: "lt",
  },
  {
    code: "hu",
    englishName: "Hungarian",
    localizedName: "Magyar",
    icon: "hu",
  },
  {
    code: "mt",
    englishName: "Maltese",
    localizedName: "Malti",
    icon: "mt",
  },
  {
    code: "nl",
    englishName: "Dutch",
    localizedName: "Nederlands",
    icon: "nl",
  },
  {
    code: "no",
    englishName: "Norwegian",
    localizedName: "Norsk",
    icon: "no",
  },
  {
    code: "pl",
    englishName: "Polish",
    localizedName: "Polski",
    icon: "pl",
  },
  {
    code: "pt",
    englishName: "Portuguese",
    localizedName: "Português",
    icon: "pt",
  },
  {
    code: "ro",
    englishName: "Romanian",
    localizedName: "Română",
    icon: "ro",
  },
  {
    code: "sk",
    englishName: "Slovakian",
    localizedName: "Slovenčina",
    icon: "sk",
  },
  {
    code: "sl",
    englishName: "Slovenian",
    localizedName: "Slovenščina",
    icon: "si",
  },
  {
    code: "fi",
    englishName: "Finnish",
    localizedName: "Suomi",
    icon: "fi",
  },
  {
    code: "sv",
    englishName: "Swedish",
    localizedName: "Svenska",
    icon: "se",
  },
  {
    code: "tl",
    englishName: "Tagalog",
    localizedName: "Tagalog",
    icon: "ph",
  },
  {
    code: "vi",
    englishName: "Vietnamese",
    localizedName: "Tiếng Việt",
    icon: "vn",
  },
  {
    code: "tr",
    englishName: "Turkish",
    localizedName: "Türkçe",
    icon: "tr",
  },
  {
    code: "el",
    englishName: "Greek",
    localizedName: "Ελληνικά",
    icon: "gr",
  },
  {
    code: "ba",
    englishName: "Bashkir",
    localizedName: "Башҡорт",
    icon: "ru-ba",
  },
  {
    code: "be",
    englishName: "Belarusian",
    localizedName: "Беларуская",
    icon: "by",
  },
  {
    code: "bg",
    englishName: "Bulgarian",
    localizedName: "Български",
    icon: "bg",
  },
  {
    code: "mn",
    englishName: "Mongolian",
    localizedName: "Монгол",
    icon: "mn",
  },
  {
    code: "ru",
    englishName: "Russian",
    localizedName: "Русский",
    icon: "ru",
  },
  {
    code: "uk",
    englishName: "Ukrainian",
    localizedName: "Українська",
    icon: "ua",
  },
  {
    code: "he",
    englishName: "Hebrew",
    localizedName: "עברית",
    icon: "il",
  },
  {
    code: "ug",
    englishName: "Uyghur",
    localizedName: "ئۇيغۇرچە",
    icon: "xx",
  },
  {
    code: "ur",
    englishName: "Urdu",
    localizedName: "اردو",
    icon: "pk",
  },
  {
    code: "ar",
    englishName: "Arabic",
    localizedName: "العربية",
    icon: "arab",
  },
  {
    code: "fa",
    englishName: "Persian",
    localizedName: "فارسی",
    icon: "ir",
  },
  {
    code: "mr",
    englishName: "Marathi",
    localizedName: "मराठी",
    icon: "in",
  },
  {
    code: "hi",
    englishName: "Hindi",
    localizedName: "हिन्दी",
    icon: "in",
  },
  {
    code: "bn",
    englishName: "Bengali",
    localizedName: "বাংলা",
    icon: "bd",
  },
  {
    code: "ta",
    englishName: "Tamil",
    localizedName: "தமிழ்",
    icon: "in",
  },
  { code: "th", englishName: "Thai", localizedName: "ไทย", icon: "th" },
  {
    code: "ko",
    englishName: "Korean",
    localizedName: "한국어",
    icon: "kr",
  },
  {
    code: "cmn",
    englishName: "Mandarin",
    localizedName: "中文",
    icon: "cn",
  },
  {
    code: "ja",
    englishName: "Japanese",
    localizedName: "日本語",
    icon: "jp",
  },
  {
    code: "yue",
    englishName: "Cantonese",
    localizedName: "粵語",
    icon: "hk",
  },
] as const;

const languagesMap = new Map(languages.map((l) => [l.code, l]));

/** @deprecated use TranscriptionLanguageCode or OutputLanguageCode instead */
type LanguageCode = (typeof languages)[number]["code"];
/** @deprecated use transcriptionLanguageCodes or outputLanguageCodes instead */
// oxlint-disable-next-line typescript/no-deprecated
const languageCodes: readonly LanguageCode[] = languages.map((l) => l.code);

// oxlint-disable-next-line typescript/no-deprecated
export function getLanguageByCode(code: LanguageCode) {
  const language = languagesMap.get(code);
  if (!language) {
    throw new Error(`Unsupported language code: ${code}`);
  }
  return {
    ...language,
    icon: `/flags/${language.icon}.svg`,
  };
}

// Speechmatics supports automatic language detection only for batch transcriptions
// oxlint-disable-next-line typescript/no-deprecated
export const transcriptionLanguageCodes = languageCodes;
export type TranscriptionLanguageCode = (typeof transcriptionLanguageCodes)[number];
export const batchTranscriptionLanguageCodes = [...transcriptionLanguageCodes, "auto"] as const;
export type BatchTranscriptionLanguageCode = (typeof batchTranscriptionLanguageCodes)[number];
export const maybeBatchTranscriptionLanguageCodes = batchTranscriptionLanguageCodes;
export type MaybeBatchTranscriptionLanguageCode = BatchTranscriptionLanguageCode;

export const TranscriptionLanguageCodeSchema = z.enum(transcriptionLanguageCodes);

export function isSupportedTranscriptionLanguage(code: string): code is TranscriptionLanguageCode {
  return (transcriptionLanguageCodes as readonly string[]).includes(code);
}

// Resolve a client-supplied language to a code Speechmatics accepts for
// transcription. The desktop can send a regional locale ("en-US", "de-DE") that
// isn't itself in the supported set; the region subtag is stripped ("de-DE" ->
// "de") so the intended language is still selected. English is used only when
// the base language is genuinely unsupported — never as a silent downgrade for a
// language we actually support. Mirrors resolveVoiceEnrollmentLanguage.
export function resolveTranscriptionLanguage(
  code: string | null | undefined,
): TranscriptionLanguageCode {
  if (code && isSupportedTranscriptionLanguage(code)) {
    return code;
  }
  const base = code?.split("-")[0];
  if (base && isSupportedTranscriptionLanguage(base)) {
    return base;
  }
  return "en";
}

export const voiceEnrollmentLanguageCodes = ["en", "de"] satisfies TranscriptionLanguageCode[];
export type VoiceEnrollmentLanguageCode = (typeof voiceEnrollmentLanguageCodes)[number];

export function isSupportedVoiceEnrollmentLanguage(
  code: string,
): code is VoiceEnrollmentLanguageCode {
  return (voiceEnrollmentLanguageCodes as readonly string[]).includes(code);
}

// Pick the enrollment language from an ordered list of candidates — typically
// the user's primary conversation language, then their secondary, then the UI
// locale. The first one we actually enroll in (German or English) wins; region
// subtags are stripped ("en-US" -> "en"). When none match, fall back to English.
export function resolveVoiceEnrollmentLanguage(candidates: Array<string | null | undefined>) {
  for (const candidate of candidates) {
    const base = candidate?.split("-")[0];
    if (base && isSupportedVoiceEnrollmentLanguage(base)) {
      return base;
    }
  }
  return "en";
}

export const outputLanguageCodes = [
  "en",
  "de",
  "fr",
  "es",
  "it",
  "pt",
  "nl",
  "hi",
  "ja",
  "ro",
  "da",
  "fi",
  "sv",
  "no",
  "pl",
  "cmn",
  "bg",
  "cs",
  "el",
  "et",
  "ga",
  "hr",
  "hu",
  "lt",
  "lv",
  "mt",
  "sk",
  "sl",
  "ko",
  "vi",
  "th",
  "yue",
  // oxlint-disable-next-line typescript/no-deprecated
] as const satisfies LanguageCode[];
export type OutputLanguageCode = (typeof outputLanguageCodes)[number];

export function isSupportedOutputLanguage(code: string): code is OutputLanguageCode {
  return (outputLanguageCodes as readonly string[]).includes(code);
}

export const OutputLanguageCodeSchema = z.enum(outputLanguageCodes);

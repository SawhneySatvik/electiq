export type Locale = "en" | "hi" | "ta" | "bn" | "mr" | "te";

export const LOCALES: Locale[] = ["en", "hi", "ta", "bn", "mr", "te"];

export const LOCALE_DISPLAY: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  ta: "தமிழ்",
  bn: "বাংলা",
  mr: "मराठी",
  te: "తెలుగు",
};

export const LOCALE_FOR_AI: Record<Locale, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  bn: "Bengali",
  mr: "Marathi",
  te: "Telugu",
};

type Dict = Record<string, string>;

const en: Dict = {
  "nav.explore": "Explore",
  "nav.candidates": "Candidates",
  "nav.chat": "Chat",

  "home.badge": "India · Election Intelligence · Demo",
  "home.title.1": "India's elections.",
  "home.title.2": "Explored.",
  "home.subtitle":
    "Three decades of constituency results. Every candidate's declared wealth. A grounded chatbot for plain-English queries.",
  "home.stats.lsConstituencies": "LS constituencies",
  "home.stats.lsConstituenciesSub": "across 12 states",
  "home.stats.electionResults": "Election results",
  "home.stats.electionResultsSub": "LS + Vidhan Sabha",
  "home.stats.candidates": "Candidates",
  "home.stats.candidatesSub": "with affidavit data",
  "home.stats.statesCovered": "States covered",

  "home.cta.explore.eyebrow": "01 / Explore",
  "home.cta.explore.title": "State by state",
  "home.cta.explore.copy":
    "Walk through every Lok Sabha and major Vidhan Sabha race. See who won, by how much, and how the seat has shifted.",
  "home.cta.candidates.eyebrow": "02 / Candidates",
  "home.cta.candidates.title": "Wealth & cases",
  "home.cta.candidates.copy":
    "Search any candidate by name, party, or constituency. See declared assets, criminal cases, and education.",
  "home.cta.chat.eyebrow": "03 / Chat",
  "home.cta.chat.title": "Ask the data",
  "home.cta.chat.copy":
    "Plain-English questions, grounded answers. Every response shows the records the AI used.",
  "home.cta.voices.eyebrow": "04 / Voices",
  "home.cta.voices.title": "Citizen Voices",
  "home.cta.voices.copy":
    "Share your view on this election. Posts and upvotes live on your device — multi-user backend deferred.",
  "home.cta.exitPoll.eyebrow": "05 / Exit poll",
  "home.cta.exitPoll.title": "Cast a poll vote",
  "home.cta.exitPoll.copy":
    "Pick a party in a single device-level exit poll. Bar chart updates live. Privacy caveats stated upfront.",
  "home.cta.open": "Open",

  "home.pillar.1.title": "Constituency analyst",
  "home.pillar.1.body":
    "A character read of each seat — stronghold, swing, or volatile — plus the most significant shift across four election cycles.",
  "home.pillar.2.title": "Candidate transparency",
  "home.pillar.2.body":
    "Affidavit-declared assets translated to plain language. Liabilities, criminal cases, education — laid out side by side.",
  "home.pillar.3.title": "Grounded chat",
  "home.pillar.3.body":
    "Keyword-based RAG over the dataset. The chatbot only states facts present in the retrieved records, and shows you which records they were.",

  "explore.title": "Explore",
  "explore.subtitle": "Click a state on the map, toggle election type, drill into a constituency.",
  "explore.state": "State",
  "explore.electionType": "Election type",
  "explore.ls": "Lok Sabha",
  "explore.vs": "Vidhan Sabha",
  "explore.pickState": "Pick a state to begin",
  "explore.noData": "No {type} data loaded for {state} in this demo.",
  "explore.seatsSuffix": "seats",
  "explore.sortedByName": "Sorted by name",
  "explore.unopposed": "Unopposed",
  "explore.marginSuffix": "margin",

  "candidates.title": "Candidates",
  "candidates.subtitle":
    "Affidavit-declared assets, criminal cases, education. Search any candidate.",
  "candidates.results": "results",
  "candidates.result": "result",
  "candidates.noMatch": "No candidates match these filters. Try resetting.",
  "candidates.clearConstituency": "Clear constituency filter",

  "chat.title": "Chat",
  "chat.subtitle":
    "Grounded in the dataset. The retrieval layer picks the records — Gemini answers from those.",
  "chat.placeholder": "Ask about any constituency or candidate",
  "chat.thinking": "Thinking…",
  "chat.send": "Send",
  "chat.empty.title": "Ask the data",
  "chat.empty.body":
    "Plain-English questions about constituencies, candidates, parties, or the Indian electoral process. Every answer cites the records it used.",
  "chat.suggestion.1": "Who won Mumbai North in 2019?",
  "chat.suggestion.2": "Which party won the most seats in Tamil Nadu 2021?",
  "chat.suggestion.3": "Show me the richest candidates in Karnataka",
  "chat.suggestion.4": "What is NOTA?",
  "chat.suggestion.5": "Compare Rahul Gandhi's and Smriti Irani's affidavits",

  "footer.demoNote":
    "ElectoIQ · Demo data modeled on patterns from MyNeta, ADR and the Election Commission of India. Not an official source.",
  "footer.builtFor": "Built for election literacy.",

  "common.back": "Back",
  "common.loading": "Loading…",

  "upcoming.eyebrow": "Upcoming",
  "rajyaSabha.title": "Rajya Sabha",
  "rajyaSabha.seats": "{count} seats",
  "rajyaSabha.term": "Term",
  "rajyaSabha.empty": "No Rajya Sabha roster loaded for this state.",

  "nav.voices": "Voices",
  "nav.exitPoll": "Exit poll",

  "voices.title": "Citizen Voices",
  "voices.subtitle":
    "Share your view on the campaign. Stored on your device only — multi-user requires a backend that's been deferred for this build.",
  "voices.composer.placeholder": "What's on your mind about this election?",
  "voices.composer.submit": "Post",
  "voices.composer.imageHint": "Optional image (max 2 MB, stored as a data URL on your device)",
  "voices.empty": "No voices yet on this device. Be the first.",
  "voices.upvote": "Upvote",
  "voices.upvoted": "Upvoted",
  "voices.imageTooLarge": "Image too large. Keep it under 2 MB.",

  "exitPoll.title": "Exit poll",
  "exitPoll.subtitle":
    "Cast a single device-level vote. The tally below reflects votes recorded in this browser only.",
  "exitPoll.warning":
    "UI demo only. A real exit poll requires E2E encryption and time-locked decryption — not implemented here.",
  "exitPoll.pickParty": "Pick a party",
  "exitPoll.submit": "Cast vote",
  "exitPoll.alreadyVoted": "You've already voted on this device.",
  "exitPoll.tallyTitle": "Tally on this device",
  "exitPoll.totalVotes": "{count} vote(s) cast",
  "exitPoll.empty": "No votes yet on this device.",
};

const hi: Dict = {
  "nav.explore": "खोजें",
  "nav.candidates": "उम्मीदवार",
  "nav.chat": "चैट",

  "home.badge": "भारत · चुनाव इंटेलिजेंस · डेमो",
  "home.title.1": "भारत के चुनाव।",
  "home.title.2": "खोज लीजिए।",
  "home.subtitle":
    "तीन दशकों के निर्वाचन क्षेत्र परिणाम। हर उम्मीदवार की घोषित संपत्ति। आसान अंग्रेज़ी प्रश्नों के लिए एक तथ्य-आधारित चैटबॉट।",
  "home.stats.lsConstituencies": "लोकसभा सीटें",
  "home.stats.lsConstituenciesSub": "12 राज्यों में",
  "home.stats.electionResults": "चुनाव परिणाम",
  "home.stats.electionResultsSub": "लोकसभा + विधानसभा",
  "home.stats.candidates": "उम्मीदवार",
  "home.stats.candidatesSub": "हलफ़नामा डेटा के साथ",
  "home.stats.statesCovered": "कवर किए गए राज्य",

  "home.cta.explore.eyebrow": "01 / खोजें",
  "home.cta.explore.title": "राज्य दर राज्य",
  "home.cta.explore.copy":
    "हर लोकसभा और प्रमुख विधानसभा सीट को देखें। कौन जीता, किस अंतर से, और सीट कैसे बदली है।",
  "home.cta.candidates.eyebrow": "02 / उम्मीदवार",
  "home.cta.candidates.title": "संपत्ति और मामले",
  "home.cta.candidates.copy":
    "नाम, पार्टी या निर्वाचन क्षेत्र से कोई भी उम्मीदवार खोजें। घोषित संपत्ति, आपराधिक मामले और शिक्षा देखें।",
  "home.cta.chat.eyebrow": "03 / चैट",
  "home.cta.chat.title": "डेटा से पूछें",
  "home.cta.chat.copy":
    "आसान भाषा में सवाल, तथ्य-आधारित जवाब। हर जवाब में वह रिकॉर्ड दिखता है जिनसे AI ने जवाब दिया।",
  "home.cta.voices.eyebrow": "04 / आवाज़ें",
  "home.cta.voices.title": "नागरिक आवाज़ें",
  "home.cta.voices.copy":
    "इस चुनाव पर अपनी राय रखें। पोस्ट और अपवोट केवल आपके डिवाइस पर हैं — असली बैकएंड स्थगित।",
  "home.cta.exitPoll.eyebrow": "05 / एग्ज़िट पोल",
  "home.cta.exitPoll.title": "एक वोट डालें",
  "home.cta.exitPoll.copy":
    "एक डिवाइस-स्तर एग्ज़िट पोल में पार्टी चुनें। बार चार्ट तुरंत अपडेट होता है। गोपनीयता चेतावनी पहले बताई गई।",
  "home.cta.open": "खोलें",

  "home.pillar.1.title": "निर्वाचन क्षेत्र विश्लेषक",
  "home.pillar.1.body":
    "हर सीट का चरित्र — गढ़, स्विंग या अस्थिर — और चार चुनाव चक्रों में सबसे महत्वपूर्ण बदलाव।",
  "home.pillar.2.title": "उम्मीदवार पारदर्शिता",
  "home.pillar.2.body":
    "हलफ़नामा संपत्ति आसान भाषा में। देनदारियाँ, आपराधिक मामले, शिक्षा — एक साथ।",
  "home.pillar.3.title": "तथ्य-आधारित चैट",
  "home.pillar.3.body":
    "डेटासेट पर कीवर्ड-आधारित RAG। चैटबॉट केवल वही तथ्य बताता है जो रिकॉर्ड में हैं और दिखाता है कि कौन से।",

  "explore.title": "खोजें",
  "explore.subtitle": "मानचित्र पर राज्य चुनें, चुनाव प्रकार बदलें, सीट में जाएँ।",
  "explore.state": "राज्य",
  "explore.electionType": "चुनाव प्रकार",
  "explore.ls": "लोकसभा",
  "explore.vs": "विधानसभा",
  "explore.pickState": "शुरू करने के लिए राज्य चुनें",
  "explore.noData": "इस डेमो में {state} के लिए {type} डेटा उपलब्ध नहीं है।",
  "explore.seatsSuffix": "सीटें",
  "explore.sortedByName": "नाम के अनुसार",
  "explore.unopposed": "निर्विरोध",
  "explore.marginSuffix": "अंतर",

  "candidates.title": "उम्मीदवार",
  "candidates.subtitle":
    "हलफ़नामा संपत्ति, आपराधिक मामले, शिक्षा। कोई भी उम्मीदवार खोजें।",
  "candidates.results": "परिणाम",
  "candidates.result": "परिणाम",
  "candidates.noMatch": "कोई उम्मीदवार इन फ़िल्टरों से नहीं मिला। फ़िल्टर रीसेट करें।",
  "candidates.clearConstituency": "निर्वाचन क्षेत्र फ़िल्टर हटाएँ",

  "chat.title": "चैट",
  "chat.subtitle":
    "डेटासेट पर आधारित। पुनर्प्राप्ति परत रिकॉर्ड चुनती है — Gemini उनसे जवाब देता है।",
  "chat.placeholder": "किसी निर्वाचन क्षेत्र या उम्मीदवार के बारे में पूछें",
  "chat.thinking": "सोच रहा है…",
  "chat.send": "भेजें",
  "chat.empty.title": "डेटा से पूछें",
  "chat.empty.body":
    "निर्वाचन क्षेत्रों, उम्मीदवारों, पार्टियों या भारतीय चुनाव प्रक्रिया के बारे में आसान भाषा में सवाल। हर जवाब उन रिकॉर्ड्स का हवाला देता है।",
  "chat.suggestion.1": "2019 में मुंबई उत्तर कौन जीता?",
  "chat.suggestion.2": "तमिलनाडु 2021 में सबसे ज़्यादा सीटें किस पार्टी ने जीतीं?",
  "chat.suggestion.3": "कर्नाटक के सबसे अमीर उम्मीदवार दिखाएँ",
  "chat.suggestion.4": "NOTA क्या है?",
  "chat.suggestion.5": "राहुल गांधी और स्मृति ईरानी के हलफ़नामों की तुलना करें",

  "footer.demoNote":
    "ElectoIQ · MyNeta, ADR और भारत निर्वाचन आयोग पर आधारित डेमो डेटा। आधिकारिक स्रोत नहीं।",
  "footer.builtFor": "चुनाव साक्षरता के लिए बनाया गया।",

  "common.back": "वापस",
  "common.loading": "लोड हो रहा है…",

  "upcoming.eyebrow": "आगामी",
  "rajyaSabha.title": "राज्यसभा",
  "rajyaSabha.seats": "{count} सीटें",
  "rajyaSabha.term": "कार्यकाल",
  "rajyaSabha.empty": "इस राज्य के लिए राज्यसभा सूची उपलब्ध नहीं है।",

  "nav.voices": "नागरिक आवाज़ें",
  "nav.exitPoll": "एग्ज़िट पोल",

  "voices.title": "नागरिक आवाज़ें",
  "voices.subtitle":
    "इस चुनाव अभियान पर अपनी राय रखें। केवल आपके डिवाइस पर सेव होती है — असली बैकएंड इस बिल्ड में स्थगित है।",
  "voices.composer.placeholder": "इस चुनाव पर आपके क्या विचार हैं?",
  "voices.composer.submit": "पोस्ट करें",
  "voices.composer.imageHint": "वैकल्पिक छवि (अधिकतम 2 MB, आपके डिवाइस पर डेटा-URL के रूप में)",
  "voices.empty": "अभी इस डिवाइस पर कोई आवाज़ नहीं। पहले बनें।",
  "voices.upvote": "अपवोट",
  "voices.upvoted": "अपवोट किया",
  "voices.imageTooLarge": "छवि बहुत बड़ी है। 2 MB से कम रखें।",

  "exitPoll.title": "एग्ज़िट पोल",
  "exitPoll.subtitle":
    "एक डिवाइस-स्तर वोट डालें। नीचे की गिनती केवल इस ब्राउज़र के वोट दिखाती है।",
  "exitPoll.warning":
    "केवल UI डेमो। असली एग्ज़िट पोल को E2E एन्क्रिप्शन और टाइम-लॉक डिक्रिप्शन की ज़रूरत है — यहाँ लागू नहीं।",
  "exitPoll.pickParty": "पार्टी चुनें",
  "exitPoll.submit": "वोट डालें",
  "exitPoll.alreadyVoted": "आप इस डिवाइस पर पहले ही वोट डाल चुके हैं।",
  "exitPoll.tallyTitle": "इस डिवाइस पर गिनती",
  "exitPoll.totalVotes": "{count} वोट डले",
  "exitPoll.empty": "अभी इस डिवाइस पर कोई वोट नहीं।",
};

export const dict: Record<Locale, Dict> = {
  en,
  hi,
  ta: {},
  bn: {},
  mr: {},
  te: {},
};

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

export function lookupStatic(locale: Locale, key: string): { value: string; isFallback: boolean } {
  const inLocale = dict[locale][key];
  if (inLocale) return { value: inLocale, isFallback: false };
  const fallback = dict.en[key] ?? key;
  return { value: fallback, isFallback: locale !== "en" };
}

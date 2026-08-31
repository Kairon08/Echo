/* Built-in practice passages for shadowing.
   Each passage is split into sentences at load time. */
const SAMPLE_TEXTS = [
  {
    id: 'daily-1',
    level: 'A2–B1',
    title: 'Kundalik suhbat: Ob-havo',
    text: "Wow, it's really cold today. I think it might snow later this evening. Did you bring a warm jacket with you? I forgot mine at home, so I'm freezing right now. Maybe we should just stay inside and drink some hot tea instead."
  },
  {
    id: 'daily-2',
    level: 'B1',
    title: 'Kundalik suhbat: Kafeda buyurtma',
    text: "Hi, could I get a medium latte, please? Actually, make that a large one, if that's okay. Do you have any oat milk instead of regular milk? Great, thank you so much. I'll wait for it right over there by the window."
  },
  {
    id: 'story-1',
    level: 'B1–B2',
    title: 'Qisqa hikoya: Yangi shahar',
    text: "When I first moved to the city, everything felt overwhelming. The streets were crowded, and I didn't know anyone at all. But slowly, week by week, I found small places that felt like home. A quiet park. A friendly bakery. A neighbor who always smiled and said hello."
  },
  {
    id: 'talk-1',
    level: 'B2',
    title: "TED uslubida qisqa nutq: O'zgarish haqida",
    text: "Change is never comfortable, but it's always necessary. The moment you stop growing is the moment you stop truly living. I've learned that the biggest risks in life are rarely the ones we take. They're the ones we avoid, out of fear, and never even attempt."
  },
  {
    id: 'news-1',
    level: 'B2–C1',
    title: 'Yangiliklar uslubi: Texnologiya',
    text: "Researchers announced today that the new technology could significantly reduce energy consumption across major cities. Officials say the project will be tested in three regions before a wider rollout next year. Experts remain cautiously optimistic, though some have raised concerns about the overall cost."
  },
  {
    id: 'interview-1',
    level: 'B2–C1',
    title: 'Intervyu uslubi: Karyera haqida',
    text: "So, what advice would you give someone just starting out in this field? Honestly, I'd tell them not to be afraid of making mistakes early on. That's exactly how you learn the fastest. I certainly made plenty of mistakes myself, and looking back, I wouldn't change a thing."
  }
];

function splitIntoSentences(text) {
  // Split on sentence-ending punctuation while keeping it attached.
  const raw = text.match(/[^.!?]+[.!?]+(\s+|$)/g) || [text];
  return raw.map(s => s.trim()).filter(Boolean);
}

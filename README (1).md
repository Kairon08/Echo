# Echo — Shadowing mashqi

Ingliz tilini "shadowing" texnikasi orqali mashq qilish uchun brauzer ilovasi. Hech qanday to'lovli API yoki backend kerak emas — brauzerning o'zidagi ovozli o'qish (Speech Synthesis) va mikrofon yozib olish (MediaRecorder) imkoniyatlaridan foydalanadi.

Top shadowing ilovalari (Shadowing English, Tubeshad, LingoSon)dagi asosiy g'oyalar asosida qurilgan: gap-gap tinglash, tezlikni sozlash, so'zma-so'z "karaoke" yoritish, o'z ovozini yozib solishtirish, va progress/streak kuzatish.

## Imkoniyatlar

- **6 ta tayyor matn** (turli darajalar: A2–C1), yoki **o'zingizning matningizni** joylashtirish
- Gaplarga avtomatik bo'linadi, gap-gap mashq qilish
- Native ovoz bilan tinglash, **tezlikni 0.5x–1.3x** oralig'ida sozlash
- **So'zma-so'z yoritish** — diktor qaysi so'zni aytayotgan bo'lsa, o'sha so'z yorishadi
- **Takrorlash soni** — bir gapni necha marta ketma-ket eshitishni tanlash
- Turli **diktor ovozlari** orasida tanlash (brauzeringizda o'rnatilgan ovozlarga bog'liq)
- **O'z ovozingizni yozib**, keyin qayta eshitib solishtirish
- Har bir gapni **"o'zlashtirdim"** deb belgilash, progress va kunlik seriya (streak) kuzatiladi
- Ma'lumotlar `localStorage`'da saqlanadi — ilovadan chiqib ketsangiz ham yo'qolmaydi
- Telefon bosh ekraniga ilova sifatida o'rnatiladi (PWA), offline ham ochiladi

## Fayllar

```
shadow-speak/
├── index.html        — sahifa tuzilishi
├── style.css          — glass dizayn, waveform animatsiyasi
├── script.js          — TTS, mikrofon yozish, progress logikasi
├── sample-texts.js    — tayyor matnlar (A2–C1)
├── manifest.json       — bosh ekranga o'rnatish uchun (PWA)
├── icon.svg           — ilova ikonkasi
├── sw.js              — offline kesh (Service Worker)
└── README.md
```

## Muhim eslatma: brauzer talablari

- Ovozli o'qish va mikrofon yozish funksiyalari **Chrome, Edge, Safari**'ning yangi versiyalarida yaxshi ishlaydi.
- Mikrofondan foydalanish uchun sayt **HTTPS** orqali ochilishi kerak (GitHub Pages avtomatik HTTPS beradi, shuning uchun muammo bo'lmaydi).
- Diktor ovozlari ro'yxati qurilmangizda o'rnatilgan tizim ovozlariga bog'liq — kompyuter va telefonda ro'yxat farq qilishi mumkin.
- Yozib olingan ovoz faqat shu sessiya davomida xotirada saqlanadi (sahifani yangilasangiz o'chadi) — bu shaxsiy maxfiylik uchun ataylab shunday qilingan.

## GitHub Pages'ga joylash

1. Ushbu papkadagi barcha fayllarni GitHub repozitoriyasiga yuklang (drag & drop yoki `git push` orqali — avvalgi loyihadagi kabi).
2. **Settings → Pages** bo'limiga o'ting.
3. **Source**: "Deploy from a branch", **Branch**: `main`, papka: `/ (root)` — **Save** tugmasini bosing.
4. Bir necha daqiqadan so'ng `https://<username>.github.io/<repo>/` manzilida ochiladi.
5. Telefonda oching va "Bosh ekranga qo'shish" orqali ilova sifatida o'rnating.

## Kelajakda qo'shsa bo'ladigan narsalar

- AI orqali talaffuzni baholash (hozircha faqat o'z-o'zini solishtirish)
- YouTube videolardan matn olib mashq qilish
- Ko'proq tayyor matnlar va mavzular bo'yicha kategoriyalar

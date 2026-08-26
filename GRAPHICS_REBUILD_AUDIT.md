# Realistik Android 3D qayta qurish — texnik audit

## Joriy holat

Mavjud loyiha React, Babylon.js va Capacitor WebView qatlamidan foydalanadi. U gameplay prototipi sifatida yaroqli, biroq mashinalar, daraxtlar, binolar va terrain primitive geometriyadan qurilgan. Shu sabab uning asset fidelity darajasi realistik mobil racing o‘yini talabiga yetmaydi. PBR material qo‘shish primitive siluetlarni real aktivlarga aylantirmaydi.

## Rasmiy renderer manbalari

| Variant | Tasdiqlangan imkoniyat | Qayta qurish uchun baho |
| --- | --- | --- |
| Unity URP | Unity’ning URP 3D Sample’i PBR, realistic lighting, decals, lens flare, Shader Graph, fog va vegetation bilan yuqori sifatli muhitni ko‘rsatadi; sample mobile imkoniyatlari uchun ham masshtablanadi. | **Tavsiya etiladi.** Android uchun ishlatiladigan C#/URP asset pipeline, LOD, baked lighting va Addressables asosida realistik racing o‘yini uchun muvozanatli yo‘l. |
| Unreal Engine Mobile | Epic mobil HDR orqali yuqori fidelity’ni qo‘llaydi, lekin qurilma CPU/GPU/memory byudjeti bo‘yicha qat’iy profiling va optimizatsiya talab qiladi. | Yuqori sinf Android qurilmalari uchun mumkin, ammo loyiha hajmi, build murakkabligi va 12 xarita uchun texnik xavf balandroq. |
| Hozirgi Babylon/WebView | PBR va post-process mumkin, ammo WebView ichida haqiqiy GLB asset pipeline, platforma profilingi va AAA sinfidagi native renderer nazorati cheklangan. | Faqat gameplay prototipini saqlash uchun; fotorealistik yakuniy o‘yin uchun yetarli emas. |

## Tanlanadigan ishlab chiqish yo‘li

Android uchun **Unity 6 + Universal Render Pipeline (URP)** tanlanadi. Unreal Engine faqat yuqori sinf qurilmalarini asosiy target qilish va katta native loyiha hajmini qabul qilish holatida alternativa bo‘ladi.

> Unity URP demo PBR materiallar, decal, lens flare, murakkab Shader Graph, fog va vegetation bilan photorealistic environment ko‘rsatadi; uning muhitlari mobil qurilmalarga ham masshtablanadi. [1]

> Epic mobil render optimizatsiyasini ishlatishda target qurilmaning CPU/GPU/memory byudjetini o‘lchash va bottlenecklarni profiling qilish kerakligini ta’kidlaydi. [2]

## Kerakli haqiqiy asset pipeline

1. **Vehicle:** litsenziyali GLB/FBX avtomobil modellari; 4–5 LOD, 2K/1K albedo-normal-metallic-roughness teksturalar, ichki salon faqat near camera uchun.
2. **Road:** skanerlangan asphalt PBR setlari, road decal atlaslari (rezina izlari, yoriqlar, moy va nam yo‘l), baked reflection probe zonalari.
3. **Environment:** fotogrammetrik yoki professional vegetation/building paketlari; billboard/LOD tree, baked lightmap, terrain splatmap, distance impostor.
4. **Effects:** GPU particle systems bilan chang, yomg‘ir, spray va skid smoke; low/medium profilda particle count hamda texture resolution pasayadi.
5. **Lighting:** bitta directional sun, baked global illumination/lightmap, reflection probe, SSAO/SSR faqat high profilida yoki alternativ fake reflection decals.

## Native o‘tish strategiyasi

Babylon gameplaydagi region unlock, garage, car statistics, touch action mapping va race state data modeli Unity ScriptableObject/C# qatlamiga ko‘chiriladi. Android CI Gradle/Capacitor o‘rniga Unity batchmode build va GitHub Actions Android keystore secrets bilan yangilanadi. Hozirgi APK esa reference/prototype sifatida saqlanadi.

## Unity Android build va asset huquqlari

Unity 6 Android Player Settings native C# kodini **IL2CPP** orqali C++ hamda qurilmadagi machine code’ga kompilyatsiya qila oladi; Unity Android outputida ARM64 tanlanadi. Android texture targeting ASTC va ETC2 kabi formatlarni taklif etadi. Hujjatga ko‘ra APK buildda ro‘yxatdagi birinchi texture compression formati ishlatiladi; shu sabab real projectda yuqori sifatli build uchun ASTC va keng moslik uchun alohida ETC2/AAB strategiyasi belgilanishi kerak. [3]

Assetlar faqat commercial-use huquqi aniq bo‘lgan manbadan olinadi. Masalan, Sketchfab’ning **editorial** litsenziyasi commercial/promotional foydalanishni taqiqlaydi; standard license esa mustaqil asset faylini qayta tarqatishga ruxsat bermaydi va brend/trademark huquqlarini ham bekor qilmaydi. Shuning uchun real Chevrolet/Daewoo nomlari va car shape’lari bo‘yicha alohida commercial/trademark ruxsati tekshiriladi. [4]

## References

[1] [Unity — URP 3D Sample](https://unity.com/demos/urp-3d-sample)

[2] [Epic Games — Rendering Optimization for Mobile](https://dev.epicgames.com/documentation/unreal-engine/optimization-and-development-best-practices-for-mobile-projects-in-unreal-engine)

[3] [Unity 6 — Android Player settings](https://docs.unity3d.com/6000.0/Documentation/Manual/class-PlayerSettingsAndroid.html)

[4] [Sketchfab — License Agreement](https://sketchfab.com/licenses)

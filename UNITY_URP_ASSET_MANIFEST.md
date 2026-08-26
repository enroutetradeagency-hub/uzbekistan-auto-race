# UZBEKISTAN AUTO RACE — Unity 6 URP real 3D asset manifesti

**Maqsad:** Ushbu manifest primitive procedurallarni import qilingan, tayyorlanilgan va Android uchun optimallashtirilgan haqiqiy 3D assetlar bilan almashtirish kontraktidir. U asset sotib olishni bajarmaydi; har bir asset importidan oldin litsenziya va brand/trademark tekshiruvi qayd etiladi.

## 1. Qabul qilinadigan manba va litsenziya darajasi

| Prioritet | Ruxsat etilgan manba | Qabul sharti | Ta’qiqlangan holat |
| --- | --- | --- | --- |
| A | Unity Asset Store, Fab yoki to‘g‘ridan-to‘g‘ri professional vendor | Commercial game use uchun invoice/EULA va source format mavjud. | Demo-only yoki no-redistribution shartini buzadigan paket. |
| B | Sketchfab Standard/royalty-free model | Litsenziya nusxasi, modelning game-ready geometriyasi va brand huquqlari tasdiqlanadi. | **Editorial** asset; commercial/promotional use taqiqlangan. [1] |
| C | CC0 yoki CC-BY asset | Original author, versiya, attribution va derivative/distribution sharti `LICENSE.md` ichida saqlanadi. | NC, ND yoki licensing manbasi yo‘q asset. |
| D | Buyurtma asosida tayyorlangan asset | Shartnomada mobile game foydalanishi va asset source file huquqi aniq yoziladi. | Faqat render image, rig/texture yoki export huquqisiz model. |

> Litsenziya tekshiruvi yuridik maslahat emas. Sotib olish yoki real avtomobil brendi/markasini ishlatishdan oldin tegishli EULA, trademark va region marketing cheklovlarini huquqiy mutaxassis bilan tekshirish zarur.

## 2. Birinchi Toshkent vertical slice uchun majburiy assetlar

| Guruh | Birinchi import soni | Format va sifat mezoni | Android optimizatsiya sharti |
| --- | ---: | --- | --- |
| Player vehicle | 1 ta brand-safe yoki tegishli huquqli sedan | FBX yoki GLB, rig/animatsiyalanadigan 4 wheel, separate lights/doors, usable cockpit; 4+ LOD; PBR texture set. | LOD0 yaqin kamera uchun; LOD1–3 race masofasida. Exterior 2K, cabin 1K; atlas imkonida. |
| AI/traffic vehicle kit | 3–5 ta turli silhouette | FBX/GLB, 3 LOD, simple underside/interior. | 1K/512 texture; distant impostor, shared material. |
| Asphalt + shoulder | 1 road mesh kit + 2 scanned PBR set | Albedo, normal, roughness/smoothness, AO, optional height; lane/decal atlas. | 2K hero road, 1K secondary; GPU instancing/atlas. |
| Road furniture | Sign, guard rail, pole, traffic light, barrier, concrete edge kit | Real mesh + PBR, 3 LOD for repeated set. | Static batching/instancing; baked shadow. |
| Terrain set | Tashkent foothill heightfield + rock/soil/grass texture set | Terrain heightmap, 4+ terrain layers, terrain hole/road blend. | Terrain pixel error, basemap distance va foliage density profile-dependent. |
| Vegetation | 6 tree species, 4 shrub/grass groups | Prefab + wind material, LOD0–2, billboard/impostor. | GPU instanced; far grass disabled on Medium/Low. |
| Architecture | 8–12 facade/roof/wall kit element | Real meshes reflecting local suburban/roadside context; LOD/impostor. | Baked lightmap/static batching. |
| Sky/weather | Physical sky/HDRI, cloud/rain texture, wet-road decal | HDRI rights clear; no unlicensed panorama. | Shared LUT; rain/spray particle caps by quality tier. |
| VFX | Dust, tyre smoke, rain, spray, skid-mark decal | URP compatible particle material and mobile shader. | Texture atlas, max particles QoS-limited. |
| Audio | Engine loops, tyre, brake, impact, ambience | Usable game license, loop points and sample-rate metadata. | ADPCM/Vorbis profiling per device; stream only ambience. |

## 3. 10 avtomobil content contracti

Car nomlari gameplay katalogi sifatida saqlanadi, biroq final commercial release’da real badge, grille, logo va silhouette uchun huquq darajasi tasdiqlanmaguncha public marketingda ularni tasdiqlangan brand asset deb ko‘rsatib bo‘lmaydi. Har bir avtomobil uchun quyidagi to‘plam talab qilinadi.

| Mashina katalogi | Yaqin kamera sifati | Driving art requirements | Distant race requirements |
| --- | --- | --- | --- |
| Cobalt, Gentra, Nexia 2, Nexia 3 | Cockpit, dashboard, steering wheel va emissive lamp materials | PBR paint/glass/rubber/chrome, wheel rotation, brake-light/headlight mesh | LOD2/3 with simplified cabin, shared tyre/rim materials |
| Lacetti, Spark, Damas | Assetning actual vehicle type/silhouette metadata bilan aniqligi | UV-mapped body panels, 4 wheel collider anchor, 3–4 LOD | Impostor/low LOD traffic variant |
| Malibu, Onix, Tracker | Hero-car quality, optional high-detail showroom interior | Paint variants material property block, light/emissive maps, damaged dirt decal mask | LOD reduction but not generic primitive swap |

## 4. Environment kengaytirish ketma-ketligi

| Viloyat | Minimal hero kit | Ikkinchi darajali kit | Vizual tasdiqlash maqsadi |
| --- | --- | --- | --- |
| Toshkent | Foothill terrain, suburbs, road cut, orchard/roadside tree kit | Urban edge, bus stop, signage | PBR road, mountains and local roadside depth read naturally. |
| Sirdaryo | Field/irrigation, low settlement, highway kit | Canal, warehouse, farm fence | Flat terrain far-distance LOD/impostor bilan barqaror bo‘lishi. |
| Jizzax | Rocky hill, open plain, village, mountain road kit | Tunnel/guardrail variants | Elevation change va rock/terrain blend close range’da tekshirilishi. |
| Qolgan 9 viloyat | Har biri uchun alohida landmark/terrain/vegetation trio | Reused utility assets permitted, hero scene cannot be a reskin | 12 region shunchaki preset emasligini hard visual review tasdiqlaydi. |

## 5. Import gate: Unity AssetPostprocessor qoidalari

| Asset turi | Import bo‘yicha shart | Rejection gate |
| --- | --- | --- |
| Mesh | Scale `1 unit = 1 meter`; non-uniform transform yo‘q; mesh pivot documented; normals/tangents present. | LODsiz high-poly hero mesh yoki broken UV. |
| Vehicle | Wheel centres named/documented; four physical wheel mesh separate; collider proxy available. | Primitive collider shakli faqat visual mesh o‘rniga ishlatilgan asset. |
| Texture | sRGB faqat albedo/emissive; normal map flag; transparency bir atlasda; mipmaps enabled. | Raw 4K/8K texture import yoki uncompressed duplicate. |
| Material | URP Lit / controlled Shader Graph; texture count budget enforced; no legacy built-in shader. | Desktop-only shader, unsupported transparency yoki excessive keywords. |
| Vegetation | LODGroup + billboard/impostor; wind shader declared; light-probe option documented. | LODsiz bir xil high-poly tree ko‘paytirilgan scene. |
| Prefab | `ThirdParty` source immutable; `_UAR/Prefabs` variant layerida game hooklar. | Vendor source faylini to‘g‘ridan-to‘g‘ri soxta edit qilish. |

## 6. Asset qabul protokoli

Har bir asset `Documentation/AssetRegister.csv` ichida asset ID, source URL, vendor, invoice/reference, license class, creator, attribution, import date, Unity version, LOD count, texture memory va visual owner bilan qayd qilinadi. Asset yo‘lga yoki menu sahnasiga kirishidan oldin `Development` APK’da profiler snapshot, device screenshot va High/Medium/Low comparison yaratiladi.

Asset birinchi marta ko‘ringanda texnik “bo‘lishi mumkin” emas, quyidagi uchta isbot talab qilinadi: Unity scene view’dagi real mesh, Android device runtime’dagi real mesh/PBR va performance budget ichidagi profiler natijasi. Bu uchlik bo‘lmasa asset final buildga kiritilmaydi.

## References

[1] [Sketchfab — License Agreement](https://sketchfab.com/licenses)

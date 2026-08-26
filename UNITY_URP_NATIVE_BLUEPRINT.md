# UZBEKISTAN AUTO RACE — Unity 6 URP native blueprint

**Holat:** Unity loyiha papkasi ulanmaguncha bu hujjat implementation kontraktidir. U mavjud Babylon/WebView manbasini o‘zgartirmaydi va uni fallback/reference sifatida saqlaydi.

## 1. Maqsad va ishlash chegarasi

Native loyiha **Unity 6 LTS + Universal Render Pipeline** bilan quriladi. Birinchi visual vertical slice Toshkent bo‘ladi: real meshga ega avtomobil, PBR yo‘l, vegetation/building assetlari, baked lighting, reflection probe, LOD hamda Android quality tierlari bir sahnada ishlashi kerak. Sirdaryo va Jizzax shu texnik kontrakt to‘liq tasdiqlangandan keyin import qilinadi; qolgan hududlar faqat tayyor asset, memory va qurilma profilidan o‘tgach qo‘shiladi.

> PBR material yoki panorama texture primitive car va terrain geometriyasini real 3D assetga aylantirmaydi. Har bir ko‘rinadigan vehicle, road edge va muhim environment obyektining manbasi import qilingan mesh hamda uning LOD/material to‘plami bo‘lishi shart.

## 2. Tavsiya etilgan Unity papka tuzilmasi

```text
UZBEKISTAN-AUTO-RACE-UNITY/
├── Assets/
│   ├── _UAR/
│   │   ├── Art/
│   │   │   ├── Vehicles/{Cobalt,Gentra,Nexia2,Nexia3,Lacetti,Spark,Damas,Malibu,Onix,Tracker}/
│   │   │   ├── Environment/{Tashkent,Sirdaryo,Jizzax}/
│   │   │   ├── Roads/{Meshes,Materials,Decals,Markings,Signs}/
│   │   │   ├── Vegetation/{Trees,Shrubs,Grass,Impostors}/
│   │   │   ├── VFX/{Dust,Rain,Smoke,Skid}/
│   │   │   └── Audio/{Engines,Tyres,Impacts,Ambience,UI}/
│   │   ├── Data/{Cars,Regions,Tracks,Quality,Weather}/
│   │   ├── Prefabs/{Vehicles,Traffic,Rivals,Track,Environment,UI}/
│   │   ├── Scenes/{Bootstrap,Menu,Garage,Lighting,Races}/
│   │   ├── Scripts/
│   │   │   ├── Core/{Bootstrap,Save,Loading,Quality}/
│   │   │   ├── Input/{Touch,Actions}/
│   │   │   ├── Driving/{Vehicle,Drivetrain,Wheel,Damage}/
│   │   │   ├── Race/{RaceDirector,Checkpoint,AI,Traffic,Progress}/
│   │   │   ├── Camera/{Chase,Cockpit,Cinematic}/
│   │   │   └── UI/{Menu,Garage,Hud,Results}/
│   │   ├── Settings/{URP,Renderer,Quality,Input,Physics}/
│   │   └── Tests/{EditMode,PlayMode}/
│   └── ThirdParty/                    # Litsenziyasi va READMEsi saqlangan assetlar
├── Packages/
├── ProjectSettings/
├── UserSettings/                       # Git ignore
├── BuildScripts/
├── Documentation/
└── .github/workflows/
```

`_UAR` faqat o‘yin kodlari va original konfiguratsiyalarini saqlaydi. Har bir sotib olingan yoki CC-litsenziyali asset `ThirdParty/<vendor>/<pack>/LICENSE.md` bilan ajratiladi; licenseni tekshirmasdan asset import qilinmaydi.

## 3. Sahna va yuklash arxitekturasi

| Scene | Vazifasi | Yuklash usuli |
| --- | --- | --- |
| `00_Bootstrap` | Save, quality profiling, input init, content catalog va persistent service’larni yuklaydi. | O‘yin startida yagona scene. |
| `01_MainMenu` | Poyga, Garaj, Viloyatlar va Sozlamalar. | `Bootstrap` ustiga additive. |
| `02_Garage` | Tanlangan avtomobil, rang, upgrade va real showroom lighting. | Additive; vehicle prefab Addressables orqali. |
| `10_Lighting_Common` | URP renderer features, shared sky, day/night preset va global post-process volume. | Har bir poyga bilan additive. |
| `11_Race_Tashkent` | Birinchi native vertical slice: urban/foothill road, race va real assets. | `Lighting_Common` bilan additive. |
| `12_Race_Sirdaryo` | Mirzacho‘l/field/settlement art seti. | Toshkent visual gate’dan keyin. |
| `13_Race_Jizzax` | Forish foothill / mountain art seti. | Sirdaryo visual gate’dan keyin. |

`Bootstrap` faqat global singletonlar uchun ishlatiladi; race sahna state’ini global static obyektga joylamaydi. Track, car va region tanlovi `RaceSessionData` orqali immutable copy shaklida beriladi. Bu yangi viloyatlarni qo‘shishda menu/race coupling’ini oldini oladi.

## 4. C# gameplay modul kontrakti

| Modul | Asosiy sinflar | Mavjud funksiyani saqlash |
| --- | --- | --- |
| `Driving` | `VehicleController`, `VehicleDrivetrain`, `WheelContact`, `VehicleDamage` | Gaz, tormoz, nitro, drift, off-road drag, collision va speedometer. `Rigidbody` + `WheelCollider` asosida, fizik sozlamalar car data’dan olinadi. |
| `Input` | `TouchInputRouter`, `DrivingInputState`, `RaceInputActions` | Landscape chap/o‘ng, gaz, tormoz, nitro, kamera, pause. Touch UI faqat input event yuboradi; fizika bilan bog‘lanmaydi. |
| `Race` | `RaceDirector`, `LapTracker`, `CheckpointGate`, `RaceProgress` | 3 lap, start count-down, position, result va keyingi viloyat unlocki. |
| `AI` | `RivalController`, `SplineRoute`, `OvertakePlanner`, `TrafficDirector` | AI spline progress, racing line, traffic, himoyalanish va cheklangan overtake. |
| `Garage` | `GarageService`, `CarDefinition`, `UpgradeDefinition` | Cobalt–Tracker tanlovi, paint, handling/engine/nitro upgrade va preview. |
| `Progress` | `PlayerProgressStore`, `RegionDefinition`, `SaveMigrator` | 12 viloyat unlock zanjiri hamda keyinchalik Babylon localStorage’dan bir martalik import. |
| `Camera` | `RaceCameraController`, `ChaseRig`, `CockpitRig` | Orqa chase kamera, kokpit va HUD uchun alohida FOV/clip-plane qoidasini saqlaydi. |

`CarDefinition`, `RegionDefinition`, `TrackDefinition` va `QualityProfileDefinition` ScriptableObject sifatida author qilinadi. Persisted save esa faqat player tanlovi, unlock va upgrade’ni JSON/Unity Persistent Data Path’da saqlaydi. Muvozanat sozlamalari save ichiga nusxalanmaydi; ular versiyalangan content data bilan keladi.

## 5. URP rendering va Android quality profillari

Unity URP 3D Sample PBR, realistic lighting, decal, fog, vegetation va scalability imkoniyatlarini namoyish qiladi. Bu loyiha ham visual sifatni moddiy asset, baked lighting, LOD va aniq device budget bilan quradi; “realistic” post-effect natijasi sifatida qabul qilinmaydi. [1]

| Xususiyat | High | Medium | Low |
| --- | --- | --- | --- |
| Renderer | URP Forward+; HDR; 1.0 render scale | URP Forward; HDR; 0.85–0.9 dynamic scale | URP Forward; HDR off; 0.7–0.8 scale |
| Lighting | 1 real-time sun + baked GI, high-resolution lightmap, baked probes | 1 real-time sun + baked GI, reduced lightmap | 1 sun, baked direct/ambient, limited probes |
| Shadows | 2 cascades, soft near shadows | 1 cascade, hard or low-res soft | Main-light hard shadows, short distance |
| Reflection | Baked local probes + selected car probe | Baked probes, lower cubemap resolution | Baked sky/nearest probe only |
| Environment | LOD0–LOD3, grass density high, near decals | LOD1–LOD3, vegetation/decals reduced | LOD2–impostor, sparse grass, baked road detail |
| Effects | Dust/smoke/rain/spray, selective SSAO | Reduced particles, no expensive full-screen effect | Sparse particles, no SSAO/blur |
| Performance maqsadi | Tasdiqlangan high-end Androidda 45–60 FPS | Ko‘p o‘rta sinf qurilmada 30–45 FPS | Kirish darajadagi mos qurilmada barqaror 30 FPS |

Har bir track assetida kamida `LOD0`, `LOD1`, `LOD2`, `LOD3/impostor` mavjud bo‘ladi. Road, traffic va player car LOD almashinuvi ko‘rinadigan pop-in bermasligi uchun `LODGroup` crossfade bilan sinovdan o‘tadi. Sun bitta real-time directional light bilan cheklanadi; static environment lightmap va reflection probe’ga tayanadi. Baked Reflection Probe Unity editorida capture qilinib buildga saqlanadi, shu orqali realtime environment reflection narxi nazorat qilinadi. [2]

## 6. Android Player Settings kontrakti

| Sozlama | Native default | Izoh |
| --- | --- | --- |
| Package Identifier | `uz.manus.uzbekistanautorace` | Mavjud Android package id saqlanadi. |
| Orientation | Landscape Left/Right | Gameplay va HUD landscape lock. |
| Scripting Backend | IL2CPP | C# → C++ → native machine code pipeline. [3] |
| Target Architecture | ARM64 | Zamonaviy Android release build uchun majburiy target. |
| Graphics API | Vulkan preferred, OpenGLES3 fallback | Qurilma blacklist/profil orqali sinovga asoslangan tartib. |
| Color Space | Linear | PBR albedo/lighting ni natural ushlash uchun. |
| Texture Compression | ASTC asosiy; ETC2 fallback distribution | APK faqat ro‘yxatdagi birinchi formatni ishlatadi; multi-format distribution uchun AAB/texture targeting rejalashtiriladi. [3] |
| Build format | Development: APK; distribution: signed AAB | Debug profiling va Play distributsiya yo‘li ajratiladi. |
| Target API | CI va Unity Android Support’da o‘rnatilgan eng yangi talab qilinadigan API | Joriy API requirement release vaqtida Google Play talabiga nisbatan qayta tasdiqlanadi. |

## 7. Faqat real 3D assetdan qabul qilinadigan visual mezonlar

| Asset guruhi | Minimal native talab | Rad etiladigan variant |
| --- | --- | --- |
| Player car | 4+ LOD, interior, wheel meshes, PBR albedo/normal/metallic/roughness, light emissive maps | Primitive body, texture bilan chizilgan faralar, nomi boshqa bo‘lgan generic silhouette |
| Road | UV-mapped road mesh, scan-based PBR, decal atlas, lane marking/sign prefab | Bitta tiling image, CSS line yoki faqat flat plane |
| Terrain | Heightfield + texture splat map + authored road shoulder/rocks | Box/sphere mountain yoki panorama fon |
| Vegetation | Professional tree/shrub meshes, wind/LOD/impostor, terrain density budget | Cylinder trunk + sphere crown |
| Buildings | Mintaqaga mos texture/mesh kit, LOD/impostor | Repeated untextured boxes |
| FX | Particle system + material with collision/soft fade as appropriate | Static transparent disk yoki pure UI effect |

## 8. Unity papkasi ulangach birinchi sprint

Birinchi native sprint faqat **Toshkent vertical slice**’ini bajaradi. Unity 6 LTS Android Build Support, URP template va project root ulangach, `00_Bootstrap`, `01_MainMenu`, `02_Garage`, `10_Lighting_Common` va `11_Race_Tashkent` sahnalari yaratiladi. So‘ng bitta huquqi tekshirilgan vehicle, scanned road material, terrain/vegetation seti va dust/smoke VFX import qilinadi.

Vertical slice qabul mezoni faqat emulator screenshoti emas: real Android qurilmada landscape touch, 3 lap race, AI, HUD, camera, car reflection, wet-road/rain toggle, quality tier va profiler ko‘rsatkichlari tekshiriladi. Shu gate’dan keyin Sirdaryo, Jizzax va 12-region content pipeline kengaytiriladi.

## References

[1] [Unity — URP 3D Sample](https://unity.com/demos/urp-3d-sample)

[2] [Unity — Types of Reflection Probe](https://docs.unity3d.com/6000.1/Documentation/Manual/RefProbeTypes.html)

[3] [Unity 6 — Android Player settings](https://docs.unity3d.com/6000.0/Documentation/Manual/class-PlayerSettingsAndroid.html)

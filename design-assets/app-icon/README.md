# NihonGoi · Aurora Editorial App Icon

> 当前已切换为 [单片词卡「ご」扁平 Logo](./flat-go.md)。本页以下为保留的上一版「あ」叠层图标资料，不再作为当前打包入口。

使用内置 image_gen 生成；ui-ux-pro-max 用于确认 Aurora / 半透明卡片、强识别主体与小尺寸对比度方向。只保留最终入选稿，未替换既有 static/logo.png。

## 交付

| 文件 | 尺寸 | Android 密度 |
| --- | --- | --- |
| ../../static/icons/aurora/icon-72.png | 72 × 72 px | hdpi |
| ../../static/icons/aurora/icon-96.png | 96 × 96 px | xhdpi |
| ../../static/icons/aurora/icon-144.png | 144 × 144 px | xxhdpi |
| ../../static/icons/aurora/icon-192.png | 192 × 192 px | xxxhdpi |

- 四张图采用同一最终原图等比高质量缩小（System.Drawing HighQualityBicubic，边缘镜像采样），不分别生成不同设计。
- 四张 PNG 均为完整不透明的 RGB 正方形，无预制外层圆角；卡片的半透明感已烘焙在图像内。
- 原图：`aurora-master.png`，1254 × 1254 px。
- 下载包：`nihongoi-aurora-icons.zip`，只包含上述四张 PNG。
- `manifest.json` 的 `app-android.distribute.icons` 与现有兼容配置 `app.distribute.icons.android` 已指向这四张图。
- 当前只更新打包资源配置，未重新打包/安装发行 APK。标准调试基座自身图标不等于本应用发行图标。
- 验证：四尺寸实测、PNG 签名/尺寸、RGB 不透明、ZIP 文件清单及配置路径检查通过；72px 实际尺寸已做目视检查。

## 最终生成提示词（内置 image_gen）

```text
Use case: logo-brand
Deliverable: one finished 1:1 square Android app icon for NihonGoi, a Japanese vocabulary learning app.
Visual direction: contemporary Aurora Editorial / frosted-glass UI, matching modern soft-blurred peach, gold, mist-blue and lavender gradients with warm-white cards and deep charcoal Japanese typography.
Design the ENTIRE square canvas, including every corner, as a fully opaque continuous light pastel mesh gradient. Smooth airbrushed fields of pale peach/apricot orange, ivory, warm gold, mist blue and muted lavender blend gently into one another. Clean digital color blending, like a blurred aurora UI wallpaper. Quiet, light corners. This is a full square tile, not an isolated cutout.
At the center: a large warm-white frosted card with softly rounded corners and one subtle, slightly offset pale card behind it to suggest vocabulary flashcards. Card rim thin white, only delicate ambient depth. Straight front view; no perspective. The front card is roughly 62% of canvas width and 67% of height. The white surface has a subtle blush of the background colors, evoking a frosted sheet but rendered on the fully opaque background.
A single oversized deep charcoal-plum Japanese hiragana "あ" is centered on the front card. Refined Mincho typography with robust strokes, very clear silhouette and comfortably readable when the whole image is downscaled to 72px. Character around 40% of canvas height. Exact text: "あ" only.
The result should feel like a calm premium software icon, exceptionally clean, airy, simple, balanced and modern. Prefer clean smooth digital surfaces.
STRICTLY AVOID: watercolor, painted washes, visible paper fibers, mottled texture, grain, speckle, gold lines, kintsugi, metallic trim, hand-painted style, decorative swirls, sparkles, dots, badges, extra words, mockups, 3D perspective, glossy plastic, dramatic shadows, black corners, transparent corners, transparent background, blank outer border, exterior rounded-square mask. No textures and no ornaments. Only one character and the two simple card silhouettes on the smooth full-bleed pastel gradient.
```

# NihonGoi · Flat ご Logo

使用内置 image_gen 按用户的新方向重设计。ui-ux-pro-max 的 Flat Design 建议用于减少色彩、阴影和装饰，并突出字形。

## 当前版本

- 单片清浅词卡，取消背后叠层。
- 中央使用风格化平假名「ご」；两笔浊点保留，粗线条与斜切端点在小尺寸下仍可辨认。
- 暖米色卡面、浅色描边、深色字形，去掉上一版多色渐变背景与立体光影。
- PNG 画布为透明底，保留生成图的 alpha 通道；卡面主要为浅色填充，不把它描述为完全镂空的线框。
- 这是位图 Logo，不是可编辑 SVG。四尺寸由同一原图高质量等比缩小，没有分别生成四种设计。

## 文件

| 尺寸 | 路径 | Android 配置 |
| --- | --- | --- |
| 72 × 72 px | ../../static/icons/flat-go/icon-72.png | hdpi |
| 96 × 96 px | ../../static/icons/flat-go/icon-96.png | xhdpi |
| 144 × 144 px | ../../static/icons/flat-go/icon-144.png | xxhdpi |
| 192 × 192 px | ../../static/icons/flat-go/icon-192.png | xxxhdpi |

- 原图：`flat-go-master.png`（1254 × 1254 px）。
- 下载包：`nihongoi-flat-go-icons.zip`（只含上述四张 PNG）。
- 当前 `manifest.json > app-android.distribute.icons` 已指向新版；保留用户将兼容 `app.distribute.icons.android` 留空的设置。
- 旧版 `aurora-master.png`、`nihongoi-aurora-icons.zip`、`static/icons/aurora/` 及用户解压的旧图标目录均保留，不覆盖。
- 尚未重新打包或安装发行 APK。

## 验证

72/96/144/192px 原尺寸目视检查；PNG RGBA 格式、尺寸、透明角落、ZIP 内容和四处打包路径验证。导出采用 System.Drawing 高质量双三次缩小、SourceCopy 保留 alpha、边缘镜像采样。

## 生成提示词（内置 image_gen）

```text
Use case: logo-brand
Create a NEW simplified logo version for NihonGoi, a Japanese vocabulary app. The user rejected an elaborate aurora illustration: this version must read as a restrained flat graphic logo, not as a drawing, painting, glass object or 3D render.

Canvas: one square 1:1 app icon. Full-bleed perfectly uniform pale warm peach-beige background, approximately #E8D3C1. No gradient at all.
Symbol: exactly ONE upright vocabulary flashcard, optically centered. Simple softly rounded rectangular silhouette, about 66% of canvas width and 72% of its height. Express a transparent card as a very light, uniform white overlay with a thin clean cream-white outline: the background color remains visible through the card. This is a flat color/opacity design, no physical glass material, no lighting, no shadow, no thickness, no rear card, no doubled outline, no card stack, no offset copy. The final square artwork itself has an opaque background.
Lettering: exactly one Japanese HIRAGANA character "ご" in dark charcoal-plum #36313B, very large and centered within the card. This is hiragana ご (こ plus the two dakuten marks), NOT katakana ゴ, not あ, not Latin GO. Draw the two main curved horizontal strokes of こ with deliberate bold geometric shaping, slightly softened corners and subtly angled terminal cuts. Draw the two small diagonal dakuten strokes at upper right, clearly separated, with the same visual weight and angle as the terminal details. Stylish bespoke typographic logo, restrained and sophisticated, but unequivocally readable as ご. Maintain correct Japanese glyph structure and ample negative space. The two dakuten marks must remain distinct at 72px. Center the entire glyph including the dakuten optically.
Composition: single card + single dark glyph only, generous even outer space, balanced layout, icon-ready. Sharp vector-like edges and absolutely uniform color fills.
Palette: warm neutral background, lightly tinted transparent-looking single card, one dark ink color for all strokes. Only these few flat tones.
STRICT AVOID: gradients, aurora color blobs, rainbow colors, glow, drop shadows, glass reflections, bevels, embossed edges, illustration, paper texture, grain, sparkles, decorative dots, borders outside the card, perspective, multiple cards, arrows, tiny text, extra characters, badges, mockups, watermark, an outer rounded-square app mask.
Output one finished square flat LOGO, not a logo presentation board. Only visible text is "ご".
```

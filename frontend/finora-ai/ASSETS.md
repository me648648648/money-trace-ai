# 图片与公开分发

图片从原型 HTML 中逐字节提取。应用使用相对路径引用这些文件，GitHub Pages 项目子路径下也可加载。

| 文件 | 用途 | 大小 | 公开分发前的核对 |
| --- | --- | ---: | --- |
| `assets/images/app-background.webp` | 应用背景 | 591 KiB | 确认原始制作来源及可分发范围 |
| `assets/images/budget-stickers.png` | 预算页贴纸图集，裁切位置由代码定义 | 1,086 KiB | 图集中有第三方品牌文字、标识和照片。记录每项来源及使用许可，或换为自制资产 |
| `assets/images/finora-mascot.webp` | 左侧栏小账单吉祥物 | 20 KiB | 确认原始制作来源及可分发范围 |

这三张图的常见 EXIF、GPS、XMP 和 IPTC 元数据检查未检出条目。元数据检查和能否公开分发是两个独立问题。代码的许可证也不会自动覆盖图片。

更新贴纸图集时，优先保持原画布尺寸 `1536 × 1024` 和贴纸位置。尺寸或布局变化后，同步修改 `assets/js/app.js` 中的 `budgetStickerGroups` 以及 `assets/css/app.css` 的裁切尺寸。背景和吉祥物的替换文件可以继续使用 WebP。提交新素材时，一并记录来源和授权。

# 第三方软件与模型许可记录

本记录只保留已确认的第三方许可与出处，不为本项目的原创代码、品牌、图像或模型授予新的许可，也不改变原权利人的许可。

## MediaPipe Tasks Vision 0.10.32

`package-lock.json` 锁定 `@mediapipe/tasks-vision@0.10.32`，npm 包元数据声明 `Apache-2.0`。原项目：https://github.com/google-ai-edge/mediapipe 。随仓库保留 [Apache 2.0 全文](licenses/MediaPipe-Apache-2.0.txt)，原文取自上游 [v0.10.32/LICENSE](https://github.com/google-ai-edge/mediapipe/blob/v0.10.32/LICENSE)，未经改写。

本次以 npm 官方发行包的 Git blob SHA-1 核对，以下四个文件与 0.10.32 包内容逐字节一致：

| 本仓库路径 | Git blob SHA-1 |
| --- | --- |
| `public/wasm/vision_wasm_internal.js` | `ac48a29fe7ba7524120f8d4248909cda9536fbe5` |
| `public/wasm/vision_wasm_internal.wasm` | `1fcd4f70713bddbb17130eabd8a3c2aa9092a3ab` |
| `public/wasm/vision_wasm_nosimd_internal.js` | `0d3b32cf6246c25f900486780b0ecfa9d5ef9650` |
| `public/wasm/vision_wasm_nosimd_internal.wasm` | `ddff785e1619195b4957560bb52291eb389d5d5d` |

发行包：https://registry.npmjs.org/@mediapipe/tasks-vision/-/tasks-vision-0.10.32.tgz

发行包 SHA-512 SRI：`sha512-3tiAZnmKloYnRXYoO3dKltTUGnqeCwzC4lV03uY0vCsE+aveJTyEVQyZHOlQGQNsjK+gRHzkf9q08C99Qm2K0Q==`。

该 npm 包未附独立 LICENSE/NOTICE 文件。上述 Apache 许可文本不代替发行物内其他第三方组件可能要求的通知；尚未对整个 WASM 构建依赖做完整清单核验。

## Lucide 0.468.0 与 Feather

锁定的 `lucide@0.468.0` 使用 ISC；其源自 Feather 的部分保留原 MIT 权利。保留的原始全文：

- [Lucide 0.468.0 ISC 与版权说明](licenses/Lucide-0.468.0-LICENSE.txt)，来源：https://github.com/lucide-icons/lucide/blob/0.468.0/LICENSE 。
- [Feather MIT](licenses/Feather-MIT.txt)，来源：https://github.com/feathericons/feather/blob/v4.29.2/LICENSE 。

## Hand Landmarker 模型

`public/models/hand_landmarker.task` 与 Google 官方 [float16/1 模型文件](https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task) 字节完全相同（7,819,105 字节；SHA-256：`fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`）。

[官方 Hand Landmarker 页面](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker) 所链接的 [Hand Tracking Lite/Full 模型卡](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Hand%20Tracking%20%28Lite_Full%29%20with%20Fairness%20Oct%202021.pdf) 第 2 页明确列出 Apache License 2.0。这里保留其既有许可，并不把模型重新授权为本项目自有资产。模型能力、适用场景和限制应一并查阅该模型卡。

## 尚待核对的范围

- `public/wasm/vision_wasm_module_internal.js`、`vision_wasm_module_internal.wasm` 不在上述 0.10.32 npm 包内，其来源版本尚未确定。两份 `.wasm.gz` 也未在本次与原件做解压校验。
- 其他 npm 依赖按各自实际版本的许可执行；本记录不是完整 SBOM 或全体依赖合规结论。
- 项目标识、人物图像及其他美术不因软件许可而自动取得再分发权。

公开源码、非商业使用说明或这份通知本身，都不能替代所需的模型、图像、商标及第三方软件授权。

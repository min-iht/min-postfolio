---
name: optimize-images
description: 새 이미지를 이 포트폴리오의 이미지 정책(장축 2400px 캡 + WebP q85, 예외 3종)대로 일괄 변환. "이미지 최적화", "사진 변환", "webp로 바꿔줘", 또는 img/에 새 이미지를 추가하는 모든 작업에서 사용. Pillow 기반 (magick/cwebp는 이 기기에 없음).
---

# 이미지 웹 최적화

정책 원장: 메모리 `image-optimization-policy` + CLAUDE.md 관례 4.

## 정책 표

| 대상 | 규칙 |
|---|---|
| 기본 (모든 사진) | 장축 ≤2400px, WebP q85 (method 6), CMYK→sRGB(임베디드 ICC), EXIF 회전 베이크 |
| `img/favicon*.png`, `img/cursor/*.png` | PNG 유지, 변환 금지 (파비콘/CSS cursor 호환성) |
| `img/pdf/pdf_brand/*.jpg` | JPEG 유지 (세로 16,383px 초과라 WebP 불가), 폭 2000px 캡, q85 progressive |
| `img/workshop/gallery1/review/*.PNG` | 원본 유지, 변환 금지 |

WebP는 한 변 16,383px가 한계다. 초과하는 이미지는 pdf_brand 규칙(JPEG)을 따른다.

## 절차

1. **원본 백업**: 변환 전 원본을 스크래치패드의 `originals_<날짜>/` 폴더로 복사해 둔다. 원본 덮어쓰기·삭제는 변환 결과를 브라우저로 확인한 뒤에만.
2. 아래 스크립트를 스크래치패드에 저장해 실행 (인자: 파일 또는 폴더 경로들):

```python
# optimize_images.py — 사용: python optimize_images.py <파일|폴더>...
import io, os, sys
from PIL import Image, ImageCms, ImageOps

MAX_EDGE = 2400
WEBP_LIMIT = 16383

def to_srgb(im):
    if im.mode == "CMYK":
        icc = im.info.get("icc_profile")
        if icc:
            src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            return ImageCms.profileToProfile(im, src, ImageCms.createProfile("sRGB"), outputMode="RGB")
        return im.convert("RGB")
    return im

def convert(path):
    before = os.path.getsize(path)
    im = ImageOps.exif_transpose(Image.open(path))
    im = to_srgb(im)
    if max(im.size) > MAX_EDGE:
        im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
    if max(im.size) > WEBP_LIMIT:  # WebP 불가 → pdf_brand 규칙
        out = os.path.splitext(path)[0] + ".jpg"
        if im.width > 2000:
            im.thumbnail((2000, WEBP_LIMIT * 10), Image.LANCZOS)
        im.convert("RGB").save(out, "JPEG", quality=85, progressive=True)
    else:
        out = os.path.splitext(path)[0] + ".webp"
        if im.mode == "P":
            im = im.convert("RGBA")
        im.save(out, "WEBP", quality=85, method=6)
    print(f"{path}  {before/1024:.0f}KB -> {out}  {os.path.getsize(out)/1024:.0f}KB")
    return out

EXTS = (".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".webp")
for arg in sys.argv[1:]:
    files = [arg] if os.path.isfile(arg) else [
        os.path.join(r, f) for r, _, fs in os.walk(arg) for f in fs
        if f.lower().endswith(EXTS)]
    for f in files:
        convert(f)
```

3. **예외 경로는 스크립트에 넣지 않는다** — favicon/cursor/pdf_brand/gallery1 review는 건너뛴다 (인자로 주지 않으면 된다).
4. 변환 결과를 HTML에서 참조로 연결: 첫 화면 밖 `<img>`에는 `loading="lazy" decoding="async"`.
5. 브라우저에서 해당 이미지가 실제로 뜨는지 확인 → 확인 후에만 원본(.png/.jpg) 원본 파일 삭제 (백업은 1번에 있음).

## 완료 보고에 포함할 것

- 파일별 변환 전→후 크기 표 (스크립트 출력 그대로)
- 300KB를 넘는 결과물이 있으면 사유
- 백업 폴더 위치

"""批量生成商品图片（火山方舟 Seedream 模型，OpenAI 兼容接口）

用法：
  python3 generate-product-images.py [--limit N] [--concurrency N]

环境变量：
  ARK_API_KEY  火山方舟 API 密钥（必需）
"""
import argparse
import base64
import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from openai import OpenAI

ROOT = Path(__file__).resolve().parent.parent
JSONL = ROOT / "output/imagegen/products.jsonl"
OUT_DIR = ROOT / "apps/web/public/products"
MODEL = "doubao-seedream-4-0-250828"


def generate_one(client: OpenAI, job: dict) -> tuple[str, bool, str]:
    filename = job["out"]
    target = OUT_DIR / filename
    if target.exists():
        return filename, True, "已存在，跳过"
    try:
        resp = client.images.generate(
            model=MODEL,
            prompt=job["prompt"],
            size=job.get("size", "2048x2048"),
            response_format="b64_json",
            extra_body={"watermark": False},
        )
        b64 = resp.data[0].b64_json
        target.write_bytes(base64.b64decode(b64))
        return filename, True, "生成成功"
    except Exception as err:  # noqa: BLE001
        return filename, False, str(err)[:200]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="只生成前 N 个（测试用）")
    parser.add_argument("--concurrency", type=int, default=4)
    args = parser.parse_args()

    api_key = os.environ.get("ARK_API_KEY")
    if not api_key:
        sys.exit("缺少 ARK_API_KEY 环境变量")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    jobs = [json.loads(line) for line in JSONL.read_text().splitlines() if line.strip()]
    if args.limit:
        jobs = jobs[: args.limit]

    client = OpenAI(api_key=api_key, base_url="https://ark.cn-beijing.volces.com/api/v3")

    ok = fail = 0
    with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        futures = {pool.submit(generate_one, client, job): job for job in jobs}
        for i, future in enumerate(as_completed(futures), 1):
            filename, success, msg = future.result()
            ok += success
            fail += not success
            print(f"[{i}/{len(jobs)}] {'✓' if success else '✗'} {filename} {msg}", flush=True)

    print(f"\n完成：成功 {ok}，失败 {fail}")


if __name__ == "__main__":
    main()

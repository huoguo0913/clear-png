# -*- coding: utf-8 -*-
"""IndexNow 主动推送（ClearPNG）：把 URL 通知 Bing/Yahoo/DuckDuckGo 等即时索引。
Google 不支持 IndexNow，Google 侧靠 sitemap + 站内链接自然重抓。

环境变量 INDEXNOW_KEY。key 验证文件 public/<KEY>.txt 已随站点发布。

用法：
  python3 tools/indexnow_ping.py                # 推送最近更新的 5 个 URL
  python3 tools/indexnow_ping.py --all          # 推送全部 URL
  python3 tools/indexnow_ping.py --url /blog/x  # 推送指定路径
  python3 tools/indexnow_ping.py --dry-run      # 只打印不发送
"""
import json
import os
import re
import sys
import urllib.request

SITE = 'https://png.my99ai.com'
SITEMAP_URL = SITE + '/sitemap.xml'
ENDPOINT = 'https://api.indexnow.org/indexnow'


def sitemap_urls():
    with urllib.request.urlopen(SITEMAP_URL, timeout=30) as resp:
        xml = resp.read().decode('utf-8', 'replace')
    return re.findall(r'<loc>\s*(.*?)\s*</loc>', xml)


def main():
    key = os.getenv('INDEXNOW_KEY', '')
    dry = '--dry-run' in sys.argv
    if not key and not dry:
        print('未配置 INDEXNOW_KEY，跳过 IndexNow 推送。配置方法见 seo/SECRETS-SETUP.md')
        return 0

    urls = sitemap_urls()
    if '--url' in sys.argv:
        wanted = sys.argv[sys.argv.index('--url') + 1]
        urls = [u for u in urls if wanted.rstrip('/') in u.rstrip('/')] or [SITE + wanted]
    elif '--all' not in sys.argv:
        urls = urls[:5]
    if not urls:
        print('没有可推送的 URL')
        return 0

    payload = {'host': 'png.my99ai.com', 'key': key or 'DRY-RUN-KEY', 'urlList': urls}
    body = json.dumps(payload).encode('utf-8')
    if dry:
        print(f'[dry-run] 将推送 {len(urls)} 个 URL:')
        for u in urls:
            print(' ', u)
        return 0

    req = urllib.request.Request(
        ENDPOINT, data=body,
        headers={'Content-Type': 'application/json; charset=utf-8'},
        method='POST')
    with urllib.request.urlopen(req, timeout=30) as resp:
        print(f'IndexNow 推送完成：HTTP {resp.status}，{len(urls)} 个 URL')
        return 0 if resp.status in (200, 202) else 1


if __name__ == '__main__':
    sys.exit(main())

# -*- coding: utf-8 -*-
"""把站内文章转发到 DEV Community（带 canonical 指向原文，白帽外链）。

ClearPNG 版：文章内容本来就是 Markdown，直接从 lib/blog.ts 提取。

环境变量 DEVTO_API_KEY 未设置时优雅跳过。

用法：python3 tools/devto_crosspost.py --slug <slug>
      （省略 --slug 时取 published.json 中最新一篇）
"""
import json
import os
import re
import sys
from pathlib import Path

SITE = 'https://png.my99ai.com'
BASE = Path(__file__).resolve().parent.parent
TAGS = ['tutorial', 'beginners', 'productivity']


def load_article(slug):
    src = (BASE / 'lib' / 'blog.ts').read_text(encoding='utf-8')
    start = src.find(f'slug: "{slug}"')
    if start < 0:
        raise SystemExit(f'lib/blog.ts 中找不到文章: {slug}')
    block_start = src.rfind('  {', 0, start)
    block_end = src.find('\n  },', start)
    block = src[block_start:block_end]

    def field(name):
        m = re.search(name + r':\s*"((?:[^"\\]|\\.)*)"', block)
        return m.group(1).replace('\\"', '"').replace('\\\\', '\\') if m else ''

    content = re.search(r'content: `\n?(.*?)\n?`', block, re.S)
    keywords = re.findall(r'"([\w ]+)"', re.search(r'keywords: \[(.*?)\]', block, re.S).group(1)) \
        if re.search(r'keywords: \[', block) else []
    return {
        'title': field('title'),
        'description': field('description'),
        'keywords': keywords,
        'content': content.group(1) if content else '',
    }


def main():
    api_key = os.getenv('DEVTO_API_KEY', '')
    if not api_key:
        print('未配置 DEVTO_API_KEY，跳过 Dev.to 转发。配置方法见 seo/SECRETS-SETUP.md')
        return 0

    args = sys.argv
    slug = args[args.index('--slug') + 1] if '--slug' in args else None
    if not slug:
        published = json.loads((BASE / 'seo' / 'published.json').read_text(encoding='utf-8'))
        slug = published['published'][-1]

    art = load_article(slug)
    canonical = f'{SITE}/blog/{slug}'
    md = art['content'] + (f'\n\n---\n\n*This was originally published on [my blog]({canonical}). '
                           f'Try [ClearPNG]({SITE}) — remove image backgrounds free, 3 images/month.*\n'
                           f'> {art["description"]}')

    import requests
    resp = requests.post('https://dev.to/api/articles', headers={'api-key': api_key}, json={
        'article': {
            'title': art['title'],
            'body_markdown': md,
            'published': True,
            'description': art['description'],
            'tags': TAGS,
            'canonical_url': canonical,
            'main_image': f'{SITE}/og-image.png',
        }
    }, timeout=60)
    if resp.status_code in (200, 201):
        url = resp.json().get('url')
        print(f'Dev.to 转发成功: {url}')
        return 0
    print(f'Dev.to 转发失败 HTTP {resp.status_code}: {resp.text[:300]}')
    return 1


if __name__ == '__main__':
    sys.exit(main())

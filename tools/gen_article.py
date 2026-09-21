# -*- coding: utf-8 -*-
"""无人值守内容流水线（ClearPNG 版）：取词 -> DeepSeek 生成文章 -> 质量门槛 ->
向 lib/blog.ts 的 blogPosts 数组插入新条目（Next.js 构建时自动生成页面/sitemap）。

环境变量：
  LLM_API_KEY   必需（未设置时直接跳过，退出码 0，便于 CI 无凭据时优雅跳过）
  LLM_API_BASE  可选，默认 https://api.deepseek.com/v1
  LLM_MODEL     可选，默认 deepseek-flash

用法：python3 tools/gen_article.py
"""
import json
import math
import os
import re
import sys
import time
from pathlib import Path

import requests

BASE = Path(__file__).resolve().parent.parent
SEO = BASE / 'seo'
BLOG_LIB = BASE / 'lib' / 'blog.ts'
SITE = 'https://png.my99ai.com'
MARKER = '// article-insert-point'

INTERNAL_PAGES = [
    ('/remove-white-background-from-logo', 'logo background removal page'),
    ('/signature-background-remover', 'signature background remover page'),
    ('/product-photo-background-remover', 'product photo background remover page'),
    ('/remove-white-background', 'white background removal page'),
    ('/pricing', 'pricing page'),
    ('/blog', 'blog index'),
]

SYSTEM_PROMPT = (
    'You are a senior SEO content writer for ClearPNG '
    f'({SITE}), an online image background remover tool. You write accurate, '
    'practical, genuinely useful articles for an international (US) audience of '
    'designers, ecommerce sellers, marketers and everyday users. Hard rules: never '
    'invent statistics, quotes, or product claims; do not link to any external '
    'website; only use the internal URLs provided; output only the JSON object requested.'
)

USER_PROMPT = '''Write a blog article for the target keyword below.

Target keyword: {keyword}
Suggested angle: {angle}

Requirements:
- 900-1300 words. Practical and actionable, no fluff, no marketing hype.
- Structure: intro paragraph (no heading), 3-5 "## " markdown headings ("### " for sub-sections), and a short FAQ section at the end with 2-3 questions.
- Markdown only. Do NOT use code fences, backticks, HTML tags, or the sequence ${{.
- Include 2-4 internal markdown links chosen from this list, with natural anchor text. Use exactly this link syntax:
  [anchor text](/internal-path)
  Internal pages:
{urls}
- End with a call-to-action paragraph linking to the most relevant tool page.
- US English. No fabricated dates, numbers, research findings, or awards.

Respond with ONLY this JSON object (no markdown fences):
{{"title": "...", "description": "...", "keywords": ["...", "..."], "category": "...", "content": "..."}}
- title: 30-70 chars, natural, includes the keyword
- description: 110-160 chars meta description
- keywords: 3-6 SEO keywords for the post
- category: one word, e.g. Tutorials / Ecommerce / Design / Use Cases
- content: the markdown body per the rules above'''


def log(msg):
    print(msg, flush=True)


def load_keywords():
    data = json.loads((SEO / 'keywords.json').read_text(encoding='utf-8'))
    published = json.loads((SEO / 'published.json').read_text(encoding='utf-8')) \
        if (SEO / 'published.json').exists() else {'published': []}
    done = set(published['published'])
    for kw in data.get('keywords', []):
        if kw['slug'] not in done:
            return kw, published
    return None, published


def internal_url_list():
    urls = [f'{SITE}{p} ({label})' for p, label in INTERNAL_PAGES]
    # 已有博客文章也可互链
    src = BLOG_LIB.read_text(encoding='utf-8')
    for m in re.finditer(r'slug:\s*"([\w-]+)"', src):
        urls.append(f'{SITE}/blog/{m.group(1)} (existing blog post)')
    return '\n'.join(urls)


def call_llm(keyword, angle):
    api_base = (os.getenv('LLM_API_BASE') or 'https://api.deepseek.com/v1').rstrip('/')
    model = (os.getenv('LLM_MODEL') or 'deepseek-flash')
    resp = requests.post(
        f'{api_base}/chat/completions',
        headers={'Authorization': f"Bearer {os.environ['LLM_API_KEY']}"},
        json={
            'model': model,
            'messages': [
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': USER_PROMPT.format(
                    keyword=keyword, angle=angle, urls=internal_url_list())},
            ],
            'temperature': 0.7,
        },
        timeout=300,
    )
    resp.raise_for_status()
    text = resp.json()['choices'][0]['message']['content'].strip()
    text = re.sub(r'^```(?:json)?|```$', '', text.strip(), flags=re.M).strip()
    start, end = text.find('{'), text.rfind('}')
    if start < 0 or end <= start:
        raise ValueError(f'LLM did not return JSON: {text[:200]}')
    data = json.loads(text[start:end + 1])
    return {
        'title': (data.get('title') or '').strip(),
        'description': (data.get('description') or '').strip(),
        'keywords': [str(k).strip() for k in (data.get('keywords') or []) if str(k).strip()],
        'category': (data.get('category') or 'Tutorials').strip(),
        'content': (data.get('content') or '').strip(),
    }


def word_count(md):
    return len(re.findall(r"[A-Za-z0-9']+", re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', md)))


def check_gate(title, description, keywords, category, content):
    problems = []
    words = word_count(content)
    if words < 700:
        problems.append(f'too short: {words} words (need >=700)')
    internal = len(re.findall(r'\]\(/[^)]*\)', content)) + \
        len(re.findall(r'\]\(https://png\.my99ai\.com', content))
    if internal < 2:
        problems.append(f'too few internal links: {internal} (need >=2)')
    external = re.findall(r'\]\(https?://(?!png\.my99ai\.com)', content)
    if external:
        problems.append(f'{len(external)} external links not allowed')
    if '`' in content or '${' in content:
        problems.append('backticks or ${ not allowed (template literal safety)')
    if '\\' in content:
        problems.append('backslashes not allowed (template literal safety)')
    if '<' in content and re.search(r'<(?:script|iframe|html|body)', content, re.I):
        problems.append('html/script tags not allowed')
    if not 30 <= len(title) <= 80:
        problems.append(f'title length {len(title)} out of range 30-80')
    if not 100 <= len(description) <= 170:
        problems.append(f'description length {len(description)} out of range 100-170')
    if not 3 <= len(keywords) <= 6:
        problems.append(f'keywords count {len(keywords)} out of range 3-6')
    if not re.search(r'^##\s', content, re.M):
        problems.append('no "## " markdown headings found')
    return problems, words


def ts_escape(s):
    return s.replace('\\', '\\\\').replace('"', '\\"')


def build_entry(slug, title, description, keywords, category, content, read_min, date_str):
    kw_lines = ',\n'.join(f'      "{k}"' for k in keywords)
    return f'''  {{
    slug: "{slug}",
    title: "{ts_escape(title)}",
    description:
      "{ts_escape(description)}",
    date: "{date_str}",
    keywords: [
{kw_lines}
    ],
    readingTime: "{read_min} min read",
    category: "{ts_escape(category)}",
    content: `
{content}
`,
  }},
'''


def insert_entry(entry_text):
    src = BLOG_LIB.read_text(encoding='utf-8')
    if MARKER not in src:
        raise RuntimeError('blog.ts insert marker missing')
    src = src.replace('  ' + MARKER, entry_text + '  ' + MARKER, 1)
    BLOG_LIB.write_text(src, encoding='utf-8')


def main():
    kw, published = load_keywords()
    if kw is None:
        log('所有关键词均已发布。请向 seo/keywords.json 添加新词。')
        return 0

    slug, keyword, angle = kw['slug'], kw['keyword'], kw.get('angle', '')
    log(f'选取关键词: {keyword} (slug={slug})')

    if not os.getenv('LLM_API_KEY'):
        log('未配置 LLM_API_KEY，跳过文章生成（CI 中属正常情况）。配置方法见 seo/SECRETS-SETUP.md')
        return 0

    critique = ''
    for attempt in (1, 2, 3):
        log(f'调用 LLM 生成文章（第 {attempt} 次）...')
        try:
            data = call_llm(keyword, angle + ('\n\n改进要求：\n' + critique if critique else ''))
        except requests.RequestException as e:
            log(f'  LLM 调用网络错误，重试: {str(e)[:100]}')
            critique = '上次调用中断，请重新完整输出。'
            time.sleep(3)
            continue
        problems, words = check_gate(data['title'], data['description'],
                                     data['keywords'], data['category'], data['content'])
        log(f'  词数={words}，门槛问题: {problems or "无，通过"}')
        if not problems:
            break
        critique = '\n'.join(problems)
        time.sleep(2)
    else:
        raise SystemExit('文章未通过质量门槛，已放弃（不写入）。请检查 LLM_MODEL 或关键词角度。')

    read_min = max(2, math.ceil(words / 220))
    # 发布日期去重：默认今天；若已有文章占用该日期，向前找到空闲日期
    import datetime as _dt
    date_str = time.strftime('%Y-%m-%d')
    used_dates = set(re.findall(r'date: "(\d{4}-\d{2}-\d{2})"', BLOG_LIB.read_text(encoding='utf-8')))
    if date_str in used_dates:
        d = _dt.date.today()
        while d.strftime('%Y-%m-%d') in used_dates:
            d -= _dt.timedelta(days=1)
        date_str = d.strftime('%Y-%m-%d')
        log(f'  今日日期已被占用，发布日期调整为 {date_str}')
    entry = build_entry(slug, data['title'], data['description'], data['keywords'],
                        data['category'], data['content'], read_min, date_str)
    insert_entry(entry)
    log(f'已插入 lib/blog.ts：{slug}')

    published['published'].append(slug)
    (SEO / 'published.json').write_text(
        json.dumps(published, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    if 'GITHUB_OUTPUT' in os.environ:
        with open(os.environ['GITHUB_OUTPUT'], 'a', encoding='utf-8') as f:
            f.write(f'slug={slug}\n')
    log(f'完成：新文章 /blog/{slug}（{words} 词，约 {read_min} 分钟阅读）')
    return 0


if __name__ == '__main__':
    sys.exit(main())

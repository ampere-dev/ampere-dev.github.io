#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup, NavigableString
from datetime import datetime, timezone
import re
import html
from urllib.parse import urljoin
import time

BASE_URL = "https://ampere.dev"
START_URL = f"{BASE_URL}/blog"

HEADERS = {
    "User-Agent": "SitemapGenerator/1.0 (personal use; contact: your@email.com)"
}

def parse_date(date_str: str) -> str:
    """Convert date strings to ISO 8601 (YYYY-MM-DDThh:mm:ssZ) – best effort"""
    date_str = date_str.strip().replace("Short teaser:", "").strip()
    if not date_str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Common patterns seen on the site
    patterns = [
        r"([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})",           # March 4, 2026 or March 4 2026
        r"(\d{4})-(\d{2})-(\d{2})",                       # 2026-03-04
    ]
    for pat in patterns:
        m = re.search(pat, date_str)
        if m:
            if len(m.groups()) == 3 and ',' in date_str:
                month_name, day, year = m.groups()
                try:
                    dt = datetime.strptime(f"{month_name} {day} {year}", "%B %d %Y")
                    return dt.replace(tzinfo=timezone.utc).strftime("%Y-%m-%dT00:00:00Z")
                except ValueError:
                    pass
            elif len(m.groups()) == 3:
                year, month, day = m.groups()
                return f"{year}-{month}-{day}T00:00:00Z"

    # Fallback to current UTC time if parsing fails
    print(f"Date parse failed for: '{date_str}' → using current time")
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def scrape_blog_pages():
    posts = []
    seen_urls = set()  # Dedup by full URL
    page = 1

    while True:
        url = START_URL if page == 1 else f"{START_URL}?page={page}"
        print(f"Scraping page {page} → {url}")

        try:
            r = requests.get(url, headers=HEADERS, timeout=12)
            r.raise_for_status()
        except Exception as e:
            print(f"Error fetching {url}: {e} → stopping pagination.")
            break

        soup = BeautifulSoup(r.text, "html.parser")

        # Find all h2 headings (post titles)
        h2_tags = soup.find_all("h2")
        page_posts = 0

        for h2 in h2_tags:
            link_tag = h2.find("a", href=re.compile(r"^/blog/[^/]+/?$"))
            if not link_tag:
                continue

            href = link_tag.get("href")
            full_url = urljoin(BASE_URL, href)
            if full_url in seen_urls:
                continue
            seen_urls.add(full_url)

            title = link_tag.get_text(strip=True).strip()
            if not title:
                continue

            # Date: look for plain text sibling right after h2
            date = ""
            next_node = h2.next_sibling
            while next_node:
                if isinstance(next_node, NavigableString):
                    text = next_node.strip()
                    if re.search(r"[A-Za-z]+\s+\d{1,2},?\s+\d{4}", text):
                        date = text
                        break
                next_node = next_node.next_sibling

            # Fallback: search next string anywhere after
            if not date:
                date_match = h2.find_next(string=re.compile(r"[A-Za-z]+\s+\d{1,2},?\s+\d{4}"))
                if date_match:
                    date = date_match.strip()

            # We don't need excerpt for sitemap, but keeping minimal check
            # (you can remove if you want even leaner code)

            posts.append({
                "url": full_url,
                "date": parse_date(date),
            })
            page_posts += 1

        if page_posts == 0:
            print(f"Page {page} has no new posts → stopping.")
            break

        time.sleep(0.8)  # Polite delay
        page += 1

    # Sort by date descending (newest first) – good practice for sitemaps
    posts.sort(key=lambda x: x["date"], reverse=True)

    print(f"Collected {len(posts)} unique blog post URLs.")
    return posts

def generate_sitemap(posts):
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    for post in posts:
        lines.extend([
            '  <url>',
            f'    <loc>{html.escape(post["url"])}</loc>',
            f'    <lastmod>{post["date"]}</lastmod>',
            '    <changefreq>monthly</changefreq>',
            '    <priority>0.7</priority>',
            '  </url>',
        ])

    lines.append('</urlset>')

    output_file = "sitemap-blog.xml"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Created {output_file} with {len(posts)} URLs.")

if __name__ == "__main__":
    print("Starting blog sitemap generator...")
    all_posts = scrape_blog_pages()
    if all_posts:
        generate_sitemap(all_posts)
    else:
        print("No posts found — check selectors, network, or site structure.")

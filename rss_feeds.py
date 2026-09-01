#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup, NavigableString
from datetime import datetime
import xml.etree.ElementTree as ET
from xml.dom import minidom
from urllib.parse import urljoin

BASE_URL = "https://ampere.dev/blog"
MAX_PAGES = 17  # From site pagination

def parse_date(date_str):
    date_str = date_str.strip().replace(',', '').strip()
    formats = ["%B %d %Y", "%B %d, %Y", "%b %d %Y"]  # Try common variants
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime("%a, %d %b %Y 00:00:00 EST")
        except ValueError:
            pass
    return datetime.now().strftime("%a, %d %b %Y 00:00:00 EST")  # Fallback

seen_links = set()  # Deduplicate
items = []

session = requests.Session()
session.headers.update({'User-Agent': 'Mozilla/5.0 (compatible; RSSGenerator/1.0)'})

for page in range(1, MAX_PAGES + 1):
    url = BASE_URL if page == 1 else f"{BASE_URL}?page={page}"
    print(f"Fetching {url}...")
    try:
        resp = session.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print(f"Failed on page {page}: {e}")
        continue

    soup = BeautifulSoup(resp.text, 'html.parser')

    # Try to find main content area first (common containers)
    content_area = (
        soup.find('div', class_='prose') or
        soup.find('div', class_='max-w-prose') or
        soup.find('main') or
        soup.find('article') or
        soup.find('div', id='content') or
        soup.body
    )

    if not content_area:
        print(f"No content area found on page {page}")
        continue

    # Find all heading tags that look like post titles (usually h2 or h3)
    potential_titles = content_area.find_all(['h2', 'h3'])

    for title_tag in potential_titles:
        title_text = title_tag.get_text(strip=True)
        if not title_text or len(title_text) < 10:  # Skip headers that aren't post titles
            continue

        # Get link from the heading itself or nearest <a>
        link_tag = title_tag.find('a') or title_tag
        if not link_tag.name == 'a':
            link_tag = title_tag.parent.find('a') if title_tag.parent else None
        if not link_tag or 'href' not in link_tag.attrs:
            continue

        href = link_tag['href'].strip()
        full_link = urljoin(BASE_URL, href)
        if full_link in seen_links:
            continue
        seen_links.add(full_link)

        # Date: often the next sibling text or in a <time>/<span> after title
        date_str = ""
        next_sib = title_tag.next_sibling
        while next_sib:
            if isinstance(next_sib, NavigableString) and any(c.isdigit() for c in next_sib):
                date_str = next_sib.strip()
                break
            if next_sib.name in ['span', 'div', 'p', 'time']:
                date_str = next_sib.get_text(strip=True)
                if date_str and any(month in date_str.lower() for month in ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']):
                    break
            next_sib = next_sib.next_sibling

        pubdate = parse_date(date_str or "Unknown")

        # Excerpt: first <p> after title/date
        excerpt = ""
        excerpt_tag = title_tag.find_next('p')
        if excerpt_tag:
            excerpt = excerpt_tag.get_text(strip=True)
            # Clean up if it includes "Read more"
            if 'Read more' in excerpt:
                excerpt = excerpt.split('Read more')[0].strip()

        items.append({
            'title': title_text,
            'link': full_link,
            'pubDate': pubdate,
            'description': excerpt,
            'guid': full_link
        })

        print(f"  Found: {title_text[:60]}... ({pubdate})")

# Build RSS XML
if not items:
    print("No items found after all pages — selectors still need adjustment.")
else:
    rss = ET.Element("rss", version="2.0")
    channel = ET.SubElement(rss, "channel")

    ET.SubElement(channel, "title").text = "Ampere Insights | Ampere Development"
    ET.SubElement(channel, "link").text = BASE_URL
    ET.SubElement(channel, "description").text = "Blog posts from Ampere Development on data center power infrastructure, AI energy, transformers, grid, etc."
    ET.SubElement(channel, "language").text = "en-us"
    ET.SubElement(channel, "lastBuildDate").text = datetime.now().strftime("%a, %d %b %Y %H:%M:%S EST")

    for item_data in items:
        item = ET.SubElement(channel, "item")
        ET.SubElement(item, "title").text = item_data['title']
        ET.SubElement(item, "link").text = item_data['link']
        ET.SubElement(item, "guid", attrib={"isPermaLink": "true"}).text = item_data['guid']
        ET.SubElement(item, "pubDate").text = item_data['pubDate']
        ET.SubElement(item, "description").text = item_data['description']

    xml_str = minidom.parseString(ET.tostring(rss, encoding='unicode')).toprettyxml(indent="  ")
    with open("rss.xml", "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write(xml_str)

    print(f"\nGenerated RSS with {len(items)} items. Saved to rss.xml")

#!/usr/bin/env python3
"""
Update ampere.dev sitemaps.

The site uses a sitemap index:

    sitemap.xml
      ├── sitemap-static.xml   product / service / legal pages
      └── sitemap-blog.xml     /blog/<slug>/ posts

Typical use from the GitHub Pages repo root:

    # Static pages: bump lastmod, keep comments/order/priority
    python3 update_sitemap.py static --today
    python3 update_sitemap.py static --from-files --add-missing

    # Blog: insert any _posts not already listed (newest first)
    python3 update_sitemap.py blog
    python3 update_sitemap.py blog --rebuild

    # Both + refresh sitemap.xml lastmods
    python3 update_sitemap.py all --today

    python3 update_sitemap.py static --check-urls
    python3 update_sitemap.py blog --dry-run

Notes
-----
* /blog itself is the post index. It is NOT added to sitemap-static.xml.
  Individual posts live only in sitemap-blog.xml.
* Blog lastmod stays the post date (YYYY-MM-DDT00:00:00Z), matching the
  existing file. Static lastmod is date-only (YYYY-MM-DD).
* --add-missing on static only considers root-level *.html (not _posts).
"""

from __future__ import annotations

import argparse
import datetime as dt
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Iterable
from xml.sax.saxutils import escape

DEFAULT_STATIC = "sitemap-static.xml"
DEFAULT_BLOG = "sitemap-blog.xml"
DEFAULT_INDEX = "sitemap.xml"
DEFAULT_BASE = "https://ampere.dev"
DEFAULT_CHANGEFREQ = "daily"
DEFAULT_PRIORITY = "0.8"
BLOG_CHANGEFREQ = "monthly"
BLOG_PRIORITY = "0.7"

SKIP_HTML = {"404.html"}
# Keep the blog listing page out of the static sitemap.
SKIP_STEMS = {"404", "blog"}

PRIORITY_HINTS = {
    "index": "1.0",
    "resources": "0.8",
    "tapbox-rental": "0.9",
    "anord-mardix-tapbox-rental": "0.8",
    "pdi-eaton-powerwave-tapbox-rental": "0.8",
    "vertiv-ei-tapbox-rental": "0.8",
    "water-cooled-load-bank-rental": "0.8",
}

LOC_RE = re.compile(r"<loc>\s*([^<]+?)\s*</loc>", re.I)
LASTMOD_RE = re.compile(r"(<lastmod>)\s*([^<]+?)\s*(</lastmod>)", re.I)
URL_BLOCK_RE = re.compile(r"<url\b[^>]*>.*?</url>", re.I | re.S)
POST_NAME_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})-(.+)\.(md|markdown|html)$")


def today_iso() -> str:
    return dt.date.today().isoformat()


def loc_to_path(loc: str, base: str) -> str:
    loc = loc.strip()
    base = base.rstrip("/")
    if loc.startswith(base):
        path = loc[len(base) :]
    else:
        path = loc
    path = path.split("?", 1)[0].split("#", 1)[0]
    if not path or path == "/":
        return "index.html"
    path = path.lstrip("/")
    if path.endswith("/"):
        path = path[:-1]
    if not os.path.splitext(path)[1]:
        path = f"{path}.html"
    return path


def file_mtime_iso(path: Path) -> str | None:
    try:
        ts = path.stat().st_mtime
    except OSError:
        return None
    return dt.date.fromtimestamp(ts).isoformat()


def collect_html_pages(root: Path) -> list[str]:
    pages: list[str] = []
    for p in sorted(root.glob("*.html")):
        if p.name in SKIP_HTML or p.stem in SKIP_STEMS:
            continue
        pages.append(p.name)
    return pages


def page_to_loc(filename: str, base: str) -> str:
    base = base.rstrip("/")
    if filename == "index.html":
        return f"{base}/"
    # Existing sitemap keeps the .html suffix on this one URL only.
    if filename == "800v-dc-load-banks-data-centers.html":
        return f"{base}/{filename}"
    return f"{base}/{Path(filename).stem}"


def existing_locs(xml: str) -> set[str]:
    return {normalize_loc(m.group(1).strip()) for m in LOC_RE.finditer(xml)}


def normalize_loc(loc: str) -> str:
    return loc.rstrip("/")


def build_url_entry(
    loc: str,
    lastmod: str,
    changefreq: str = DEFAULT_CHANGEFREQ,
    priority: str = DEFAULT_PRIORITY,
) -> str:
    return (
        f"  <url>\n"
        f"    <loc>{escape(loc)}</loc>\n"
        f"    <lastmod>{escape(lastmod)}</lastmod>\n"
        f"    <changefreq>{escape(changefreq)}</changefreq>\n"
        f"    <priority>{escape(priority)}</priority>\n"
        f"  </url>\n"
    )


def update_lastmods(
    xml: str,
    *,
    use_today: bool,
    from_files: bool,
    root: Path,
    base: str,
    fallback: str,
) -> tuple[str, int]:
    changed = 0

    def replacer(match: re.Match[str]) -> str:
        nonlocal changed
        block = match.group(0)
        loc_m = LOC_RE.search(block)
        last_m = LASTMOD_RE.search(block)
        if not last_m:
            return block
        new_date = last_m.group(2).strip()
        if from_files and loc_m:
            rel = loc_to_path(loc_m.group(1), base)
            file_date = file_mtime_iso(root / rel)
            if file_date:
                new_date = file_date
        elif use_today:
            new_date = fallback
        old = last_m.group(2).strip()
        old_date = old[:10]
        if new_date != old and new_date != old_date:
            changed += 1
        return LASTMOD_RE.sub(rf"\g<1>{new_date}\g<3>", block, count=1)

    return URL_BLOCK_RE.sub(replacer, xml), changed


def insert_missing_static(
    xml: str,
    missing_locs: Iterable[tuple[str, str, str]],
    lastmod: str,
) -> tuple[str, int]:
    missing = list(missing_locs)
    if not missing:
        return xml, 0
    extra = ["\n  <!-- Auto-added pages -->\n"]
    for loc, changefreq, priority in missing:
        extra.append(build_url_entry(loc, lastmod, changefreq, priority))
    close = xml.rfind("</urlset>")
    if close == -1:
        raise SystemExit("sitemap is missing </urlset>")
    return xml[:close] + "".join(extra) + xml[close:], len(missing)


def update_index_entry(index_path: Path, sitemap_name: str, lastmod: str) -> bool:
    if not index_path.exists():
        return False
    text = index_path.read_text(encoding="utf-8")
    pattern = re.compile(
        rf"(<loc>\s*https?://[^<]*{re.escape(sitemap_name)}\s*</loc>\s*"
        rf"<lastmod>)\s*[^<]+(\s*</lastmod>)",
        re.I,
    )
    new, n = pattern.subn(rf"\g<1>{lastmod}\2", text, count=1)
    if n:
        index_path.write_text(new, encoding="utf-8")
        return True
    return False


def check_urls(locs: Iterable[str], timeout: float = 15.0) -> list[tuple[str, str]]:
    bad: list[tuple[str, str]] = []
    for loc in locs:
        req = urllib.request.Request(loc, method="HEAD", headers={"User-Agent": "sitemap-updater"})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                code = getattr(resp, "status", None) or resp.getcode()
                if int(code) >= 400:
                    bad.append((loc, str(code)))
        except urllib.error.HTTPError as exc:
            if exc.code in (405, 403):
                try:
                    get_req = urllib.request.Request(
                        loc, method="GET", headers={"User-Agent": "sitemap-updater"}
                    )
                    with urllib.request.urlopen(get_req, timeout=timeout) as resp:
                        code = getattr(resp, "status", None) or resp.getcode()
                        if int(code) >= 400:
                            bad.append((loc, str(code)))
                except Exception as exc2:
                    bad.append((loc, str(exc2)))
            else:
                bad.append((loc, str(exc.code)))
        except Exception as exc:
            bad.append((loc, str(exc)))
    return bad


def parse_front_matter_date(text: str) -> str | None:
    # date: 2026-08-23 or date: 2026-08-23 00:00:00 +/-0000
    m = re.search(r"^date:\s*['\"]?(\d{4}-\d{2}-\d{2})", text, re.M)
    return m.group(1) if m else None


def parse_front_matter_slug(text: str, fallback: str) -> str:
    m = re.search(r"^slug:\s*['\"]?([^\s'\"]+)", text, re.M)
    return m.group(1) if m else fallback


def collect_posts(root: Path, base: str) -> list[tuple[str, str]]:
    """Return (loc, lastmod_iso_z) newest first."""
    posts_dir = root / "_posts"
    found: list[tuple[str, str, str]] = []
    if not posts_dir.is_dir():
        return []
    for path in posts_dir.iterdir():
        if not path.is_file():
            continue
        m = POST_NAME_RE.match(path.name)
        if not m:
            continue
        file_date, slug_part, _ = m.groups()
        text = path.read_text(encoding="utf-8", errors="replace")
        date = parse_front_matter_date(text) or file_date
        slug = parse_front_matter_slug(text, slug_part)
        loc = f"{base.rstrip('/')}/blog/{slug}/"
        lastmod = f"{date}T00:00:00Z"
        found.append((date, loc, lastmod))
    found.sort(key=lambda row: row[0], reverse=True)
    return [(loc, lastmod) for _, loc, lastmod in found]


def blog_xml_from_posts(posts: list[tuple[str, str]]) -> str:
    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>\n',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n',
    ]
    for loc, lastmod in posts:
        parts.append(build_url_entry(loc, lastmod, BLOG_CHANGEFREQ, BLOG_PRIORITY))
    parts.append("</urlset>\n")
    return "".join(parts)


def insert_missing_blog(xml: str, posts: list[tuple[str, str]]) -> tuple[str, int]:
    have = existing_locs(xml)
    missing = [(loc, lastmod) for loc, lastmod in posts if normalize_loc(loc) not in have]
    if not missing:
        return xml, 0
    # Newest first, prepend after <urlset ...>
    extra = "".join(
        build_url_entry(loc, lastmod, BLOG_CHANGEFREQ, BLOG_PRIORITY) for loc, lastmod in missing
    )
    m = re.search(r"<urlset\b[^>]*>\s*", xml, re.I)
    if not m:
        raise SystemExit("blog sitemap is missing <urlset>")
    insert_at = m.end()
    return xml[:insert_at] + extra + xml[insert_at:], len(missing)


def resolve_path(root: Path, value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else root / path


def write_or_print(path: Path, xml: str, dry_run: bool) -> None:
    if dry_run:
        sys.stdout.write(xml)
        if not xml.endswith("\n"):
            sys.stdout.write("\n")
        return
    path.write_text(xml, encoding="utf-8")
    print(f"wrote {path}")


def maybe_check(xml: str, enabled: bool) -> int:
    if not enabled:
        return 0
    locs = [m.group(1).strip() for m in LOC_RE.finditer(xml)]
    print(f"checking {len(locs)} URLs…")
    bad = check_urls(locs)
    if not bad:
        print("all URLs reachable")
        return 0
    print("failures:")
    for loc, reason in bad:
        print(f"  {loc}  ->  {reason}")
    return 2


def run_static(args: argparse.Namespace, root: Path) -> tuple[str, Path, int]:
    sitemap_path = resolve_path(root, args.sitemap or DEFAULT_STATIC)
    if not sitemap_path.exists():
        raise SystemExit(f"error: sitemap not found: {sitemap_path}")
    xml = sitemap_path.read_text(encoding="utf-8")
    stamp = today_iso()
    use_today = args.today or (not args.from_files and args.bump_dates)
    xml, n_dates = update_lastmods(
        xml,
        use_today=use_today,
        from_files=args.from_files,
        root=root,
        base=args.base,
        fallback=stamp,
    )
    n_added = 0
    if args.add_missing:
        have = existing_locs(xml)
        missing: list[tuple[str, str, str]] = []
        for name in collect_html_pages(root):
            loc = page_to_loc(name, args.base)
            if normalize_loc(loc) in have:
                continue
            stem = Path(name).stem
            missing.append((loc, DEFAULT_CHANGEFREQ, PRIORITY_HINTS.get(stem, DEFAULT_PRIORITY)))
        xml, n_added = insert_missing_static(xml, missing, stamp)
    print(f"static lastmod fields updated: {n_dates}")
    print(f"static pages added: {n_added}")
    return xml, sitemap_path, n_added + n_dates


def run_blog(args: argparse.Namespace, root: Path) -> tuple[str, Path, int]:
    sitemap_path = resolve_path(root, args.blog_sitemap or DEFAULT_BLOG)
    posts = collect_posts(root, args.base)
    if args.rebuild:
        xml = blog_xml_from_posts(posts)
        print(f"blog rebuilt from _posts: {len(posts)} urls")
        return xml, sitemap_path, len(posts)
    if not sitemap_path.exists():
        xml = blog_xml_from_posts(posts)
        print(f"blog sitemap created: {len(posts)} urls")
        return xml, sitemap_path, len(posts)
    xml = sitemap_path.read_text(encoding="utf-8")
    xml, n_added = insert_missing_blog(xml, posts)
    print(f"blog posts added: {n_added}")
    if not posts:
        print("note: no _posts directory found; nothing new to insert")
    return xml, sitemap_path, n_added


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Update ampere.dev static and blog sitemaps")
    p.add_argument(
        "target",
        choices=["static", "blog", "all"],
        help="Which sitemap to update. /blog posts are only written to sitemap-blog.xml.",
    )
    p.add_argument("--root", default=".", help="Repo root")
    p.add_argument("--base", default=DEFAULT_BASE, help="Public site origin")
    p.add_argument("--sitemap", help="Override path to sitemap-static.xml")
    p.add_argument("--blog-sitemap", help="Override path to sitemap-blog.xml")
    p.add_argument("--index", default=DEFAULT_INDEX, help="Path to sitemap.xml index")
    p.add_argument("--today", action="store_true", help="Set static lastmod to today")
    p.add_argument(
        "--bump-dates",
        action="store_true",
        help="Same as --today; used when target=all so blog dates stay put",
    )
    p.add_argument("--from-files", action="store_true", help="Static lastmod from HTML mtime")
    p.add_argument(
        "--add-missing",
        action="store_true",
        help="Append root HTML pages missing from sitemap-static.xml (never blog posts)",
    )
    p.add_argument(
        "--rebuild",
        action="store_true",
        help="Rewrite sitemap-blog.xml entirely from _posts (newest first)",
    )
    p.add_argument("--check-urls", action="store_true", help="HEAD-check urls after update")
    p.add_argument("--dry-run", action="store_true", help="Print XML instead of writing")
    p.add_argument("--no-index", action="store_true", help="Do not touch sitemap.xml")
    return p


def main() -> int:
    args = build_parser().parse_args()
    root = Path(args.root).resolve()
    stamp = today_iso()
    written: list[tuple[Path, str]] = []
    rc = 0

    if args.target in {"static", "all"}:
        xml, path, _ = run_static(args, root)
        write_or_print(path, xml, args.dry_run)
        written.append((path, xml))
        if not args.dry_run and not args.no_index:
            if update_index_entry(resolve_path(root, args.index), path.name, stamp):
                print(f"updated index lastmod for {path.name}")

    if args.target in {"blog", "all"}:
        xml, path, _ = run_blog(args, root)
        write_or_print(path, xml, args.dry_run)
        written.append((path, xml))
        if not args.dry_run and not args.no_index:
            if update_index_entry(resolve_path(root, args.index), path.name, stamp):
                print(f"updated index lastmod for {path.name}")

    if args.check_urls and not args.dry_run:
        for path, xml in written:
            print(f"== {path.name}")
            rc = max(rc, maybe_check(xml, True))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3

import os
import datetime

def generate_sitemap(directory, base_url):
    urls = []

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.html', '.htm')):
                path = os.path.relpath(os.path.join(root, file), directory)
                url = f"{base_url}/{path.replace(os.sep, '/')}"
                urls.append(url)
    
    sitemap_content = generate_sitemap_content(urls)
    
    sitemap_path = os.path.join(directory, 'sitemap.xml')
    with open(sitemap_path, 'w', encoding='utf-8') as file:
        file.write(sitemap_content)
    
    print(f"Sitemap generated at {sitemap_path}")

def generate_sitemap_content(urls):
    sitemap_header = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap_header += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    sitemap_footer = '</urlset>'

    sitemap_urls = ''
    for url in urls:
        sitemap_urls += '  <url>\n'
        sitemap_urls += f'    <loc>{url}</loc>\n'
        sitemap_urls += f'    <lastmod>{datetime.datetime.now().strftime("%Y-%m-%d")}</lastmod>\n'
        sitemap_urls += '  </url>\n'

    return sitemap_header + sitemap_urls + sitemap_footer

if __name__ == "__main__":
    # Определяем директорию, где находится сам скрипт
    script_directory = os.path.dirname(os.path.abspath(__file__))
    website_base_url = 'https://kkrugley.github.io'  # Укажите базовый URL вашего сайта

    generate_sitemap(script_directory, website_base_url)

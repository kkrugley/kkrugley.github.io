import os
import argparse
from datetime import datetime
from xml.etree import ElementTree as ET
from xml.dom import minidom

def generate_sitemap(root_dir, base_url, output_file="sitemap.xml"):
    urlset = ET.Element('urlset', xmlns='http://www.sitemaps.org/schemas/sitemap/0.9')
    
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if not is_valid_file(filename):
                continue
                
            file_path = os.path.join(dirpath, filename)
            url = create_url_entry(file_path, root_dir, base_url)
            if url:
                urlset.append(url)

    xml_str = prettify_xml(urlset)
    save_xml(xml_str, output_file)

def is_valid_file(filename):
    """Определяем, какие файлы включать в sitemap"""
    valid_extensions = {'.html', '.htm', '.php', '.asp', '.aspx'}
    return os.path.splitext(filename)[1].lower() in valid_extensions

def create_url_entry(file_path, root_dir, base_url):
    """Создаем XML-запись для URL"""
    rel_path = os.path.relpath(file_path, root_dir)
    url_path = rel_path.replace('\\', '/').replace('index.html', '').rstrip('/')
    
    url = ET.Element('url')
    ET.SubElement(url, 'loc').text = f"{base_url}/{url_path}"
    
    lastmod = datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
    ET.SubElement(url, 'lastmod').text = lastmod
    
    return url

def prettify_xml(elem):
    """Форматирование XML с отступами"""
    rough_string = ET.tostring(elem, 'utf-8')
    parsed = minidom.parseString(rough_string)
    return parsed.toprettyxml(indent="  ")

def save_xml(xml_str, output_file):
    """Сохранение XML в файл"""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(xml_str)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate sitemap from directory structure')
    parser.add_argument('root_dir', help='Path to root directory of your website')
    parser.add_argument('base_url', help='Base URL of your website (e.g. https://example.com)')
    parser.add_argument('-o', '--output', default='sitemap.xml', help='Output file name')
    
    args = parser.parse_args()
    
    generate_sitemap(
        root_dir=args.root_dir,
        base_url=args.base_url.rstrip('/'),
        output_file=args.output
    )
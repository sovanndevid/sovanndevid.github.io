#!/usr/bin/env python3
"""Link the tested Study Buddy static site into the existing portfolio."""
from pathlib import Path

home = Path('index.html')
content = home.read_text()
marker = '<a href="projects/study-buddy.html" class="project-link" data-track="project_open" data-project="study-buddy" aria-label="Read Study Buddy project case study">Read case study <span aria-hidden="true">↗</span></a>'
live = '<a href="study-buddy/" class="project-link" data-track="project_demo" data-project="study-buddy" aria-label="Open the live Study Buddy app">Try Study Buddy <span aria-hidden="true">↗</span></a>'
if live not in content:
    assert marker in content, 'Study Buddy card link not found'
    content = content.replace(marker, marker + live, 1)
    home.write_text(content)

case = Path('projects/study-buddy.html')
content = case.read_text()
marker = '<a class="button button-dark" href="https://github.com/sovanndevid/Study_Buddy/tree/main/sprint6" target="_blank" rel="noopener noreferrer" data-track="social_click" data-destination="github">View on GitHub ↗</a>'
live = '<a class="button button-dark" href="../study-buddy/" data-track="project_demo" data-project="study-buddy">Launch live app ↗</a>'
if live not in content:
    assert marker in content, 'Study Buddy case-study CTA not found'
    content = content.replace(marker, marker + live, 1)
    case.write_text(content)

sitemap = Path('sitemap.xml')
content = sitemap.read_text()
new = '  <url><loc>https://sovanndevid.xyz/study-buddy/</loc></url>'
if new not in content:
    assert '</urlset>' in content
    content = content.replace('</urlset>', new + '\n</urlset>')
    sitemap.write_text(content)
print('Study Buddy portfolio entry points updated')

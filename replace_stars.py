import re

with open('about.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Sprite definitions to insert
sprites = """                <svg width="0" height="0" class="hidden-svgs" style="display: none;">
                    <defs>
                        <symbol id="icon-star-full" viewBox="0 0 24 24">
                            <path stroke="var(--star-stroke)" stroke-width="1.5" fill="var(--star-fill)" stroke-linejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </symbol>
                        <symbol id="icon-star-half" viewBox="0 0 24 24">
                            <clipPath id="half-clip"><rect x="0" y="0" width="12" height="24" /></clipPath>
                            <path stroke="var(--star-stroke)" stroke-width="2" fill="none" opacity="0.3" stroke-linejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            <path stroke="var(--star-stroke)" stroke-width="1.5" fill="var(--star-fill)" clip-path="url(#half-clip)" stroke-linejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </symbol>
                        <symbol id="icon-star-empty" viewBox="0 0 24 24">
                            <path stroke="var(--star-stroke)" stroke-width="2" fill="none" opacity="0.3" stroke-linejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </symbol>
                    </defs>
                </svg>
                <div class="softwares-grid">"""

html = html.replace('<div class="softwares-grid">', sprites)

# Regex for Full star
full_star_re = re.compile(r'<svg class="star"\s+width="16"\s+height="16"\s+viewBox="0 0 24 24"\s+fill="currentColor">\s*<path[^>]+/>\s*</svg>', re.MULTILINE)
html = full_star_re.sub('<svg class="star"><use href="#icon-star-full"></use></svg>', html)

# Regex for Empty star
empty_star_re = re.compile(r'<svg class="star empty"\s+width="16"\s+height="16"\s+viewBox="0 0 24 24"\s+fill="none"\s+stroke="currentColor"\s+stroke-width="2">\s*<path[^>]+/>\s*</svg>', re.MULTILINE)
html = empty_star_re.sub('<svg class="star empty"><use href="#icon-star-empty"></use></svg>', html)

# Regex for Half star (match the entire block)
half_star_re = re.compile(r'<svg class="star half".*?</svg>', re.DOTALL)
html = half_star_re.sub('<svg class="star half"><use href="#icon-star-half"></use></svg>', html)


with open('about.html', 'w', encoding='utf-8') as f:
    f.write(html)

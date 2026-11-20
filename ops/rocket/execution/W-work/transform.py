import re
WOODRE=re.compile(r'\b(sturdy\s+)?(solid)([\s-]+)(wood|wooden|timber|hardwood)\b',re.I)
HARD=re.compile(r'\b(hardwood)(\s+frame)',re.I)
def wood(s):
    if not s: return s
    def r(m):
        sturdy=m.group(1) or ''
        w='Wooden' if m.group(2)[0]=='S' else 'wooden'
        if m.group(2).isupper(): w='WOODEN'
        return sturdy+w
    s=WOODRE.sub(r,s)
    s=HARD.sub(lambda m:('Wooden' if m.group(1)[0]=='H' else 'wooden')+m.group(2),s)
    # "Wooden, upholstered headboard" table cell fix
    s=s.replace('>Wooden, upholstered headboard<','>Wooden frame, upholstered headboard<')
    return s
STORE=re.compile(r'ottoman|gas[\s-]*lift|drawer|storage|divan',re.I)
def is_plain_frame(p):
    return p['productType'] in ('Bed Frame','Kids Bed') and not STORE.search(p['title']+' '+p['handle'])
def add_slats(html):
    if re.search(r'slat',html,re.I): return html, None
    # try first <ul> after a "Key features"/"Features" heading
    m=re.search(r'(<h[2-4][^>]*>[^<]*(?:features|specification|at a glance|highlights)[^<]*</h[2-4]>\s*(?:<p>.*?</p>\s*)?<ul[^>]*>)(.*?)(</ul>)',html,re.I|re.S)
    if m:
        items=re.findall(r'<li[^>]*>(.*?)</li>',m.group(2),re.S)
        dot='.' if items and sum(i.strip().endswith('.') for i in items)*2>len(items) else ''
        li='<li>Comes with a wooden slatted base'+dot+'</li>'
        new=html[:m.end(2)]+li+html[m.end(2):]
        return new,'features-list'
    ms=list(re.finditer(r'</p>',html))
    m=ms[0] if ms else None
    if m and html.startswith('<p><strong>5-Year') and len(ms)>1: m=ms[1]
    if m:
        new=html[:m.end()]+'<p>Comes with a wooden slatted base.</p>'+html[m.end():]
        return new,'after-first-p'
    return html,'NO-PLACE'

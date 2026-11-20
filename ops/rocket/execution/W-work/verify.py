import json,sys
exp={}
for l in open('w-products.jsonl'):
    p=json.loads(l)['product']; exp[p['id']]=p
d=json.load(open(sys.argv[1]))['data']['a']['nodes']
for n in d:
    e=exp.get(n['id'])
    if not e: print('not in plan',n['handle']); continue
    import re; N=lambda s:re.sub(r'\s+','',s); ok=N(n['descriptionHtml'])==N(e['descriptionHtml'])
    if 'seo' in e: ok = ok and n['seo']['description']==e['seo']['description']
    print('OK ' if ok else 'MISMATCH',n['handle'],n['updatedAt'])

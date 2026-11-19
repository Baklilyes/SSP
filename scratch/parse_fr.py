with open(r'C:\Projects\Protocol\data\fr-asset.js', 'r', encoding='utf-8') as f:
    text = f.read()

import re
# Look for ",c=" or ",d=" or "const c" or "let c" or "var c"
for m in re.finditer(r'[,;]\s*([cd])\s*=', text):
    print(m.group(0), 'at', m.start())

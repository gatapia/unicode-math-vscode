from bs4 import BeautifulSoup
import re

source_file = './mathsymbols.py'
target_file = './symbols.json'

with open(source_file, 'r') as f:
    text = f.read()

def get_between_paren(txt):
    txt = txt[txt.index('{') + 1:]
    endidx = txt.index('}')
    return endidx, txt[:endidx]

endidx, main_set = get_between_paren(text)
_, aliases = get_between_paren(text[endidx:])

main_lines = [l for l in main_set.split('\n') if l.strip().startswith('"')]
alias_lines = [l for l in aliases.split('\n') if l.strip().startswith('"')]
output = '{'
added = {}
for l in main_lines:
    name, ucode = re.findall('"[^"]+"', l)    
    if (len(ucode.split('\\')) > 2): continue
    name, ucode = name[1:-1], chr(int('0x' + ucode[3:-1], 16))
    key  = name.lower()    
    if ucode == '\\' or key in added: 
        continue
    added[key] = ucode
    output += f'\n\t"\\\\{name}": {{ "prefix": "\\\\{name}", "body": "{ucode}", "description": "{ucode}"}},' 

for l in alias_lines:
    try: alias, key = l.strip().split(':')
    except: continue
    alias, key = alias[1:-1], key[2:key.index('"', 2)]
    if key in added and alias.lower() not in added:
        output += f'\n\t"\\\\{alias}": {{ "prefix": "\\\\{alias}", "body": "{added[key]}", "description": "{added[key]}"}},'    
output = output[:-1] # remove last comma
output += '\n}'
with open(target_file, "wb") as f: 
    f.write(output.encode('utf-8'))

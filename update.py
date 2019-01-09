from bs4 import BeautifulSoup
import re, sys, json

class sublime(object):
    @staticmethod
    def version(): return 9999

sys.modules["sublime"] = sublime
import mathsymbols

target_file = './symbols.json'

symbols = mathsymbols.make_maths()
for syn, key in mathsymbols.make_synonyms().items(): symbols[syn] = symbols[key]
symbols = list(symbols.items())

def get_entry(name, ucode):
    if ucode == '\\': return None
    return f'"\\\\{name}": {{ "prefix": "\\\\{name}", "body": "{ucode}", "description": "{ucode}"}}'

json_entries = filter(lambda e: e, map(lambda s: get_entry(s[0], s[1]), symbols))
output = ',\n\t'.join(json_entries)
output = f'{{\n\t{output}\n}}'

with open(target_file, "wb") as f: 
    f.write(output.encode('utf-8'))

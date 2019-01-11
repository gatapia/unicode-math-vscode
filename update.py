from bs4 import BeautifulSoup
import re, sys, json, requests

def update_symbols_json_snippets_file():
    class sublime(object):
        @staticmethod
        def version(): return 9999

    sys.modules["sublime"] = sublime
    import mathsymbols

    symbols = mathsymbols.make_maths()
    for syn, key in mathsymbols.make_synonyms().items(): symbols[syn] = symbols[key]
    symbols = list(symbols.items())

    def get_entry(name, ucode):
        if ucode == '\\': return None
        return f'"\\\\{name}": {{ "prefix": "\\\\{name}", "body": "{ucode}", "description": "{ucode}"}}'

    json_entries = filter(lambda e: e, map(lambda s: get_entry(s[0], s[1]), symbols))
    output = ',\n\t'.join(json_entries)
    output = f'{{\n\t{output}\n}}'

    with open('./symbols.json', "wb") as f: 
        f.write(output.encode('utf-8'))

def update_package_json_languages_list():
    lang_uri = 'https://code.visualstudio.com/docs/languages/identifiers'
    page = requests.get(lang_uri).content
    s = BeautifulSoup(page, 'html.parser')
    codes = s.find('table', 'table-striped').find_all('code')
    codes = list(map(lambda e: e.text, codes))
    languages = list(map(lambda c: f'{{"language": "{c}", "path": "./symbols.json" }}', codes))
    if len(languages) < 10: raise Exception(f'an error occurred parsing languages from "{lang_uri}"')

    with open('./package.json', 'r') as f:
        package_json = f.read()
    start_idx = package_json.index('"snippets":')
    before = package_json[0:start_idx]
    after = package_json[package_json.index('],', start_idx) + 2: ]
    all_langs = ','.join(languages)
    new_content = f'{before}"snippets": [{all_langs}]{after}'

    with open('./package.json', 'w') as f:
        f.write(new_content)

update_symbols_json_snippets_file()
update_package_json_languages_list()
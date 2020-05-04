import { TextDocument, Position, CancellationToken, CompletionContext,
    Range, CompletionItem, ExtensionContext, TextEditor,
    TextEditorEdit, Uri, commands, languages, window, workspace } from "vscode";
import * as Symbols from './symbols';

let SPACE_KEY: string = 'space';
let leader = workspace.getConfiguration('unicode-math-vscode').get('leader', '\\')

console.log(leader, Symbols.default[";exclam"]);

export function activate(context: ExtensionContext) {
	const ctl = new UnicodeMaths(Symbols.default);

    context.subscriptions.push(languages.registerCompletionItemProvider({ scheme: 'file', language: '*' }, ctl));

    context.subscriptions.push(commands.registerCommand('unicode-math-vscode.commit_tab', () => ctl.commit('tab')));
    context.subscriptions.push(commands.registerCommand('unicode-math-vscode.commit_space', () => ctl.commit(SPACE_KEY)));
    context.subscriptions.push(commands.registerCommand('unicode-math-vscode.symbols_html', () => {
        commands.executeCommand('vscode.open', Uri.parse('https://github.com/mvoidex/UnicodeMath/blob/master/table.md'));
    }));
}

export function deactivate() {}

class UnicodeMaths {
	private DEBUG: boolean = false;
    private keys: string[];
    constructor(private codes: {[key:string]: string}) { this.keys = Object.keys(codes); }

    public async provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext) {
        const [target, word] = this.evalPosition(document, position);
        if (!target || !word) { return; }
        let matches = this.keys.filter((k: string) => k.startsWith(word));
        this.debug(`completion items - word: ${word} has ${matches.length} matches`);
        return matches.map((key: string) => {
            const item = new CompletionItem(key);
			item.detail = this.codes[key];
            item.insertText = this.codes[key];
            item.range = target;
            return item;
        });
    }

    public commit(key: string) {
        if (!key || !window.activeTextEditor || !window.activeTextEditor.selection) { return; }
        this.debug('commit - key: ' + key);
        // only single selection supported, I dont see how multiple selection support is worth the testing
        this.commitAtPosition(window.activeTextEditor.selection.start, key);
    }
    private commitAtPosition(position: Position, key: string) {
        const editor: TextEditor = <TextEditor> window.activeTextEditor;
        const dokey = () => {
            this.debug('dokey: ' + key);
            if (key === SPACE_KEY) {
                commands.executeCommand('type', { source: 'keyboard', text: ' ' });
            } else {
                commands.executeCommand(key);
            }
        };
        const [target, word] = this.evalPosition(editor.document, position);
        if (!target || !word) { return dokey(); }
        const changed = this.doWord(word);
        this.debug('word:', word, 'changing to:', changed);
        if (changed) {
            editor.edit((editor: TextEditorEdit) => {
                this.debug(`editor.replace [${target}] [${changed}]`, target);
                editor.delete(target);
                editor.insert(target.start, changed);
            });
        }
		// always propegate the space key, or propegate tab
		//		only if not used to insert a character
        if (!changed || key === SPACE_KEY) { return dokey(); }
    }

    private evalPosition(document: TextDocument, position: Position): any[] {
        if (position.character === 0) { return [null, null]; }
        try {
            const [range, word] = this.getWordRangeAtPosition(document, position);
            this.debug('evalPosition - word:', word);
            return !word || !word.startsWith(leader) ? [null, null] : [range, word];
        } catch (e) {
            return [null, null];
        }
    }

    // this implementation has a loser meaning of word (anything starting with leader)
    private getWordRangeAtPosition(document: TextDocument, position: Position): any[] {
        const linestart = new Position(position.line, 0);
        const lnrange = new Range(linestart, position);
        const line = document.getText(lnrange);
        const slash = line.lastIndexOf(leader);
        const word = line.substr(slash).trim();
        const start = new Position(position.line, slash);
        const end = start.translate(undefined, word.length);
        return [new Range(start, end), word];
    }

    private doWord(word: string): string | null {
        const startch = word.charAt(1);
        this.debug('doWord: ', word);
        if (startch === '_') { return this.mapToSubSup(word, subs); }
        else if (startch === '^') { return this.mapToSubSup(word, sups); }
        else if (word.startsWith(`${leader}i:`)) { return this.mapToBoldIt(word, false); }
        else if (word.startsWith(`${leader}b:`)) { return this.mapToBoldIt(word, true); }
        return this.codes[word] || null;
    }

    private mapToSubSup(word: string, mapper: {[key: string]: string}): string | null {
        const target = word.substr(2);
        const newstr = target.split('').map((c: string) => mapper[c] || c).join('');
        return newstr === target ? null : newstr;
    }

    private mapToBoldIt(word: string, bold: boolean): string | null {
        const target = word.substr(3);
        const codeprfx = bold ? `${leader}mbf` : `${leader}mit`;
        const newstr = target.split('').map((c: string) => this.codes[codeprfx + c] || c).join('');
        this.debug('mapToBoldIt word: ', word, 'bold:', bold, 'newstr:', newstr);
        return newstr === target ? null : newstr;
    }

    private debug(msg: any, ...optionals: any[]) {
        if (!this.DEBUG) { return; }
        console.log(msg, ...optionals);
    }
}

// see: https://en.wikipedia.org/wiki/Unicode_subscripts_and_superscripts
const sups: {[key: string]: string} = {    "L": "ᴸ", "I": "ᴵ", "y": "ʸ", "9": "⁹", "0": "⁰", "δ": "ᵟ", "w": "ʷ", "4": "⁴", "l": "ˡ",
    "Z": "ᶻ", "P": "ᴾ", "b": "ᵇ", "7": "⁷", ")": "⁾", "h": "ʰ", "6": "⁶", "W": "ᵂ", "=": "⁼", "χ": "ᵡ", "m": "ᵐ", "-": "⁻",
    "r": "ʳ", "p": "ᵖ", "c": "ᶜ", "v": "ᵛ", "d": "ᵈ", "ϕ": "ᵠ", "θ": "ᶿ", "1": "¹", "T": "ᵀ", "o": "ᴼ", "K": "ᴷ", "e": "ᵉ",
    "G": "ᴳ", "t": "ᵗ", "8": "⁸", "β": "ᵝ", "V": "ⱽ", "M": "ᴹ", "s": "ˢ", "i": "ⁱ", "k": "ᵏ", "α": "ᵅ", "A": "ᴬ", "5": "⁵",
    "2": "²", "u": "ᶸ", "H": "ᴴ", "g": "ᵍ", "(": "⁽", "j": "ʲ", "f": "ᶠ", "D": "ᴰ", "γ": "ᵞ", "U": "ᵁ", "E": "ᴱ", "a": "ᵃ",
    "N": "ᴺ", "n": "ⁿ", "B": "ᴮ", "x": "ˣ", "3": "³", "R": "ᴿ", "+": "⁺", "J": "ᴶ"
};

const subs: {[key: string]: string} = { "1": "₁", ")": "₎", "m": "ₘ", "4": "₄", "j": "ⱼ", "7": "₇", "β": "ᵦ", "8": "₈",
    "2": "₂", "3": "₃", "s": "ₛ", "u": "ᵤ", "χ": "ᵪ", "5": "₅", "t": "ₜ", "h": "ₕ", "-": "₋", "ρ": "ᵨ", "+": "₊",
    "o": "ₒ", "v": "ᵥ", "r": "ᵣ", "6": "₆", "(": "₍", "k": "ₖ", "x": "ₓ", "9": "₉", "=": "₌", "e": "ₑ", "l": "ₗ",
    "i": "ᵢ", "ϕ": "ᵩ", "a": "ₐ", "p": "ₚ", "n": "ₙ", "0": "₀"
};

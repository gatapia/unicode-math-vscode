import { TextDocument, Position, CancellationToken, CompletionContext, 
	Range, CompletionItem, ExtensionContext, TextEditor, Selection, 
	TextEditorEdit, commands, languages, window } from "vscode";
import * as Symbols from './symbols';

export function activate(context: ExtensionContext) {	
	const ctl = new UnicodeMaths(Symbols.default);
	context.subscriptions.push(commands.registerCommand('unicode-math-vscode.commit', () => ctl.commit()));
	context.subscriptions.push(languages.registerCompletionItemProvider('*', ctl, '.', ','));
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
		this.debug(`word: ${word} has ${matches.length} matches`);
		return matches.map((key: string) => {
			const item = new CompletionItem(key);
			item.detail = this.codes[key];
			item.insertText = this.codes[key];			
			item.range = target;			
			return item;
		});
	}	

	public commit() {
		if (!window.activeTextEditor) { return; }
		this.debug('commit');		
		window.activeTextEditor.selections.
			forEach((selection: Selection) => this.commitAtPosition(selection.start));
	}	

	private commitAtPosition(position: Position) {
		const editor: TextEditor = <TextEditor> window.activeTextEditor;		
		const [target, word] = this.evalPosition(editor.document, position);
		if (!target || !word) { return this.sendTab(); }
		const changed = this.doWord(word);	
		this.debug('word:', word, 'changing to:', changed);				
		if (!changed) { return this.sendTab(); }		
		editor.edit(((editor: TextEditorEdit) => editor.replace(target, changed)));
	}

	private sendTab() {
		commands.executeCommand('type', { source: 'keyboard', text: '\t' });			
	}

	private evalPosition(document: TextDocument, position: Position): any[] {
		const range = document.getWordRangeAtPosition(position);		
		this.debug('evalPosition has range:', !!range);
		if (!range || range.start.character === 0) { return [null, null]; }
		let target = new Range(range.start.translate(0, -1), range.end); // include initial '\'		
		let word = document.getText(target);		
		if (word.startsWith('^')) {
			target = new Range(range.start.translate(0, -2), range.end); // include initial '\^'		
			word = document.getText(target);		
		}		
		this.debug('evalPosition word:', word);
		return !word.startsWith('\\') ? [null, null] : [target, word];
	}

	private doWord(word: string): string | null {
		const startch = word.charAt(1);
		if (this.isSubSupWord(word)) { return this.toSuperSub(word, startch === '_'); }		
		return this.codes[word] || null; 
	}

	private isSubSupWord(word: string): boolean {
		const startch = word.charAt(1);
		return startch === '_' || startch === '^';
	}

	private toSuperSub(word: string, tosub: boolean): string | null {
		const mapper = tosub ? subs : sups;
		const target = word.substr(2);
		const newstr = target.split('').map((c: string) => mapper[c] || c).join('');
		return newstr === target ? null : newstr;
	}

	private debug(msg: any, ...optionals: any[]) {
		if (!this.DEBUG) { return; }
		console.log(msg, ...optionals);
	}
}



// see: https://en.wikipedia.org/wiki/Unicode_subscripts_and_superscripts
const sups: {[key: string]: string} = {	"L": "ᴸ", "I": "ᴵ", "y": "ʸ", "9": "⁹", "0": "⁰", "δ": "ᵟ", "w": "ʷ", "4": "⁴", "l": "ˡ",
	"Z": "ᶻ", "P": "ᴾ", "b": "ᵇ", "7": "⁷", ")": "⁾", "h": "ʰ", "6": "⁶", "W": "ᵂ", "=": "⁼", "χ": "ᵡ", "m": "ᵐ", "-": "⁻",
	"r": "ʳ", "p": "ᵖ", "c": "ᶜ", "v": "ᵛ", "d": "ᵈ", "ϕ": "ᵠ", "θ": "ᶿ", "1": "¹", "T": "ᵀ", "o": "ᴼ", "K": "ᴷ", "e": "ᵉ",
	"G": "ᴳ", "t": "ᵗ", "8": "⁸", "β": "ᵝ", "V": "ⱽ", "M": "ᴹ", "s": "ˢ", "i": "ⁱ", "k": "ᵏ", "α": "ᵅ", "A": "ᴬ", "5": "⁵",
	"2": "²", "u": "ᶸ", "H": "ᴴ", "g": "ᵍ", "(": "⁽", "j": "ʲ", "f": "ᶠ", "D": "ᴰ", "γ": "ᵞ", "U": "ᵁ", "E": "ᴱ", "a": "ᵃ",
	"N": "ᴺ", "n": "ⁿ", "B": "ᴮ", "x": "ˣ", "3": "³", "R": "ᴿ", "+": "⁺", "J": "ᴶ"    
};

const subs: {[key: string]: string} = { "1": "₁", ")": "₎", "m": "ₘ", "4": "₄", "j": "ⱼ", "7": "₇", "β": "ᵦ", "8": "₈",
	"2": "₂", "3": "₃", "s": "ₛ", "u": "ᵤ", "χ": "ᵪ", "5": "₅", "t": "ₜ", "h": "ₕ", "-": "₋", "ρ": "ᵨ", "+": "₊",
	"o": "ₒ", "v": "ᵥ", "r": "ᵣ", "6": "₆", "(": "₍", "k": "ₖ", "x": "ₓ", "9": "₉", "=": "₌", "e": "ₑ", "l": "ₗ",
	"i": "ᵢ", "ϕ": "ᵩ", "a": "ₐ", "p": "ₚ", "n": "ₙ", "θ": "₀"
};
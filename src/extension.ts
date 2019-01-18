import { TextDocument, Position, CancellationToken, CompletionContext, 
	Range, CompletionItem, ExtensionContext, TextEditor, Selection, 
	TextEditorEdit, commands, languages, window } from "vscode";
import symbols from './symbols';

export function activate(context: ExtensionContext) {
	context.subscriptions.push(commands.registerCommand('unicode-math-vscode.doSuperSub', doSuperSub));
	context.subscriptions.push(languages.registerCompletionItemProvider('*', new CompletionItems(), '.', ',', '\\'));
}

export function deactivate() {}

class CompletionItems {
	private keys: string[];

	constructor() { this.keys = Object.keys(symbols); }

	public async provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext) {
		const range = document.getWordRangeAtPosition(position);
		console.log('provideCompletionItems range:', range);
		
		if (!range || range.start.character === 0) { return; }		
		const target = new Range(range.start.translate(0, -1), range.end);
		const word = document.getText(target);
		console.log('word:', word);
		if (word.length < 2 || !word.startsWith('\\')) { 
			return; 
		}
		let matching = this.keys.filter((k: string) => k.startsWith(word));		
		if (!matching.length) { return; }
		// todo: remove
		if (matching.length > 5) { matching = matching.slice(0, 5); } 				
		return matching.map((key: string) => {
			const item = new CompletionItem(key);
			item.detail = symbols[key];
			item.insertText = symbols[key];			
			item.range = target;			
			return item;
		});
	} 
}

function doSuperSub() {
	const editor = window.activeTextEditor;
	if (!editor) { return; }
	editor.selections.forEach(s => processSelection(editor, s));	
}

function processSelection(editor: TextEditor, sel: Selection) {
	const document = editor.document;
	const editrange = new Range(new Position(sel.start.line, 0), sel.start);
	const line = document.getText(editrange);	
	const tokens = line.split('\\');
	const last = tokens === null ? '' : tokens[tokens.length - 1];	
	const changed = toSuperSub(last);	
	
	
	editor.edit(((editor: TextEditorEdit) => {		
		if (changed) {
			const newline = line.substring(0, line.lastIndexOf(last) - 1) + changed;
			editor.replace(editrange, newline);
		} else {
			commands.executeCommand('type', { source: 'keyboard', text: '\t' });			
		}
	}));
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

function toSuperSub(txt: string): string | null {
	if (!txt) { return null; }
	const startch = txt.charAt(0);
	if (startch !== '_' && startch !== '^') { return null; }
	const mapper = startch === '_' ? subs : sups;
	const target = txt.substr(1);
	const newstr = target.split('').map((c: string) => mapper[c] || c).join('');
	return newstr === target ? null : newstr;
}
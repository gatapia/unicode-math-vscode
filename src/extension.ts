import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('unicode-math-vscode.run', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) { return; }
		editor.selections.forEach(s => processSelection(editor, s));		
	});
	context.subscriptions.push(disposable);
}
export function deactivate() {}


function processSelection(editor: vscode.TextEditor, sel: vscode.Selection) {
	const document = editor.document;
	if (!sel || !document) { return; }
	const editrange = new vscode.Range(new vscode.Position(sel.start.line, 0), sel.start);
	const line = document.getText(editrange);	
	const tokens = line.split('\\');
	if (tokens === null) { return; }
	const last = tokens[tokens.length - 1];	
	if (last.startsWith('_') || last.startsWith('^')) {		
		const changed = toSuperSub(last);
		if (changed === null) { return; }
		const newline = line.substring(0, line.lastIndexOf(last) - 1) + changed;
		editor.edit(((editor: vscode.TextEditorEdit) => {
			editor.replace(editrange, newline);
		}));
	}
}

// see: https://en.wikipedia.org/wiki/Unicode_subscripts_and_superscripts
const sups: {[key: string]: string} = {
	"L": "ᴸ",
	"I": "ᴵ",
	"y": "ʸ",
	"9": "⁹",
	"0": "⁰",
	"δ": "ᵟ",
	"w": "ʷ",
	"4": "⁴",
	"l": "ˡ",
	"Z": "ᶻ",
	"P": "ᴾ",
	"b": "ᵇ",
	"7": "⁷",
	")": "⁾",
	"h": "ʰ",
	"6": "⁶",
	"W": "ᵂ",
	"=": "⁼",
	"χ": "ᵡ",
	"m": "ᵐ",
	"-": "⁻",
	"r": "ʳ",
	"p": "ᵖ",
	"c": "ᶜ",
	"v": "ᵛ",
	"d": "ᵈ",
	"ϕ": "ᵠ",
	"θ": "ᶿ",
	"1": "¹",
	"T": "ᵀ",
	"o": "ᴼ",
	"K": "ᴷ",
	"e": "ᵉ",
	"G": "ᴳ",
	"t": "ᵗ",
	"8": "⁸",
	"β": "ᵝ",
	"V": "ⱽ",
	"M": "ᴹ",
	"s": "ˢ",
	"i": "ⁱ",
	"k": "ᵏ",
	"α": "ᵅ",
	"A": "ᴬ",
	"5": "⁵",
	"2": "²",
	"u": "ᶸ",
	"H": "ᴴ",
	"g": "ᵍ",
	"(": "⁽",
	"j": "ʲ",
	"f": "ᶠ",
	"D": "ᴰ",
	"γ": "ᵞ",
	"U": "ᵁ",
	"E": "ᴱ",
	"a": "ᵃ",
	"N": "ᴺ",
	"n": "ⁿ",
	"B": "ᴮ",
	"x": "ˣ",
	"3": "³",
	"R": "ᴿ",
	"+": "⁺",
	"J": "ᴶ"    

};
const subs: {[key: string]: string} = {
	"1": "₁",
	")": "₎",
	"m": "ₘ",
	"4": "₄",
	"j": "ⱼ",
	"7": "₇",
	"β": "ᵦ",
	"8": "₈",
	"2": "₂",
	"3": "₃",
	"s": "ₛ",
	"u": "ᵤ",
	"χ": "ᵪ",
	"5": "₅",
	"t": "ₜ",
	"h": "ₕ",
	"-": "₋",
	"ρ": "ᵨ",
	"+": "₊",
	"o": "ₒ",
	"v": "ᵥ",
	"r": "ᵣ",
	"6": "₆",
	"(": "₍",
	"k": "ₖ",
	"x": "ₓ",
	"9": "₉",
	"=": "₌",
	"e": "ₑ",
	"l": "ₗ",
	"i": "ᵢ",
	"ϕ": "ᵩ",
	"a": "ₐ",
	"p": "ₚ",
	"n": "ₙ",
	"θ": "₀"
};
function toSuperSub(txt: string): string | null {
	const mapper = txt.charAt(0) === '_' ? subs : sups;
	const target = txt.substr(1);
	const newstr = target.split('').map((c: string) => mapper[c] || c).join('');
	return newstr === target ? null : newstr;
}
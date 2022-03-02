# unicode-math-vscode README
[Download Url](https://marketplace.visualstudio.com/items?itemName=GuidoTapia2.unicode-math-vscode)

## This project is no longer mantained but I am happy to merge/publish pull requests.

Note: This project is a port from the great [UnicodeMath](https://github.com/mvoidex/UnicodeMath) 
    sublime text plugin by [Alexandr Ruchkin](https://github.com/mvoidex). See original documentation for more details.


# Supported Features

## Autocomplete
All commands described below can be executed with either the [tab] or [space] key.  Executing a command with [tab] will insert the special symbols and leave the cursor next to the inserted symbol.  [space] will add a space after the inserted symbol.

## Insert Symbols
Snippets to automatically convert symbol names to their corresponding 
unicode character.  For instance typing '&#92;all' + [tab] will 
display '∀'. For a full list of supported symbols 
see [list here](https://github.com/mvoidex/UnicodeMath/blob/master/table.md). This page has also
been added to VS Code, so just press CTL + SHIFT + P and type 'Symbols', 
select "Unicode Math Symbols Guide" to see the full list of supported symbols.

## Superscript and Subscript
To convert a portion of text to a superscript or subscript just type 
'&#92;\_123' or '&#92;^123' + [tab].  This will display ₁₂₃ or ¹²³.  For a full list of supported
subscript and superscript characters [see here](https://en.wikipedia.org/wiki/Unicode_subscripts_and_superscripts).

## Bold and Italics
To insert a bold character the '&#92;mbf\<character\>'  can be used. For instance '&#92;mbfX' + [space] will display '𝐗 '. Correspondingly, italics can be inserted with the '&#92;mitX', resulting in '𝑋'.

If a sequence of characters needs to be bolded or italicised then the following sequences will work:
'&#92;b:matrix' or '&#92;i:matrix' resulting in '𝐦𝐚𝐭𝐫𝐢𝐱' and '𝑚𝑎𝑡𝑟𝑖𝑥'.

## Special

You can also convert a list of chars with special prefix via \prefix:abc, which
will be equivalent to \prefixa \prefixb and \prefixc, for example:

\Bbb:ABCabc → 𝔸𝔹ℂ𝕒𝕓𝕔

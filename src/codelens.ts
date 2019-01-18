import { CodeLens,
    CodeLensProvider,
    TextDocument,
    SymbolInformation
} from 'vscode';
import { getSymbols,
    getReferences
} from './localize';

// 5 identifies functions
const SymbolFunction: number = 5;
// 14 is the indent to the first char of the function name (if global)
const SymbolGlobal: number = 14;

// Extending base CodeLens class with two properties:
// document
// symbol
// This allows me to push some computation into the resolveCodeLens functionality
// This means the list of CodeLenses is generated faster.
class LocalizeLens extends CodeLens
{
    public document: TextDocument;
    public symbol: SymbolInformation;

    constructor(doc: TextDocument, sym: SymbolInformation)
    {
        super(sym.location.range);
        this.document = doc;
        this.symbol = sym;
    }
}

// This implementation ignores the sent CancellationToken
export class LocalizeLensProvider implements CodeLensProvider {

    // Returns CodeLenses for symbols in the current document that are global functions
    async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
        let codeLenses: CodeLens[] = [];
        
        // retrieve all document symbols as defined by AL language
        await getSymbols(document)
        .then(symbols => {
            // only want to create lenses for global functions
            symbols.filter(symbol =>
                symbol.kind === SymbolFunction && symbol.location.range.start.character === SymbolGlobal)
                .forEach(symbol => {
                    let lens: LocalizeLens = new LocalizeLens(document, symbol);
                    codeLenses.push(lens);
                });
        })
        .catch(error => {
            console.error("getSymbols failed: " + error.message);
        });

        return codeLenses;
    }

    // checks if the codeLens has references that are external to the current document
    async resolveCodeLens(codeLens: CodeLens): Promise<CodeLens> {
        let lens: LocalizeLens = codeLens as LocalizeLens;

        // get all references for the symbol that the lens references
        await getReferences(lens.symbol.location)
        .then(references => {
            // filter to references that are outside of current document
            // if the new array is zero, then there are no external references
            if (references.filter(ref => lens.symbol.location.uri.toString() !== ref.uri.toString()).length === 0) {
                lens.command = {
                    title: "Localizeable",
                    command: 'localizer.localize',
                    arguments:
                    [
                        lens.document,
                        lens.range.start
                    ]
                };
            }
            else {
                lens.command = 
                {
                    title: 'Has external references',
                    command: ''
                };
            }
        })
        .catch(error => {
            console.error("getReferences failed for " + lens.symbol.name + " with error: " + error.message);
        });

        return lens;
    }
}

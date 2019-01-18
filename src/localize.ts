import { TextDocument,
    SymbolInformation,
    Location,
    Position,
    commands,
    workspace,
    WorkspaceEdit
} from 'vscode';

// the local prefix for functions
const LocalPrefix: string = 'local ';
// offset needed to calculate where the keyterm "procedure" is on the line.
const ProcedureOffset: number = 10;

// returns the symbols of the current document
// requires on the language implementation of symbols
export async function getSymbols(document: TextDocument): Promise<SymbolInformation[]> {
    return await commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri) || [];
}

// returns the references at a given location
// relies on the language implementation for references
export async function getReferences(location: Location): Promise<Location[]> {
    return await commands.executeCommand<Location[]>('vscode.executeReferenceProvider', location.uri,
        new Position(location.range.start.line, location.range.start.character)) || [];
}

// inserts the "local" prefix at the beginning of a line
export function insertLocal(document: TextDocument, position: Position)
{
    const wsEdit = new WorkspaceEdit();
    wsEdit.insert(document.uri, new Position(position.line, position.character - ProcedureOffset), LocalPrefix);
    workspace.applyEdit(wsEdit);
}

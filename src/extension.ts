import { languages,
	ExtensionContext,
	commands,
	DocumentSelector
} from 'vscode';
import { LocalizeLensProvider } from './codelens';
import { insertLocal } from './localize';

// only apply on al files
const alFiles: DocumentSelector = { scheme: "file", pattern: "**/*.al" };

export function activate(context: ExtensionContext)
{
	// add lens and function to environment.
	context.subscriptions.push(commands.registerCommand('localizer.localize', insertLocal),
		languages.registerCodeLensProvider(alFiles, new LocalizeLensProvider()));
}

export function deactivate() {}

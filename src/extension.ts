import * as vscode from 'vscode';
import * as math from "mathjs";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('mathjs-eval.evaluate',
      evaluator((selection, edit, result) => {
        edit.insert(selection.end, `=${result}`);
      })),
    vscode.commands.registerTextEditorCommand('mathjs-eval.evaluateReplace',
      evaluator((selection, edit, result) => {
        edit.replace(selection, result);
      }))
  );
}

export function deactivate() { }

function evaluator(handler: (selection: vscode.Selection, edit: vscode.TextEditorEdit, result: string) => void) {
  return (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, _args: any[]) => {
    textEditor.selections.forEach((selection, index) => {
      const selectedText = textEditor.document.getText(selection);

      if (selectedText === "") {
        return;
      }

      const scope = {
        sel: {
          index: index + 1,
          start: {
            line: selection.start.line,
            char: selection.start.character,
          },
          end: {
            line: selection.end.line,
            char: selection.end.character,
          },
        },
      };

      try {
        handler(selection, edit, math.format(math.evaluate(selectedText, scope)));
      } catch (e) {
        vscode.window.showErrorMessage(`Unable to evaluate '${selectedText}': ${e}`);
      }
    });
  };
}

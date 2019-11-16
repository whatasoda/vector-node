import ts from 'typescript';
import prettier from 'prettier';

const HEADER_TEXT = 'DO NOT EDIT MANUALLY. THIS IS GENERATED FILE.';

interface PrinterOptions {
  prettierrc?: prettier.Options;
}

export const printStatements = (
  filePath: string,
  statements: ts.Statement[],
  sys: ts.System,
  options: PrinterOptions = {},
) => {
  const { prettierrc = readDefaultPrettierrc(sys) } = options;
  const resultFile = ts.createSourceFile('', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const nodeArray = ts.createNodeArray([
    ts.addSyntheticLeadingComment(
      ts.createEmptyStatement(),
      ts.SyntaxKind.MultiLineCommentTrivia,
      ` ${HEADER_TEXT} `,
      true,
    ),
    ...statements,
  ]);
  let result: string;
  result = printer.printList(ts.ListFormat.SourceFileStatements, nodeArray, resultFile);
  result = prettier.format(result, { ...prettierrc, parser: 'typescript' });

  sys.writeFile(filePath, result);
};

const readDefaultPrettierrc = (sys: ts.System): prettier.Options => {
  const path = `${process.cwd()}/.prettierrc`;
  try {
    if (sys.fileExists(path)) return JSON.parse(sys.readFile(path, 'utf-8') || '{}');
    const jsonPath = `${path}.json`;
    if (sys.fileExists(jsonPath)) return JSON.parse(sys.readFile(jsonPath, 'utf-8') || '{}');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
  return {};
};

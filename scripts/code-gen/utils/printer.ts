import ts from 'typescript';
import prettier from 'prettier';

const HEADER_TEXT = 'DO NOT EDIT MANUALLY. THIS IS GENERATED FILE.';

interface PrinterOptions {
  header?: string;
  prettierrc?: prettier.Options;
}

export const printStatements = (
  filePath: string,
  file: ts.SourceFile,
  sys: ts.System,
  options: PrinterOptions = {},
) => {
  const { header, prettierrc = readDefaultPrettierrc(sys) } = options;
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const nodeArray = ts.createNodeArray([
    createCommentStatement(HEADER_TEXT),
    ...(header ? [createCommentStatement(header)] : []),
    ...file.statements,
  ]);
  let result: string;
  result = printer.printList(ts.ListFormat.SourceFileStatements, nodeArray, file);
  result = prettier.format(result, { ...prettierrc, parser: 'typescript' });

  sys.writeFile(filePath, result);
};

const createCommentStatement = (text: string) => {
  return ts.addSyntheticLeadingComment(
    ts.createEmptyStatement(),
    ts.SyntaxKind.MultiLineCommentTrivia,
    ` ${text} `,
    true,
  );
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

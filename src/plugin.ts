import * as BabelTypes from "@babel/types"
import { Visitor } from "@babel/traverse";
import { getTsconfigPath, getConstEnumsFromTsConfig } from "./typescriptUtils";
import ts, { SyntaxKind } from "typescript";

export interface Babel {
  types: typeof BabelTypes;
}

const visited = new Set<string>();
const ambientConstEnums = new Map<string, ts.EnumDeclaration>();

/**
 * A plugin that rewrites usages of declare const enums with their values.
 */
const declareConstEnumPlugin = ({ types }: Babel): { visitor: Visitor<{ opts: { debug: boolean } }> } => {

  return {
    visitor: {
      Program: (path, state) => {
        const currentFile = (state as any).file.opts.filename as string;

        // We only care for TypeScript files
        if (!/.ts(x)?$/.test(currentFile)) {
          return;
        }

        const tsconfigPath = getTsconfigPath(currentFile);
        if (!visited.has(tsconfigPath)) {
          console.debug(`declare-const-enum: Loading types from ${tsconfigPath}`);

          const allEnums = getConstEnumsFromTsConfig(tsconfigPath);
          for (const foundEnum of allEnums) {
            const key = foundEnum.name.escapedText.toString();
            if (!ambientConstEnums.has(key)) {
              ambientConstEnums.set(key, foundEnum);
            }
            else {
              const match = ambientConstEnums.get(key)!;
              if (match.members.length !== foundEnum.members.length) {
                throw new Error(`Found a second reference to ${key} which had different members to the first. This is not supported.`);
              }
            }

            visited.add(tsconfigPath);
          }
        }
      },
      File: (path) => {
        console.log(path.node.program.sourceFile);
      },
      MemberExpression: (path,state) => {
        const { object, property } = path.node;
        if (types.isIdentifier(object) && types.isIdentifier(property)) {
          const constEnum = ambientConstEnums.get(object.name);
          if (!constEnum) {
            // TODO is there a way to distinguish enum access from other member access at this point?
            // throw new Error(`Found ${object.name}.${property.name} but a const enum called ${object.name} wasn't found.`)
            return;
          }

          const member = constEnum.members.find(m => (m.name as any).escapedText === property.name);
          if (!member) {
            throw new Error(`Found reference to ${object.name}.${property.name} but ${object.name} doesn't have a member called ${property.name}.`);
          }

          if (!member.initializer) {
            throw new Error(`Found reference to ${object.name}.${property.name} but this doesn't have a value defined. This is not supported.`);
          }

          if (!ts.isLiteralExpression(member.initializer)
            || (member.initializer.kind !== SyntaxKind.NumericLiteral
              && member.initializer.kind !== SyntaxKind.StringLiteral)) {
            throw new Error(`Found reference to ${object.name}.${property.name} but this is not a numeric or string literal. This is not supported.`);
          }
          
          if (state.opts.debug) {
            console.debug(`Replaced ${object.name}.${property.name} with ${member.initializer.text}`);
          }

          switch (member.initializer.kind) {
            case SyntaxKind.StringLiteral:
              path.replaceWith(types.stringLiteral(member.initializer.text));
              return;
            case SyntaxKind.NumericLiteral:
              path.replaceWith(types.numericLiteral(parseInt(member.initializer.text)));
              return;
            default:
              throw Error(`Unhandled enum member type ${member.initializer.kind}`);
          }
        }
      },
    }
  }
};

export default declareConstEnumPlugin;

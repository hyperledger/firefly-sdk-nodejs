import { promises as fs } from 'fs';
import openapiTS, { astToString } from 'openapi-typescript';
import * as ts from 'typescript';
import { pathToFileURL } from 'url';

const STRING = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
const ANY = ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);

async function run() {
  const localPath = pathToFileURL('../firefly/doc-site/docs/swagger/swagger.yaml');
  console.log(`Generating types from ${localPath}`);
  const output = await openapiTS(localPath.toString(), {
    transform: (schemaObject, options) => {
      if (schemaObject.type === 'object' && schemaObject.additionalProperties) {
        // For objects with arbitrary properties, use "any" instead of "unknown"
        return ANY;
      }

      if (schemaObject.type === undefined) {
        // For objects with undefined type, use "any" instead of "unknown"
        return ANY;
      }

      if (options.path && options.path.indexOf('/responses/') >= 0 && schemaObject.nullable) {
        // Override all response fields to be non-nullable (but allow undefined)
        schemaObject.nullable = false;
      }
    },
  });
  await fs.writeFile('lib/schema.ts', astToString(output));
}

run().catch((err) => {
  console.error('Error running script', err);
});

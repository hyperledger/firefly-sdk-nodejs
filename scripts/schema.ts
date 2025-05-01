import { promises as fs } from 'fs';
import openapiTS, { astToString } from 'openapi-typescript';
import { pathToFileURL } from 'url';

async function run() {
  const localPath = pathToFileURL('../firefly/doc-site/docs/swagger/swagger.yaml');
  console.log(`Generating types from ${localPath}`);
  const output = await openapiTS(localPath.toString());
  await fs.writeFile('lib/schema.ts', astToString(output));
}

run().catch((err) => {
  console.error('Error running script', err);
});

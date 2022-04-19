import { pathToFileURL } from 'url';
import { promises as fs } from 'fs';

async function run() {
  const openapiTS = (await import('openapi-typescript')).default;
  const localPath = pathToFileURL('../firefly/docs/swagger/swagger.yaml');
  const output = await openapiTS(localPath, {
    formatter(node) {
      if (node.type === undefined) {
        return 'any';
      }
    },
  });
  await fs.writeFile('lib/schema.ts', output);
}

run().catch((err) => {
  console.error('Error running script: ' + err);
});

import FireFly from '../..';

async function main() {
  const firefly = new FireFly({ host: 'http://localhost:5000' });
  const datatypes = await firefly.getDatatypes();
  console.log(JSON.stringify(datatypes, null, 2));
}

if (require.main === module) {
  main().catch((err) => console.error(`Error: ${err}`));
}

import FireFly from '../..';

async function main() {
  const firefly = new FireFly({ host: 'http://localhost:5000' });
  await firefly.sendBroadcast({
    data: [
      {
        value: 'test-message',
      },
    ],
  });
}

if (require.main === module) {
  main().catch((err) => console.error(`Error: ${err}`));
}

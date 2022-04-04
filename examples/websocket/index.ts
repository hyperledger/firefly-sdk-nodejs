import FireFly from '../..';

const SUB_NAME = 'test-sub';

async function main() {
  const firefly = new FireFly({ host: 'http://localhost:5000' });
  const subscriptions = await firefly.getSubscriptions({ name: SUB_NAME });
  if (subscriptions.length > 0) {
    await firefly.deleteSubscription(subscriptions[0].id);
  }
  const subscription = await firefly.createOrUpdateSubscription({
    name: SUB_NAME,
    options: { firstEvent: '0' },
  });
  console.log(JSON.stringify(subscription, null, 2));

  const listener = firefly.listen(SUB_NAME, (socket, event) => {
    // do nothing
  });
  setTimeout(() => listener.close(), 2000);
}

if (require.main === module) {
  main().catch((err) => console.error(`Error: ${err}`));
}

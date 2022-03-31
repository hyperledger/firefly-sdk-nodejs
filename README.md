# firefly-sdk-nodejs

FireFly SDK for Node.js

## Installation

```
npm install @photic/firefly-sdk-nodejs
```

## Usage

```
import { FireFly } from '@photic/firefly-sdk-nodejs';

const firefly = new FireFly({ host: 'http://localhost:5000' });
await firefly.sendBroadcast({
  data: [{ value: 'test-message' }],
});
```

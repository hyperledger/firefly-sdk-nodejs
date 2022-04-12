# FireFly SDK

![version](https://img.shields.io/github/package-json/v/hyperledger/firefly-sdk-nodejs?label=firefly-sdk-nodejs)
[![FireFy Documentation](https://img.shields.io/static/v1?label=FireFly&message=documentation&color=informational)](https://hyperledger.github.io/firefly//)

![Hyperledger FireFly](./images/hyperledger_firefly_logo.png)

This is an SDK for Node.js that will alllow you to build your own applications using Hyperledger FireFly.

## Installation

```bash
npm install @hyperledger/firefly-sdk
```

## Usage

```typescript
import FireFly from '@hyperledger/firefly-sdk';

const firefly = new FireFly({ host: 'http://localhost:5000' });
await firefly.sendBroadcast({
  data: [{ value: 'test-message' }],
});
```

## Learn more about Hyperledger FireFly Architecture

- [YouTube Channel](https://www.youtube.com/playlist?list=PL0MZ85B_96CFVEdBNsHRoX_f15AJacZJD)
  - Check out the architecture series
- [Architecture reference documentation](https://hyperledger.github.io/firefly/architecture/node_component_architecture.html)
  - Still evolving, and open for feedback - let us know what you think [on Rocket Chat](https://chat.hyperledger.org/channel/firefly)

## Git repositories

There are multiple Git repos making up the Hyperledger FireFly project, and this
list is likely to grow as additional pluggable extensions come online in the community:

- Command Line Interface (CLI) - https://github.com/hyperledger/firefly-cli
- Core - https://github.com/hyperledger/firefly
- FireFly SDK (this repo) - https://github.com/kaleido-io/firefly-sdk-nodejs
- FireFly Sandbox - https://github.com/kaleido-io/firefly-sandbox
- HTTPS Data Exchange - https://github.com/hyperledger/firefly-dataexchange-https
- Hyperledger Fabric connector - https://github.com/hyperledger/firefly-fabconnect
- Ethereum (Hyperledger Besu / Quorum) connector - https://github.com/hyperledger/firefly-ethconnect
- Corda connector: https://github.com/hyperledger/firefly-cordaconnect - contributed from Kaleido generation 1 - porting to generation 2
- FireFly Explorer UI - https://github.com/hyperledger/firefly-ui
- Firefly Performance CLI (https://github.com/hyperledger/firefly-perf-cli)

## Contributing

Interested in contributing to the community?

Check out our [Contributor Guide](https://hyperledger.github.io/firefly/contributors/contributors.html), and welcome!

Please adhere to this project's [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Hyperledger Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the [LICENSE](LICENSE) file.

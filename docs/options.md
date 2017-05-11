---
title: Options
layout: default
---

# Options

```js
const Condor = require('condor-framework');
const options = {
  'host': 'myservice.example.com',
  'port': 50051,
  'rootCert': '/path/to/root/cert',
  'certChain': '/path/to/cert/chain',
  'privateKey': '/path/to/private/key',
};
const app = new Condor(options);
```

All the options are not required. Their default values are:

| Option     | Description                  | Default |
|------------|------------------------------|---------|
| host       | The hostname                 | 0.0.0.0 |
| port       | The port                     | 3000    |
| rootCert   | Path to the root cert file   |         |
| certChain  | Path to the cert chain file  |         |
| privateKey | Path to the private key file |         |

Next: [Related modules and middleware](related-modules-and-middleware.md)

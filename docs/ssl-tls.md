---
title: SSL / TLS
layout: default
---

# SSL/TLS Support

GRPC has some built-in mechanisms for server [authentication](http://www.grpc.io/docs/guides/auth.html).

To enable SSL you just have to pass the host and the paths to the certificate files.
 
```js
const options= {
  'host': 'myservice.example.com',      // required
  'rootCert': '/path/to/root/cert',     // optional
  'certChain': '/path/to/cert/chain',   // required
  'privateKey': '/path/to/private/key', // required
};
app = new Condor(options);
```

## No encryption / authentication

Just create the app with no options. **This is not recommended for production**.

```js
app = new Condor();
```

Next: [Options](options.md)

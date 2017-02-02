### Server Authentication Support

GRPC has some built-in mechanisms for server [authentication](http://www.grpc.io/docs/guides/auth.html).

On production you should use SSL/TLS, but during development, it might be fine to have an insecure environment.

#### No encryption / authentication

This is recommended only during development.

```js
app = new Condor();
```

#### Server authentication SSL/TLS

It is always recommended that your service implements SSL/TLS on a production environment. To enable it, you just have to pass the paths to the certificate files.

```js
const options= {
  'host': 'myservice.example.com',
  'rootCert': '/path/to/root/cert',
  'certChain': '/path/to/cert/chain',
  'privateKey': '/path/to/private/key',
};
app = new Condor(options);
```

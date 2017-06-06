# Context Object

The `context` object is passed to the service implementations, middleware and error handlers. 

It contains the following properties and methods:

- `call`: The actual call object.
- `req` and `request`: Shortcuts to `call.request`.
- `meta` and `metadata`: Shortcuts to `call.metadata`.
- `properties`: An object with the call properties, like: `methodName`, `methodFullName`, `serviceName`, `serviceFullName`.
- `write()`: A shortcut to `call.write()`.
- `on()`: A shortcut to `call.on()`.
- `end()`: A shortcut to `call.end()`.
- `send(message, metadata)`: It will send a response to the user, calling this function will complete the flow an will return to the user passing the result to every middleware called before the response was  sent, the result will be on the `next().then`. 

The context object can be used to pass data from one middleware to another, or to the service implementation.

Next: [SSL/TLS Support](ssl-tls)

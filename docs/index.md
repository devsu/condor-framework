---
title: Condor GRPC Framework
layout: home
---

### Easy to use

<!-- HTML generated using hilite.me --><div style="background: #f8f8f8; overflow:auto;width:auto;border:solid gray;border-width:.1em .1em .1em .8em;padding:.2em .6em;"><pre style="margin: 0; line-height: 125%"><span style="color: #008000; font-weight: bold">const</span> Condor <span style="color: #666666">=</span> require(<span style="color: #BA2121">&#39;condor-framework&#39;</span>);

<span style="color: #008000; font-weight: bold">class</span> Greeter {
  sayHello(call) {
    <span style="color: #008000; font-weight: bold">return</span> { <span style="color: #BA2121">&#39;greeting&#39;</span><span style="color: #666666">:</span> <span style="color: #BA2121">&#39;Hello &#39;</span> <span style="color: #666666">+</span> call.request.name };
  }
}

<span style="color: #008000; font-weight: bold">const</span> logger <span style="color: #666666">=</span> (context, next) <span style="color: #666666">=&gt;</span> {
  console.log(<span style="color: #BA2121">&#39;Request:&#39;</span>, context.request);
  <span style="color: #008000; font-weight: bold">return</span> next();
};

<span style="color: #008000; font-weight: bold">const</span> rootProtoPath <span style="color: #666666">=</span> <span style="color: #BA2121">&#39;./protos&#39;</span>;

<span style="color: #008000; font-weight: bold">const</span> app <span style="color: #666666">=</span> <span style="color: #008000; font-weight: bold">new</span> Condor({rootProtoPath})
  .add(<span style="color: #BA2121">&#39;myapp/greeter.proto&#39;</span>, <span style="color: #BA2121">&#39;GreeterService&#39;</span>, <span style="color: #008000; font-weight: bold">new</span> Greeter())
  .use(logger)
  .start();
</pre></div>

### Status

Condor is working, but it's in *ALPHA* stage. We're using it to build a large system that will be in production soon.

### Links

- [Quick Start](quick-start)
- [Github Repo](https://github.com/devsu/condor-framework)

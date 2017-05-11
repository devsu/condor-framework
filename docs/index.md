---
title: Condor GRPC Framework
layout: home
---

### Easy to use

<!-- HTML generated using hilite.me --><div style="background: #ffffff; overflow:auto;width:auto;border:solid gray;border-width:.1em .1em .1em .8em;padding:.2em .6em;"><pre style="margin: 0; line-height: 125%"><span style="color: #008800; font-weight: bold">const</span> Condor <span style="color: #333333">=</span> require(<span style="background-color: #fff0f0">&#39;condor-framework&#39;</span>);

<span style="color: #008800; font-weight: bold">class</span> Greeter {
  sayHello(call) {
    <span style="color: #008800; font-weight: bold">return</span> { <span style="background-color: #fff0f0">&#39;greeting&#39;</span><span style="color: #333333">:</span> <span style="background-color: #fff0f0">&#39;Hello &#39;</span> <span style="color: #333333">+</span> call.request.name };
  }
}

<span style="color: #008800; font-weight: bold">const</span> logger <span style="color: #333333">=</span> (context, next) <span style="color: #333333">=&gt;</span> {
  console.log(<span style="background-color: #fff0f0">&#39;Request:&#39;</span>, call.request);
  <span style="color: #008800; font-weight: bold">return</span> next();
};

<span style="color: #008800; font-weight: bold">const</span> app <span style="color: #333333">=</span> <span style="color: #008800; font-weight: bold">new</span> Condor()
  .addService(<span style="background-color: #fff0f0">&#39;./protos/greeter.proto&#39;</span>, <span style="background-color: #fff0f0">&#39;myapp.Greeter&#39;</span>, <span style="color: #008800; font-weight: bold">new</span> Greeter())
  .use(logger)
  .start();
</pre></div>

### Status

Condor is working, but it's in *ALPHA* stage. We're using it to build a large system that will be in production soon.

### Links

- [Quick Start](quick-start)
- [Github Repo](https://github.com/devsu/condor-framework)

---
layout: base.liquid
---

### Hello 👋🏽
I'm Jay and this is my blog where I write things. When I'm not writing about neural networks, you can find me [jamming on guitar](https://www.youtube.com/channel/UCwJzU57tHnbgaI0eECNKqjw), [writing lots of code](https://github.com/jaymody), [answering questions on stackoverflow](https://stackoverflow.com/users/11070463/jay-mody), or training LLMs at [co:here](https://cohere.com).

I love meeting new people, so don't don't hesitate to reach out! `jaykmody [at] gmail [dot] com`.

### Posts

{% for post in collections.posts reversed %}
  <p>
    <span style="opacity: 0.5;">{{ post.data.date | date: "%b %d, %Y" }} |</span>
    <span><a href="{{ post.url }}">{{ post.data.title }}</a></span>
  </p>
{% endfor %}

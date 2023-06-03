---
layout: base.liquid
---

### Hello 👋🏽
I'm Jay and this is my blog where I write things. I love meeting new people, so feel free to reach out to me via email `jaykmody [at] gmail [dot] com`.

### Posts

{% for post in collections.posts reversed %}
  <p>
    <span style="opacity: 0.5;">{{ post.data.date | date: "%b %d, %Y" }} |</span>
    <span><a href="{{ post.url }}">{{ post.data.title }}</a></span>
  </p>
{% endfor %}

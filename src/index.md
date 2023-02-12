---
layout: base.liquid
---

{% for post in collections.posts reversed %}
  <p>
    <span>{{ post.data.date | date: "%b %d, %Y" }}</span>
    <span><a href="{{ post.url }}">{{ post.data.title }}</a></span>
  </p>
{% endfor %}

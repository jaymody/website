---
layout: base.liquid
---

### Hello 👋🏽
I'm Jay, this is my blog where I write things.

You can get in touch with me at `jaykmody [at] gmail [dot] com`. Don't by shy, I love receiving emails.

### Posts

{% for post in collections.posts reversed %}
  <p>
    <span style="opacity: 0.5;">{{ post.data.date | date: "%b %d, %Y" }} |</span>
    <span><a href="{{ post.url }}">{{ post.data.title }}</a></span>
  </p>
{% endfor %}

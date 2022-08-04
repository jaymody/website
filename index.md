---
layout: base.liquid
---

<ul class="post-content no-bullets">
{% for post in collections.posts reversed %}
  <li class="post-listing">
    <p class="date">{{ post.data.date | date: "%B %d, %Y" }}</p>
    <a href="{{ post.url }}">
        <h3 class="lightweight">{{ post.data.title }}</h3>
    </a>
    <p>{{ post.data.description }}</p>
  </li>
{% endfor %}
</ul>

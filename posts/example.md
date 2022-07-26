---
title: "Test Post"
date: 2020-02-01
description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
---

Computing distances matrixes with NumPy the slow way, and the fast way.

---

## Background

![Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.](https://picsum.photos/1600/900)

A [distance matrix](https://en.wikipedia.org/wiki/Distance_matrix#:~:text=In%20mathematics%2C%20computer%20science%20and,may%20not%20be%20a%20metric.) is a square matrix that captures the pairwise distances between a set of vectors. More formally:

> Given a set of vectors $v_1, v_2, ... v_n$ and it's distance matrix $\text{dist}$, the element $\text{dist}_{ij}$ in the matrix would represent the distance between $v_i$ and $v_j$. Notice, this means the matrix is symmetric since $\text{dist}_{ij} = \text{dist}_{ji}$, and the dimensionality (size) of the matrix is $(n, n)$.

The above definition, however, doesn't define what *distance* means. There are [many ways to define and compute the distance between two vectors](https://numerics.mathdotnet.com/Distance.html), but usually, when speaking of the distance between vectors, we are referring to their *euclidean distance*. Euclidean distance is our intuitive notion of what distance is (i.e. shortest line between two points on a map). Mathematically, we can define euclidean distance between two vectors $u, v$ as,

$$|| u - v ||_2 = \sqrt{\sum_{k=1}^d (u_k - v_k)^2}$$

where $d$ is the dimensionality (size) of the vectors.

By itself, distance matrixes are already highly useful in all kinds of applications, from math, to computer science, to graph theory, to bio-informatics. Let's explore one particular application for distance matrices, machine learning.

## Motivating Example: k-Nearest Neighbors

[k-Nearest Neighbour](https://cs231n.github.io/classification/#k---nearest-neighbor-classifier) (kNN) is a machine learning classification algorithm that utilizes distance matrices under the hood. The idea is simple, we can predict the class of any given data point by looking at the classes of the $k$ nearest neighboring labelled data points. Whichever class is most common within the neighbors is the class we predict for the data point.

How do you determine which labelled points are the "nearest"? Well, if we represent each data point as a vector, we can compute their euclidean distance.

Let's say instead of just predicting for a single point, you want to predict for multiple points. More formally, you are given $n$ labelled data points (train data), and $m$ unlabelled data points (test data, for which you would like to classify). The data points are represented as vectors, of dimensionality $d$. In order to implement the kNN classifier, you'll need to compute the distances between all labelled-unlabelled pairs. These distances can be stored in an $(m, n)$ matrix $\text{dist}$, where $\text{dist}_{ij}$ represents the distance between the ith unlabelled point and the jth labelled point. If we represent our labelled data points by the $(n, d)$ matrix $Y$, and our unlabelled data points by the $(m, d)$ matrix $X$, the distance matrix can be formulated as:

$$\text{dist}_{ij} = \sqrt{\sum_{k=1}^d (X_{ik} - Y_{jk})^2}$$

This distance computation is really the meat of the algorithm, and what I'll be focusing on for this post. Let's implement it.

**Note:** I use the term distance matrix here even though the matrix is no longer square (since we are computing the distances between two sets of vectors and not just one).

## Three Loop

Most simple way to compute our distance matrix is to just loop over all the pairs and elements:

```python
X # test data (m, d)
X_train # train data (n, d)

m = X.shape[0]
n = X_train.shape[0]
d = X.shape[1]
dists = np.zeros((num_test, num_train)) # distance matrix (m, n)

for i in range(m):
    for j in range(n):
        val = 0
        for k in range(d):
            val += (X[i][k] - X_train[j][k]) ** 2
        dist[i][j] = np.sqrt(val)
```

While this works, it's quite inefficient and doesn't take advantage of numpy's efficient vectorized operations. Let's change that.

## Two Loops

```python
for i in range(m):
    for j in range(n):
        # element-wise subtract, element-wise square, take the sum and sqrt
        dist[i][j] = np.sqrt(np.sum((X[i] - X_train[j]) ** 2))
```

That wasn't too bad, we even made it easier to read if you're asking me, but we can do better.

## One Loop

```python
for i in range(m):
    dist[i, :] = np.sqrt(np.sum((X[i] - X_train) ** 2, axis=1))
```

What the hell is going on here?! Ok let's break it down.

Firstly, shouldn't `X[i] - X_train` result in an error?  `X[i]` has shape $(d)$ while `X_train` has shape $(n, d)$. Element-wise operations only work if both parties have the same shape, so what's happening here?

Numpy is automatically [broadcasting](https://numpy.org/doc/stable/user/basics.broadcasting.html) `X[i]` to match the shape of `X_train`. You can think of this as stacking `X[i]` $n$ times to produce an $(n, d)$ matrix where each row is just a copy of `X[i]`. This way, when perform the subtraction, each row of `X_train` is being subtracted by `X[i]` (or the other way around, it doesn't matter since we'll be taking the square of the result). If you wanted, you can create the "stacked" matrix yourself in numpy using `np.tile`, but it would be [slower then if you let numpy handle it with broadcasting](https://gist.github.com/jaymody/9d7dec07300f817ddd40b74b1d648a34). So now we have an $(n, d)$ matrix where each row is `X[i] - X_train[j]`, sick.

The next step is easy,  we perform an element-wise square. Then, we need to take the sum of each row, so we use `np.sum` with the argument `axis=1` which tells numpy to sum across the first axis (ie the rows). Without the axis argument, `np.sum` will take the sum of every element in the matrix and output a single scalar value. The result of the `np.sum` with `axis=1` gives us a vector of size $n$.

Finally, we take the element-wise square root of this vector and store it in $dist[i]$.

So here's a better annotated version of the code that's much easier to understand:

```python
for i in range(m):
    # X[i] gets broadcasted (d) -> (n, d)
    # (each row is a copy of X[i])
    diffs = X[i] - X_train

    # element wise square
    squared = diffs ** 2

    # take the sum of each row (n, d) -> (n)
    sums = np.sum(squared, axis=1)

    # take the element-wise square root and store them in dists
    dist[i, :] = np.sqrt(sums)
```

## No Loops?!

We can do even better and only use vector/matrix operations, no loops needed. How you ask? Let's take a closer look at our equation:

$$\text{dist}_{ij} = \sqrt{\sum_{k=1}^d (x_{ik} - y_{jk})^2}$$

What happens if we expand out the expression in the sum?

$$\text{dist}_{ij} = \sqrt{\sum_{k=1}^d x^2_{ik} - 2x_{ik}y_{jk} + y^2_{jk}}\\$$

Interesting, let's distribute the sum:

$$\text{dist}_{ij} = \sqrt{\sum_{k=1}^d x^2_{ik} - 2 \sum_{k=1}^d x_{ik}y_{jk} + \sum_{k=1}^dy^2_{jk}}\\$$

You'll notice that each of these sums are just dot products, so let's replace the ugly notation and get a much cleaner expression:

$$\text{dist}_{ij} = \sqrt{x_i \cdot x_i - 2x_i \cdot y_j + y_j \cdot y_j}\\$$

Notice, for all combinations of $i, j$, the middle term is unique, but the left and right terms are repeated. Imagine fixing either $i$ or $j$ and iterate the other variable, you'll see that $x_i \cdot x_i$ shows up $j$ times and $y_j \cdot y_j$ shows up $i$ times. So, our challenge is to figure out how to compute all possible $x_i \cdot x_i$, $x_i \cdot y_j$, and  $y_j \cdot y_j$, and then add them together in the right way. All of this without loops. Let's try it:

```python
# this has the same affect as taking the dot product of each row with itself
x2 = np.sum(X**2, axis=1) # shape of (m)
y2 = np.sum(X_train**2, axis=1) # shape of (n)

# we can compute all x_i * y_j and store it in a matrix at xy[i][j] by
# taking the matrix multiplication between X and X_train transpose
# if you're stuggling to understand this, draw out the matrices and
# do the matrix multiplication by hand
# (m, d) x (d, n) -> (m, n)
xy = np.matmul(X, X_train.T)

# each row in xy needs to be added with x2[i]
# each column of xy needs to be added with y2[j]
# to get everything to play well, we'll need to reshape
# x2 from (m) -> (m, 1), numpy will handle the rest of the broadcasting for us
# see: https://numpy.org/doc/stable/user/basics.broadcasting.html
x2 = x2.reshape(-1, 1)
dists = x2 - 2*xy + y2 # (m, 1) repeat columnwise + (m, n) + (n) repeat rowwise -> (m, n)
```

## -1 Loops?!!?! 🤔

```python
from sklearn.neighbous import KNeighborsClassifier
```

## Speed Comparison

To test the speed of each implementation, we can run it against a small subset of the cifar-10 dataset as seen in the [cs231n assignment 1 knn notebook](https://github.com/jaymody/cs231n/blob/master/assignment1/knn.ipynb):

```python
Two loop version took 39.707250 seconds
One loop version took 28.705156 seconds
No loop version took 0.218127 seconds
```

Clearly, we can see the no loop version is the winner, beating out both the two loop and one loop implementations by orders of magnitudes. Notice, I didn't include the three loop implementation because that would have taken hours to run! On just `10` training and `10` test examples, the three loop implementation took  `0.5` seconds. For reference, the above time profiles are for `5000` training and `500` test examples, yikes! +1 for vector operations!


---


While MacOS's native search tool **spotlight** is pretty darn good, I want to *spotlight* (pun-intended) **Alfred**, a more powerful search tool for MacOS.


## Open an App

`<app name>` or `open <app name>`

<video controls="controls" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
  <source src="https://thumbs.gfycat.com/ObeseGloriousErin-mobile.mp4">
</video>

## Google Something

`google <query>` or just `<query>` (use `cmd + enter` to force a google search if the query has matches)

you can also enter a url and get taken the page directly, e.g. `github.com/jaymody`

<video controls="controls" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
  <source src="https://thumbs.gfycat.com/RelievedPlainJavalina-mobile.mp4">
</video>

## Open a Bookmark

`<bookmark name>` or `bookmark <bookmark name>`

`bookmark` to show all bookmarks

<video controls="controls" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
  <source src="https://thumbs.gfycat.com/HardtofindForkedAmericancrow-mobile.mp4">
</video>

## Find a File

This just works in Alfred. Spotlights file search is just not it. Also, you can specify which folders to search in, so rather than vomiting out lots of irrelevant files that you don't care about, it just searches where you want. I'm looking at you `node_modules`.

Also, I have it set up to ignore source files unless I ask it to include them via the `'` token. This way, I get a more minimal search by default, and I can be more granular with my search if I specify.

 `<file name>`

 `find <file name>` or `'<file name>` to include more files (like source code) in the search

<video controls="controls" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
  <source src="https://thumbs.gfycat.com/CaringInsignificantClam-mobile.mp4">
</video>

## Preview a File

You can click Shift to preview a file.

<video controls="controls" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
  <source src="https://thumbs.gfycat.com/InferiorUglyAsiaticgreaterfreshwaterclam-mobile.mp4">
</video>

## Open in Finder

Sometimes, you don't want to open the file, you just want to open it's location in finder, that's easy as well, just use ctrl when pressing enter.

<video controls="controls" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
  <source src="https://thumbs.gfycat.com/LoneThatEelelephant-mobile.mp4">
</video>

## Drag and Drop a File

Search a file, and simply drag and drop it. Much much faster than clicking around finder, finding the file, moving the window to the right location, and then dropping it where you want. Just search, drag, drop.

<video controls="controls" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
  <source src="https://thumbs.gfycat.com/PracticalDimwittedLeafhopper-mobile.mp4">
</video>

## Search for term in Files

This is super powerful. Let's say instead of opening a file named induction, I wanted to search for the word "induction" in all my files. Maybe i'm studying, and I can't remember which lecture mentioned induction.

 `in <term to search>`

<video controls="controls" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
  <source src="https://thumbs.gfycat.com/MeaslyUnsungDolphin-mobile.mp4">
</video>

## Math

You can do math (and save the result in your clipboard)

`4*5` or `=4*5`

`=sin(pi/4)` , use the equals sign when you need terms like sin or exp

<video controls="controls" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
  <source src="https://thumbs.gfycat.com/VictoriousPlayfulAmericanquarterhorse-mobile.mp4">
</video>

## System Commands

You can also trigger some useful system commands like:

- `quit chrome`
- `quit all apps`
- `show trash`
- `empty trash`
- `lock`
- `sleep`
- `shut down`

<video controls="controls" style="width: 100%; max-width: 600px; margin: 0 auto; display: block;">
  <source src="https://thumbs.gfycat.com/CandidEntireAmericancrow-mobile.mp4">
</video>

## Comparison with Spotlight
### Pros
- It makes you be more explicit/specific with your searches. Rather than searching something, and wading through the results (like in spotlight), alfred uses special phrases to specify what you want exactly.
- It has a "smarter" memory than spotlight. I find with spotlight, the option I want is always way down the list, but with alfred, it's almost always the first option.
- Less noise, more signal
- Way faster than spotlight in my experience
- Highly customizable
- Looks clean asf (although spotlight looks super nice as well)
- Powerpack unlocks even more powerful features (particularly clipboard snippets, file actions, and workflows)

### Cons
- Spotlight can search your mail, which is neat
- Spotlight also suggests websites (which is sometimes useful), alfred does not
- It's an extra app you gotta download (but it's one million percent worth it)
- The alfred logo is ugly
- If you want to unlock all the features you'll need to buy powerpack (developers need to make money somehow!)


This article offers a sample of basic Markdown syntax that can be used in Hugo content files, also it shows whether basic HTML elements are decorated with CSS in a Hugo theme.


## Headings

The following HTML `<h1>`—`<h6>` elements represent six levels of section headings. `<h1>` is the highest section level while `<h6>` is the lowest.

# H1
## H2
### H3
#### H4
##### H5
###### H6

## Paragraph

Xerum, quo qui aut unt expliquam qui dolut labo. Aque venitatiusda cum, voluptionse latur sitiae dolessi aut parist aut dollo enim qui voluptate ma dolestendit peritin re plis aut quas inctum laceat est volestemque commosa as cus endigna tectur, offic to cor sequas etum rerum idem sintibus eiur? Quianimin porecus evelectur, cum que nis nust voloribus ratem aut omnimi, sitatur? Quiatem. Nam, omnis sum am facea corem alique molestrunt et eos evelece arcillit ut aut eos eos nus, sin conecerem erum fuga. Ri oditatquam, ad quibus unda veliamenimin cusam et facea ipsamus es exerum sitate dolores editium rerore eost, temped molorro ratiae volorro te reribus dolorer sperchicium faceata tiustia prat.

Itatur? Quiatae cullecum rem ent aut odis in re eossequodi nonsequ idebis ne sapicia is sinveli squiatum, core et que aut hariosam ex eat.

## Blockquotes

The blockquote element represents content that is quoted from another source, optionally with a citation which must be within a `footer` or `cite` element, and optionally with in-line changes such as annotations and abbreviations.

#### Blockquote without attribution

> Tiam, ad mint andaepu dandae nostion secatur sequo quae.
> **Note** that you can use *Markdown syntax* within a blockquote.

#### Blockquote with attribution

> Don't communicate by sharing memory, share memory by communicating.<br>
> — <cite>Rob Pike[^1]</cite>

[^1]: The above quote is excerpted from Rob Pike's [talk](https://www.youtube.com/watch?v=PAAkCSZUG1c) during Gopherfest, November 18, 2015.

## Tables

Tables aren't part of the core Markdown spec, but Hugo supports supports them out-of-the-box.

   Name | Age
--------|------
    Bob | 27
  Alice | 23

#### Inline Markdown within tables

| Italics   | Bold     | Code   |
| --------  | -------- | ------ |
| *italics* | **bold** | `code` |

## Code Blocks

#### Code block with backticks

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Example HTML5 Document</title>
</head>
<body>
  <p>Test</p>
</body>
</html>
```

#### Code block indented with four spaces

    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Example HTML5 Document</title>
    </head>
    <body>
      <p>Test</p>
    </body>
    </html>

## List Types

#### Ordered List

1. First item
2. Second item
3. Third item

#### Unordered List

* List item
* Another item
* And another item

#### Nested list

* Fruit
  * Apple
  * Orange
  * Banana
* Dairy
  * Milk
  * Cheese

## Other Elements — abbr, sub, sup, kbd, mark

<abbr title="Graphics Interchange Format">GIF</abbr> is a bitmap image format.

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

Press <kbd><kbd>CTRL</kbd>+<kbd>ALT</kbd>+<kbd>Delete</kbd></kbd> to end the session.

Most <mark>salamanders</mark> are nocturnal, and hunt for insects, worms, and other small creatures.

![](https://picsum.photos/200/300)

![](https://picsum.photos/1600/900)

![](https://picsum.photos/900/1600)

![](https://picsum.photos/100/100)

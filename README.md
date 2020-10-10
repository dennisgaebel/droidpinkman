![droidpinkman.io](screenshot.png)

## Project Overview

 - Site Generator : 11ty
 - Template Language : Nunjucks
 - Styles : Sass
 - Package Manager : NPM
 - Node v12.18.3

## Installation

```javascript
$ npm install
```

### Serve Templates

```shell
npx @11ty/eleventy
```

```shell
npx @11ty/eleventy --serve
```

## Environment Control

Environmental controls are governed by an option found within ``siteConfig.js``. [Docs reference](https://www.11ty.dev/docs/data-js/#example-exposing-environment-variables)

```shell
ELEVENTY_ENV=development npx @11ty/eleventy --serve
```

```shell
ELEVENTY_ENV=production npx @11ty/eleventy
```

```nunjucks
{% if siteConfig.environment == "production" %}
<style>{{ css | cssmin | safe }}</style>
{% else %}
<style>{{ css | safe }}</style>
{% endif %}
```
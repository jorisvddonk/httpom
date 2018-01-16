# httpom :dog2: the HTTP [Pomeranian](https://en.wikipedia.org/wiki/Pomeranian_(dog)) - an HTTP tool for devs, ops, support staff and other human beings

Httpom is a tool for making HTTP request, which can be used by devs, ops, support staff and other humans beings alike.

**NOTE: Currently, httpom is a project without any implementation. Examples, command invocations and featureset may change at any time.**

## Design philosophy

The following design principles guide httpom's usage, development, implementation:

* Cute - Like a Pomeranian, httpom should be cute and elegant.
* Fun - httpom's development and usage should be *fun*. Humor should be used in its documentation and examples.
* Metaphoric - httpom should resemble a real Pomeranian in certain ways, such as functionality. For example, just like a Pomeranian, httpom should be able to *fetch* stuff, and you should be able to have a *conversation* with it.
* [Developer Dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) - A good devtool should be used by developers to prove a concept, and can later on be used by non-developers day-to-day.
* Plays well with others - httpom should play well with other dev tools, like [jq](https://stedolan.github.io/jq/), [curl](https://curl.haxx.se/), [Visual Studio Code](https://code.visualstudio.com/) and IDEs.
* Speaks your language - httpom should speak your language, as long as your language is English, HTTP and/or JavaScript.
* Interactive - httpom should fallback to an interactive mode if required input parameters are missing. The interactive mode should ideally support both a command-line interface and web-based forms.
* Programmable - httpom should provide an API, allowing software developers to use pomfiles written during development later on in their product lifecycle.
* UNIX Philosophy - httpom should embrace the UNIX Philosophy.

## Usage

### Pomfiles

A central concept of httpom is the Pomfile. A pomfile is a file with a `.pom` extension describing:
* an HTTP request, or:
* a sequence of HTTP requests, or:
* a set of settings, to be used as defaults (e.g. as a defaults configuration file)

A pomfile consists of a few sections:
* A request-line, similar to [RFC7230](https://tools.ietf.org/html/rfc7230#section-3.1.1), specifying a URL and an HTTP method. The protocol version is optional and defaults to a sane default (`HTTP/1.1`). *Required*.
* HTTP headers, following [RFC7230](https://tools.ietf.org/html/rfc7230#section-3.2). *Optional*.
* httpom directives, which provide settings and meta-information to httpom. *Optional*. See the section below for directive options.
* A separator: two newlines. *Optional*.
* A request body.

All of the sections are delimited with newlines (`\n`, `\r\n` or `\n\r`).

Furthermore, the following can be used anywhere except for the request body:

* Comments: lines starting with one or more slashes (`/`) or one or more whitespace characters are treated as comments. Note: due to RFC7230, a hash (`#`) can *not* be used to start a comment!
* One newline can be used to separate sections.

And the following can be used in all sections:
* Template variables.

### Pomfile directives

Pomfile directives resemble HTTP headers, except they start with an `@`, and their body may be of an as of yet-to-be determined type.

* `@type`: convenience directive, describing the request's content-type and potentially a request body transform. The `json` type, for instance, automatically adds the `Content-Type: application/json` header and validates + minifies the request JSON.
* `@template-variables`: describes template variable names, descriptions, defaults and value types for supported request bodies (e.g. `boolean`, `string`, `number`, `int32`, `enum`) which allows for improved interactive mode.
* `@flow`: this directive describes a flow of multiple Pomfiles, and can be used to chain together multiple Pomfiles in interesting ways.
* `@pomfile-searchpath`: describes the pomfile searchpath, for Pomfile discovery in pure-interactive mode. Should usually only be used for meta-pomfile.
* `@no-template-variables-in-body`: describes that template variable functionality should be disabled for the request body.

### Pomfile examples

A Pomfile describing a GET to httpbin.org to retrieve your IP address:

```
GET http://httpbin.org/get
``` 

A Pomfile describing a POST to httpbin.org:

```
POST http://httpbin.org/post

Content-Type: application/json


{"foo": "bar"}
```

## Template variables, sessions, pomfile includes, pomfile flow, JavaScript response parsing.

@TODO: document. These should be a fairly cool features, allowing you to chain together various pomfiles in interesting ways and parse their results. This should be used to, for example, login and then make authenticated requests.

## Pure-interactive mode

@TODO: document. This feature allows you to discover pomfiles on the local filesystem and select which you want to run.

## Default pomfile

@TODO: document. There's a default pomfile that's used if no pomfile is specified. The default pomfile can be overridden via the `httpom_default_pomfile` environment variable, which - together with other functionality of httpom - should allow developers to set up a nice toolchain on the PCs of non-developers. If not set, it should probably default to `%HOME%/httpom.pom` or something similar.

## httpom command invocation Examples

Note: these may not all work on all operating systems or command-line shells, but should all work on GNU bash.

* `httpom --cli` Runs httpom in pure-interactive mode, with a command-line interface.
* `httpom --web` Runs httpom in pure-interactive mode, with a web-based interface that'll automatically be opened in the user's default web browser.
* `httpom` - Runs httpom in pure-interactive mode. Depending on the default pomfile, this will run the interactive mode in CLI or WEB mode.
* `httpom GET http://httpbin.org/get` - Makes a simple HTTP/1.1 GET on http://httpbin.org/get, without making use of a pomfile.
* `httpom login.pom` - Executes the request specified by login.pom.
* `cat login.pom | httpom --` - Executes login.pom, which is passed along via stdin.
* `httpom login.pom get-dogs.pom` - Executes login.pom, then get-dogs.pom, in a shared session.
* `httpom login.pom | httpom get-dogs.pom` - Executes login.pom, then get-dogs.pom, in a shared session.
* `httpom upload-cute-dog-picture.pom < cute-dog-picture.jpg` - Executes upload-cute-dog-picture.pom, with cute-dog-picture.jpg as the request body.
* `httpom get-cute-dog-picture.pom > cute-dog-picture.jpg` - Executes get-cute-dog-picture.pom and saves its response body to cute-dog-picture.jpg.
* `httpom --output=web get-cute-dog-picture.pom` - Executes get-cute-dog-picture.pom, then opens its response body in the system's default web browser instead of stdin.

### here-documents

The following should also work:
```
httpom << END_TEXT
POST http://httpbin.org/post

Content-Type: application/json
END_TEXT
```
This executes a pomfile entered via stdin with a [here-document](https://en.wikipedia.org/wiki/Here_document).
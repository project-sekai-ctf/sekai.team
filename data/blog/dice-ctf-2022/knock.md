---
title: DICE CTF 2022 – knock-knock
date: '2022-02-06'
draft: false
authors: ['thebish0p']
tags: ['DICE CTF 2022', 'Web', 'Crypto', 'JavaScript', 'Signature']
summary: 'Make sure to call your functions :)'
---

## knock-knock

> by BrownieInMotion
>
> Knock knock? Who's there? Another pastebin!!
>
> [knock-knock.mc.ax](knock-knock.mc.ax)
>
> Downloads
>
> [index.js](https://static.dicega.ng/uploads/d90311de33b98f393614654acad1e2f57ac87b0a309ee0548a5f9e8b18f70a8b/index.js)
>
> [Dockerfile](https://static.dicega.ng/uploads/6035c50d5bc8f1178f87aa6d16847cda0e611bdd68f72928f81f952ddef762c9/Dockerfile)

We start by checking the web page and notice that we can create a pastebin:

![Browsing](/static/images/dice-ctf-2022/knock/browsing.png)

We can see the content of our paste by sending a `GET` request on `/note` and each note has a unique `id` and we notice that `token` parameter is apparently some sort of signature:

![Random Content](/static/images/dice-ctf-2022/knock/random_content.png)

As you can see if we tamper the token we get `invalid token` error:

![Invalid Token](/static/images/dice-ctf-2022/knock/invalid_token.png)

Time to look at the source code. We proceed by checking the `index.js` file and we notice that on launch the flag is set directly in a pastebin.
The `id` parameter is incremental which means that our flag is on `id=0`

```javascript
const crypto = require('crypto')

class Database {
  constructor() {
    this.notes = []
    this.secret = `secret-${crypto.randomUUID}`
  }

  createNote({ data }) {
    const id = this.notes.length
    this.notes.push(data)
    return {
      id,
      token: this.generateToken(id),
    }
  }

  getNote({ id, token }) {
    if (token !== this.generateToken(id)) return { error: 'invalid token' }
    if (id >= this.notes.length) return { error: 'note not found' }
    return { data: this.notes[id] }
  }

  generateToken(id) {
    return crypto.createHmac('sha256', this.secret).update(id.toString()).digest('hex')
  }
}

const db = new Database()
db.createNote({ data: process.env.FLAG })
```

Another interesting finding here is that `crypto.randomUUID` is called without parentheses `()` to execute which made me test my theory directly in node as shown below:

![Node Results](/static/images/dice-ctf-2022/knock/node_results.png)

As you can see above `crypto.randomUUID` is just the source code of the function. This means that they key used to sign the `id` is static. We can simply sign `0` in order to see the flag by running the code below:

```javascript
const crypto = require('crypto')

class Database {
  constructor() {
    this.notes = []
    this.secret = `secret-${crypto.randomUUID}`
  }

  createNote({ data }) {
    const id = this.notes.length
    this.notes.push(data)
    return {
      id,
      token: this.generateToken(id),
    }
  }

  getNote({ id, token }) {
    if (token !== this.generateToken(id)) return { error: 'invalid token' }
    if (id >= this.notes.length) return { error: 'note not found' }
    return { data: this.notes[id] }
  }

  generateToken(id) {
    return crypto.createHmac('sha256', this.secret).update(id.toString()).digest('hex')
  }
}
let test = new Database()
console.log(test.generateToken(0)) // Generates this: 7bd881fe5b4dcc6cdafc3e86b4a70e07cfd12b821e09a81b976d451282f6e264
```

By sending `id` as `0` and the token we just got we can see the flag now:

![Flag](/static/images/dice-ctf-2022/knock/flag.png)

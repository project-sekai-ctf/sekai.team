---
title: UMDCTF 2023 – POKéPTCHA
date: '2023-05-01'
draft: false
authors: ['thebadgod']
tags: ['UMDCTF 2023', 'Web', 'Reverse', 'VM', 'JavaScript']
summary: 'Ever wanted to reverse a VM in obfuscated JavaScript?'
canonical: 'https://spclr.ch/umdctf-pokeptcha'
---

## POKéPTCHA (Web, 500 Points)

> Team Rocket keeps taking down my website! I’m testing out this new type of captcha, but it doesn’t seem to be working as expected. None of the choices are valid! Can you solve it for me?
>
> Author: umasi, sd
>
> NOTE: Flag format is `UMDCTF{}`, with the correct answer in the brackets.
>
> https://pokeptcha.chall.lol/

### Solve

Opening the website will give us a website where we have to identify a Pokémon based on its silhouette. It’s the classic scene and we are given the choices from the episode, however all of them just trigger the text `Team Rocket detected!`, so let’s see what the correct answer is.

Pressing _F12_ immediatly triggers a debugger statement, which indicates that there is some anti-debugging in place. So for now I disabled the breakpoints to at least see the sources (One could also download the JavaScript source code directly by looking at the networks tab / the HTML).

The JavaScript is obfuscated, however what immediatly looked out is the [`https://github.com/blueimp/JavaScript-MD5/blob/master/js/md5.min.js`](https://github.com/blueimp/JavaScript-MD5/blob/master/js/md5.min.js) comment, which allowed me to identify a big part (everything after the comment) as part of the MD5 algorithm. The big base64 data is printable text, all numbers and `|` characters. The very first function defined looks like this after some deobfuscation:

```javascript
function NWFm(mKC) {
  var values = []
  var data = atob(base64_data)
  var data_array = data.split('|')
  for (var i = 0; i < ZY5MM0.length; i = i + 1) {
    values[moWJn] = parseInt(data_array[i]) ^ 21
  }
  return values
}
```

So this gives us the values we want, just split at the pipes, parseint and then xor with 21. Next there were some utility functions to read parts of the values array (which is assigned to a global value called `bytecode`):

```javascript
function next_index() {
  pc = pc + 1
  return pc - 1
}

function read_string() {
  var l = bytecode[next_index()]
  var s = ''
  for (let i = 0; i < l; i = i + 1) {
    s = s + String.fromCharCode(bytecode[next_index()])
  }
  return s
}

function read_const() {
  var currentIndex = bytecode[next_index()]
  if (currentIndex & 1) {
    return read_string()
  } else {
    return bytecode[next_index()]
  }
}

function read_single() {
  return global_data[next_index()]
}
```

We see that this just reads from the `bytecode` array.

Next we have some more utility functions to push and pop to a global `stack` variable:

```javascript
function pop() {
  var length = stack.length
  var popped_val = stack[length - 1]
  stack.length = length - 1
  return popped_val
}

function push(val) {
  var sp = actual_stack.length
  stack[sp] = val
}
```

Then we have an array of three functions (Which are each assigned individually, but in the end we have `operations = [push_func, eval_func, assign_func]`), which are defined as follows:

```javascript
// 0
function push_func() {
  stack.push(read_const())
}

// 1
function eval_func() {
  push(eval(pop()))
}

// 2
function assign_val(value, key, obj) {
  obj[key] = value
}
function assign_func() {
  var values = []
  for (let i = 0; i < 3; i = i + 1) {
    values.push(pop())
  }
  assign_val(...values)
}
```

Where the comment indicates the position in the array. The final piece of this whole thing is:

```javascript
function main_loop(bone_in) {
  reset()
  stack.push(bone_in)
  // QZOR is the start time, will be used in the bytecode
  QZOR = Date.now()

  // while(true)?
  for (; 1 < 100; ) {
    var op = read_single()

    // Special handler for opcode 100 -> exit
    if (op == 100) {
      memory = []
      // LZX will be set in the bytecode
      return LZX
    } else {
      var func = operations[op]
      // Don't really understand this...
      if (func == 2) {
        break
      }
      // execute op
      func()
    }
  }
  reset()
}
```

Which, in case my variable names have not made it clear yet, should hopefully make it clear that we’re dealing with a VM in JavaScript. We take one single value as opcode and then execute the operation at that index (The comment above the function). However we currently only have indices 0-2 defined, but looking at the values there is no way that can be true. At the same time we see some code in the array, so I wrote a small interpreter in python which steps through and prints when we assign to anything. The first thing we do is

```python
cwJjVO[3] = eval("var Yulo=['\\x70\\x75\\x73','\\x70\\x6f\\x70','\\x68','\\x70\\x6f\\x70'];var i0M=function(){var qIdHpk=fWu[Yulo[(-(-(177/(59*(91/91)))+(3000/50-1043%62))+7)*1]]();var j9M=fWu[Yulo[91-(26+(42+20))]]();j9M[Yulo[0/(87-118%34)]+Yulo[82%5]](qIdHpk)};i0M");
```

Decoding this gives us a new operation:

```javascript
// 3
function(){
    var a = stack.pop();
    var b = stack.pop();
    b.push(a)
}
```

Which is just appending one value to the other. The next thing we do (after some push and evals) is actually this, where we append to the operations. We continue adding more operations and usually use them right after adding them to the operations array, but after some time I finally had them all:

```javascript
// 4, pop
function() {
    stack.pop()
}

// 5, mem_write
function set_mem(value,address){
    var value_func = () => { return value };
    memory[address] = value_func
}
function(){
    var address = stack.pop();
    var value = stack.pop();
    set_mem(value, address)
}

// 6, mem_read
function get_mem(address) {
    return memory[address]()
}
function(){
    var address = stack.pop();
    stack.push(get_mem(address))
}

// 7, sub
function(){
    var a=stack.pop();
    var b=stack.pop();
    stack.push(a-b)
}

// 8, or
function(){
    stack.push(stack.pop()||stack.pop())
}

// 9, push_global
function(){
    stack.push(global)
}

// 10, push_null
function(){
    stack.push(null)
}

// 11, goto
function(){
    pc=stack.pop()
}

// 12, call
function(){
    var func=stack.pop();
    var a = stack.pop();
    var b = stack.pop();
    stack.push(func.apply(a,b))
}

// 13, push_arr
function(){
    stack.push([])
}

// 14, jne
function(){
    var a = stack.pop();
    var b = stack.pop();
    var dst = stack.pop();
    pc = a == b ? pc : dst
}

// 15, xor
function(){
    var a = stack.pop();
    var b = stack.pop();
    stack.push(a^b)
}

// 16, mod
function(){
    var a = stack.pop();
    var b = stack.pop();
    stack.push(a%b)
}

// 17, index
function(){
    var a = stack.pop();
    var b = stack.pop();
    stack.push(a[b])
}

// 18, add
function(){
    var a = stack.pop();
    var b = stack.pop();
    stack.push(a+b)
}

// 19, shr
function(){
    var a = stack.pop();
    var b = stack.pop();
    stack.push(b>>a)
}

// 20, jne again?
function(){
    var a = stack.pop();
    var b = stack.pop();
    var dst = stack.pop();
    pc = a != b ? dst : pc
}
```

Not quite sure about the two `jne` instructions, could be that I switched some variables around and one is actually a `je`, but from now I just printed the operations and didn’t interpret them anymore, so it didn’t matter too much (I just needed to know that there is a conditional jump to some address). With a bit of cleanup I got:

```
mem[99] = globalThis || globalThis.window
[...]
mem[1] = []
mem[1].append(b'var LtTZ7p=function(){debugger};LtTZ7p();LtTZ7p')
mem[1].append(5)
setInterval(null, mem[1])
mem[20] = mem[99].location.hostname
mem[51] = FQgZw // the name of the whole interpreter function
mem[20] += mem[51].toString(mem[51], [])
mem[63] = mem[99].Date
mem[20] += (mem[63].now(mem[63], []) - QZOR) >> 3 // time diff
mem[87] = []
mem[87].append(mem[20])
mem[20] = md5(null, mem[87]) // md5(<whole string>)
[...]
```

So we can see that we’re first calling setInterval with a debugger statement every 5 milliseconds. Then we do some string concatenations and finally call MD5 (which returns a hex string).

Continuing we got:

```
mem[21] = r1
mem[1] = []
mem[2] = 0
mem[3] = 0
mem[4] = []

// rc4 initial state [i for i in range(256)]
mem[10] = 0
loc_4388:
	mem[1][mem[10]] = mem[10]
	mem[10] = mem[10] + 1
jmp loc_4388 if 256 != mem[10]

// rc4 key init
mem[10] = 0
loc_4431:
	mem[2] = mem[1][mem[10]] + mem[2]
	mem[6] = mem[10] % mem[20].length
	mem[5] = []
	mem[5].append(mem[6])
	mem[2] = mem[20].charCodeAt(mem[20], mem[5]) + mem[2]
	mem[2] = mem[2] % 256
	mem[3] = mem[1][mem[10]]
	mem[1][mem[10]] = mem[1][mem[2]]
	mem[1][mem[2]] = mem[3]
	mem[10] = mem[10] + 1
	jmp loc_4431 if 256 != mem[10]

mem[10] = 0
mem[2] = 0
mem[5] = 0
loc_4622:
	mem[10] = (mem[10] + 1) % 256
	mem[2] = (mem[1][mem[10]] + mem[2]) % 256
	mem[3] = mem[1][mem[10]]
	mem[1][mem[10]] = mem[1][mem[2]]
	mem[1][mem[2]] = mem[3]
	mem[7] = []
	mem[7].append(mem[5])
	mem[8] = mem[21].charCodeAt(mem[21], mem[7]) ^ mem[1][(mem[1][mem[10]] + mem[1][mem[2]])%256]
	mem[7] = []
	mem[7].append(mem[8])
	mem[25] = String.fromCharCode(null, mem[7])
	mem[4] = mem[25] + mem[4]
	mem[5] = mem[5] + 1
	jmp loc_4622 if mem[21].length != mem[5]
```

So it uses the MD5 hex-string as RC4 key, to then encrypt (or decrypt) our input which means we can get the RC4 key (Either using the JS debugger console and the convenient MD5 function or by copying everything into a Python script to calculate it there). Finally we just need to know the ciphertext to decrypt it. So more bytecode:

```
mem[10] = []
mem[10].append(mem[4])
mem[71] = window.btoa(null, mem[10])
goto loc_4976

// if ciphertext[mem[71]] == mem[42]:
//   goto mem[65]
// else
//   goto mem[82]
fun_4921:
	mem[49] = []
	mem[49].append(mem[57])
	jmp mem[65] if mem[42] != mem[71].charCodeAt(mem[71], mem[49])
	jmp mem[82]

loc_4976:
	mem[65] = loc_6456 // fail
	mem[82] = loc_5008 // next char
	mem[57] = 0 // index
	mem[42] = 103 // exected char
	jmp fun_4921

loc_5008:
	mem[82] = 5033
	mem[57] = 1
	mem[42] = 53
	jmp fun_4921

loc_5033:
[...]
```

This pattern repeats until `loc_6383`, at that point we assign `LZX = true;`:

```
loc_6358:
	mem[82] = loc_6383
	mem[57] = 55
	mem[42] = 66
	jmp fun_4921

loc_6383:
	LZX = true

loc_6456:
	push("Did you solve this? We want to know how. Open a ticket!")
	exit
```

Extracting all the characters and putting them in the correct order (they already were, no need to shuffle anything luckily) gives us the base64 string `g5+Kqs+Smi1f6zGOZq423PAHr0mk3LCn2vF+TdTWNH+uJ98Wt5iNLyaB`. So now we can decrypt the binary data after `b64decoding` using the key `bc493a282bbecd7339515be0667610a6`, which gives us `Th3_4n5W3R_1s_A_p1gGlyJuFf_S3en_fR0m_480Ve`.

The flag is `UMDCTF{Th3_4n5W3R_1s_A_p1gGlyJuFf_S3en_fR0m_480Ve}`.

_Note: This solve was the first blood and Flipper Zero device prize winner._

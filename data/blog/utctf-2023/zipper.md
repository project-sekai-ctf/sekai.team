---
title: UT CTF 2023 – Zipper
date: '2023-03-12'
draft: false
authors: ['legoclones']
tags: ['UTCTF 2023', 'Misc', 'Zip']
summary: 'Craft a malicious Zip file with identically-named files to bypass a filter and get RCE.'
canonical: 'https://justinapplegate.me/2023/utctf-zipper/'
---

## Zipper (Misc, 968 Points)

> One of our spies has stolen documentation relating to a new class of missiles. Can you figure out how to hack them?
>
> "We have developed a new protocol to allow reprogramming missiles in flight. We send a base64 encoded string representing a specifically formatted zip file to control these missiles. The missiles themselves verify each command before executing them to ensure that a hacker cannot manipulate them."
>
> A sample message has also been stolen by our spy.
>
> By Aadhithya (@aadhi0319 on discord)
>
> Attachments: [verify_hash.py](https://github.com/Legoclones/website/blob/main/source/static/utctf-zipper/verify_hash.py), [commands.zip.b64](https://github.com/Legoclones/website/blob/main/source/static/utctf-zipper/commands.zip.b64).

When connecting to the port through netcat, the file run was `verify_hash.py`:

```python
import hashlib
import os
import sys
import zipfile

def get_file(name, archive):
    return [file for file in archive.infolist() if file.filename == name][0]

archive = zipfile.ZipFile(sys.argv[1])
file = get_file("commands/command.txt", archive)
data = archive.read(file)
md5 = hashlib.md5(data).hexdigest()

if md5 == "0e491b13e7ca6060189fd65938b0b5bc":
    archive.extractall()
    os.system("bash commands/command.txt")
    os.system("rm -r commands")
else:
    print("Invalid Command")
```

The script takes in a ZIP file (passed to the server through base64 encoding presumably), looks for, reads, and hashes the `commands/command.txt` file, and if the MD5 hash of the file matches `0e491b13e7ca6060189fd65938b0b5bc`, the contents of that file are run in bash. There’s no mention of the flag anywhere, which means it must be on the filesystem and read through arbitrary file read or RCE. Based on the fact that user-supplied input was run through bash, it’s just a matter of bypassing the filter.

### Initial Thoughts

I had two ideas initially - Zip Slip vulnerability, and MD5 collision. It didn’t take very long for me to discover that [Python’s ZIP-handling libraries aren’t vulnerable to Zip Slip](https://security.snyk.io/research/zip-slip-vulnerability), and hasn’t since 2014. The [official documentation](https://docs.python.org/3/library/zipfile.html#zipfile.ZipFile.extract) even describes the measures it takes to prevent path traversal when extracting ZIP files. So there was no chance of me overwriting arbitrary files without popping a 0day.

I already knew that MD5 collisions were pretty tough, and 30 extra seconds of research confirmed that. While research has been released on how to achieve MD5 collisions ([link 1](https://www.mscs.dal.ca/~selinger/md5collision/), [link 2](https://github.com/cr-marcstevens/hashclash), [link 3](https://marc-stevens.nl/research/md5-1block-collision/)), they all have certain prerequisites that couldn’t be fulfilled within the context of this problem. The most important idea is that it can be easy to generate two files with the same hash, but given a single hash it’s hard to generate another file with that same hash.

### Identical Files

While writing out my ideas/work so far in a Discord thread for my team, an idea popped into my head. I’ve spent a lot of time experimenting, researching, and playing with the ZIP file format, and nothing said you couldn’t have two files with the same name in it. I double checked how the MD5 hash check is made, and the `get_file()` function that returns the content being hashed will only return the _first_ file with the desired name.

This means I could make a ZIP file with 2 identically-named files inside; the first one would have the "approved" content `a` with the hash `0e491b13e7ca6060189fd65938b0b5bc`, while the second one would be my own malicious script. When the script ran `archive.extractall()` on the ZIP file, it would first extract the good `commands.txt` file, then it would extract the malicious `commands.txt` file and overwrite the good one, giving us RCE.

To create this ZIP file, I originally made 2 files, one called `commands.txt` and the other called `commands.txk`. After zipping it up, I opened it in a hex editor and replaced both occurrences of `commands.txk` with `commands.txt`, base64-encoded my file, and sent it through the netcat session. Using the command `cat flag.txt` gave me the flag!

Final payload - `UEsDBAoAAAAAAHiralYAAAAAAAAAAAAAAAAJABwAY29tbWFuZHMvVVQJAANDAwxkQwMMZHV4CwABBOgDAAAE6AMAAFBLAwQKAAAAAAAth2FWWhLOtxMAAAATAAAAFAAcAGNvbW1hbmRzL2NvbW1hbmQudHh0VVQJAANm5v9jPwMMZHV4CwABBOgDAAAE6AMAAGVjaG8gJ0hlbGxvIFdvcmxkISdQSwMECgAAAAAAaqxqVnswo9kMAAAADAAAABQAHABjb21tYW5kcy9jb21tYW5kLnR4dFVUCQADCAUMZAgFDGR1eAsAAQToAwAABOgDAABjYXQgZmxhZy50eHRQSwECHgMKAAAAAAB4q2pWAAAAAAAAAAAAAAAACQAYAAAAAAAAABAA7UEAAAAAY29tbWFuZHMvVVQFAANDAwxkdXgLAAEE6AMAAAToAwAAUEsBAh4DCgAAAAAALYdhVloSzrcTAAAAEwAAABQAGAAAAAAAAQAAAICBQwAAAGNvbW1hbmRzL2NvbW1hbmQudHh0VVQFAANm5v9jdXgLAAEE6AMAAAToAwAAUEsBAh4DCgAAAAAAaqxqVnswo9kMAAAADAAAABQAGAAAAAAAAQAAAICBpAAAAGNvbW1hbmRzL2NvbW1hbmQudHh0VVQFAAMIBQxkdXgLAAEE6AMAAAToAwAAUEsFBgAAAAADAAMAAwEAAP4AAAAAAA==`

**Flag:** `utflag{https://youtu.be/bZe5J8SVCYQ}`

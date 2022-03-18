---
title: UTCTF 2022 – IRC
date: '2022-03-11'
draft: false
authors: ['n0b0dy']
tags: ['UTCTF 2022', 'forensics', 'volatility']
summary: 'Analyze memory dump and recover password.'
canonical: ''
---

## IRC

Original Challenge Link: https://utctf.live/challenges#IRC-26

> Steal my irc password.
>
> Note: the password is the flag, but it is not in utflag format (that would make it too easy). Do not guess; the correct solution finds the password with certainty. If you believe you have the correct password, but CTFd still marks it as wrong, DM me rather than using all your attempts.
>
> I spent way too long solving this problem...
>
> [memdump.lime.z](https://utexas.box.com/s/z2ljzoah8cp3alsp8p0uwh7hdvvz5wq3)
>
> By Daniel Parks (@danielp on discord)

Memory Image: https://utexas.box.com/s/z2ljzoah8cp3alsp8p0uwh7hdvvz5wq3

## 1. Unpack the image:

```bash
$ zlib-flate -uncompress memdump.lime.z
```

## 2. Figure out what version of Linux the image is running:

```bash
$ strings memdump.lime | grep -i 'Linux version' | uniq

SWIMS: Linux Version: %04X
MESSAGE=Linux version 5.10.0-11-amd64 (debian-kernel@lists.debian.org) (gcc-10 (Debian 10.2.1-6) 10.2.1 20210110, GNU ld (GNU Binutils for Debian) 2.35.2) #1 SMP Debian 5.10.92-1 (2022-01-18)
Mar  2 16:45:35 hackme kernel: [    0.000000] Linux version 5.10.0-11-amd64 (debian-kernel@lists.debian.org) (gcc-10 (Debian 10.2.1-6) 10.2.1 20210110, GNU ld (GNU Binutils for Debian) 2.35.2) #1 SMP Debian 5.10.92-1 (2022-01-18)
Linux version 5.10.0-11-amd64 (debian-kernel@lists.debian.org) (gcc-10 (Debian 10.2.1-6) 10.2.1 20210110, GNU ld (GNU Binutils for Debian) 2.35.2) #1 SMP Debian 5.10.92-1 (2022-01-18)
```

## 3. Build a custom profile for Debian 10:

You can do this lots of ways – basically you will need a system.map for the running kernel, and you will need to combine it in an appropriately named zip file with `module.dwarf` – then put that zip file in your volatility profiles directory. Lots of good tutorials out there to do this – like https://andreafortuna.org/2019/08/22/how-to-generate-a-volatility-profile-for-a-linux-system/

## 4. Once you have a working profile:

First step is to see if we get lucky and he was running the IRC client when the memory image was created (shortened):

```bash
$ vol.py -f memdump.lime --profile=LinuxDebian1102x64 linux_pslist
Volatility Foundation Volatility Framework 2.6.1
WARNING : volatility.debug    : Overlay structure cpuinfo_x86 not present in vtypes
WARNING : volatility.debug    : Overlay structure cpuinfo_x86 not present in vtypes
Offset             Name                 Pid             PPid            Uid             Gid    DTB                Start Time
------------------ -------------------- --------------- --------------- --------------- ------ ------------------ ----------
0xffff9a010020af80 systemd              1               0               0               0      0x00000001010c2000 2022-03-02 22:45:38 UTC+0000
0xffff9a010020c740 kthreadd             2               0               0               0      ------------------ 2022-03-02 22:45:38 UTC+0000
0xffff9a0100208000 rcu_gp               3               2               0               0      ------------------ 2022-03-02 22:45:38 UTC+0000
0xffff9a01002097c0 rcu_par_gp           4               2               0               0      ------------------ 2022-03-02 22:45:38 UTC+0000
0xffff9a010020df00 kworker/0:0          5               2               0               0      ------------------ 2022-03-02 22:45:38 UTC+0000
0xffff9a0100234740 kworker/0:0H         6               2               0               0      ------------------ 2022-03-02 22:45:38 UTC+0000
.
.
.
.
0xffff9a0105470000 xfce4-terminal       950             1               1000            1000   0x0000000110bc6000 2022-03-02 22:46:06 UTC+0000
0xffff9a01019317c0 bash                 955             950             1000            1000   0x000000010469c000 2022-03-02 22:46:06 UTC+0000
0xffff9a015da48000 hexchat              959             779             1000            1000   0x0000000103b88000 2022-03-02 22:46:18 UTC+0000
0xffff9a0101b3c740 hexchat              972             959             1000            1000   0x0000000103a5e000 2022-03-02 22:46:49 UTC+0000
0xffff9a01055c4740 sudo                 977             955             1000            0      0x00000001024c0000 2022-03-02 22:46:57 UTC+0000
0xffff9a0101930000 insmod               978             977             0               0      0x0000000101b0c000 2022-03-02 22:46:57 UTC+0000
```

## 5. Review process listing:

He is running hexchat, next you can google or install hexchat locally to figure out where things are stored and how things are setup. Some quick googling reveals that the confing file will be in `hexchat.conf`, also while googling I found some previous mention about a file `servlist.conf` that used to hold credentials in earlier versions. I decided to do a bit more recon on the image, maybe get lucky with bash history:

```bash
$ vol.py -f memdump.lime --profile=LinuxDebian1102x64 linux_bash
Volatility Foundation Volatility Framework 2.6.1
WARNING : volatility.debug    : Overlay structure cpuinfo_x86 not present in vtypes
WARNING : volatility.debug    : Overlay structure cpuinfo_x86 not present in vtypes
Pid      Name                 Command Time                   Command
-------- -------------------- ------------------------------ -------
     955 bash                 2022-03-02 22:46:01 UTC+0000   ll
     955 bash                 2022-03-02 22:46:01 UTC+0000   git clone https://github.com/504ensicsLabs/LiME
     955 bash                 2022-03-02 22:46:01 UTC+0000   sudo apt install linux-headers-amd64 build-essential git
     955 bash                 2022-03-02 22:46:01 UTC+0000   sudo insmod ./lime-5.10.0-11-amd64.ko "path=/home/daniel/memdump.z format=lime compress=1"
     955 bash                 2022-03-02 22:46:01 UTC+0000   H?D?a?
     955 bash                 2022-03-02 22:46:01 UTC+0000   mkdir .ssh
     955 bash                 2022-03-02 22:46:01 UTC+0000   watch ls -lh memdump.z
     955 bash                 2022-03-02 22:46:01 UTC+0000   ATA??U??H??????H??tI?_?
     955 bash                 2022-03-02 22:46:01 UTC+0000   cat > .ssh/authorized_keys
     955 bash                 2022-03-02 22:46:01 UTC+0000   0
     955 bash                 2022-03-02 22:46:01 UTC+0000   cd
     955 bash                 2022-03-02 22:46:01 UTC+0000   ip addr
     955 bash                 2022-03-02 22:46:01 UTC+0000   logout
     955 bash                 2022-03-02 22:46:01 UTC+0000   cd src
     955 bash                 2022-03-02 22:46:01 UTC+0000   ?:?
     955 bash                 2022-03-02 22:46:01 UTC+0000   systemctl reboot
     955 bash                 2022-03-02 22:46:01 UTC+0000   make
     955 bash                 2022-03-02 22:46:01 UTC+0000   ls -l
     955 bash                 2022-03-02 22:46:01 UTC+0000   sudo apt install spice-vdagent
     955 bash                 2022-03-02 22:46:01 UTC+0000   ls -lh
     955 bash                 2022-03-02 22:46:01 UTC+0000   groups
     955 bash                 2022-03-02 22:46:01 UTC+0000   su
     955 bash                 2022-03-02 22:46:01 UTC+0000   sudo apt install neovim spice-vdagent hexchat
     955 bash                 2022-03-02 22:46:01 UTC+0000   ls
     955 bash                 2022-03-02 22:46:01 UTC+0000   cd sr
     955 bash                 2022-03-02 22:46:01 UTC+0000   cd LiME/
     955 bash                 2022-03-02 22:46:01 UTC+0000   sudo rmmod lime
     955 bash                 2022-03-02 22:46:01 UTC+0000   rm memdump.z
     955 bash                 2022-03-02 22:46:01 UTC+0000   sudo insmod ./lime-5.10.0-11-amd64.ko "path=/home/daniel/memdump.z format=lime compress=1"
     955 bash                 2022-03-02 22:46:01 UTC+0000   systemctl poweroff
     955 bash                 2022-03-02 22:46:01 UTC+0000   AWAVAUATUSH??8dH?%(
     955 bash                 2022-03-02 22:46:01 UTC+0000   watch ls -lh memdump.z
     955 bash                 2022-03-02 22:46:01 UTC+0000   apt search linux-image
     955 bash                 2022-03-02 22:46:25 UTC+0000   rm memdump.z
     955 bash                 2022-03-02 22:46:31 UTC+0000   cd LiME/
     955 bash                 2022-03-02 22:46:32 UTC+0000   ll
     955 bash                 2022-03-02 22:46:45 UTC+0000   sudo insmod ./lime-5.10.0-11-amd64.ko "path=/home/daniel/memdump.z format=lime compress=1"
     955 bash                 2022-03-02 22:46:51 UTC+0000   cd src/
     955 bash                 2022-03-02 22:46:52 UTC+0000   sudo insmod ./lime-5.10.0-11-amd64.ko "path=/home/daniel/memdump.z format=lime compress=1"
```

## 6. More recon:

Not much there except we know the user is `daniel`. More recon (abbreviated):

```bash
$ vol.py -f memdump.lime --profile=LinuxDebian1102x64 linux_lsof
Volatility Foundation Volatility Framework 2.6.1
WARNING : volatility.debug    : Overlay structure cpuinfo_x86 not present in vtypes
WARNING : volatility.debug    : Overlay structure cpuinfo_x86 not present in vtypes
Offset             Name                           Pid      FD       Path
------------------ ------------------------------ -------- -------- ----
0xffff9a010020af80 systemd                               1        0 /dev/null
0xffff9a010020af80 systemd                               1        1 /dev/null
0xffff9a010020af80 systemd                               1        2 /dev/null
0xffff9a010020af80 systemd                               1        3 /dev/kmsg
.
.
.
.
0xffff9a0101b3c740 hexchat                             972        9 anon_inode:[8059]
0xffff9a0101b3c740 hexchat                             972       10 <BAD d_dname pointer>
0xffff9a0101b3c740 hexchat                             972       11 /home/daniel/.config/hexchat/logs/NETWORK/server.log
0xffff9a0101b3c740 hexchat                             972       12 pipe:[17602]
0xffff9a0101b3c740 hexchat                             972       13 pipe:[17602]
0xffff9a0101b3c740 hexchat                             972       14 <BAD d_dname pointer>
0xffff9a0101b3c740 hexchat                             972       15 <BAD d_dname pointer>
0xffff9a01055c4740 sudo                                977        0 /dev/pts/0
0xffff9a01055c4740 sudo                                977        1 /dev/pts/0
0xffff9a01055c4740 sudo                                977        2 /dev/pts/0
0xffff9a01055c4740 sudo                                977        3 pipe:[16065]
0xffff9a01055c4740 sudo                                977        4 pipe:[16065]
0xffff9a01055c4740 sudo                                977        5 <BAD d_dname pointer>
0xffff9a01055c4740 sudo                                977        6 <BAD d_dname pointer>
0xffff9a0101930000 insmod                              978        0 /dev/pts/0
0xffff9a0101930000 insmod                              978        1 /dev/pts/0
0xffff9a0101930000 insmod                              978        2 /dev/pts/0
0xffff9a0101930000 insmod                              978        3 /home/daniel/LiME/src/lime-5.10.0-11-amd64.ko
```

## 7. Dump the open log file:

```bash
$ vol.py -f memdump.lime --profile=LinuxDebian1102x64 linux_find_file -F '/home/daniel/.config/hexchat/logs/NETWORK/server.log'
Volatility Foundation Volatility Framework 2.6.1
WARNING : volatility.debug    : Overlay structure cpuinfo_x86 not present in vtypes
WARNING : volatility.debug    : Overlay structure cpuinfo_x86 not present in vtypes
Inode Number                  Inode File Path
---------------- ------------------ ---------
         1056133 0xffff9a0101f838c0 /home/daniel/.config/hexchat/logs/NETWORK/server.log

$ vol.py -f memdump.lime --profile=LinuxDebian1102x64 linux_find_file -i 0xffff9a0101f838c0 -O server.log

$ cat server.log
**** BEGIN LOGGING AT Wed Mar  2 16:10:51 2022

Mar 02 16:10:51 FiSHLiM plugin loaded
Mar 02 16:10:51 Sysinfo plugin loaded
Mar 02 16:10:51 Checksum plugin loaded
Mar 02 16:10:51 Perl interface loaded
**** BEGIN LOGGING AT Wed Mar  2 16:46:44 2022

Mar 02 16:46:44 FiSHLiM plugin loaded
Mar 02 16:46:44 Sysinfo plugin loaded
Mar 02 16:46:44 Checksum plugin loaded
Mar 02 16:46:44 Perl interface loaded
Mar 02 16:46:44 *       Looking up utctf.live
Mar 02 16:46:44 *       Connecting to utctf.live (18.235.217.204:6667)
```

## 8. Pivot on irc server address:

At this point I thought it might be useful to grep through the actual memory dump itself for the `utctf.live` string, as this seemed unique enough to be useful (abbreviated):

```bash
$ strings memdump.lime | grep -i -B 2 -A 2 utctf.live
current
UNIX
utctf.live
libgstde265.so
startup.txt
--
.
.
.
.
N=utctf.live
P=6cf35d047000d30d39e07b2361668ae8a408db184f24641670f5e2ee0872d86c
E=UTF-8 (Unicode)
F=19
S=utctf.live/6667
N=2600net
E=UTF-8 (Unicode)
--
r.log
daniel
.
.
.
.
--

 Connecting to
29utctf.live
2318.235.217.204:6667
Directory tree generator.
```

## 9. Get lucky:

So we get a bit lucky here – `P=6cf35d047000d30d39e07b2361668ae8a408db184f24641670f5e2ee0872d86c` looks pretty promising as a password. We know from the challenge text that the flag won’t be in the usual format as well – and should be obvious. To be honest a long hash like this is not super obvious as a password – but we try to submit it and it is correct.

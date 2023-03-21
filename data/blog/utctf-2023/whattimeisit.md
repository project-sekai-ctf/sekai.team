---
title: UT CTF 2023 – What Time Is It?
date: '2023-03-12'
draft: false
authors: ['legoclones']
tags: ['UTCTF 2023', 'Forensics', 'Email']
summary: 'Decode a timestamp hidden in Gmail Content-Type boundary to determine the time the email was sent.'
canonical: 'https://justinapplegate.me/2023/utctf-whattimeisit/'
---

## What Time Is It? (Forensics, 911 Points)

> Super Secure Company’s database was recently breached. One of the employees self reported a potential phishing event that could be related. Unfortunately, our Linux email server does not report receiving any emails on March 2, 2023. >
>
> Can you identify when this email was actually sent? The flag format is `utflag{MM/DD/YYYY-HH:MM}` in UTC time.
>
> By Aadhithya (@aadhi0319 on Discord)
>
> Attachment: [phishing.eml](https://raw.githubusercontent.com/Legoclones/website/main/source/static/utctf-whattimeisit/phishing.eml).

### Initial Analysis

The provided phishing EML file looked like this:

```
MIME-Version: 1.0
Date: Thu, 2 Mar 2023 03:12:42 +0000
Message-ID: <CAODBzaAPrwTP=oDe6fkOv1a7LApXzv1m+YrYG9RHZM7tbBJRbw@mail.gmail.com>
Subject: Critical Security Incident - Action Required ASAP!
From:  Security Division <admin-notifications@supersecurecompany.com>
To: Jim Browning <jim.browning@supersecurecompany.com>
Content-Type: multipart/alternative; boundary="00000000000093882205f60cdcdb"

--00000000000093882205f60cdcdb
Content-Type: text/plain; charset="UTF-8"

Jim,

We have reason to believe that your Google account may have been
compromised. Please login as soon as possible at the following link in
order to secure your account. Thank you for your cooperation and swift
action to address this issue. Please feel free to reply to this email if
you have any questions. Do not email IT about this email as they are not in
the loop on account authorization issues.

https://supersecurecompany.gooogle.com/login/

Sincerely,
Security Division
Super Secure Company

--00000000000093882205f60cdcdb
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: quoted-printable

<div dir=3D"ltr"><div dir=3D"ltr"><div dir=3D"ltr"><div dir=3D"ltr"><div di=
r=3D"ltr"><div dir=3D"ltr"><div dir=3D"ltr"><div>Jim,</div><div><br></div><=
div>We have reason to believe that your=20
Google account may have been compromised. Please login as soon as=20
possible at the following link in order to secure your account. Thank=20
you for your cooperation and swift action to address this issue. Please=20
feel free to reply to this email if you have any questions. Do not email
 IT about this email as they are not in the loop on account=20
authorization issues.</div><div><br></div><div><a href=3D"https://supersecu=
recompany.gooogle.com/login/">https://supersecurecompany.gooogle.com/login/=
</a><br></div><div><br></div><div>Sincerely,</div><div>Security Division</d=
iv><div>Super Secure Company<br></div></div></div></div></div></div></div><=
/div>

--00000000000093882205f60cdcdb--
```

The flag is just when the email was sent. There’s a `Date` header in the email, but it was too obvious (and wasn’t correct when I tried). After scanning the whole file, I figured the forensics trick was to reverse engineer some seemingly random text to determine when it was sent. There were only 2 pieces of information that fit into this category - the `Content-Type boundary`, and the `Message-ID` header.

Doing a quick Google Search, I found [this great article](https://www.metaspike.com/dates-gmail-message-id-thread-id-timestamps/) about hiding timestamps in Gmail Message IDs. However, after looking through other articles and rereading this one a few times, I realized it wouldn’t work. One line says:

```
Please note that the Gmail Message ID of a message is different than its Message-Id
header field which might look something like this:

Message-Id: <13eba327.EAAAAO8sA-QAAcgxWv4AAAd9o_wAAAAIijYAAAAAAAYklQBfFbYb@mailjet.com>
```

We had the Gmail message ID, which is different than the actual `Message-ID` header, which is why the decoding process didn’t work.

### Boundary Timestamp

Turning to the other piece of information, I found that [Part 2 in the series of the above article](https://www.metaspike.com/gmail-mime-boundary-delimiter-timestamps/) was actually about hidden timestamps in Gmail `Content-Type` boundaries. The decoding process was fairly easy.

```
Given --> 00000000000093882205f60cdcdb

1. Extract numbers:
    Part 1 --> 938822 (first 6 non-0 hex chars)
    Part 2 --> 05f60cdc (next 8 hex chars)

2. Append Part 1 to Part 2:
    05f60cdc938822

3. Convert to decimal
    0x05f60cdc938822 = 1677909984249890

4. Convert to timestamp (using epochconverter.com)
    1677909984249890 = Saturday, March 4, 2023 6:06:24.249 AM
```

**Flag:** `utflag{03/04/2023-06:06}`

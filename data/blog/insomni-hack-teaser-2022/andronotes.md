---
title: Insomni'hack teaser 2022 – AndroNotes
date: '2022-01-30'
draft: false
authors: ['blueset']
tags: ["Insomni'hack teaser 2022", 'Forensics', 'Android']
summary: 'A rooted Android phone could be handy sometimes.'
---
## AndroNotes
> by Dai
>
> Our Forensic experts dumped the mobile device of a criminal, can you identify what the thugs are up to...
> 
> This challenge can be solved offline.
>
> [dump.img](https://static.insomnihack.ch/media/dump-23a51cd1a485489bc9913641c06de94f85cd2a358b573f965ce59d928acb6297.img)  
> [mirror of dump.img](https://mega.nz/file/SDpCxIwb#YI7BP2P22Pya75n_gx86bwX5Ic5U9qcL2lGAE1_2JHo)

Mounting the IMG, we can see an entire Android filesystem. 

Looking at the SMS database (SQLite) at `/data/data/com.android.providers.telephony/databases/mmssms.db`, we can find the following messages:

```
sqlite> select * from sms;
1|3|6505551212||1640171169759|1640171169000|0|1|-1|1|0||Hi James, I've configured the server please keep the password in a safe place mate! The website contains sensitive information about mrna-1273!

Best||0|1|0|com.google.android.apps.messaging|1
2|3|6505551212||1640171277362|0||1|-1|2|||Hi H, it is in my Safe Note app. One of the most secure with military grade encryption mechanisms. 💯💯||0|1|-1|com.google.android.apps.messaging|1
3|3|6505551212||1640171303660|1640171303000|0|1|-1|1|0||Nice, Funds are Safu !||0|1|0|com.google.android.apps.messaging|1
4|3|6505551212||1640171330546|0||1|-1|2|||😜😷🤑👨‍🔬||0|1|-1|com.google.android.apps.messaging|1
```

The second message is referring to the [Safe Notes](https://play.google.com/store/apps/details?id=com.protectedtext.android&hl=en_US&gl=US) app which is also installed in the dumped device.

Install the app on a rooted Android device, write some notes, and observe the data folder of the app (`/data/data/com.protectedtext.android`), it is easy to see that the notes are encrypted and stored in `shared_prefs/com.protectedtext.n2.xml`.

Look for the same file in the dump image, copy it over and overwrite it on your device and restart the app. The flag can be found a note in the app.


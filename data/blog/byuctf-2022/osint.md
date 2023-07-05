---
title: BYUCTF 2022 – OSINT Compilation
date: '2022-05-30'
draft: false
authors: ['enscribe']
tags: ['BYUCTF 2022', 'OSINT']
summary: 'Write-ups for all 9 OSINT challenges in BYUCTF 2022.'
canonical: 'https://enscribe.dev/ctfs/byu/osint/osint-compilation'
---

<TOCInline toc={props.toc} asDisclosure />

So, we played BYU CTF 2022. There were **9 OSINT challenges**. 9. It was absolutely party-time for a CTF player w/ OSINT-emphasis like me, and a tragedy for people who dislike the inherently guessy nature behind the genre. Our team managed to solve them all, so here was our (albeit flawed) thought process behind it.

**Important note**: Some of our lines of reasoning don’t make sense at all. That’s normal for this category, and it comes from a shit ton of brainstorming and guesswork. I’ll try my best to include wrong paths that we took, but for the sake of brevity some of it will be omitted.

Oh, also, here is a haiku to express my carnal, passionate, burning hatred for OSINT:

> _”Eternal Resentment”_  
> Submerged in my tears,  
> I yearn for painless release.  
> The dreadful OSINT...  
> — enscribe

Thank you, and enjoy.

---

## 🐼 I don’t dream about noodles, dad

> Whose signature is found beneath Po’s foot?  
> Flag format - `byuctf{Firstname_Lastname}`

![Picture of a figure of Kung-fu Panda](/static/images/byuctf-2022/osint/po1.png)

I did a quick [Google Lens](https://lens.google/) search with my phone with the keyword “BYU” attached and [this](https://universe.byu.edu/2012/09/27/5-campus-locations-you-didnt-know-existed/) article turned up:

![Section 5. Po, the ‘Kung-Fu Panda’ of the article “Campus attractions you didn’t know existed”](/static/images/byuctf-2022/osint/po2.png)

> Jason Turner is a BYU computer science program graduate who works at DreamWorks and created all the data for Po’s character. The statue is a tribute to his success, as well as the University’s program and alumni.

Since the tribute is for Jason Turner, we can assume the signature is below his foot. The flag is `byuctf{Jason_Turner}`.

---

## 🌐 Oh The Vanity

> The vanity and audacity of these scammers and their phishing attacks are just getting ridiculous. I read an article this month about a new way to mask phishing campaigns. They even included this photo. Find the date the article was published.  
> Flag format: `byuctf{mm-dd-yyyy}`

![Picture of a shark and a gold fish in water with their head swapped](/static/images/byuctf-2022/osint/sharky1.png)

Reverse Google Search with “phishing” crib:

![Google Image search result](/static/images/byuctf-2022/osint/sharky2.png)

> [Vanity URLs Could Be Spoofed for Social Engineering Attacks](https://www.darkreading.com/cloud/vanity-urls-could-be-spoofed-for-social-engineering-attacks) by Robert Lemos, published on Dark Reading on 11 May, 2022.

The Vanity URL article was published on May 11th, 2022.
The flag is `byuctf{05-11-22}`.

---

## 🧗‍♀️ B0uld3r1ng

> I met a guy named Sam while climbing here in California. Can’t remember what it’s called though. Kinda looks like reptilian don’t you think?

Once again, I used Google Lens to figure out where the location of this image was. Turns out to be a place called the `Lizard’s Mouth Rock` in Santa Barbara County, California:

<figure>
![Google Maps screenshot of “Lizards Mouth Rock”](/static/images/byuctf-2022/osint/bouldering1.png)
<figcaption><a href="https://goo.gl/maps/qB9kE955f42UVuP9A">Lizards Mouth Rock</a> on Google Maps</figcaption>
</figure>

The image given to us is a direct screenshot of an image posted by Maps contributor [Jonathan P.](https://www.google.com/maps/contrib/104742787928495148360), although that has little relevance to the challenge.

Moving on, although we have the location of the image taken the flag is in _explicit format_, meaning that it’s somewhere on the internet wrapped with `byuctf{...}`. We noticed that a guy named “Sam” was mentioned, so we guessed that we could find him leaving a review of the place on a platform.

We checked through the following platforms: Yelp, Google Reviews, TripAdvisor, AllTrails⁠—yet, we couldn’t find a recent reviewer by the name of Sam. Luckily, one of my team members searched up “Bouldering Lizard’s Mouth” (based on the challenge name) and happened to stumble across [this website](https://www.mountainproject.com/area/105885134/the-lizards-mouth):

<figure>
![Entry of “The Lizard’s Mouth” on Mountain Project](/static/images/byuctf-2022/osint/bouldering2.png)
<figcaption><a href="https://www.mountainproject.com/area/105885134/the-lizards-mouth">The Lizard’s Mouth</a> on Mountain Project</figcaption>
</figure>

We scrolled down to the “Reviews” section and found this:

![A comment by Samuel Sender](/static/images/byuctf-2022/osint/bouldering3.png)

Hey, look! A Sam! Let’s check out their [profile](https://www.mountainproject.com/user/201354492/samuel-sender):

![Profile page of Samuel Sender on Mountain Project, the flag is written in the Other Interests section.](/static/images/byuctf-2022/osint/bouldering4.png)

The flag is `byuctf{ju5t_5end_1t_br0_v8bLDrg}`.

---

## 💧 Squatter’s Rights

> Somehow, somewhere, something in this picture has a flag, but my friend Blue Orca won’t tell me where it is!!!! Can you help me??

![A screenshot of Google Street View, with a view of road, a water tower, and a sign of Pioneer [redacted]e mu[redacted].](/static/images/byuctf-2022/osint/squatter1.png)

Hey, look! Another Google Lens problem! Although there’s a lot of blue water towers out there, I luckily stumbled across one that looked really similar in Flint, Michigan:

![Mobile screenshot of Google Lens search of the water tower](/static/images/byuctf-2022/osint/squatter2.png)

Going to the [webpage](http://www.eureka4you.com/water-michigan/MI-Flint1.htm), it mentions that this water tower is in “Genesee County. Mid Michigan.”, so with a quick Maps search I stumble across the “Wyatt P. Memorial Water Tower”:

<figure>
![Screenshot of “Wyatt P. Memorial Water Tower” on Google Maps](/static/images/byuctf-2022/osint/squatter3.png)
<figcaption><a href="https://goo.gl/maps/SkomGLvvnuVgRtPj9">Wyatt P. Memorial Water Tower</a> on Google Maps</figcaption>
</figure>

This is where the rabbit hole begins. I looked around the reviews section of this place and found the absolute weirdest, most hilarious reviews of all time:

> **Robert Skouson**  
> In all my days, I have never seen such a magnificent water tower. Being in its presence has given me powers beyond comprehension. I have mastered flight in the downward direction. I have 100% recall of events that happened to me in the last 5 minutes. I have also discovered I am completely invisible when no one is looking. This water tower has changed my view of who I am, and my ultimate potential.

This guy even claims it to be holy water:

> **Nicholas Martinez**  
> This water from Wyatt P. Memorial Water tower has changed the way I see water, and drink it. Everytime I see this water tower, it makes me want quality water. Forget Poland Spring or Fiji. This is quality water! You know how in the Book of John Chapter 2, the Savior Jesus Christ turned water into wine? Well he actually turned already good wine to water from Wyatt P. Memorial Water tower.

This one might be my favorite:

> **McKay Lush**  
> Professionally speaking as a water tower enthusiast, this has to be one of the best water towers that I’ve ever visited and I’ve visited thousands. The divine structure of the 10 legs leading to the plumply, robust water basin is enough to get any man excited. The satisfying twang as you bang the side wall sends shivers down even the most hardened of souls. Never before has such a feat been attempted and accomplished. Truly this should be the EIGHTIETH WONDER OF THE WORLD.

I actually stumbled across the person it’s named after, _Wyatt Pangerl_, and I was super curious as to what the hell was going on:

![Screenshot of the review by Wyatt Pangerl, with a picture of a man sitting on the top of a car by the road next to the water tower.](/static/images/byuctf-2022/osint/squatter4.png)

So I opened a ticket. Turns out, this Wyatt guy, a member of their team, managed to get the water tower named after himself after a series of divine, godlike social engineering strategies (assumedly to the county) and exploitation of the [Squatter’s Rights](https://homeguides.sfgate.com/squatters-rights-law-california-45887.html) law in California. He also claimed the location on Google Maps and put his burner phone there as well, which we called (he didn’t pick up). When I found his Facebook (will not disclose), I saw a multitude of his friends commenting hilarious crap, calling him “ICONIC” and a “LEGEND” for managing to make it happen.

Yet, there was no flag.

I continued to look around and managed to fall deeper into the rabbit hole, OSINT-ing everything between the model of [Wyatt’s car](https://www.kbb.com/chrysler/crossfire/2006/), a Chrysler Crossfire 2006 (🤣) to where his parents file taxes... I even managed to get an award from a head admin for being a dumbass:

![A screenshot of a Discord message sent by ohCoz, where the message contains a picture of a certificate that reads: Certificate of achievement, This certificate is presented to enscribe for their outstanding work in dividing headfirst into a rabbit hole the size of mars](/static/images/byuctf-2022/osint/squatter5.png)

Then, while on the go, I checked the location on my phone... And look what we’ve got:

![Screenshot of “Wyatt P. Memorial Water Tower” on Google Maps for Android](/static/images/byuctf-2022/osint/squatter6.png)

Apparently for whatever stupid, scatter-brained, vapid, moronic reason this “From the owner” section isn’t on Google Chrome. Screw you Wyatt, and your majestic, plump, baby-blue water tower. The flag is `byuctf{h0w_d1d_1_st34l_4_w4t3r_t0w3r}`. Once again, screw you Wyatt. I hope your taxes are messed up forevermore.

> **Editor’s note:** The “From the owner” section can be found on the knowledge card of the [main search result of “Wyatt P. Memorial Water Tower”](https://www.google.com/search?q=Wyatt+P.+Memorial+Water+Tower).

---

## 💾 Okta? More like OhNah

> Recently, the group known as LAPSUS$ released indications they breached Microsoft & one of the Largest SSO companies, Okta. In some of their leaks they hinted that “most of the time if you don’t do anything like \_\_\_\_\_\_\_\_ you won’t be detected.”.  
> flag: `byuctf{answer_Timestamp in format: HH:MM}` two word answer separated by an underscore.

Looks like a challenge regarding an infamous hacking group. Seeing that the flag asks for a timestamp and the language is pseudo-colloquial, I’d safely assume that this text mentioned somewhere came from a messaging board. I downloaded _Telegram_, their main method of communication with the real world, joining their [announcements board](https://t.me/minsaudebr), yet upon a <kbd>Ctrl</kbd> + <kbd>F</kbd>, I couldn’t find this message anywhere. Their board mentions a [group chat](https://t.me/saudechat), but it was recently purged and terminated. When the admin confirmed that this wasn’t the intended solution, I moved towards looking for screenshots surrounding the Okta leak. Our team found this [tweet from John Hammond](https://twitter.com/_JohnHammond/status/1506166671664463875) after a while:

<blockquote className="twitter-tweet">
<p lang="en" dir="ltr">even da big ones<br/>[shocked pikachu] <a href="https://t.co/YsvMMNQDPG">pic.twitter.com/YsvMMNQDPG</a></p>&mdash; John Hammond (@_JohnHammond) <a href="https://twitter.com/_JohnHammond/status/1506166671664463875?ref_src=twsrc%5Etfw">March 22, 2022</a>
![A screenshot of the tweet by John Hammond](/static/images/byuctf-2022/osint/okta1.png)
</blockquote> <script async src="https://platform.twitter.com/widgets.js"></script>

The flag is `byuctf{port_scanning_11:22}`.

A hint was later added to the challenge:

> think screenshots! it is not on telegram but another platform with that same first letter. tweeted by a famous red head i think

Would have been easier. Love you, John Hammond.

---

## 🔪 Murder Mystery

> While searching for secrets of the past, you find a scrap of paper that contains the following information:  
> `0110111001110010011010000111000001101001011001000100110001001011110100001111`  
> June 29, 1902  
> Because you’re great at OSINT, you trace this information back to a famous inscription. What is that inscription?
>
> Flag - `byuctf{inscription_with_underscores}`  
> Note, the flag will not include the name or dates found in the inscription.

Instantly, we moved to [Cyberchef](https://gchq.github.io/CyberChef/) for the binary conversion, and it resulted in `nrhpidLKÐ`. We thought it was garbage at first, until a teammate noticed “NRHP ID” within the string, which is related to the [National Register of Historic Places](https://history.idaho.gov/nrhp/). Since there’s a historic date also in the description, we can immediately conclude that this is the correct path to take. We isolated the last part and converted it into decimal instead - 80002319.

Following the trail for _NRHP ID 80002319_, we found this [UpWiki Page](https://en.upwiki.one/wiki/Jesse_James_Home_Museum) About the “Jesse James Home Museum”, which is the location registered under this ID.

When I looked up “jesse james famous inscription”, I found a [Smithsonian Magazine](https://photocontest.smithsonianmag.com/photocontest/detail/the-original-grave-site-of-jesse-james-located-in-the-yard-of-the-james-fam/) page that photographs Mr. Jame’s grave:

![A picture of a grave which engraves: Devoted husband and father Jesse Woodson James Sept. 5, 1847, Murdered Apr. 3, 1882 by a traitor and coward whose name is not worthy to appear here. James](/static/images/byuctf-2022/osint/mystery1.png)

Removing the dates and names as the description specifies, the flag is `byuctf{murdered_by_a_traitor_and_coward_whose_name_is_not_worthy_to_appear_here}`.

---

## 🎂 Buckeye Billy Birthday

> Buckeye Billy, our lovely, nutty, history loving friend, has a birthday coming up! Billy is as cryptic as can be, and we have no idea what to get him for his birthday. We did find three hints on written on his desk. Can you help us find where we should buy a gift from?  
> [Hint 1](https://mywordle.strivemath.com/?word=sokhc) [Hint 2](https://mywordle.strivemath.com/?word=yocod) [Hint 3](https://mywordle.strivemath.com/?word=lffep)

`byuctf{storename}`

I took a look at the three hints, and they were Wordle games that resulted in `WATER`, `CALLS`, and `PROBE`. Since we were looking for a shop (meaning a location), we immediately turned to [what3words](https://what3words.com/) and stumbled across [this location](https://what3words.com/water.calls.probe) in Charlotte, Ohio:

![A screenshot of what3words on the location ///water.calls.probe (35.242602, -80.89268)](/static/images/byuctf-2022/osint/bday1.png)

We tried a couple of stores around the area to no avail, until an admin told us in a ticket that we were in the wrong place. By extension, we decided to try out various permutations of `water`, `calls` and `probe`:

| what3word address                                        | Location                  |
| -------------------------------------------------------- | ------------------------- |
| [///water.calls.probe](https://w3w.co/water.calls.probe) | Charlotte, North Carolina |
| [///calls.water.probe](https://w3w.co/calls.water.probe) | Detroit, Michigan         |
| [///probe.water.calls](https://w3w.co/probe.water.calls) | Houston, Texas            |
| [///water.probe.calls](https://w3w.co/water.probe.calls) | Cincinnati, Ohio          |
| [///calls.probe.water](https://w3w.co/calls.probe.water) | Albuquerque, New Mexico   |
| [///probe.calls.water](https://w3w.co/probe.calls.water) | Eastbourne, London        |

Most of them were bogus except [///water.probe.calls](https://what3words.com/water.probe.calls), which was on E. McMillan St, Cincinnati, Ohio. We assumed it was correct (and admin later confirmed) because the nickname “Buckeye Billy” comes from the fact that he loves the [Ohio State University Buckeyes](https://ohiostatebuckeyes.com/) football team. (Bonus: The Ohio Buckeye is a type of nut, and the description says that he is “nutty”). Our teammate somehow connected “history-loving” to old stores in Cincinnati, Ohio, and upon a Google search we found:

![A screenshot of Google search of the keywords “oldest stores in cincinnati mcmillan street” and a result that points to https://www.greaters.com/about-us/our-history](/static/images/byuctf-2022/osint/bday2.png)

The flag is `byuctf{graeters}`. This was a guessy challenge, so don’t feel dumb. I felt dumb too.

---

## 💬 Buckeye Billy Blabbin’

> Buckeye Billy discovered social media. And probably posts too much. Try to see what you can find. for this problem and others!  
> Flag will be completely visible once solved! You will see `byuctf{}`.

Step 0 is to find his social media account, which we did by searching “Buckeye Billy” on [Twitter](https://twitter.com/William_buckeye):

![Search suggestions of “Buckeye Billy” on Twitter, with the third suggestion to be the account we need.](/static/images/byuctf-2022/osint/blabbin1.png)

We scoured his Twitter account on the Wayback Machine for it to no avail (and even found some [deleted stuff](https://web.archive.org/web/20220415232856/https://twitter.com/William_buckeye/status/1515109844771999745) from a previous internal CTF).

I slowly began to despise him... that Buckeye Billy. That stupid, perfectly circular nuthead with the even stupider BYU sombrero. We gave up on the challenge and I cried to the admin until he got annoyed and agreed to post a global hint:

> the more billy tweeted about something, the more of a hint it might be. The flag is on his account someplace.

He tweeted a lot about song lyrics:

![A screenshots of 4 tweets of @William_buckeye, each featuring a verse of lyrics of different song.](/static/images/byuctf-2022/osint/blabbin2.png)

We decided it would be best to create a list of songs, in addition to counting occurrences of topics he discussed (for brainstorming purposes). We ended up with this list:

> Songs:
>
> - Boulevard of Broken Dreams
> - The Sound of Silence
> - 3 Words
> - One Place
> - Greater
> - Ice Cream
> - Man in the Mirror
> - Magic Mirror
>
> Places:
>
> - BYU Creamery
> - Rancherito’s Mexican Food
> - Buc-ees
> - Bricks Clothing
>
> Topics:
>
> - Pigeons (5×)/Birds (7×)
> - Cats (6×)
> - Michael Jackson (5×)
> - Ohio State Buckeyes (5×)
> - Chili/Sports Game Food (4×)
> - Fortnite (3×)
> - Star Wars (3×)
> - Hockey (3×)
> - Basketball (1×)
> - BYU Cosmo (1×)

Hey, check that out in the _Songs_ list. _“3 Words”_, _“One Place”_, _“Greater”_, _“Ice Cream”_? That sounds a lot like our previous challenge, _Buckeye Billy Birthday_. Looks like these were meant to be solved in tandem. By extension, _“Man in the Mirror”_ and _“Magic Mirror”_ were also hinted at, and we found a [tweet](https://twitter.com/William_buckeye/status/1515113600750219265) of Billy posing in front of a mirror with a BYU hat. Uncoincidentally, this is the only mention of BYU in his entire profile (I believe):

<blockquote class="twitter-tweet">
<p lang="en" dir="ltr">thanks <a href="https://twitter.com/byu_cosmo?ref_src=twsrc%5Etfw">@byu_cosmo</a> for the great hat! <a href="https://t.co/IbPentkUgE">pic.twitter.com/IbPentkUgE</a></p>&mdash; #1 Buckeye Fan billy (@William_buckeye) <a href="https://twitter.com/William_buckeye/status/1515113600750219265?ref_src=twsrc%5Etfw">April 15, 2022</a>
![A screenshot of a tweet by @William_buckeye featuring a picture of a bathroom with a stick figure drawn on the window](/static/images/byuctf-2022/osint/blabbin4.png)
</blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

My team used steganography tools on this image, and lo and behold:

![A randomly color-mapped version of the picture, zoomed in to the window frame, a line of magenta text can be found on the picture which says the flag.](/static/images/byuctf-2022/osint/blabbin5.png)

The flag is `byuctf{t@lk_0sinty_t0_m3}`. Also an extremely guessy challenge. Screw you, Buckeye Billy. And Wyatt too, if you’re reading.

---

## 🎶 43

> It’s at your fingertips!! Who made this code?  
> `S fsu om yjr aogr 3"45`  
> Flag format - `byuctf{blank_blank}`

Looks like something the [DCode Cipher Identifier](https://www.dcode.fr/cipher-identifier) could figure out:

```text
dCode’s analyzer suggests to investigate:
Keyboard Shift Cipher ■■■■■■■■■▪
Substitution Cipher   ▪
Shift Cipher          ▪
Homophonic Cipher     ▫
ROT Cipher            ▫
```

I threw it into their [Keyboard Shift Cipher](https://www.dcode.fr/keyboard-shift-cipher) and got this:

```text
qwerty → A day in the \ife 2:34
qwerty ← D gdi p, ukt spht 4A56
qwerty ↓↻ W va7 ln ume slf4 e:v6
qwerty ↑4 S fsu om yjr aogr 3_45
qwerty ↓4 S fsu om yjr aogr 3{45
```

_“A Day in the Life”_ is a song by the [Beatles](https://www.youtube.com/watch?v=usNsCeOV4GM?t=154) (a fascinatingly good one too), and I took a look the decoded timestamp `2:34` in the music video:

![A screenshot of the music video of A Day in the Life of Beatles paused at 2:34.](/static/images/byuctf-2022/osint/43-1.png)

Although I couldn’t find who the person in the timestamp was, someone in the comments named the individuals at timestamps:

> **Carl Anderson** _3 weeks ago_
>
> 0:20 Mick Jagger (Rolling Stones)  
> 0:20-1:43 Marianne Faithfull (singer)  
> 1:03 Keith Richards (Rolling Stones)  
> 1:31 Donovan (singer)  
> 0:48 George Martin (producer)  
> 1:18-1:36 Pattie Boyd (model)  
> 3:00 Marijke Koger (fashion designer)  
> 3:31 Michael Nesmith (Monkees)
>
> 166 likes, 4 replies

![43-3](/static/images/byuctf-2022/osint/43-3.png)

The guy at 3:31 is the same as the guy at 2:34, so it’s Michael Nesmith from the Monkees.

Looking up “Monkees 43” on Google, we discover that there’s actually an old website called [monkeesrule43.com](https://www.monkeesrule43.com/articles.html).

This is where you guess all the names of the Monkees. Not sure of the logical thought process yet. Flag is `byuctf{micky_dolenz}`.

---

## Solvers

- 🐼 I don’t dream about noodles, dad: **enscribe**
- 🌐 Oh The Vanity: **sahuang**
- 🧗‍♀️ B0uld3r1ng: **sahuang**, enscribe, Battlemonger
- 💧 Squatter’s Rights: **enscribe**, sahuang
- 💾 Okta? More like OhNah: **Battlemonger**, enscribe
- 🔪 Murder Mystery: **Battlemonger**
- 🎂 Buckeye Billy Birthday: **Battlemonger**, sahuang, enscribe
- 💬 Buckeye Billy Blabbin’: **Battlemonger**, enscribe
- 🎶 43: **Battlemonger**, neil, enscribe

Thanks Battlemonger for carry!

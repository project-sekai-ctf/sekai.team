---
title: Ugra CTF Quals 2022 – Играет как умеет
date: '2022-03-01'
draft: false
authors: ['blueset', 'sahuang']
tags: ['Ugra CTF Quals 2022', 'Misc', 'PDF', 'Music', 'Audio Processing', 'Talking Piano']
summary: 'Talking piano illusion only works if you know the words, but what if you only sort of know them?'
---

## Играет как умеет (Plays the best he can, `symphony`, 350)

> Один композитор при зарубежном военном оркестре, состоящем из людей на букву Y, написал симфонию.
> 
> Неподготовленному слушателю может быть трудно расслышать в ней всё, что нужно, поэтому автор любезно предлагает начать с разминки.
> 
> ---
> 
> One composer with a foreign military band, consisting of people with the letter Y, wrote a symphony.
>
> It can be difficult for an unprepared listener to hear everything that is needed in it, so the author kindly suggests starting with a warm-up.
>
> (Google Translate)
>
> Attachments: `symphony.pdf`, `warmup.pdf`

See also: [Official write-up (Russian)](https://github.com/teamteamdev/ugractf-2022-quals/blob/master/tasks/symphony/WRITEUP.md)

Inspecting the attachments, we can see the PDFs are sheet music with some rather intersting patterns: super fast [tempo](https://en.wikipedia.org/wiki/Tempo) (1500 BPM), full bar [rests](https://en.wikipedia.org/wiki/Rest_(music)) are written as 4 quarters rests instead of a full rest, all [notes](https://en.wikipedia.org/wiki/Musical_note) are quarter notes, the “[chords](https://en.wikipedia.org/wiki/Chord_(music))” are very packed and spans across an unusually wide range of [octaves](https://en.wikipedia.org/wiki/Octave).

![Preview of symphony.pdf](/static/images/ugra-ctf-quals-2022/symphony/sheet.png)

When I first saw the sheet, my first idea was to look for an Optical Music Recognition (OMR) tool and play it. However, due to the fact that the chords are too packed, no OMR tool we tried was able to handle them.

Inspecting further into the PDF files, the metadata suggests that the PDFs are generated with [GNU LilyPond](http://lilypond.org/), a music notation software. Although no LilyPond source was embeded, nor decompile tool was found for LilyPond PDFs, fortunately the PDF was drawn with rather simple elements: glyphs, lines and rectangles.

With the rather structural format of the sheets, we can parse the elements in the PDF and attempt to reconstruct a MIDI out of it.

We first pulled out [PDFMiner](https://pypi.org/project/pdfminer/) to convert the PDF into XML for easier parsing.

While reading the XML output, we realized that it defaults to `WinAnsiEncoding` for non-standard fonts which can be confusing for CIDs less than 32, I adjusted the source for it to output the raw CID for any CID below 4. (The musical notation font embeded only has 4 glyphs: Note Head (𝅘), Quarter Rest (𝄽), [Common Time](https://en.wikipedia.org/wiki/Time_signature#common_time) (𝄴), and [G Clef](https://en.wikipedia.org/wiki/Clef#G-clefs) (𝄞).)

<figure>
<img alt="A wireframe illustration of a parsed PDF page" src="/static/images/ugra-ctf-quals-2022/symphony/wireframe.svg" />
<figcaption>A wireframe illustration of a parsed PDF page, colored in purple are the G Clefs, in red are the note heads, in green are the quater rests, and in black are the note stems.</figcaption>
</figure>

As we know, the placement of G Clefs on the [staff](https://en.wikipedia.org/wiki/Staff_(music)) signifies the key of all notes on the same staff, we can use the clefs as a reference to determine the key based on their relative Y-axis difference. Since the G Clefs are placed on the most common location, we can know that [middle C](https://en.wikipedia.org/wiki/C_(musical_note)#Middle_C) would be on the first [ledger line](https://en.wikipedia.org/wiki/Ledger_line) below the staff.

With the following information, we can write a script to reconstruct the MIDI from the parsed PDF.

* Coordinate of the G Clefs, to determine the placement of staffs
* Coordinate of the quarter rests and note stems, to determine which staff they belongs to, and  
  <small>Find the G Clef that overlaps the most with the rest/note stem in Y-axis.</small>
* Coordinates of the note heads, to determine which note stem they belong to, and their pitches.  
  <small>Find which note stem overlaps with the note head, trace back to the G Clef on the same staff to fint the pitch with the Y-axis difference.</small> 

Using the parsed timing and pitch information, we reconstructed the MIDI using [MIDIUtil](https://github.com/MarkCWirt/MIDIUtil). Opening the MIDI file with a [Piano Roll](https://en.wikipedia.org/wiki/Piano_roll) editor, we can see a very characteristic pattern.

![Piano roll view of the reconstructed MIDI](/static/images/ugra-ctf-quals-2022/symphony/piano-roll.png)

The pattern resembles the shape we commonly see in spectrograms of human speech, of which we can further confirm when we plot the same MIDI with frequency as the Y-axis.

<figure>
<img alt="A secton of the frequency plot of the music score" src="/static/images/ugra-ctf-quals-2022/symphony/parsed-spectrogram.png" />
<figcaption>A secton of the frequency plot of the music score</figcaption>
</figure>
<figure>
<img alt="A spectrogram of human speech" src="/static/images/ugra-ctf-quals-2022/symphony/spectrogram.png" />
<figcaption>An example of a spectrogram of human speech[^1]</figcaption>
</figure>

[^1]: Can you figure out what’s said in this piece of audio clip? 4.2 seconds, 0 ~ 5 kHz.

This reminds me of _Talking Piano Illusion_ – an [auditory illusion](https://en.wikipedia.org/wiki/Auditory_illusion) where despite only hearing a piano playing, when some words are shown in front of you, the piano sound would turn into voice in your brain. This is conducted with the sound played on the piano matching with certain frequences of the spoken words. While listening to them alone would not make any sense, once the words are shown to you, your brain will automatically bridge the gap to allow you “hear” the words.

However, the illusion would only work if you already know the words, but in an CTF, you are supposed to figure out what was actually spoken. We have tried to adjust the instruments and tempo to make it sound more like the speech, but with no promising result. As given in the “warm-up” sheet, the instrument is indicated as “Blown Bottle”, which is one of the [General MIDI Program instruments](https://en.wikipedia.org/wiki/General_MIDI#Pipe). We definitely tried that too, but it did not sound much better.

Inspired by [Game & Gig](https://www.youtube.com/watch?v=3UnPEcfqduw), we decided to try playing it with [Sine Wave](https://en.wikipedia.org/wiki/Sine_wave) as the instrument. This time it sounds much better, despite that we still cannot make out the full flag. We used [Nekodigi/Midi](https://github.com/Nekodigi/Midi/) for this purpose, and this is what we got.

<figure>
<audio style={{width: "100%"}} src="/static/images/ugra-ctf-quals-2022/symphony/symphony.ogg" controls />
<figcaption>symphony.ogg (860 KB)</figcaption>
</figure>

Since we know that this is going to be a flag, the format would be `ugra_<word>_<word>_..._<hex>`. So the first 5 clusters must be corresponding to U, G, R, A, and \_. With this piece of information, we can partially recognize some of the words read.

> uniform, <small>wauw</small>, romeo, <small>awa</small>, underscore, <small>owo</small>, <small>aoao</small>, <small>o-aa</small>, <small>rourou</small>, underscore, <small>aoao</small>, bravo, november, <small>aotrao</small>, <small>etrim</small>, <small>aotrao</small>, romeo, underscore, <small>ueiao</small>, <small>yeo</small>, romeo, <small>weio</small>, romeo, <small>waowao</small>, <small>wauw</small>, <small>rokan</small>, <small>uall</small>, underscore, <small>wauw</small>, <small>uoyo</small>, <small>brovia</small>, <small>brovia</small>, <small>uoyo</small>, <small>oh</small>, <small>haka</small>, <small>ayhao</small>

So, when do we read U as “uniform”?

That’s right. It’s the [NATO phonetic alphabet](https://en.wikipedia.org/wiki/NATO_phonetic_alphabet), and now the first 5 words makes sense.

> uniform, golf, romeo, alfa, underscore...

And so does the _warmup_ audio.

<figure>
<audio style={{width: "100%"}} src="/static/images/ugra-ctf-quals-2022/symphony/warmup.ogg" controls />
<figcaption>warmup.ogg (819 KB)</figcaption>
</figure>

> alfa, bravo, charlie, delta, echo, foxtrot, golf, hotel[^2], india, juliett, kilo, lima, mike, november, oscar, papa, quebec, romeo, sierra, tango, uniform, victor, whiskey, x-ray, yankee, zulu, underscore, zero, one, two, tree, four, five, six, seven, eight, niner

[^2]: this was pronunced as something like /ˈhōtō/ instead of /hōˈtel/.

However, even we have the full alphabet, it is still hard for a human to match up one to another. We had to resort to comparing the flag against the alphabet using data.

Both _symphony_ and _warmup_ are pretty well divided between words. We can easilly break down the sheet into words when two clusters are over 5 [bars](https://en.wikipedia.org/wiki/Bar_(music)) apart. Once we have the set of clusters in both sheets, we can compare the ones from _symphony_ against each cluster in _warmup_ and look for the most similar one note-by-note. The algorithm comparing them is rather simple:

```python
def difference(cluster1, cluster2):
    """a claster is a list of notes, each note is a list of pitches played."""
    total = 0
    matched = 0
    for idx in range(max(len(cluster1), cluster2)):
        if idx >= len(cluster1):
            total += len(cluster2[idx])
            continue
        if idx >= len(cluster2):
            total += len(cluster1[idx])
            continue
        total += max(len(cluster1[idx]), len(cluster2[idx]))
        matched += len(set(cluster1[idx]) * set(cluster2[idx]))
    return matched / total
```

Using this simple metric, we finally managed to find all the words in the flag.

Now, let’s listen to _symphony_ again with the correct words.

<figure>
<audio style={{width: "100%"}} src="/static/images/ugra-ctf-quals-2022/symphony/symphony.ogg" controls />
<figcaption>symphony.ogg (860 KB)</figcaption>
</figure>

> uniform, golf, romeo, alfa, underscore, whiskey, alfa, victor, yankee, underscore, oscar, bravo, november, oscar, x-ray, india, oscar, uniform, sierra, underscore, sierra, quebec, uniform, india, romeo, romeo, echo, lima, sierra, underscore, foxtrot, four, zero, delta, delta, one, foxtrot, alfa, 

Can you hear it now? Congrats!

Flag: `ugra_wavy_obnoxious_squirrels_f40dd1fa`

> Fun fact: Project SEKAI is the only team in the contest that solved this challenge.

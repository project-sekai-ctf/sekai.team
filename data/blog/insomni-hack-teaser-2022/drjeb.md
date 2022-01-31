---
title: Insomni'hack teaser 2022 – DrJeb
date: '2022-01-31'
draft: false
authors: ['thebish0p']
tags: ["Insomni'hack teaser 2022", 'Misc', 'Git', 'OSINT']
summary: 'Git repo secret.'
---

## DrJeb

> by 123Soleil
>
> Dr. Jeb was able to analyze the virus in depth. He believes in the power of open source so his disassembler is publicly available [here](https://github.com/doctor-jebaited/research).
>
> It's time to check his research with [practice](https://static.insomnihack.ch/media/VirusINC-2f2decd2db45ea7368eeab89d0134afce30254f7f7f4e6a0d6d5e7ff91618569.png).

The github repository provided explains how to use the `Virus Disassembler` by providing it an image of the virus:

```
python3 VirusDisassembler.py virus.png
```

```python
import numpy as np
from PIL import Image
import sys
# Very important
from doctorsecret.const import SECRET

def Dissasemble(img_path):

    img = Image.open(img_path, 'r')
    data = np.array(list(img.getdata()))
    data = data[::SECRET,:]
    tot_pixels = data.shape[0]

    tmp_bits = ""
    for p in range(tot_pixels):
        tmp_bits += (bin(data[p][2])[-1])
    tmp_bits = [tmp_bits[i:i+8] for i in range(0, len(tmp_bits), 8)]

    message = ""
    for i in range(len(tmp_bits)):
        newchar = chr(int(tmp_bits[i], 2))
        message += newchar
    return message


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Example: python3 VirusDissasembler.py <image_path>")
    else:
        print(Dissasemble(sys.argv[1]))
```

After running the script and providing it the image we get a weird output as shown below:

```
D:\CTF\Insomni>python VirusDisassembler.py virus.png
JÈu)¯$æ¶¶:f↨c¨³#[}¥ôöq▬$Ä↓;▲¥ä­zù∟1l?ÌÌ1☻Ä(=\£¨k õà\¹É®ÐZ#ÄÉ♂4¤
 àêgMÓQ¡T§½1X'5V'♂P☻^{↑♂]H¾ÒÂæÏ_»à↑I@¨g2$ÜP↔ÒÐW)X♥*dÑ↕§LÀr@Ê▲Ô[♂)°oö¼ØãáM·g^xQ=SLÁä»øÁG§¥▲ÄÚÓþ?ë¹♂:Jy
5 ©|²£x´>g⌂k=>¤ò®?Ð¨õY&Áð÷{üµÔÉ▬8¥)àñ▲#DX >I)Ü$Côõz©ïbèÙ#♦r$ñvÞÛ☺)¤ªG☻♫l♣¤JoÆÇ´:ÇÒwïûvÏ∟)^¯x§►6&%Æ↓ÞG­­ ~Xµ↑bãÌ^8↨ÿPÍ L±xè8í♠ô(0`n►ùd§zGÐ k²¿@/×·l_M(þóìYSÆß=º♂nt|¡9tø{¥:Ë¸`Zúí=Piwiø÷ñ½R¥ê´♦ø»¯Èr*CsÕÔ♥bøùÿd¸☻Ñ7ÕÌæ±
♥←♦
ëÛæÏ|j}«∟«|28èè)Á0Aò­Ð∟dú3cJ³fdÝ♫´#æþ▬¼þÆNù%(í£¶¢hubú▬°Ì⌂gàÙÊ;Å,1ï☺♦H»·2ç¡¥ìññ±¶Ô/·Ù]☻U4)6 a=Âvò♂ç¬¼§▬ ­♣9u`©←¶)ó↨J·↔☺ª   C£¡↓b♫çl
¸0
qÊÛë2`©q¡gNíÜ4æÐî[↑L⌂-$P‼)¤À↓▼Ó▲!¸vGYÊÕ=¡L}² Í¯Ë↑(↓ô§Å~hÁ È%Æ#!PÌ+÷ÓG/¡Áó÷Fm%k²♦°õ§eùá▼µTÈÇ:;ão<e♦­Æo0Çßö;oãcÙ¬¼'À÷Ö«pi­æëý⌂í×~¿÷ì?Gtî%Â<·¨Ô~[íì▼£ÿ²^Nï¹o¬±zäÞ▼·ð?ÿâûßðôûUK©U'´_¯ vÃÞ~ÏÑõ>Âò▼‼àÿ_ëü⌂çì♠óý?ôò¿÷Êñ\ºÅZëEH-'ñ|_Ãñ~/)ð?7âðÜ
Qæ,e·ÐJIXI l%EºÕN³]HQã?gÌý↔#ö⌂¹Ç=çØó¿GÎ½Û#åè[£pn♠

```

We notice that in the `requirements.txt` there is a secret repo:

```
numpy
# My years of research are contained in this doctorsecret package
git+https://github.com/doctor-jebaited/secret1234.git@f464e6774efe95ff3fc0fdf7464659240cfff09f
```

By accessing `https://github.com/doctor-jebaited/secret1234/blob/master/doctorsecret/` we can see a `const.py`:

```python
SECRET = 133

def GetSecret():
    return SECRET
```

We replace the `SECRET` in our script to `133`, run it again and get the flag:

```python
import numpy as np
from PIL import Image
import sys
# Very important
from doctorsecret.const import SECRET

def Dissasemble(img_path):

    img = Image.open(img_path, 'r')
    data = np.array(list(img.getdata()))
    data = data[::133,:]
    tot_pixels = data.shape[0]

    tmp_bits = ""
    for p in range(tot_pixels):
        tmp_bits += (bin(data[p][2])[-1])
    tmp_bits = [tmp_bits[i:i+8] for i in range(0, len(tmp_bits), 8)]

    message = ""
    for i in range(len(tmp_bits)):
        newchar = chr(int(tmp_bits[i], 2))
        message += newchar
    return message


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Example: python3 VirusDissasembler.py <image_path>")
    else:
        print(Dissasemble(sys.argv[1]))

```

```
D:\CTF\Insomni>python VirusDisassembler.py virus.png
ATAATGATAATCGATGTTTATGCGCCTGCGGATCATAACTAAAATAAATTCTCAAAAGTACAACGGGTTTCGCGGCGAAGGATTACACACACGGATGGTGGCCGAGCGGTTTATAGTTATTTTCCCATCGGGGATACGTCCGAAATTCATCACTGAGGGGAGTCTCTCAGTCCACCGGACGTCAAGATCGCAGGTGGCTCAGACTACGAGGGTGTCGTTCATGGGTGGAGCCTGTTCGTCTGACCTTAGGCTGTGACTCAGCAAGACATGGTCTCGAGTTCGTCGTTCAGTAGGCGAGGGGCINS{W3LCOME_2o22_1NS0_B3_Car3fuL}GGAAAGTAAGACGTCAGTGTCCTTCTGCTTAGCTCCTAAGGTATGCCGTCTGTTAGTATGTTGCAGAGACTGACTCCGAGAACATCACGATATTCTTGACTATGCGAAAGTGAAGCGACACCTCGGATGGATTCCAGGACTCCGTATTTCCACGTGAAGACCATTGAGAGCGGGGTTCATTGAGAGTGAGGAGGTCTCAAAACGGTGTAATTTAACGACACTGATTGATTTCCGAGCCTCTGAGTGCCAACGACTACATTTTAAGTCCCATGACATCGGACCGAAATGTACGTCCCTCCAAT
```

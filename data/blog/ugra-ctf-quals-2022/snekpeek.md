---
title: Ugra CTF Quals 2022 – Разборчивая змейка
date: '2022-03-01'
draft: false
authors: ['blueset', 'sahuang']
tags: ['Ugra CTF Quals 2022', 'Misc', 'Snake', 'QR Code']
summary: 'Picky snake, but the one being picky is actually not the snake.'
---

## Разборчивая змейка (Picky snake `snekpeek`, 250)

> Чем ближе рекорд, тем интереснее играть.
>
> ---
> 
> The closer the record, the more interesting it is to play.
> 
> (Google Translate)
> 
> https://snekpeek.q.2022.ugractf.ru/8619d4ed7f8a85b7/

Opening the web page, we can see a [Snake game](https://en.wikipedia.org/wiki/Snake_(video_game_genre)), on a 42×42 board, with a high score of 17600. The game awards 10 points for every target eaten.

When playing the game, the webpage opens a WebSocet connection to the game server, which communicates the game state to the client.

```websocket
>>> {"size": 42, "target": [7, 7], "head": [28, 28], "tail": "DDD", "score": 0}
<<< U
>>> {"size": 42, "target": [7, 7], "head": [28, 27], "tail": "DDD", "score": 0}
<<< U
>>> {"size": 42, "target": [7, 7], "head": [28, 26], "tail": "DDD", "score": 0}
<<< U
>>> {"size": 42, "target": [7, 7], "head": [28, 25], "tail": "DDD", "score": 0}
...
```

The server sends the entire game state, including the target, the entire snake position and posture, and the current score, which made the automation much easier.

Initially, we took the high score as a hint, and looked all over the place for a snake AI trying to beat the game. However, the server connection has not be stable, and the game resets upon disconnection.

Later on, the author updated the game which allows sending multiple instructions at once, so that it can speed up the process a bit.

Afterwards, we realized that as we can send batch instructions, we can actually draw an [Eularian path](https://en.wikipedia.org/wiki/Eulerian_path) that covers the entire board and program the snake to follow it.

One example of the path is shown below.

```
╭───────────╮
│╭──────────╯
↑╰──────────╮
│╭──────────╯
│╰──────────╮
↑╭──────────╯
│╰──────────╮
╰───────────╯
```

The strategy worked pretty well, but we hit a strange error message when we are almost beating the game.

```json
{
    "size": 42, "target": null, "head": [36, 36], 
    "tail": "...", "score": 13590, 
    "error": "Unable to place new target because all permitted target locations are already occupied by snek"
}
```

$ 42 \times 42 = 1764 $, and we are far from filling the entire board. The error message mentions “permitted target locations”, which made me think that there must be something special about where the targets appear.

Extracting all the past target locations from the traffic log, and plot them on a 42×42 grid, it turns out to be something very “interesting”.

<img src="/static/images/ugra-ctf-quals-2022/snekpeek/qr.png" alt="A plot of all target locations in a game play, which appears to be a QR Code" style={{width: "100%", imageRendering: "pixelated"}} />

A QR Code, and they are nice enough to [pad](https://www.qrcode.com/en/howto/code.html) it! That explains why it says “picky” in the title.

Scan it, and there’s the flag.

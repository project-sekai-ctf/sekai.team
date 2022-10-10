# Editorial Guidelines

Version 0.0.2

## File format

File name: <code>data/blog/<var>{ctf-name}</var>/<var>{challenge-name}</var>.md</code>

File content:

```md
---
title: {CTF name} – {Challenge name}
date: '{Year}-{Month}-{Day}'
draft: false
authors: ['{Author 1 name}', '{Author 2 name}']
tags: ['{CTF Name}', '{Category 1}', '{Category 2}', '{Keyword 1}', '{Keyword 2}', '{Keyword 3}', '{Keyword 4}']
summary: 'A one-line summary of the article.'
canonical: '{URL of the original article⁎}'
---

# {Challenge name} ({Name in English⁎}, {Category}, `{Identifier⁎}`, {Points} points, {Solves⁎} solves)

> {Challenge description}
>
> ---
>
> ({Translation author⁎})
>
> {Description in English⁎}
>
> Attachments: [{File name 1⁎}]({File URL 1⁎}), [{File name 2⁎}]({File URL 2⁎})

{Writeup content}
```

Notes:

- Items labelled with an asterisk (⁎) are only to be included when available.
- In the title between the CTF name and the challenge name, there should be an en-dash (–, U+2013) instead of a hyphen (-, U+002D).
- For author names, use the name in the author file found in `data/authors/`, if the author is not there, use `default`.
- If the challenge titles and/or description is not written in English, always use the original ones first, and add the English translations afterwards. If the translation is done by machine, label the engine used.
- If you are posting the writeup on your own website as well, put the URL to it in the `canonical` section for proper attribution.

## Content guidelines

### Typographical practices

- Use proper capitalizations and punctuations through out the article.
  - Use the proper [quotes](https://practicaltypography.com/straight-and-curly-quotes.html) and [apostrophes](https://practicaltypography.com/apostrophes.html) in the article unless when writing code.
  - Use hyphens only to join words (e.g. _cost-effective_, _cross-platform_). Use [dashes](https://practicaltypography.com/hyphens-and-dashes.html) to join sentences and express ranges (e.g. _pages 39–831_).
- Use code formatting (<code>&#96;{content}&#96;</code>, <code>&#96;&#96;&#96;↵{content}↵&#96;&#96;&#96;</code>) only for code, and content that are input/output of programs. Do not use code formatting for emphasis or coding non-code content.
- Use italics and title casing to refer to titles of words mentioned.
- Use italics for subtle emphasis, and bold for strong emphasis. Do not use ~~ALL CAPS~~ for emphasis.
- Use quotation marks to quote words, phrases or sentences.
- Use block quotes (`> {content}`) to quote a whole paragraph.
- Use LaTeX-style syntax for mathematical mentions, including variables, numbers, expressions, and equations. Use `${content}$` for inline math, and `$$↵{content}↵$$` for block math.
  - You may consider using non-LaTeX notations if your writeup does not involve complex expressions such as fractions, summations, and integrals.
    - For non-LaTeX notations, single-letter variable and function names have to be italicized, and long names should remain in roman (upright).
    - Be consistent. Do not mix LaTeX and non-LaTeX notations in the same article.
  - Use roman (upright) text (`\text{...}`) for functions names (e.g. $\mathrel{\text{cotan}} x = \cot x$), and textual descriptions in expressions (e.g. $W_\text{valid} = W_v \times 2 = \frac{\text{valid vertices weight}}{\text{total weight}}$).
- If you want to make a hard line break without starting a new paragraph, put two spaces at the end of the line. Use `<br/>` only if your text is surrounded by HTML tags.
- Specify the language of code blocks for syntax highlighting.
- Exceptions can be made for verbatim quotes from external sources, such as the challenge descriptions, or intentional violations of the guideline to support the writeup content.

### Archive-friendly articles

Articles here, especially challenge writeups, are meant to share knowledge, and is a valuable resource for future readers. In the unfortunate case where this site goes down, we want the articles to provide as most information as possible in archive services, even no picture or attachment is accessible.

Therefore, we want to minimize the dependency of non-textual content in articles. This does not mean that you cannot use pictures or attachments, but you should always provide a sufficient textual alternative when possible.

- Do not include screenshots that consists of **only text**, such as terminal transcript, source code, Jupyter Workbook output with only text. Instead, use code blocks to include them as plain text.  
  If the syntax highlighting does not work as expected, or the color information is important, consider copying them as richtext/HTML code from the source.
- For images included in articles, write an appropriate [Alt Text](https://webaim.org/techniques/alttext/) for each of them. When writing, always include the details in the image that you want to convey to the readers, as if you want to explain it to someone who read the article but cannot load the picture. E.g.: <code>!&#91;A screenshot of the login page after injecting the RCE payload &#96;ls&#96;. The RCE output is found in the error message on the page, which shows that a file named &#96;flag.txt&#96; is in the current working directory.](rce1.png)</code>.

### Placeholders

Sometimes there are some information that you want to redact from the verbatim output for privacy reasons. For such cases, you can choose to use a placeholder to replace them. Here are some options:

- Redact content with symbols, such as “█”, “�”, or anything that is distinct enough to be recognized as a placeholder.
- Use a textual placeholder like “[REDACTED]”.
- Use a contextual placeholder, such as:
  - `foo`, `bar`, `baz`, `MyDataClass`, etc. for identifiers in source code;
  - “example.com”, “example.net”, etc. for domain names;
    - **Do not** ever use “xxx” in domain name placeholders, as they might point to inappropriate websites.
  - “127.0.0.1”, “[::1]”, etc. for IP addresses.

For non-printable characters such as ASCII control characters, there are a few options to include them in the writeup:

- If they are included as a part of source code, use the appropriate escape sequence in the specific language (e.g. `"\b"`, `"\x08"`, `"\u0008"`, `"\U00000008"` can be in used Python to represent the Backspace character).
- If they are not significant to the article, you may use a generic placeholder like `�` and `.`.
- If the characters’ meaning are important to the article, you may use a graphical or canonical symbol to represent them. For example, `⌫` and `␈` can both be used to represent the Backspace character.

## Rich content

### Table of contents

To include the table of contents, use the following react component:

```jsx
<TOCInline toc={props.toc} exclude={['Overview']} toHeading={2} asDisclosure />
```

You can find examples of usage in other articles here.

### Advanced media content and styling

If you have additional need that is not supported by Markdown, you can write HTML directly.

If you have the need to include something that might need JavaScript, or some component that might be used in further articles, please work with the maintainers to make a React component for it.

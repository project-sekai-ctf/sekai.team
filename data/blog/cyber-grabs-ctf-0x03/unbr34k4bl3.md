---
title: Cyber Grabs CTF 0x03 – Unbr34k4bl3
date: '2022-02-07'
draft: false
authors: ['michael']
tags: ['Cyber Grabs CTF 0x03', 'crypto', 'rsa', 'number theory']
summary: 'Unbreakable RSA Challenge?'
---

## Unbr34k4bl3

> No one can break my rsa encryption, prove me wrong !!
>
> Flag Format: `cybergrabs{}`
>
> Author: Mritunjya
>
> [output.txt](https://mzhang.io/posts/2022-02-07-cybergrabs-ctf-unbreakable/output.txt) [source.py](https://mzhang.io/posts/2022-02-07-cybergrabs-ctf-unbreakable/source.py)

[Original Writeup](https://mzhang.io/posts/2022-02-07-cybergrabs-ctf-unbreakable/)

Looking at the source code, this challenge looks like a typical RSA challenge at first, but there are some important differences to note:

- $n = pqr$ (line 34). This is a twist but RSA strategies can easily be
  extended to 3 prime components.
- $p, q \equiv 3 \mod 4$ (line 19). This suggests that the cryptosystem is
  actually a [Rabin cryptosystem](https://en.wikipedia.org/wiki/Rabin_cryptosystem).
- We're not given the public keys $e_1$ and $e_2$, but they are related through
  $x$.

## Finding $e_1$ and $e_2$

We know that $e_1$ and $e_2$ are related through $x$, which is some even number
greater than 2, but we're not given any of their real values. We're also given
through an oddly-named `functor` function that:

$$
1 + e_1 + e_1^2 + \cdots + e_1^x = 1 + e_2 + e_2^2
$$

Taking the entire equation $\mod e_1$ gives us:

$$
\begin{aligned} 1 &\equiv 1 + e_2 + e_2^2 \mod e_1 \\\ 0 &\equiv e_2 + e_2^2 \\\ 0 &\equiv e_2(1 + e_2) \end{aligned}
$$

This means there are two possibilities: either $e_1 = e_2$ or $e_1$ is even
(since we know $e_2$ is a prime). The first case isn't possible, because with $x
\> 2$, the geometric series equation would not be satisfied. So it must be true
that $\boxed{e_1 = 2}$, the only even prime.

Applying geometric series expansion, $1 + e_2 + e_2^2 = 2^{x + 1} - 1$. We can
rearrange this via the quadratic equation to $e_2 = \frac{-1 \pm \sqrt{1 - 4
(2 - 2^{x + 1})}}{2}$. Trying out a few values we see that only $\boxed{x = 4}$
and $\boxed{e_2 = 5}$ gives us a value that make $e_2$ prime.

## Finding $p$ and $q$

We're not actually given $p$ or $q$, but we are given $ip = p^{-1} \mod q$ and
$iq = q^{-1} \mod p$. In order words:

$$
\begin{aligned}
  p \times ip &\equiv 1 \mod q \\\
  q \times iq &\equiv 1 \mod p
\end{aligned}
$$

We can rewrite these equations without the mod by introducing variables $k_1$
and $k_2$ to be arbitrary constants that we solve for later:

$$
\begin{aligned}
  p \times ip &= 1 + k_1q \\\
  q \times iq &= 1 + k_2p
\end{aligned}
$$

We'll be trying to use these formulas to create a quadratic that we can use to
eliminate $k_1$ and $k_2$. Multiplying these together gives:

$$
\begin{aligned}
  (p \times ip)(q \times iq) &= (1 + k_1q)(1 + k_2p) \\\
  pq \times ip \times iq &= 1 + k_1q + k_2p + k_1k_2pq
\end{aligned}
$$

I grouped $p$ and $q$ together here because it's important to note that since we
have $x$, we know $r$ and thus $pq = \frac{n}{r}$. This means that for purposes
of solving the equation, $pq$ is a constant to us. This actually introduces an
interesting structure on the right hand side, we can create 2 new variables:

$$
\begin{aligned}
  \alpha &= k_1q \\\
  \beta &= k_2p
\end{aligned}
$$

Substituting this into our equation above we get:

$$
\begin{aligned}
  pq \times ip \times iq &= 1 + \alpha + \beta + \alpha\beta
\end{aligned}
$$

Recall from whatever algebra class you last took that $(x - x_0)(x - x_1) = x^2 - (x_0 + x_1)x + x_0x_1$. Since we have both $\alpha\beta$ and $(\alpha + \beta)$ in our equation, we can try to look for a way to isolate them in order to create our goal.

$$
\begin{aligned}
  pq \times ip \times iq &= 1 + k_1q + k_2p + k_1k_2pq \\\
  k_1k_2pq &= pq \times ip \times iq - 1 - k_1q - k_2p \\\
  k_1k_2 &= ip \times iq - \frac{1}{pq} - \frac{k_1}{p} - \frac{k_2}{q}
\end{aligned}
$$

$\frac{1}{pq}$ is basically $0$, and since $k_1$ and $k_2$ are both smaller than
$p$ or $q$, then we'll approximate this using $k_1k_2 = ip \times iq - 1$. Now
that $k_1k_2$ has become a constant, we can create the coefficients we need:

$$
\begin{aligned}
  \alpha + \beta &= pq \times ip \times iq - 1 - k_1k_2pq \\\
  \alpha\beta &= k_1k_2pq
\end{aligned}
$$

$$
\begin{aligned}
  (x - \alpha)(x - \beta) &= 0 \\\
  x^2 - (\alpha + \beta)x + \alpha\beta &= 0 \\\
  x &= \frac{(\alpha+\beta) \pm \sqrt{(\alpha+\beta)^2 - 4\alpha\beta}}{2}
\end{aligned}
$$

Putting this into Python, looks like:

```py
from decimal import Decimal
getcontext().prec = 3000 # To get all digits

k1k2 = ip * iq - 1
alpha_times_beta = k1k2 * pq
alpha_plus_beta = pq * ip * iq - 1 - k1k2 * pq

def quadratic(b, c):
  b, c = Decimal(b), Decimal(c)
  disc = b ** 2 - 4 * c
  return (-b + disc.sqrt()) / 2, (-b - disc.sqrt()) / 2

alpha, beta = quadratic(-alpha_plus_beta, alpha_times_beta)
```

Now that we have $\alpha$ and $\beta$, we can try GCD'ing them against $pq$ to
get $p$ and $q$:

```py
from math import gcd

p = gcd(pq, int(alpha))
q = gcd(pq, int(beta))
assert p * q == pq # Success!
```

### Alternative method

@sahuang used the [sympy] library to do this part instead, resulting in much
less manual math. It's based on [this] proof from Math StackExchange that $p
\cdot (p^{-1} \mod q) + q \cdot (q^{-1} \mod p) = pq + 1$.

[sympy]: https://www.sympy.org
[this]: https://math.stackexchange.com/a/1705450

```py
from sympy import *
p,q = symbols("p q")
eq1 = Eq(ip * p + iq * q - pq - 1, 0)
eq2 = Eq(p * q, pq)
sol = solve((eq1, eq2), (p, q))
```

## Decrypting the ciphertexts

Now that we know $p$ and $q$, it's time to plug them back into the cryptosystem
and get our plaintexts. $c_2$ is actually easier than $c_1$, because with $e_2 =
5$ we can just find the modular inverse:

```py
phi = (p - 1) * (q - 1) * (r - 1)
d2 = pow(e2, -1, phi)
m2 = pow(c2, d2, n)
print(long_to_bytes(m2))
# ... The last part of the flag is: 8ut_num83r_sy5t3m_15_3v3n_m0r3_1nt3r35t1n6} ...
```

This trick won't work with $c_1$ however:

```py
d1 = pow(e1, -1, phi)
# ValueError: base is not invertible for the given modulus
```

Because $\phi$ is even (it's the product of one less than 3 primes), there can't
possibly be a $d_1$ such that $2 \cdot d_1 \equiv 1 \mod \phi$. According to
[Wikipedia](https://en.wikipedia.org/wiki/Rabin_cryptosystem), the decryption for a standard two-prime $n$ takes 3 steps:

1. Compute the square root of $c \mod p$ and $c \mod q$:
   - $m_p = c^{\frac{1}{4}(p + 1)} \mod p$
   - $m_q = c^{\frac{1}{4}(q + 1)} \mod q$
2. Use the extended Euclidean algorithm to find $y_p$ and $y_q$ such that $y_p
   \cdot p + y_q \cdot q = 1$.
3. Use the Chinese remainder theorem to find the roots of $c$ modulo $n$:
   - $r_1 = (y_p \cdot p \cdot m_q + y_q \cdot q \cdot m_p) \mod n$
   - $r_2 = n - r_1$
   - $r_3 = (y_p \cdot p \cdot m_q - y_q \cdot q \cdot m_p) \mod n$
   - $r_4 = n - r_3$
4. The real message could be any $r_i$, but we don't know which.

Converting this to work with $n = pqr$, it looks like:

1. Compute the square root of $c \mod p$, $c \mod q$, and $c \mod r$:
   - $m_p = c^{\frac{1}{4}(p + 1)} \mod p$
   - $m_q = c^{\frac{1}{4}(q + 1)} \mod q$
   - $m_r = c^{\frac{1}{4}(r + 1)} \mod r$
2. Using the variable names from [AoPS](https://artofproblemsolving.com/wiki/index.php/Chinese_Remainder_Theorem)'s definition of CRT:
   - For $k \in \{ p, q, r \}, b_k = \frac{n}{k}$.
   - For $k \in \{ p, q, r \}, a_k \cdot b_k \equiv 1 \mod k$.
3. Let $r = \displaystyle\sum_k^{\{ p, q, r \}} \pm (a_k \cdot b_k \cdot m_k) \mod n$.
4. The real message could be any $r$, but we don't know which.

In code this looks like:

```py
# Step 1
mp = pow(c1, (p + 1) // 4, p)
mq = pow(c1, (q + 1) // 4, q)
mr = pow(c1, (r + 1) // 4, r)

# Step 2
bp = n // p
bq = n // q
br = n // r
ap = pow(bp, -1, p)
aq = pow(bq, -1, q)
ar = pow(br, -1, r)

# Step 3
from itertools import product
for sp, sq, sr in product((-1, 1), repeat=3):
  m = (sp * ap * bp * mp + sq * aq * bq * mq + sr * ar * br * mr) % n
  m = long_to_bytes(m)

  # Step 4
  # We know that the real flag starts with `cybergrabs{`...
  if b"cybergrabs" in m: print(m)

# Congratulations, You found the first part of flag cybergrabs{r481n_cryp70sy5t3m_15_1nt3r35t1n6_ ...
```

The final flag, then, is:

```
cybergrabs{r481n_cryp70sy5t3m_15_1nt3r35t1n6_8ut_num83r_sy5t3m_15_3v3n_m0r3_1nt3r35t1n6}
```

Big thanks to @10, @sahuang, and @thebishop in the Project Sekai discord for
doing a lot of the heavy-lifting to solve this challenge.

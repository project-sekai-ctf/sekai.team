---
title: WolvSec CTF – CPA-Secure Diffie–Hellman?
date: '2022-03-26'
draft: false
authors: ['sahuang']
tags: ['WolvSec CTF', 'Crypto', 'Diffie-Hellman', 'Prime', 'Mersenne', 'Factorization']
summary: 'Small subgroup attack on Diffie-Hellman...?'
---

## CPA-Secure Diffie–Hellman?

> Alice and Bob have implemented their own CPA-Secure Diffie–Hellman key exchange in an effort to ensure nobody can send messages to Alice that appear to be signed by Bob. Their prime is large and they are using sha-256. Despite this someone is impersonating Bob. He is convinced someone has constructed a second pre-image attack on sha-256. Do you agree with his conclusion?
>
> https://dhe-medium-bvel4oasra-uc.a.run.app/

Personally I think this is the best challenge in the whole CTF – The only Crypto problem that I learned something new. Most of their other challenges are either boring or guessy.

We were provided with the following script. I removed website part for simplicity.

```py
from Crypto.Util.number import bytes_to_long, long_to_bytes
from hashlib import sha256
from hmac import new

# ephemerals live on as seeds!

# wrap flag in wsc{}

# Someone has cracked sha-256 and has started impersonating me to Alice on the internet!
# Here's the oracle they proved sha-256 is forgeable on
# Guess the internet will just have to move on to sha-512 or more likely sha-3

key = {
    '0' : 0 , '1' : 1 , '2' : 2 , '3' : 3 , '4' : 4 , '5' : 5 , '6' : 6 ,
    'a' : 70, 'b' : 71, 'c' : 72, 'd' : 73, 'e' : 74, 'f' : 75, 'g' : 76, 'h' : 77, 'i' : 78, 'j' : 79,
    'k' : 80, 'l' : 81, 'm' : 82, 'n' : 83, 'o' : 84, 'p' : 85, 'q' : 86, 'r' : 87, 's' : 88, 't' : 89,
    'u' : 90, 'v' : 91, 'w' : 92, 'x' : 93, 'y' : 94, 'z' : 95, '_' : 96, '#' : 97, '$' : 98, '!' : 99,
}

def bytes_to_long_flag(bytes_in):
    long_out = ''
    for b in bytes_in:
        long_out += str(key[chr(b)])
    return int(long_out)

def long_to_bytes_flag(long_in):
    new_map = {v: k for k, v in key.items()}
    list_long_in = [int(x) for x in str(long_in)]
    str_out = ''
    i = 0
    while i < len(list_long_in):
        if list_long_in[i] < 7:
            str_out += new_map[list_long_in[i]]
        else:
            str_out += new_map[int(str(list_long_in[i]) + str(list_long_in[i + 1]))]
            i += 1
        i += 1
    return str_out.encode("utf_8")

def diffie_hellman(A):
    p = 6864797660130609714981900799081393217269435300143305409394463459185543183397656052122559640661454554977296311391480858037121987999716643812574028291115057151
    g = 5016207480195436608185086499540165384974370357935113494710347988666301733433042648065896850128295520758870894508726377746919372737683286439372142539002903041
    B = pow(g,b,p) #unused in our protocal
    s = pow(A,b,p)
    message = b'My totally secure message to Alice'
    password = long_to_bytes(s)
    my_hmac = new(key=password, msg = message, digestmod=sha256)
    return str(bytes_to_long(my_hmac.digest()))

@app.route("/")
def home():
    A = request.args.get('A')
    if not A:
        return "Missing required query string parameter: A"
    else:
        try:
            result = diffie_hellman(int(A))
            return result
        except:
            return "A must be an integer: " + A;

f = open("flag.txt", "r")
flag = f.read()
b = bytes_to_long_flag(flag.encode('utf-8'))

# Someone mentioned CPA-Security to me... No idea what that has to do with this

# All the homies hate 521
```

Let us first check each function.

`bytes_to_long_flag` – Takes flag as byte string and turns it into a long number `b` according to the `key` map.

`long_to_bytes_flag` – We will use it in the end to convert the number `b` back to flag.

`diffie_hellman` – This is the function we need to focus on. We are given an encryption scheme where `p` is known. We can choose arbitrary `A` and the server will compute the following:

```py
s = pow(A,b,p) # b is what we need to attack
message = b'My totally secure message to Alice' # Fixed message
password = long_to_bytes(s)
my_hmac = new(key=password, msg = message, digestmod=sha256) # hmac on the fixed message
return str(bytes_to_long(my_hmac.digest()))
```

On the website, we can provide chosen `A` and it will return the value of `diffie_hellman(A)` which is the digest of hmac.

Spent some time playing around with the website, we observed that inputting `A = 1` and `A = -1` yield different results, meaning that `b` is odd. (Since `pow(A,b,p)` needs to be different.) Our intuition was to do some oracle kind of attack, which sounds like a good starting point.

![Discord chat](/static/images/wolvsec-ctf/cpa/discord_chat.png)

> the way to solve this would be  
> first put 1 and then -1  
> you get different outputs mean that the last bit is 1  
> now for second bit  
> was thinking of finding 4th root of 1 in modulo p  
> there are 4 possible roots  
> two of them are -1 and 1 which we won’t use here  
> the other two we pass it into the oracle  
> if we get different, the second bit is 1  
> otherwise 0

However, it turns out there are only 2 n-th roots of 1 modulo `p` if `n = pow(2, k)`. At this point I began to search for property of `p`, which surprisingly belongs to an OEIS:

![Sequence](/static/images/wolvsec-ctf/cpa/sequence.png)

We noticed that `p = pow(2, 521) - 1` and is a Mersenne prime. (I later saw there is a hint in the source code: `All the homies hate 521`, but I did not realize it before solving the challenge.) With some research, I found a statement “breaking the Diffie-Hellman Key Exchange Protocol is easy for Fermat primes and Mersenne primes” - which convinced me this might be the right path.

My first finding: if we let `A = 2`, we can get

$$
\begin{aligned}
  s &= A^{b} \bmod p \\\
  s &= 2^{521\times k + l} \bmod 2^{521}-1 \\\
  s &= 2^{521\times k} \times 2^{l} \bmod 2^{521}-1 \\\
  s &= 2^{l}
\end{aligned}
$$

Where we let `b = 521*k+l` and `l < 521`. Since there are only 521 possible `l`, we can brute force hmac and find if it matches the hmac result on the website. From this we know `b mod 521`.

It turns out this can work for all small primes of `p-1`. Our attack is as follows:

1. Factorize `p-1`, and get an array of `q` such that `q | p - 1`.
2. If `q | p - 1`, we want to find a number `x` such that `x^q = 1 (mod p)`. Example: `521 | p - 1`, we find that `2^521 = 1 (mod p)`
3. Let `A = x` and get hmac output from the website. Now we can simply enumerate `key = 1, A, A^2, ..., A^(q-1)` to get our calculated hmac results, and find the one that matches the one shown on website. **In this way we know `b % q`**.
4. Do this for all prime factors of `p - 1`. Since enumeration is on `q`, `q` cannot be too large, so we might need to stop at some point, but that should be enough.
5. Once we get all `b % q` we can use `crt` to solve modular equation system. We finally call `long_to_bytes_flag` to get flag.

Note that this solution will work as `p` is a Mersenne prime and factorization of `p - 1` yields smooth primes. Let us code each part.

### Factorization

```py
from factordb.factordb import FactorDB
from tqdm import *

p = 6864797660130609714981900799081393217269435300143305409394463459185543183397656052122559640661454554977296311391480858037121987999716643812574028291115057151

f = FactorDB(p-1)
f.connect()
factors = f.get_factor_list()
print(factors) # [2, 3, 5, 5, 11, 17, 31, 41, 53, 131, 157, 521, 1613, 2731, 8191, 42641, 51481, 61681, 409891, 858001, 5746001, 7623851, 34110701, 308761441, 2400573761, 65427463921, 108140989558681, 145295143558111, 173308343918874810521923841]
```

### Get array of A

Let us stop at prime 7623851. Each `nth_root(q)` will return `q` solutions, we just need to pick a random one that is NOT 1.

```py
qs = [2, 3, 5, 11, 17, 31, 41, 53, 131, 157, 521, 1613, 2731, 8191, 42641, 51481, 61681, 409891, 858001, 5746001, 7623851]
As = []

for q in tqdm(qs):
    assert (p-1) % q == 0
    # find A such that A^q = 1 (mod p)
    A = mod(1, p).nth_root(q, all=True)
    # print(len(A))
    As.append(A[1])
```

Next we plug these `As` on the website and make queries to get hmacs. e.g. `https://dhe-medium-bvel4oasra-uc.a.run.app?A=2`

```py
hmacs = [
    90955237956961005126189890739708800567014836931403058445375855242389099585701,
    20622406187866361184960795196046480859426473595059025902341280993971771378288,
    91368064761969554193146310664428696779669778217293388427175887610826255556020,
    74021593115437125724024446523467719290309892636225095633323251957292028007132,
    10716258788641479259594529780635715860349212776071528807400384532061573153008,
    110510228817758736818252789151915040195413986812322691047390564789478326973050,
    65262770926857981885448926437679422618994233854053849290222210849227212897520,
    57435813898663542619087859683488085284323482381057842568122199304476971950523,
    9967846880058967842313047192978638601339192853624560939100516409504228047626,
    34967325199632989453867820562138113005051555475875808882359441344461422450499,
    91368064761969554193146310664428696779669778217293388427175887610826255556020,
    31743099937462953838420138089826239234058887936841257999333341042640277908838,
    91675905941987675878239782917111661679692464439705001658016439827716618545165,
    105753927392692241661624046469843247134214934184588590022760687820963468567616,
    23901054353629274832410860711360758784125475837395501853661319179438740190165,
    102557550478192355354391076861234563743000999800502420626135097732567720012327,
    69212182994459464439026839995716859251160492847604538040515680157299030133365,
    65002122913494568498218268818219782603905118449754877723534048019066958627760,
    39832404137779429258931968594173145831388800981461808550758491797445688935686,
    31851101972958182833519147171046031144906686288554760230152812880237129795757,
    13343204244345352896009532737013092899621868990191685708915515624011831103237
]
```

### Find `b % q`

Next step is to find `b % q` for all `q` in `qs`. This can be easily done by brute-forcing hmacs.

```py
from hashlib import sha256
from hmac import new
from Crypto.Util.number import bytes_to_long, long_to_bytes

message = b'My totally secure message to Alice'
for i in range(len(As)):
    A = As[i]
    q = qs[i]
    assert (p-1) % q == 0
    assert pow(A, q, p) == 1

    # enumerate A^0 to A^(q-1)
    for j in range(0, q):
        s = pow(A, j, p)
        password = long_to_bytes(int(s))
        my_hmac = new(key=password, msg = message, digestmod=sha256)
        if str(bytes_to_long(my_hmac.digest())) == str(hmacs[i]):
            print("b % " + str(q) + " = " + str(j))
```

The output:

```
b % 2 = 1
b % 3 = 1
b % 5 = 0
b % 11 = 2
b % 17 = 15
b % 31 = 9
b % 41 = 29
b % 53 = 45
b % 131 = 1
b % 157 = 84
b % 521 = 0
b % 521 = 4
b % 521 = 9
b % 521 = 18
b % 521 = 27
b % 521 = 36
b % 521 = 45
b % 521 = 54
b % 521 = 63
b % 521 = 72
b % 521 = 77
b % 521 = 81
b % 521 = 86
b % 521 = 95
b % 521 = 104
b % 521 = 113
b % 521 = 122
b % 521 = 131
b % 521 = 140
b % 521 = 149
b % 521 = 154
b % 521 = 163
b % 521 = 172
b % 521 = 181
b % 521 = 190
b % 521 = 199
b % 521 = 208
b % 521 = 217
b % 521 = 226
b % 521 = 231
b % 521 = 240
b % 521 = 249
b % 521 = 258
b % 521 = 267
b % 521 = 276
b % 521 = 285
b % 521 = 294
b % 521 = 299
b % 521 = 303
b % 521 = 308
b % 521 = 317
b % 521 = 326
b % 521 = 335
b % 521 = 344
b % 521 = 353
b % 521 = 362
b % 521 = 371
b % 521 = 376
b % 521 = 385
b % 521 = 394
b % 521 = 403
b % 521 = 412
b % 521 = 421
b % 521 = 430
b % 521 = 439
b % 521 = 448
b % 521 = 453
b % 521 = 462
b % 521 = 471
b % 521 = 480
b % 521 = 489
b % 521 = 498
b % 521 = 507
b % 521 = 516
b % 1613 = 758
b % 2731 = 1566
b % 8191 = 4693
b % 42641 = 40709
b % 51481 = 18367
b % 61681 = 60431
b % 409891 = 231910
b % 858001 = 6110
b % 5746001 = 5113228
b % 7623851 = 2550195
```

Oops, it seems that 521 is the cursed number as it has so many modulos! We can just throw it away.

### Get flag

Finally, we do a `crt` with the help of sage and get (the smallest possible value of) `b`. Hopefully this can be transformed into the flag.

```py
key = {
    '0' : 0 , '1' : 1 , '2' : 2 , '3' : 3 , '4' : 4 , '5' : 5 , '6' : 6 ,
    'a' : 70, 'b' : 71, 'c' : 72, 'd' : 73, 'e' : 74, 'f' : 75, 'g' : 76, 'h' : 77, 'i' : 78, 'j' : 79,
    'k' : 80, 'l' : 81, 'm' : 82, 'n' : 83, 'o' : 84, 'p' : 85, 'q' : 86, 'r' : 87, 's' : 88, 't' : 89,
    'u' : 90, 'v' : 91, 'w' : 92, 'x' : 93, 'y' : 94, 'z' : 95, '_' : 96, '#' : 97, '$' : 98, '!' : 99,
}

def long_to_bytes_flag(long_in):
    new_map = {v: k for k, v in key.items()}
    list_long_in = [int(x) for x in str(long_in)]
    str_out = ''
    i = 0
    while i < len(list_long_in):
        if list_long_in[i] < 7:
            str_out += new_map[list_long_in[i]]
        else:
            str_out += new_map[int(str(list_long_in[i]) + str(list_long_in[i + 1]))]
            i += 1
        i += 1
    return str_out.encode("utf_8")

'''
b % 2 = 1
b % 3 = 1
b % 5 = 0
b % 11 = 2
b % 17 = 15
b % 31 = 9
b % 41 = 29
b % 53 = 45
b % 131 = 1
b % 157 = 84
b % 1613 = 758
b % 2731 = 1566
b % 8191 = 4693
b % 42641 = 40709
b % 51481 = 18367
b % 61681 = 60431
b % 409891 = 231910
b % 858001 = 6110
b % 5746001 = 5113228
b % 7623851 = 2550195
'''

b = CRT_list([1,1,0,2,15,9,29,45,1,84,758,1566,4693,40709,18367,60431,231910,6110,5113228,2550195], [2,3,5,11,17,31,41,53,131,157,1613,2731,8191,42641,51481,61681,409891,858001,5746001,7623851])

print(long_to_bytes_flag(b)) # b'5m4l1_5ub_gr0up5'
```

And this is the flag! `wsc{5m4l1_5ub_gr0up5}`. (The flag implied this is small subgroup attack which I never heard of.)

Huge thanks to @Utaha for giving me hints and directions to solve this challenge. I would not have thought of this attack without their help. :)

---
title: BSidesTLV 2022 CTF – Code is Law
date: '2022-06-29'
draft: false
authors: ['yanhu']
tags: ['BSidesTLV 2022', 'Blockchain', 'Solidity', 'Contract']
summary: 'Modify contract storage using hardhat_setStorageAt.'
canonical: 'https://yanhuijessica.github.io/Chictf-Writeups/crypto/code_is_law/'
---

## Code is Law 1 & 2 (Blockchain, 150 + 250)

> Download the **zip** file and follow the instructions in the **README.md** file to solve the solidity challenge.
>
> Attachments: [code-is-law-1.zip](https://github.com/YanhuiJessica/Chictf-Writeups/blob/master/docs/crypto/static/code-is-law-1.zip) [code-is-law-2.zip](https://github.com/YanhuiJessica/Chictf-Writeups/blob/master/docs/crypto/static/code-is-law-2.zip)

In `Code is Law 1` and `Code is Law 2`, we can get the flag when the address of `msg.sender` of `ChallengeToken.did_i_win()` holds `ChallengeToken`.

```js
function did_i_win() public view returns (string memory) {
    if (balanceOf(msg.sender) == 0) {
        revert("you shall not pass");
    }

    return "BSidesTLV2022{PLACEHOLDER}";
}
```

We first take a look at the `ChallengeToken` in `Code is Law 1`:

```js
function can_i_haz_token(address receiver) public {
    require(
        receiver == calculateAddressOfTheFirstContractDeployedBy(tx.origin),
        "receiver is ineligible for a token because they are not the first contract deployed by the EOA who initiated this transaction"
    );
    require(
        getContractCodeHash(receiver) == onlyICanHazTokenContractCodeHash,
        "receiver is ineligible for a token because their codehash does not match the specific contract codehash required"
    );

    if (balanceOf(receiver) == 0) {
        _mint(receiver, 1);
    }
}
```

We can only get new tokens from `can_i_haz_token`. However, the receiver must meet these conditions:

- The receiver is the first contract deployed by the `tx.origin`
- The code hash of the receiver equals the `onlyICanHazTokenContractCodeHash`

What about let `OnlyICanHazToken` obtain a token and then transfer it to us? Well, `selfdestruct` can only transfer ethers, not tokens.

```js
contract OnlyICanHazToken {
    function bye() public {
        selfdestruct(payable(msg.sender));
    }
}
```

Going back to `ChallengeToken`, I tried but failed to find any weakness in `getContractCodeHash` and `calculateAddressOfTheFirstContractDeployedBy`. `ERC20`, the parent contract of `ChallengeToken`, is even less likely to have problems. (╥ω╥)

```js
function getContractCodeHash(address contractAddress)
    private
    view
    returns (bytes32 callerContractCodeHash)
{
    assembly {
        callerContractCodeHash := extcodehash(contractAddress)
    }
}

// Copied from https://ethereum.stackexchange.com/a/87840
function calculateAddressOfTheFirstContractDeployedBy(address deployer)
    private
    pure
    returns (address _address)
{
    bytes32 hash = keccak256(
        abi.encodePacked(bytes1(0xd6), bytes1(0x94), deployer, bytes1(0x80))
    );

    assembly {
        mstore(0, hash)
        _address := mload(0)
    }
}
```

Finally, I turned my attention to the development environment Hardhat. HardHat has a method `hardhat_setStorageAt`[^1] which can modify contract storage. So, we can directly modify our balance to hold tokens!

`ChallengeToken` inherits from `ERC20`. There is a mapping variable `_balances` which uses to store the balance for each account. The storage location of the `_balances` ends up being the slot `0` after applying the storage layout rules. So, the entry for address `A` is stored at `keccak256(A | 0)` where `|` is concatenation.

```ts
it('Should return the winning flag', async function () {
  challengeToken = await ethers.getContractAt(
    'ChallengeToken',
    '0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f'
  )

  let [player] = await ethers.getSigners()
  let playerHash = await ethers.utils.solidityKeccak256(['uint256', 'uint'], [player.address, 0])
  await ethers.provider.send('hardhat_setStorageAt', [
    challengeToken.address,
    playerHash,
    ethers.utils.hexZeroPad(ethers.utils.hexlify(1), 32),
  ]) // modify the balance

  const returnedFlag = await challengeToken.did_i_win()
  console.log(`\tThe returned flag is: "${returnedFlag}"`)
})
```

Compared with `Code is Law 1`, `ChallengeToken` in `Code is Law 2` only updated the rules of minting tokens and banned `approve`. So, the above method can still be applicable =)

## Flag

```bash
BSidesTLV2022{c0nstUct!v3_m@g!3_ind3ed} # Code is Law 1
BSidesTLV2022{W!L3_M@g!3_in_the_w3rld} # Code is Law 2
```

[^1]: [Local ERC20 Balance Manipulation (with HardHat)](https://kndrck.co/posts/local_erc20_bal_mani_w_hh/)

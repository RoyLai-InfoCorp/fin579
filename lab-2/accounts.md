---
id: solidity-tools-2-Addresses
title: Lesson 2 - Addresses
---

# Lesson 2 - Accounts and Addresses

Ethereum addresses are made up of 20 bytes and are represented as hexadecimal strings, e.g., 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266. The prefix `0x` denotes a hexadecimal string, and every two characters represent one byte (total 42 characters long). Ethereum uses addresses in two ways. Addresses used for human wallets are called **accounts**. Addresses used for contracts are known as **Externally Owned Accounts**. The main difference is that Externally Owned Accounts are generated by the blockchain without a private key being stored, while the private key for accounts needs to be known and kept safe by the wallet user.

---

## Checksummed Address

-   Ethereum addresses can be written in two ways - in all lowercase letters, e.g., `0x167081a9f679a73ed3984265ca84b91f8b19cf15`, and a **checksummed version** that includes capital letters, e.g., `0x167081A9f679a73ED3984265Ca84b91F8b19Cf15`. Both will be converted to the same value since hexadecimal is case-insensitive.

-   Whenever possible, use the checksummed version of an address because it has the added advantage of being validated to prevent potential typos in an Ethereum address.

    -   The easiest way to create a checksummed address is to do a search using the non-checksummed address on `etherscan.io`, and it will return a checksummed address.
    -   To create a checksummed address using ethers.js, use **ethers.utils.getAddress(address)**.

### Example: Converting checksummed and non-checksummed addresses using ethers.js

```js
>'0x167081A9f679a73ED3984265Ca84b91F8b19Cf15'.toLowerCase()
'0x167081a9f679a73ed3984265ca84b91f8b19cf15'
> ethers.utils.getAddress('0x167081a9f679a73ed3984265ca84b91f8b19cf15')
'0x167081A9f679a73ED3984265Ca84b91F8b19Cf15'
```

---

## Hierarchical Deterministic (HD) Wallet Mnemonics

A HD Wallet is a wallet capable of deterministically generating an infinite number of addresses using a seed phrase (mnemonic or password phrase), usually containing 12 words. The addresses will always be generated in the same sequence from the same seed phrase. Each individual address generated by a mnemonic is no different from any other address and contains its own private key. That is, each MetaMask wallet supports only one passphrase, but each additional address (account) created is generated from the same passphrase. Each address is derived from an HD Wallet using a derivation path that looks like this "m/44'/60'/0'/0". It's not necessary to understand this, but you should know the derivation path used for generating accounts from a wallet app if you intend to transfer your passphrase to a different wallet app.

Hardhat will generate 20 accounts with 10,000 ETH each. The accounts are created using the same mnemonic. This ensures that the same set of accounts are created for testing each time the network is restarted.

```txt
test test test test test test test test test test test junk
```

You can start up a network by setting the passphrase explicitly in the Hardhat config this way

```js
module.exports = {
    networks: {
        hardhat: {
            chainId: 1337,
            accounts: {
                mnemonic:
                    "test test test test test test test test test test test junk",
            },
        },
    },
};
```

---

# Lab 2 - Accounts and Addresses

Refer to "lab-2.ipynb" for the lab exercise.
const express = require("express");
const {Web3} = require("web3");
const NFTMetadata = require("../models/NFTMetadata.js");
const fetch = require("node-fetch");


// Configure Web3
const web3 = new Web3("https://mainnet.infura.io/v3/a09f34379ff449dcbd00a333eca8d547"); 

const getMetadata = async (req, res) => {
  const { contractAddress, tokenId } = req.body;

  if (!contractAddress || !tokenId) {
    return res
      .status(400)
      .json({ error: "Contract address and token ID are required." });
  }

  try {
    // Load the contract ABI
    const abi = [
      // Minimal ERC-721 metadata interface
      {
        constant: true,
        inputs: [{ name: "_tokenId", type: "uint256" }],
        name: "tokenURI",
        outputs: [{ name: "", type: "string" }],
        type: "function",
      },
    ];

    // Interact with the contract
    const contract = new web3.eth.Contract(abi, contractAddress);
    const tokenURI = await contract.methods.tokenURI(tokenId).call();

    // Fetch metadata from the tokenURI 
    const metadataResponse = await fetch(tokenURI);
    const metadata = await metadataResponse.json();

    const { name, description, image: imageUrl } = metadata;

    // Store in MongoDB
    const nft = await NFTMetadata.create({
      contractAddress,
      tokenId,
      name,
      description,
      imageUrl,
    });

    res.status(200).json(nft);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving metadata." });
  }
};

module.exports = { getMetadata };

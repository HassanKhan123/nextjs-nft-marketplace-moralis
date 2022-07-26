const Moralis = require("moralis/node");
require("dotenv").config();

const contractAddresses = require("./constants/networkMapping.json");

let chainId = process.env.CHAIN_ID || 31337;
let moralisChainId = chainId === "31337" ? "1337" : chainId;

const contractAddress = contractAddresses[chainId]["NftMarketplace"][0];

const appId = process.env.NEXT_PUBLIC_MORALIS_APP_ID;
const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
const masterKey = process.env.moralisMasterKey;

async function main() {
  await Moralis.start({ serverUrl, appId, masterKey });
  console.log("Working with contract address: ", contractAddress);

  let itemListedOptions = {
    chainId: moralisChainId,
    sync_historical: true,
    topic: "ItemListed(address,address,uint256,uint256)",
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "seller",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
      ],
      name: "ItemListed",
      type: "event",
    },
    tableName: "ItemListed",
    address: contractAddress,
  };

  let itemBoughtOptions = {
    chainId: moralisChainId,
    sync_historical: true,
    topic: "ItemBought(address,address,uint256,uint256)",
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "buyer",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
      ],
      name: "ItemBought",
      type: "event",
    },
    tableName: "ItemBought",
    address: contractAddress,
  };
  let itemCancelledOptions = {
    chainId: moralisChainId,
    sync_historical: true,
    topic: "ItemCancelled(address,address,uint256)",
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "seller",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "nftAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "ItemCancelled",
      type: "event",
    },
    tableName: "ItemCancelled",
    address: contractAddress,
  };

  const listedResponse = await Moralis.Cloud.run(
    "watchContractEvent",
    itemListedOptions,
    { useMasterKey: true }
  );
  const boughtResponse = await Moralis.Cloud.run(
    "watchContractEvent",
    itemBoughtOptions,
    { useMasterKey: true }
  );
  const cancelledResponse = await Moralis.Cloud.run(
    "watchContractEvent",
    itemCancelledOptions,
    { useMasterKey: true }
  );

  if (
    listedResponse.success &&
    boughtResponse.success &&
    cancelledResponse.success
  ) {
    console.log("Success! Database updated with watching events");
  } else {
    console.log("Something went wrong with the watchContractEvent call");
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
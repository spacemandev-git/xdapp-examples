import hardhat from "hardhat";
import fs from "fs";
// eslint-disable-next-line node/no-missing-import
import { Messenger } from "../typechain";
import { CHAIN_ID_SOLANA, tryNativeToHexString } from "@certusone/wormhole-sdk";

async function main() {
  const signer = hardhat.ethers.Wallet.fromMnemonic(
    "myth like bonus scare over problem client lizard pioneer submit female collect"
  );
  const messengerAddress = fs.readFileSync("../../eth-address.txt").toString();

  const messenger = new hardhat.ethers.Contract(
    messengerAddress,
    (
      await hardhat.artifacts.readArtifact("contracts/Messenger.sol:Messenger")
    ).abi,
    signer
  ) as Messenger;

  messenger.registerApplicationContracts(
    CHAIN_ID_SOLANA,
    tryNativeToHexString(
      "AxJUYo5P9SL9f1XHxdqUSaAvGPqSbFNMcgQ9tZENyofB",
      "solana"
    )
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

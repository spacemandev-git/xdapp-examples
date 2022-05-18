import hardhat from "hardhat";
import { ethers } from "ethers";
import fs from "fs";
// eslint-disable-next-line node/no-missing-import
import { Messenger } from "../typechain";

export async function submitVaa() {
    const vaa = fs.readFileSync("../solana-project/vaa.txt").toString();
    const vaaBytes = Buffer.from(vaa, "base64");

    const signer = ethers.Wallet.fromMnemonic(
        "myth like bonus scare over problem client lizard pioneer submit female collect"
    ).connect(
        new ethers.providers.JsonRpcProvider(`${process.env.TILT_RPC_IP}:8545`)
    );
    const messengerAddress = fs.readFileSync("eth-address.txt").toString();

    const messenger = new ethers.Contract(
        messengerAddress,
        (
            await hardhat.artifacts.readArtifact(
                "contracts/Messenger.sol:Messenger"
            )
        ).abi,
        signer
    ) as Messenger;

    await messenger.recieveEncodedMsg(vaaBytes);
}

submitVaa();

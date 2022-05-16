import hardhat from "hardhat";
import { ethers } from "ethers";
import fs from "fs";
// eslint-disable-next-line node/no-missing-import
import { Messenger } from "../typechain";

export async function submitVaa() {
    const vaa = fs.readFileSync("../solana-project/vaa.txt").toString();
    const vaaBytes = Uint8Array.from(atob(vaa), (c) => c.charCodeAt(0));

    const signer = ethers.Wallet.fromMnemonic(
        "myth like bonus scare over problem client lizard pioneer submit female collect"
    ).connect(
        new ethers.providers.JsonRpcProvider("http://34.235.126.200:8545")
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

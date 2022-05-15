import hardhat from "hardhat";
import fs from "fs";
// eslint-disable-next-line node/no-missing-import
import { Messenger } from "../typechain";

export async function submitVaa(vaa: Uint8Array) {
    const signer = hardhat.ethers.Wallet.fromMnemonic(
        "myth like bonus scare over problem client lizard pioneer submit female collect"
    );
    const messengerAddress = fs
        .readFileSync("../../eth-address.txt")
        .toString();

    const messenger = new hardhat.ethers.Contract(
        messengerAddress,
        (
            await hardhat.artifacts.readArtifact(
                "contracts/Messenger.sol:Messenger"
            )
        ).abi,
        signer
    ) as Messenger;

    await messenger.recieveEncodedMsg(vaa);
}

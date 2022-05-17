import hardhat from "hardhat";
import { ethers } from "ethers";
import fs from "fs";
// eslint-disable-next-line node/no-missing-import
import { Messenger } from "../typechain";
import {
    CHAIN_ID_ETH,
    getEmitterAddressEth,
    parseSequenceFromLogEth,
} from "@certusone/wormhole-sdk";

export async function sendMsg() {
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
    const msgText = "From: EVM, with Love";
    const tx = await (await messenger.sendMsg(Buffer.from(msgText))).wait();
    const emitterAddr = getEmitterAddressEth(messenger.address);
    const seq = parseSequenceFromLogEth(
        tx,
        "0xC89Ce4735882C9F0f0FE26686c53074E09B0D550"
    );

    const WH_DEVNET_REST = "http://34.235.126.200:7071";
    const vaaBytes = await (
        await fetch(
            `${WH_DEVNET_REST}/v1/signed_vaa/${CHAIN_ID_ETH}/${emitterAddr}/${seq}`
        )
    ).json();
    console.log("Signed VAA: ", vaaBytes);

    // Submit on ETH
    fs.writeFileSync("vaa.txt", vaaBytes.vaaBytes);
}
sendMsg();

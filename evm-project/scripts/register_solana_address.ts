import hardhat from "hardhat";
import { ethers } from "ethers";
import fs from "fs";
// eslint-disable-next-line node/no-missing-import
import { Messenger } from "../typechain";
import {
    CHAIN_ID_SOLANA,
    getEmitterAddressSolana,
    setDefaultWasm,
} from "@certusone/wormhole-sdk";

async function main() {
    setDefaultWasm("node");
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

    const solanaAddr = Buffer.from(
        await getEmitterAddressSolana(
            "AxJUYo5P9SL9f1XHxdqUSaAvGPqSbFNMcgQ9tZENyofB"
        ),
        "hex"
    );
    messenger.registerApplicationContracts(CHAIN_ID_SOLANA, solanaAddr);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

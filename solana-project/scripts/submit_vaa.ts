import fs from "fs";
import {
    setDefaultWasm,
    postVaaSolanaWithRetry
} from "@certusone/wormhole-sdk";
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import * as anchor from '@project-serum/anchor';
import {SolanaProject as Messenger} from '../target/types/solana_project';

async function submit_vaa(){
    const vaa = fs.readFileSync("../evm-project/vaa.txt").toString();
    const vaaBytes = Buffer.from(vaa, "base64");
    const SOLANA_CORE_BRIDGE_ADDRESS = "Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o";

    setDefaultWasm("node");
    const KEYPAIR = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync("test_keypair.json").toString()))); //7Tn83bS6TJquiCz9pXsCnYZpZmqPQrTjyeksPmJgURoS
    const CONN_STRING = "http://34.235.126.200:8899";    const CONTRACT_ADDRESS = "AxJUYo5P9SL9f1XHxdqUSaAvGPqSbFNMcgQ9tZENyofB";
    const IDL = JSON.parse(fs.readFileSync('target/idl/solana_project.json').toString());
    const program = new anchor.Program<Messenger>(IDL,CONTRACT_ADDRESS, new anchor.AnchorProvider(new anchor.web3.Connection(CONN_STRING), new NodeWallet(KEYPAIR), {}));


    //Submit to Core Bridge
    await postVaaSolanaWithRetry(
        new anchor.web3.Connection(CONN_STRING, "confirmed"),
        async (tx) => {
            tx.partialSign(KEYPAIR);
            return tx;
        },
        SOLANA_CORE_BRIDGE_ADDRESS,
        KEYPAIR.publicKey.toString(),
        vaaBytes,
        10
    );
    //Confirm via Messenger Code
    
}
submit_vaa();

import * as anchor from '@project-serum/anchor';
import {SolanaProject as Messenger} from '../target/types/solana_project';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import {bs58} from '@project-serum/anchor/dist/cjs/utils/bytes';
import fs from 'fs';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';

async function main(){
    const KEYPAIR = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync("test_keypair.json").toString()))); //7Tn83bS6TJquiCz9pXsCnYZpZmqPQrTjyeksPmJgURoS
    const CONN_STRING = "http://34.235.126.200:8899";
    const CONTRACT_ADDRESS = "AxJUYo5P9SL9f1XHxdqUSaAvGPqSbFNMcgQ9tZENyofB";
    const IDL = JSON.parse(fs.readFileSync('target/idl/solana_project.json').toString());
    const program = new anchor.Program<Messenger>(IDL,CONTRACT_ADDRESS, new anchor.AnchorProvider(new anchor.web3.Connection(CONN_STRING), new NodeWallet(KEYPAIR), {}));

    //Initalize
    let [config_acc, config_bmp] = findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
    )

    await program.methods.initialize()
        .accounts({
            config: config_acc,
            owner: KEYPAIR.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId
        })
        .rpc();
}

main();

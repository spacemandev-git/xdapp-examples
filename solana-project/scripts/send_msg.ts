import * as anchor from '@project-serum/anchor';
import {SolanaProject as Messenger} from '../target/types/solana_project';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import {bs58} from '@project-serum/anchor/dist/cjs/utils/bytes';
import fs from 'fs';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import {submitVaa} from '../../evm-project/scripts/submit_vaa';

import {
    getSignedVAA,
    CHAIN_ID_SOLANA,
    tryNativeToHexString,
    setDefaultWasm
} from '@certusone/wormhole-sdk';
import {
    NodeHttpTransport
} from '@improbable-eng/grpc-web-node-http-transport';

async function main(){
    setDefaultWasm("node");
    const KEYPAIR = anchor.web3.Keypair.fromSecretKey(bs58.decode(fs.readFileSync('test_key.txt').toString()))
    const CONN_STRING = "http://localhost:8899"; //"https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/" //"http://localhost:8899"; // devnet: https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/
    const CONTRACT_ADDRESS = "AxJUYo5P9SL9f1XHxdqUSaAvGPqSbFNMcgQ9tZENyofB";
    const IDL = JSON.parse(fs.readFileSync('target/idl/solana_project.json').toString());
    const program = new anchor.Program<Messenger>(IDL,CONTRACT_ADDRESS, new anchor.AnchorProvider(new anchor.web3.Connection(CONN_STRING), new NodeWallet(KEYPAIR), {}));

    //Send a Message
    const msg_text = "Wormhole is Awesome!";
    const whCoreBridge = new anchor.web3.PublicKey("Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o");

    const whDerivedEmitter = findProgramAddressSync([Buffer.from("emitter")], whCoreBridge)[0]
    const whSequence = findProgramAddressSync([Buffer.from("sequence"), whDerivedEmitter.toBytes()], whCoreBridge)
    await program.methods
        .sendMsg(msg_text)
        .accounts({
            coreBridge: whCoreBridge,
            wormholeConfig: findProgramAddressSync([Buffer.from("Bridge")], whCoreBridge)[0],
            wormholeFeeCollector: findProgramAddressSync([Buffer.from("fee_collector")], whCoreBridge)[0],
            wormholeDerivedEmitter: whDerivedEmitter,
            wormholeSequence: whSequence,
            wormholeMessageKey: anchor.web3.Keypair.generate(),
            payer: KEYPAIR,
            systemProgram: anchor.web3.SystemProgram.programId,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            config: findProgramAddressSync([Buffer.from("config")],program.programId)[0]
        })
        .rpc();
    await new Promise((r) => setTimeout(r, 1000));
    
    const WORMHOLE_DEVNET_HOST = "http://54.144.111.92:7070";
    const vaa = await getSignedVAA(
        WORMHOLE_DEVNET_HOST,
        CHAIN_ID_SOLANA,
        tryNativeToHexString(whDerivedEmitter.toString(), CHAIN_ID_SOLANA),
        tryNativeToHexString(whSequence.toString(), CHAIN_ID_SOLANA),
        {
            transport: NodeHttpTransport()
        }
    )
    console.log("Signed VAA: ", vaa);


    //Submit on ETH
    await submitVaa(vaa.vaaBytes);
}

main();

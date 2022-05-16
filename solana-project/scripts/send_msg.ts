import * as anchor from '@project-serum/anchor';
import {SolanaProject as Messenger} from '../target/types/solana_project';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import fs from 'fs';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import fetch from 'node-fetch';

import {
    CHAIN_ID_SOLANA,
    setDefaultWasm,
    parseSequenceFromLogSolana,
    getEmitterAddressSolana
} from '@certusone/wormhole-sdk';

async function main(){
    setDefaultWasm("node");
    const KEYPAIR = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync("test_keypair.json").toString()))); //7Tn83bS6TJquiCz9pXsCnYZpZmqPQrTjyeksPmJgURoS
    const CONN_STRING = "http://34.235.126.200:8899";    const CONTRACT_ADDRESS = "AxJUYo5P9SL9f1XHxdqUSaAvGPqSbFNMcgQ9tZENyofB";
    const IDL = JSON.parse(fs.readFileSync('target/idl/solana_project.json').toString());
    const program = new anchor.Program<Messenger>(IDL,CONTRACT_ADDRESS, new anchor.AnchorProvider(new anchor.web3.Connection(CONN_STRING), new NodeWallet(KEYPAIR), {}));

    //Send a Message
    const msg_text = "Wormhole is Awesome!";
    const whCoreBridge = new anchor.web3.PublicKey("Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o");
    const whConfig = findProgramAddressSync([Buffer.from("Bridge")], whCoreBridge)[0];
    const whFeeCollector = findProgramAddressSync([Buffer.from("fee_collector")], whCoreBridge)[0];
    const whDerivedEmitter = findProgramAddressSync([Buffer.from("emitter")], program.programId)[0];
    const whSequence = findProgramAddressSync([Buffer.from("Sequence"), whDerivedEmitter.toBytes()], whCoreBridge)[0];
    const whMessageKeypair = anchor.web3.Keypair.generate();
    const tx = await program.methods
        .sendMsg(msg_text)
        .accounts({
            coreBridge: whCoreBridge,
            wormholeConfig: whConfig,
            wormholeFeeCollector: whFeeCollector,
            wormholeDerivedEmitter: whDerivedEmitter,
            wormholeSequence: whSequence,
            wormholeMessageKey: whMessageKeypair.publicKey,
            payer: KEYPAIR.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            config: findProgramAddressSync([Buffer.from("config")],program.programId)[0]
        })
        .signers([KEYPAIR, whMessageKeypair])
        .rpc();
    await new Promise((r) => setTimeout(r, 1000));
    
    const seq = parseSequenceFromLogSolana(await program.provider.connection.getTransaction(tx));
    console.log("Sequence: ", seq);
    const emitterAddress = await getEmitterAddressSolana(program.programId.toString());
    console.log("Emitter Addresss: ", emitterAddress);
   
    const WH_DEVNET_REST = "http://34.235.126.200:7071";
    const vaaBytes = (
        await (
            await fetch(
                `${WH_DEVNET_REST}/v1/signed_vaa/${CHAIN_ID_SOLANA}/${emitterAddress}/${seq}`
            )
        ).json()
    );
    console.log("Signed VAA: ", vaaBytes);


    //Submit on ETH
    fs.writeFileSync('vaa.txt', vaaBytes['vaaBytes']);
    
}

main();

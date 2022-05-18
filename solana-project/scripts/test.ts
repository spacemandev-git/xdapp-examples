import fs from "fs";
import {
    setDefaultWasm,
    postVaaSolanaWithRetry,
    importCoreWasm,
    getClaimAddressSolana,
    getEmitterAddressEth
} from "@certusone/wormhole-sdk";
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import * as anchor from '@project-serum/anchor';
import {SolanaProject as Messenger} from '../target/types/solana_project';
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import * as b from "byteify";
import keccak256 from "keccak256";


async function main(){
    setDefaultWasm("node");
    const { parse_vaa } = await importCoreWasm();

    const vaa = fs.readFileSync("../evm-project/vaa.txt").toString();
    const vaaBytes = Buffer.from(vaa, "base64");
    const SOLANA_CORE_BRIDGE_ADDRESS = "Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o";
    const KEYPAIR = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync("test_keypair.json").toString()))); //7Tn83bS6TJquiCz9pXsCnYZpZmqPQrTjyeksPmJgURoS
    const CONN_STRING = `${process.env.TILT_RPC_IP}:8899`;
    const CONTRACT_ADDRESS = "AxJUYo5P9SL9f1XHxdqUSaAvGPqSbFNMcgQ9tZENyofB";
    const IDL = JSON.parse(fs.readFileSync('target/idl/solana_project.json').toString());
    const program = new anchor.Program<Messenger>(IDL,CONTRACT_ADDRESS, new anchor.AnchorProvider(new anchor.web3.Connection(CONN_STRING), new NodeWallet(KEYPAIR), {}));
    
    const parsed_vaa = parse_vaa(vaaBytes);
    console.log(parsed_vaa);

    let emitter_address_acc = findProgramAddressSync([
        Buffer.from("EmitterAddress"),
        b.serializeUint16(parsed_vaa.emitter_chain)
    ], program.programId)[0];
    console.log(emitter_address_acc.toString());
    
    let processed_vaa_key = findProgramAddressSync([
        Buffer.from(getEmitterAddressEth(fs.readFileSync('../evm-project/eth-address.txt').toString()), "hex"),
        b.serializeUint16(parsed_vaa.emitter_chain),
        b.serializeUint64(parsed_vaa.sequence)
    ], program.programId)[0];
    console.log(processed_vaa_key.toString());

    let buffer_array = []
    buffer_array.push(b.serializeUint32(parsed_vaa.timestamp));
    buffer_array.push(b.serializeUint32(parsed_vaa.nonce));
    buffer_array.push(b.serializeUint16(parsed_vaa.emitter_chain));
    buffer_array.push(Uint8Array.from(parsed_vaa.emitter_address));
    buffer_array.push(b.serializeUint64(parsed_vaa.sequence));
    buffer_array.push(b.serializeUint8(parsed_vaa.consistency_level));
    buffer_array.push(Uint8Array.from(parsed_vaa.payload));
    const hash = keccak256(Buffer.concat(buffer_array));

    let core_bridge_vaa_key = findProgramAddressSync([
        Buffer.from("PostedVAA"),
        hash
    ], new anchor.web3.PublicKey(SOLANA_CORE_BRIDGE_ADDRESS))[0]
    console.log(core_bridge_vaa_key.toString());

    /*
    program.provider.connection.onLogs("all", (evt) => {
        console.log(evt);
    })

    await program.methods.debug()
        .accounts({
            coreBridgeVaa: core_bridge_vaa_key
        })
        .rpc();
    */
}

main();
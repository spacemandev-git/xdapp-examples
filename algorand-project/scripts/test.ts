
import  {
    _parseVAAAlgorand,
    submitVAAHeader,
    TransactionSignerPair
} from "@certusone/wormhole-sdk/lib/cjs/algorand/Algorand";

import {
    hexToUint8Array,
    textToUint8Array,
} from "@certusone/wormhole-sdk/lib/cjs/utils";

import algosdk, {
  Account,
  Algodv2,
  Transaction,
  assignGroupID,
  makeApplicationCallTxnFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  OnApplicationComplete,
  mnemonicToSecretKey,
  waitForConfirmation,
  bigIntToBytes,
} from "algosdk";

async function signSendAndConfirmAlgorand(
    algodClient: Algodv2,
    txs: TransactionSignerPair[],
    wallet: Account
) {
    assignGroupID(txs.map((tx) => tx.tx));
    const signedTxns: Uint8Array[] = [];
    for (const tx of txs) {
        if (tx.signer) {
            signedTxns.push(await tx.signer.signTxn(tx.tx));
        } else {
            signedTxns.push(tx.tx.signTxn(wallet.sk));
        }
    }
    await algodClient.sendRawTransaction(signedTxns).do();
    const result = await waitForConfirmation(
        algodClient,
        txs[txs.length - 1].tx.txID(),
        1
    );
    return result;
}

class AlgoTests {
    constructor() {
    }

    async runTests() {
        const ALGO_TOKEN = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        const ALGOD_ADDRESS= "http://localhost";
        const ALGOD_PORT: number = 4001;

        let t = "01000000000100149f90045969c7979fd9fbf0fd7cb248bd2ea5352fbc1fdeb6dbd5c1e1555217606d638b215c354d606c097a599e9a456ed96093b7e595df963f52ec9518ac9e0062860f1c62860f1c00020000000000000000000000000290fb167208af455bb137780163b7b7a9a10c160000000062860f1c20746f6173746572"
        console.log(t)
        let vaa = hexToUint8Array(t)
        console.log(_parseVAAAlgorand(vaa))

        const algodClient = new Algodv2(ALGO_TOKEN, ALGOD_ADDRESS, ALGOD_PORT);
        let sender = mnemonicToSecretKey("castle sing ice patrol mixture artist violin someone what access slow wrestle clap hero sausage oyster boost tone receive rapid bike announce pepper absent involve")

        let appId = 190
        let coreId = 4

        const params: algosdk.SuggestedParams = await algodClient.getTransactionParams() .do();

        let txs: TransactionSignerPair[] = [];

        txs.push({
            tx: makeApplicationCallTxnFromObject({
                appArgs: [textToUint8Array("registerEmitter"), hexToUint8Array("0000000000000000000000000290fb167208af455bb137780163b7b7a9a10c16"), bigIntToBytes(BigInt(2), 2)],
                appIndex: appId,
                from: sender.addr,
                onComplete: OnApplicationComplete.NoOpOC,
                suggestedParams: params,
            }),
            signer: null,
        });

        let ret = await signSendAndConfirmAlgorand(algodClient, txs, sender);
        console.log(ret);


        let sstate = await submitVAAHeader(algodClient, BigInt(coreId), vaa, sender.addr, BigInt(appId))
        txs = sstate.txs;
        let accts = sstate.accounts;

        txs.push({
            tx: makeApplicationCallTxnFromObject({
                appArgs: [textToUint8Array("receiveMessage"), vaa],
                accounts: accts,
                appIndex: appId,
                from: sender.addr,
                onComplete: OnApplicationComplete.NoOpOC,
                suggestedParams: params,
            }),
            signer: null,
        });

        ret = await signSendAndConfirmAlgorand(algodClient, txs, sender);
        console.log(ret);
    }
}

let t = new AlgoTests()
t.runTests();

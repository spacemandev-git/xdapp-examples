#! /bin/bash
# Deploy EVM
cd evm-project && npx hardhat run --network tilt scripts/deploy.ts && cd ../
# Deploy Solana
solana config set --url "http://34.235.126.200:8899"
cd solana-project && anchor build && solana airdrop 100 -k test_keypair.json && sleep 5 && cd ../
cd solana-deployer && cargo build --release && cargo run --release && cd ../
#Register Solana Address on EVM
cd evm-project && npx hardhat run ./scripts/register_solana_address.ts && cd ../
#Initialize Solana contract
cd solana-project && ts-node ./scripts/initialize_messenger.ts && cd ../
#Register EVM Address on Solana
#Send msg from Solana to EVM
cd solana-project && ts-node ./scripts/send_msg.ts && cd ../
#Submit the VAA
cd evm-project && ts-node ./scripts/submit_vaa.ts && cd ../
#Check the Msg on EVM
cd evm-project && ts-node ./scripts/get_current_msg.ts && cd ../

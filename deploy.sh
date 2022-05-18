#! /bin/bash

export TILT_RPC_IP=$1

# Download Solana-Deployer if it doesn't exist
if [ ! -d "./solana-deployer" ] 
then
    git clone https://github.com/spacemandev-git/solana-deployer
fi
# Deploy EVM
cd evm-project && npx hardhat run --network tilt scripts/deploy.ts && cd ../
# Deploy Solana
solana config set --url $TILT_RPC_IP:8899
cd solana-project && anchor build && solana airdrop 100 -k test_keypair.json && sleep 5 && cd ../
cd solana-deployer && cargo build --release && cargo run --release -- -m=8 --payer=../solana-project/test_keypair.json --program-kp-path=../solana-project/solana_project-keypair.json --program-path=../solana-project/target/deploy/solana_project.so -r=$TILT_RPC_IP:8899 -s=1 -t=5 --thread-count=8 && cd ../
sleep 10
#Register Solana Address on EVM
cd evm-project && npx hardhat run ./scripts/register_solana_address.ts && cd ../
#Initialize Solana contract
#TODO: Don't call this if the config account exists already
cd solana-project && ts-node ./scripts/initialize_messenger.ts && cd ../
#Send msg from Solana to EVM
cd solana-project && ts-node ./scripts/send_msg.ts && cd ../
#Submit the VAA
cd evm-project && ts-node ./scripts/submit_vaa.ts && cd ../
#Check the Msg on EVM
cd evm-project && ts-node ./scripts/get_current_msg.ts && cd ../
#Send msg from EVM to Solana
cd evm-project && ts-node ./scripts/send_msg.ts && cd ../
#Register EVM Address on Solana
cd solana-project && ts-node ./scripts/register_eth_chain.ts && cd ../
#Post and Confirm the VAA
cd solana-project && ts-node ./scripts/submit_vaa.ts && cd ../
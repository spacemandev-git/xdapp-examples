#! /bin/bash
# Deploy EVM
cd evm-project && npx hardhat run --network localhost scripts/deploy.ts & cd ../
# Copy Solana Project and Key into the container and deploy solana
cd solana-project & anchor build
minikube kubectl cp -c wormhole target/deploy/solana_project.so solana-devnet-0:/usr/src/
minikube kubectl cp -c wormhole solana_project-keypair.json solana-devnet-0:/usr/src/
minikube kubectl cp -c wormhole test_keypair.json solana-devnet-0:/usr/src/
minikube kubectl exec -c wormhole solana-devnet-0 -- solana program deploy -u l --output json -k /usr/src/test_keypair.json --program-id /usr/src/solana_project-keypair.json /usr/src/solana_project.so
#Register Solana Address on EVM
cd ../
ts-node evm-project/scripts/register_solana_address.ts
#Initialize Solana contract
ts-node solana-project/scripts/initialize_messenger.ts
#Register EVM Address on Solana
#Send msg from Solana to EVM
ts-node solana-project/scripts/send_msg.ts
#Check the Msg on EVM
ts-node evm-project/scripts/get_current_msg.ts

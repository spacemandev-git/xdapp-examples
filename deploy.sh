#! /bin/bash
# Deploy EVM
cd evm-project && npx hardhat run --network tilt scripts/deploy.ts && cd ../
# Deploy Solana
cd solana-project && anchor build && solana airdrop 100 -k test_keypair.json && sleep 5 && cd ../
cd solana-deployer && cargo build --release && cargo run --release && cd ../

#minikube kubectl exec -c wormhole solana-devnet-0 -- solana airdrop 1000 7Tn83bS6TJquiCz9pXsCnYZpZmqPQrTjyeksPmJgURoS
#minikube kubectl cp -c wormhole target/deploy/solana_project.so solana-devnet-0:/usr/src/
#minikube kubectl cp -c wormhole solana_project-keypair.json solana-devnet-0:/usr/src/
#minikube kubectl cp -c wormhole test_keypair.json solana-devnet-0:/usr/src/
#minikube kubectl exec -c wormhole solana-devnet-0 -- solana program deploy -u l --output json -k /usr/src/test_keypair.json --program-id /usr/src/solana_project-keypair.json /usr/src/solana_project.so

#Register Solana Address on EVM
cd evm-project && npx hardhat run ./scripts/register_solana_address.ts && cd ../
#Initialize Solana contract
cd solana-project && ts-node ./scripts/initialize_messenger.ts && cd ../
#Register EVM Address on Solana
#Send msg from Solana to EVM
cd solana-project && ts-node ./scripts/send_msg.ts && cd ../
#Check the Msg on EVM
cd evm-project && ts-node ./scripts/get_current_msg.ts && cd ../

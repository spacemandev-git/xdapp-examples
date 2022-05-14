#! /bin/bash
# Deploy EVM
cd evm-project && npx hardhat run --network tilt scripts/deploy.ts
# Deploy Solana
solana config set --url ""
cd ../solana-project && anchor build && solana program deploy target/deploy/solana_project.so
#Register Solana Address on EVM
#Register EVM Address on Solana
#Send msg from Solana to EVM
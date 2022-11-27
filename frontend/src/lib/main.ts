import { ethers } from 'ethers'
import * as ethereum from './ethereum'
import { contracts } from '@/contracts.json'
import type { Main } from '$/Main'
import type { MyShip } from '$/Ship.sol'
export type { Main } from '$/Main'
export type { MyShip } from '$/Ship.sol'


export const correctChain = () => {
  return 31337
}

export const init = async (details: ethereum.Details) => {
  const { provider, signer } = details
  const network = await provider.getNetwork()
  if (correctChain() !== network.chainId) {
    console.error('Please switch to HardHat')
    return null
  }
  const { address, abi } = contracts.Main
  const contract = new ethers.Contract(address, abi, provider)
  const deployed = await contract.deployed()
  if (!deployed) return null
  const contract_ = signer ? contract.connect(signer) : contract
  return contract_ as any as Main
}

export const getShip = (cpt : number) : string => {
  let s : string = ''
  switch (cpt){
    case 1 : 
      s = contracts.MyShip1.address
      break;
    case 2 : 
      s = contracts.MyShip2.address
      break;
    case 3 : 
      s =  contracts.MyShip3.address
      break;
    case 4 : 
      s = contracts.MyShip4.address
      break
  }
  return s
}

export const ship1 = async (details: ethereum.Details) => {
  const { provider, signer } = details
  const network = await provider.getNetwork()
  if (correctChain() !== network.chainId) {
    console.error('Please switch to HardHat')
    return null
  }
  const { address, abi} = contracts.MyShip1
  const contract = new ethers.Contract(address, abi, provider)
  const deployed = await contract.deployed()
  if (!deployed) return null
  const ship_ = signer ? contract.connect(signer) : contract
  return ship_ as any as MyShip
}

export const ship2 = async (details: ethereum.Details) => {
  const { provider, signer } = details
  const network = await provider.getNetwork()
  if (correctChain() !== network.chainId) {
    console.error('Please switch to HardHat')
    return null
  }

  const { address, abi} = contracts.MyShip2
  const contract = new ethers.Contract(address, abi, provider)
  const deployed = await contract.deployed()
  if (!deployed) return null
  const ship_ = signer ? contract.connect(signer) : contract
  return ship_ as any as MyShip
}

export const ship3 = async (details: ethereum.Details) => {
  const { provider, signer } = details
  const network = await provider.getNetwork()
  if (correctChain() !== network.chainId) {
    console.error('Please switch to HardHat')
    return null
  }
  const { address, abi} = contracts.MyShip3
  const contract = new ethers.Contract(address, abi, provider)
  const deployed = await contract.deployed()
  if (!deployed) return null
  const ship_ = signer ? contract.connect(signer) : contract
  return ship_ as any as MyShip
}

export const ship4 = async (details: ethereum.Details) => {
  const { provider, signer } = details
  const network = await provider.getNetwork()
  if (correctChain() !== network.chainId) {
    console.error('Please switch to HardHat')
    return null
  }
  const { address, abi} = contracts.MyShip4
  const contract = new ethers.Contract(address, abi, provider)
  const deployed = await contract.deployed()
  if (!deployed) return null
  const ship_ = signer ? contract.connect(signer) : contract
  return ship_ as any as MyShip
}

import 'dotenv/config'
import { DeployFunction } from 'hardhat-deploy/types'
import { int } from 'hardhat/internal/core/params/argumentTypes'
import { shortenFullJsonFilePath } from 'typechain'

const deployer: DeployFunction = async hre => {
  if (hre.network.config.chainId !== 31337) return
  const { deployer } = await hre.getNamedAccounts()
  await hre.deployments.deploy('Main', { from: deployer, log: true })
  await hre.deployments.deploy('MyShip1', { contract: 'MyShip', from: deployer, log: true })
  await hre.deployments.deploy('MyShip2', { contract: 'MyShip', from: deployer, log: true })
  await hre.deployments.deploy('MyShip3', { contract: 'MyShip', from: deployer, log: true })
  await hre.deployments.deploy('MyShip4', { contract: 'MyShip', from: deployer, log: true })

}

export default deployer

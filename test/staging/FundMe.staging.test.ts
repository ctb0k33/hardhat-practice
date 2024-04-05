import { BaseContract } from "ethers"
import { FundMe } from "../../typechain-types"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { assert } from 'chai'

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
        let fundMe: FundMe
        let deployer: string
        const sendValue = ethers.parseEther("0.01") // 1eth
        beforeEach(async () => {
            // get from hardhat config
            deployer = (await getNamedAccounts()).deployer;

            // this is because ethers different version require abi and address to get contract
            const fundMeContract = await deployments.get("FundMe");
            fundMe = await ethers.getContractAt(fundMeContract.abi,
                fundMeContract.address,
                await ethers.getSigner(deployer)
            ) as BaseContract as FundMe
        })
        it("allow people to fund and withdraw", async function () {
            await fundMe.fund({ value: sendValue })
            await fundMe.withdraw()
            const endingBalance = await ethers.provider.getBalance(await fundMe.getAddress())
            assert.equal(endingBalance.toString(), "0")
        })
    })
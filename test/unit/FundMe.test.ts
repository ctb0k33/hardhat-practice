import { BaseContract } from "ethers"
import { FundMe, MockV3Aggregator } from "../../typechain-types"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { assert, expect } from "chai"
import { developmentChains } from "../../helper-hardhat-config"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
        let fundMe: FundMe
        let deployer: string
        let MockV3Aggregator: MockV3Aggregator
        const sendValue = ethers.parseEther("1") // 1eth
        beforeEach(async () => {
            // deploy all contract 
            await deployments.fixture(["all"])

            deployer = (await getNamedAccounts()).deployer;
            // this is because ethers different version require abi and address to get contract
            const fundMeContract = await deployments.get("FundMe");
            const mockV3AggregatorContract = await deployments.get("MockV3Aggregator");
            fundMe = await ethers.getContractAt(
                fundMeContract.abi,
                fundMeContract.address,
                await ethers.getSigner(deployer) // Fix: Convert deployer to Signer object
            ) as BaseContract as FundMe
            MockV3Aggregator = await ethers.getContractAt(
                mockV3AggregatorContract.abi,
                mockV3AggregatorContract.address,
                await ethers.getSigner(deployer)
            ) as BaseContract as MockV3Aggregator
        })

        describe("Constructor", async function () {
            it("set the aggregator address correctly", async function () {
                const response = await fundMe.i_priceFeed()
                assert.equal(response, await MockV3Aggregator.getAddress())
            })
        })

        describe("fund", async function () {
            it("Fails if you don't send enough ether", async function () {
                await expect(fundMe.fund({ value: 0 })).to.be.revertedWith("You need to spend more ETH!")
            })
            it("Update the amount funded data structure", async function () {
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.getAddressToAmountFunded(deployer)
                // convert to string beacuse ethers.js return BigNumber
                assert.equal(response.toString(), sendValue.toString())
            })
            it("Add funder to array of funders", async function () {
                await fundMe.fund({ value: sendValue })
                const funder = await fundMe.getFunders(0)
                assert.equal(funder, deployer)
            })
        })

        describe("withdraw", async function () {
            this.beforeEach(async function () {
                await fundMe.fund({ value: sendValue })
            })
            it("Only the owner can withdraw", async function () {
                const accounts = await ethers.getSigners();
                const attacker = accounts[1];
                const owner = accounts[0];
                await expect(fundMe.connect(attacker).withdraw()).to.be.reverted
            })
            it("Withdraw the fund", async function () {
                await fundMe.fund({ value: sendValue })
                // const ownerBalance = await ethers.provider.getBalance(deployer)
                // console.log(ownerBalance)
                await fundMe.connect(await ethers.getSigner(deployer)).withdraw()
                const response = await fundMe.getAddressToAmountFunded(deployer)
                assert.equal(response.toString(), "0")
            })
            it("test withdraw with multiple owner", async function () {
                const accounts = await ethers.getSigners();
                for (let i = 1; i < accounts.length; i++) {
                    await fundMe.connect(accounts[i]).fund({ value: sendValue })
                }
                await fundMe.connect(await ethers.getSigner(deployer)).withdraw()
                for (let i = 1; i < accounts.length; i++) {
                    const response = await fundMe.getAddressToAmountFunded(await accounts[i].getAddress())
                    assert.equal(response.toString(), "0")
                }
                await expect(fundMe.getFunders(0)).to.be.reverted
            })
        })
    })
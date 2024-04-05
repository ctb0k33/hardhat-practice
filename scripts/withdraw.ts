import { getNamedAccounts,deployments,ethers } from "hardhat";
import {BaseContract } from "ethers";
import { FundMe } from "../typechain-types";

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMeContract = await deployments.get("FundMe");
    const fundMe = await ethers.getContractAt(fundMeContract.abi,
        fundMeContract.address,
        await ethers.getSigner(deployer)) as BaseContract as FundMe;
    const transaction = await fundMe.withdraw();
    await transaction.wait(1);
    console.log("Got it back")

}
main().then(() => process.exit(0)).catch((error) => { process.exit(1) })
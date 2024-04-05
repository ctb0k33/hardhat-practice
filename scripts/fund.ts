import { deployments, ethers, getNamedAccounts } from "hardhat";
import { BaseContract } from "ethers";
import { FundMe } from "../typechain-types";

async function main() {
    const { deployer } = await getNamedAccounts();
    let fundMeContract = await deployments.get("FundMe");
    const fundMe: FundMe = await ethers.getContractAt(fundMeContract.abi,
        fundMeContract.address,
        await ethers.getSigner(deployer)) as BaseContract as FundMe;
    const transaction = await fundMe.fund({ value: ethers.parseEther("0.01") });
    await transaction.wait(1);
    console.log("Funded")
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
})
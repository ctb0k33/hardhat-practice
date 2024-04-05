import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { verify } from "../utils/verify";
import "dotenv/config";

const deployFundMe: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;


    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId || 11155111;
    let ethUsdPriceFeedAddress;

    if (developmentChains.includes(network.name)) {
        // get the Mock address
        const getUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = getUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }
    const args = [ethUsdPriceFeedAddress];
    // 
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put priceFeed address
        log: true,
        waitConfirmations: 1
    });
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args);
    }
};

export default deployFundMe;
deployFundMe.tags = ["all", "fundme"]
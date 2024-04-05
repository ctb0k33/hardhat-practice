import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, DECIMALS, INITIAL_ANSWER } from "../helper-hardhat-config";
import { DeployFunction } from "hardhat-deploy/dist/types";

const deployMock:DeployFunction = async(hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        console.log("Currently deploy on development chain ...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER]
        })
        console.log("MOCK-DEPLOYED")
        console.log("-----------------------------------------------");
        
    }
};

export default deployMock;
deployMock.tags = ["all", "mocks"];
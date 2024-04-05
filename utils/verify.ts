import { run } from "hardhat";

export const verify = async (contractAddress: string, args: any[]) => {
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
        // catch if contract already verified
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Contract already verified");
        } else {
            console.log(e)
        }
    }


}
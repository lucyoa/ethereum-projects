const CallerContract = artifacts.require("CallerContract");
const EthPriceOracle = artifacts.require("EthPriceOracle");

module.exports = async function (deployer) {
    await deployer.deploy(EthPriceOracle);
    const ethPriceOracle = await EthPriceOracle.deployed();

    await deployer.deploy(CallerContract);
    const callerContract = await CallerContract.deployed();

    await callerContract.setOracleInstanceAddress(ethPriceOracle.address);
};

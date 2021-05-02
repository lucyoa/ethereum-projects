const CallerContract = artifacts.require("CallerContract");

module.exports = async function(callback) {
    const callerContract = await CallerContract.deployed();
    console.log(`CallerContract address ${callerContract.address}`);

    const ethPrice = await callerContract.ethPrice();
    console.log(`EthPrice: ${ethPrice}`);

    callback();
}

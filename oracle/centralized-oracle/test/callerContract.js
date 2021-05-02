const CallerContract = artifacts.require("CallerContract");
const EthPriceOracle = artifacts.require("EthPriceOracle");

const { expectRevert } = require("@openzeppelin/test-helpers");

contract("CallerContract", accounts => {
    let callerContract;
    let ethPriceOracle;

    beforeEach("deploy new contract", async () => {
        ethPriceOracle = await EthPriceOracle.new();
        callerContract = await CallerContract.new();
    });

    it("sets oracle address", async () => {
        let oracleAddress = await callerContract.oracleAddress();
        assert(oracleAddress == 0x0);

        await callerContract.setOracleInstanceAddress(ethPriceOracle.address);

        oracleAddress = await callerContract.oracleAddress();
        assert(oracleAddress == ethPriceOracle.address);
    });

    it("not owner should not set oracle address", async () => {
        await expectRevert(
            callerContract.setOracleInstanceAddress(accounts[0], {from: accounts[1]}),
            "Ownable: caller is not the owner."
        );
    });

    it("update eth price", async () => {
        await callerContract.setOracleInstanceAddress(ethPriceOracle.address);
        const id = await callerContract.updateEthPrice();
    });

    it("should set eth price", async () => {
        let ethPrice = await callerContract.ethPrice();
        assert(ethPrice == 0);

        await callerContract.setOracleInstanceAddress(ethPriceOracle.address);
        await callerContract.updateEthPrice();

        await callerContract.setOracleInstanceAddress(accounts[0]);
        // await callerContract.callback(1000, 1);
    });

    it("should revert on request not in pending list for set eth price", async () => {
        let ethPrice = await callerContract.ethPrice();
        assert(ethPrice == 0);

        await callerContract.setOracleInstanceAddress(ethPriceOracle.address);
        await callerContract.updateEthPrice();

        await callerContract.setOracleInstanceAddress(accounts[0]);

        await expectRevert(
            callerContract.callback(1000, 1),
            "request is not in the pending list"
        );
    });
});


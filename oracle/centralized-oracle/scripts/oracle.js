require("dotenv").config()

const Web3 = require("web3");
const axios = require("axios").default;

const localProvider = new Web3.providers.WebsocketProvider(process.env.HTTP_PROVIDER);
const web3 = new Web3(localProvider)

const EthPriceOracle = require("../build/contracts/EthPriceOracle.json");

const { address: admin } = web3.eth.accounts.wallet.add(process.env.PRIVKEY);

const ethPriceOracle = new web3.eth.Contract(
    EthPriceOracle.abi,
    EthPriceOracle.networks[process.env.NETWORK_ID].address
);

async function retrieveLatestEthPrice () {
    const resp = await axios({
        url: "https://api.binance.com/api/v3/ticker/price",
        params: {
            symbol: "ETHUSDT"
        },
        method: "get"
    })

    return resp.data.price
}


ethPriceOracle.events.GetLatestEthPriceEvent(
    {fromBlock: 0}
)
.on("data", async event => {
    const { callerAddress, id } = event.returnValues;

    const ethPrice = parseInt((await retrieveLatestEthPrice()).replace(".", ""));
    console.log(ethPrice);

    try {
        const tx = ethPriceOracle.methods.setLatestEthPrice(
            ethPrice, 
            callerAddress,
            id
        );

        const [gasPrice, gasCost] = await Promise.all([
            web3.eth.getGasPrice(),
            tx.estimateGas({from: admin})
        ]);

        const data = tx.encodeABI();
        const txData = {
            from: admin,
            to: ethPriceOracle.options.address,
            data,
            gas: gasCost,
            gasPrice
        };

        const receipt = await web3.eth.sendTransaction(txData);
        console.log(`Transaction hash: ${receipt.transactionHash}`);
        console.log(`Setting ETH - ID: ${id} Price: ${ethPrice}`)
    } catch(err) {
    }
})
// .on("error", console.error);

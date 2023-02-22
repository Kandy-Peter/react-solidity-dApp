require ('@nomiclabs/hardhat-waffle');
require('dotenv').config();

module.exports = {
  solidity: "0.8.0",
  networks: {
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/P0yIeAwKx6mc6tIp8CpwKYflJcrmOE3O",
      accounts: [`${process.env.PRIVATE_KEY}`]
    }
  }
};

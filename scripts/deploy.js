const hre = require('hardhat');

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const CryptoToken = await hre.ethers.getContractFactory('CryptoToken');
    const cryptoToken = await CryptoToken.deploy('Crypto Token', 'CRT', 18, ethers.utils.parseEther('1000'));
    await cryptoToken.deployed();

    console.log(`CryptoToken deployed to: ${cryptoToken.address}`);
    console.log(`Deploying contract with: ${deployer.address} `);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
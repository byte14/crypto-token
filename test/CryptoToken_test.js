const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoToken contract test", () => {
    let cryptoToken;
    let owner, account1, account2, account3;

    beforeEach(async () => {
        [owner, account1, account2, account3] = await ethers.getSigners();
        const CryptoToken = await ethers.getContractFactory("CryptoToken");
        cryptoToken = await CryptoToken.deploy('Crypto Token', 'CRT', 18, ethers.utils.parseEther('1000'));
        await cryptoToken.deployed();
    });

    it("Should initialize the contract with correct values", async () => {
        expect(await cryptoToken.name()).to.equal("Crypto Token");
        expect(await cryptoToken.symbol()).to.equal("CRT");
        expect(await cryptoToken.decimals()).to.equal(18);
    });

    it("Should allocates the initial supply of 1000 to the owner address", async () => {
        const ownerBalance = await cryptoToken.balanceOf(owner.address);
        expect(await cryptoToken.totalSupply()).to.equal(ownerBalance).to.equal(ethers.utils.parseEther('1000'));
    });

    it("Should transfer token ownership", async () => {
        await expect(cryptoToken.transfer(account1.address, ethers.utils.parseEther('2000'))).to.be.revertedWith('Not enough tokens');

        const tx = await cryptoToken.transfer(account1.address, ethers.utils.parseEther('200'));
        const res = await tx.wait();
        expect(res.events[0].args._from).to.equal(owner.address);
        expect(res.events[0].args._to).to.equal(account1.address);
        expect(res.events[0].args._value).to.equal(ethers.utils.parseEther('200'));
        
        expect(await cryptoToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther('800'));
        expect(await cryptoToken.balanceOf(account1.address)).to.equal(ethers.utils.parseEther('200'));
    });

    it("Should approve tokens for delegated transfer", async () => {
        const tx = await cryptoToken.approve(account1.address, ethers.utils.parseEther('100'));
        const res = await tx.wait();
        expect(res.events[0].args._owner).to.equal(owner.address);
        expect(res.events[0].args._spender).to.equal(account1.address);
        expect(res.events[0].args._value).to.equal(ethers.utils.parseEther('100'));

        expect(await cryptoToken.allowance(owner.address, account1.address)).to.equal(ethers.utils.parseEther('100'));
    });

    it("Should handle delegated token transfer", async () => {
        const fromAccount = account1;
        const toAccount = account2;
        const spendingAccount = account3;

        await cryptoToken.transfer(fromAccount.address, ethers.utils.parseEther('100'));
        await cryptoToken.connect(fromAccount).approve(spendingAccount.address, ethers.utils.parseEther('50'));

        await expect(cryptoToken.connect(spendingAccount).transferFrom(fromAccount.address, toAccount.address, ethers.utils.parseEther('200'))).to.be.revertedWith('Not enough tokens');
        await expect(cryptoToken.connect(spendingAccount).transferFrom(fromAccount.address, toAccount.address, ethers.utils.parseEther('100'))).to.be.revertedWith("Cannot exceed approved amount");

        const tx = await cryptoToken.connect(spendingAccount).transferFrom(fromAccount.address, toAccount.address, ethers.utils.parseEther('30'));
        const res = await tx.wait();
        expect(res.events[0].args._from).to.equal(fromAccount.address);
        expect(res.events[0].args._to).to.equal(toAccount.address);
        expect(res.events[0].args._value).to.equal(ethers.utils.parseEther('30'));

        expect(await cryptoToken.balanceOf(fromAccount.address)).to.equal(ethers.utils.parseEther('70'));
        expect(await cryptoToken.balanceOf(toAccount.address)).to.equal(ethers.utils.parseEther('30'));
        expect(await cryptoToken.allowance(fromAccount.address, spendingAccount.address)).to.equal(ethers.utils.parseEther('20'));
    });
});
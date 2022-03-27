var CryptoToken = artifacts.require("./CryptoToken.sol");

contract('CryptoToken', function(accounts) {
	var tokenInstance;

	it('initializes the contract with correct values', function() {
		return CryptoToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name) {
			assert.equal(name, 'Crypto Token', 'has the correct name');
			return tokenInstance.symbol();
		}).then(function(symbol) {
			assert.equal(symbol, 'CT', 'has the correct symbol');
			return tokenInstance.standard();
		}).then(function(standard) {
			assert.equal(standard, 'Crypto Token v1.0', 'has the correct standard');
		});
	});	

	it('allocates the initial supply upon deployment', function() {
		return CryptoToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(ownerBalance) {
			assert.equal(ownerBalance.toNumber(), 1000000, 'it allocates the initial supply to the owner account');
		});
	});

	it('transfers token ownership', function() {
		return CryptoToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.transfer.call(accounts[1], 9999999999999999);
		}).then(assert.fail).catch(function(error) {
			assert(error.message, 'error message must contain revert');
			return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
		}).then(function(success) {
			assert.equal(success, true, 'it returns true');
			return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
		}).then(function(reciept) {
			assert.equal(reciept.logs.length, 1, 'triggers one event');
			assert.equal(reciept.logs[0].event, 'Transfer', 'should be the "Transfer" event');
			assert.equal(reciept.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
			assert.equal(reciept.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
			assert.equal(reciept.logs[0].args._value, 250000, 'logs the transfer amount');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 250000, 'adds the amount to the receiving account');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 750000, 'deducts the amount from sending account');
		});
	});

	it('approves tokens for delegated transfer', function() {
		return CryptoToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1], 100);
		}).then(function(success) {
			assert.equal(success, true, 'it returns true');
			return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Approval', 'should be "Approval" event');
			assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
			assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
			assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
			return tokenInstance.allowance(accounts[0], accounts[1]);
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
		});
	});

	 it('handles delegated token transfers', function() {
	 	return CryptoToken.deployed().then(function(instance) {
	 		tokenInstance = instance;
	 		fromAccount = accounts[2];
	 		toAccount = accounts[3];
	 		spendingAccount = accounts[4];
	 		return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
	 	}).then(function(receipt) {
	 		return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
	 	}).then(function(receipt) {
	 		return tokenInstance.transferFrom(fromAccount, toAccount, 999, { from: spendingAccount });
	 	}).then(assert.fail).catch(function(error) {
	 		assert(error.message, 'cannot transfer value larger than the balance');
	 		return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
	 	}).then(assert.fail).catch(function(error) {
	 		assert(error.message, 'cannot tranfer value larger than the approved amount');
	 		return tokenInstance.tranferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
	 	});
	 });
}); 
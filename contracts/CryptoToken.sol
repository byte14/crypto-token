// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoToken {
	string public name = 'Crypto Token';
	string public symbol = 'CT';
	string public standard = 'Crypto Token v1.0';
	uint public totalSupply;
	address public owner;

	event Transfer(
		address indexed _from,
		address indexed _to,
		uint _value
		);

	event Approval(
		address indexed _owner,
		address indexed _spender,
		uint _value
		);

	mapping (address => uint) public balanceOf;
	mapping (address => mapping(address => uint)) public allowance;
	
	constructor (uint _initialSupply) {
		owner = msg.sender;
		balanceOf[owner] = _initialSupply;
		totalSupply = _initialSupply;
	}

	function transfer(address _to, uint _value) public returns (bool success) {
		require(_value <= balanceOf[msg.sender], 'You do not have enough balance');
		// will add: cannot transfer to own address
		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;

		emit Transfer(msg.sender, _to, _value);
		return true;
	}

	function approve(address _spender, uint _value) public returns (bool success) {
		allowance[msg.sender][_spender] = _value;
		// will write different function for allowance
		emit Approval(msg.sender, _spender, _value);

		return true;
	}

	function transferFrom(address _from, address _to, uint _value) public returns (bool success) {
		require(balanceOf[_from] >= _value, 'amount should not exceed the balance');
		require(allowance[_from][msg.sender] >= _value, 'amount should not exceed allowance');

		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;

		allowance[_from][msg.sender] -= _value;

		emit Transfer(_from, _to, _value);

		return true;
	}
}
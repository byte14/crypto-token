// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract CryptoToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint public totalSupply;

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

    constructor (string memory _name, string memory _symbol, uint8 _decimals, uint _initialSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint _value) public returns (bool sucess) {
        require(balanceOf[msg.sender] >= _value, 'Not enough tokens');
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint _value) public returns (bool success) {
        allowance[msg.sender][_spender] += _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint _value) public returns (bool success) {
        require(balanceOf[_from] >= _value, "Not enough tokens");
        require(allowance[_from][msg.sender] >= _value, "Cannot exceed approved amount");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }
}
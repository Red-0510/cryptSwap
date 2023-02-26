// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange{

    struct _Order{
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    address public feeAccount;
    uint256 public feePercent;
    mapping (address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public cancelledOrder;
    mapping(uint256 => bool) public filledOrder;
    uint256 public orderCount;

    event Deposit(address token,address user , uint256 amount,uint256 balance);
    event Withdraw(address token,address user , uint256 amount,uint256 balance);
    event Order(uint256 id,address user,address tokenGet,uint256 amountGet,address tokenGive,uint256 amountGive,uint256 timestamp);
    event CancelOrder(uint256 id,address user,address tokenGet,uint256 amountGet,address tokenGive,uint256 amountGive,uint256 timestamp);
    event Trade(uint256 id,address user,address tokenGet,uint256 amountGet,address tokenGive,uint256 amountGive,address creator,uint256 timestamp);

    constructor(address _feeAccount,uint256 _feePercent){
        feeAccount = _feeAccount;
        feePercent = _feePercent;
        orderCount=0;
    }

    function depositToken(address _token,uint256 _amount) public {

        // transfer tokens to exchange
        require(Token(_token).transferFrom(msg.sender,address(this), _amount));

        tokens[_token][msg.sender] += _amount;

        emit Deposit(_token, msg.sender, _amount,tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token,uint256 _amount) public{
        require(tokens[_token][msg.sender]>=_amount);

        Token(_token).transfer(msg.sender, _amount);

        tokens[_token][msg.sender] -= _amount;

        emit Withdraw(_token, msg.sender, _amount,tokens[_token][msg.sender]);
    }

    function balanceOf(address _token , address _user)
        public view
        returns (uint256)
    {
        return tokens[_token][_user];
    }

    // Orders
    function makeOrder(address _tokenGet,uint256 _amountGet,address _tokenGive,uint256 _amountGive) public{
        require(balanceOf(_tokenGive,msg.sender)>=_amountGive);
        orderCount+=1;
        orders[orderCount]= _Order(orderCount,msg.sender,_tokenGet,_amountGet,_tokenGive,_amountGive,block.timestamp);

        emit Order(orderCount,msg.sender,_tokenGet,_amountGet,_tokenGive,_amountGive,block.timestamp);
    }

    function cancelOrder(uint256 _id) public {
        _Order storage _order = orders[_id];
        require(_order.user==msg.sender);
        require(_order.id==_id);

        cancelledOrder[_id]=true;
        emit CancelOrder(_order.id,msg.sender,_order.tokenGet,_order.amountGet,_order.tokenGive,_order.amountGive,_order.timestamp);
    }

    function fillOrder(uint256 _id) public {
        require(_id>0 && _id<=orderCount);
        require(!cancelledOrder[_id]);
        require(!filledOrder[_id]);

        _Order storage _order = orders[_id];


        _trade(_order.id,_order.user,_order.tokenGet,_order.amountGet,_order.tokenGive,_order.amountGive);
    }

    function _trade(uint256 _id,address _user,address _tokenGet,uint256 _amountGet,address _tokenGive,uint256 _amountGive) internal {
        uint256 _feeAmount = (_amountGet*feePercent)/100;

        tokens[_tokenGet][msg.sender] -= (_amountGet+_feeAmount);
        tokens[_tokenGet][_user] += _amountGet;
        tokens[_tokenGive][msg.sender]+=_amountGive;
        tokens[_tokenGive][_user] -= _amountGive;

        // fee charges
        tokens[_tokenGet][feeAccount] += _feeAmount;

        filledOrder[_id]=true;
        emit Trade(_id,msg.sender,_tokenGet,_amountGet,_tokenGive,_amountGive,_user,block.timestamp);
        
    }
}
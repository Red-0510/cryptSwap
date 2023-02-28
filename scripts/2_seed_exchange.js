import hre from 'hardhat';
import config from '../src/config.json';
// const config = require('../src/config.json');
const {ethers} = hre;

const tokens = (n)=>{
    return ethers.utils.parseUnits(n.toString(),'ether');
}

function wait(seconds){
    const ms=seconds*1000;
    return new Promise(resolve => setTimeout(resolve,ms));
}

async function main(){

    const {chainId} = await ethers.provider.getNetwork();
    console.log('Using ChainId ',chainId);

    const red = await ethers.getContractAt('Token',config[chainId].red.address);
    console.log(`RED Token fetched at :${red.address}`);

    const mETH = await ethers.getContractAt('Token',config[chainId].mETH.address);
    console.log(`mETH Token fetched at :${mETH.address}`);
    
    const mBTC = await ethers.getContractAt('Token',config[chainId].mBTC.address);
    console.log(`mBTC Token fetched at :${mBTC.address}`);

    const exchange = await ethers.getContractAt('Exchange',config[chainId].exchange.address);
    console.log(`Exchange Contract fetched at :${exchange.address}`);

    const accounts =  await ethers.getSigners();
    const deployer = accounts[0];
    const feeAccount = await exchange.feeAccount();
    console.log(`fee Account :${feeAccount}`);

    const user1=accounts[2];
    const user2 = accounts[3];
    const user3 = accounts[4];
    let amount=tokens(10000);
    let transaction,result;
    transaction = await red.connect(deployer).transfer(user1.address,amount)
    await transaction.wait();
    console.log(`Transferred ${amount} RED tokens from ${deployer.address} to ${user1.address}`);
    transaction = await red.connect(user1).approve(exchange.address,amount);
    await transaction.wait();
    console.log(`Approved ${amount} RED tokens from ${user1.address}`);
    transaction = await exchange.connect(user1).depositToken(red.address,amount);
    await transaction.wait();
    console.log(`Deposited ${amount} RED tokens from ${user1.address}`);

    transaction = await mETH.connect(deployer).transfer(user2.address,amount)
    await transaction.wait();
    console.log(`Transferred ${amount} mETH tokens from ${deployer.address} to ${user2.address}`);
    transaction = await mETH.connect(user2).approve(exchange.address,amount);
    await transaction.wait();
    console.log(`Approved ${amount} mETH tokens from ${user2.address}`);
    transaction = await exchange.connect(user2).depositToken(mETH.address,amount);
    await transaction.wait();
    console.log(`Deposited ${amount} mETH tokens from ${user2.address}`);

    transaction = await mBTC.connect(deployer).transfer(user3.address,amount)
    await transaction.wait();
    console.log(`Transferred ${amount} mBTC tokens from ${deployer.address} to ${user3.address}`);
    transaction = await mBTC.connect(user3).approve(exchange.address,amount);
    await transaction.wait();
    console.log(`Approved ${amount} mBTC tokens from ${user3.address}`);
    transaction = await exchange.connect(user3).depositToken(mBTC.address,amount);
    await transaction.wait();
    console.log(`Deposited ${amount} mBTC tokens from ${user3.address}`);

    // makeOrder

    transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(100),red.address,tokens(5));
    await transaction.wait();
    console.log(`made order from ${user1.address}`);

    //cancel order
    let orderId;
    orderId = await exchange.orderCount();
    transaction = await exchange.connect(user1).cancelOrder(orderId);
    await transaction.wait();
    console.log(`cancelled the order from ${user1.address}`);

    await wait(1);

    transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(100),red.address,tokens(10));
    await transaction.wait();
    console.log(`made order from ${user1.address}`);

    orderId = await exchange.orderCount();
    transaction = await exchange.connect(user2).fillOrder(orderId);
    await transaction.wait();
    console.log(`Filled the order from ${user2.address} created by ${user1.address}`);

    await wait(1);

    transaction = await exchange.connect(user2).makeOrder(mBTC.address,tokens(50),mETH.address,tokens(15));
    await transaction.wait();
    console.log(`made order from ${user2.address}`);
    
    orderId = await exchange.orderCount();
    transaction = await exchange.connect(user3).fillOrder(orderId);
    await transaction.wait();
    console.log(`Filled the order from ${user3.address} created by ${user2.address}`);

    await wait(1);

    transaction = await exchange.connect(user3).makeOrder(red.address,tokens(10),mBTC.address,tokens(20));
    await transaction.wait();
    console.log(`made order from ${user3.address}`);
    
    orderId = await exchange.orderCount();
    transaction = await exchange.connect(user1).fillOrder(orderId);
    await transaction.wait();
    console.log(`Filled the order from ${user1.address} created by ${user3.address}`);

    await wait(1);

    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(i*15),red.address,tokens(i*10));
        await transaction.wait();
        console.log(`made ${i}th order from ${user1.address}`);
    }

    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user2).makeOrder(red.address,tokens(i*10),mETH.address,tokens(i*20));
        await transaction.wait();
        console.log(`made ${i}th order from ${user2.address}`);
    }

    for (let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user3).makeOrder(red.address,tokens(i*15),mBTC.address,tokens(i*20));
        await transaction.wait();
        console.log(`made ${i}th order from ${user3.address}`);
    }
}

main()
   .then(()=>process.exit(0))
   .catch(err=>{
    console.log(err);
    process.exit(1);
   });
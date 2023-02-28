import hre from "hardhat";

const {ethers} = hre;

async function main(){
    //Fetch the contract
    const Token = await ethers.getContractFactory('Token');
    const Exchange = await ethers.getContractFactory('Exchange');

    const accounts =await ethers.getSigners();
    //deploy the contract
    const red = await Token.deploy('Red Coin','RED',1000000);
    await red.deployed();
    console.log(`Red Token deployed to: ${red.address}`);
    const meth = await Token.deploy('My Ethereum','mETH',1000000);
    await meth.deployed();
    console.log(`mETH Token deployed to: ${meth.address}`);
    const mbtc = await Token.deploy('My Bitcoin','mBTC',1000000);
    await mbtc.deployed();
    console.log(`mBTC Token deployed to: ${mbtc.address}`);

    const exchange = await Exchange.deploy(accounts[1].address,10);
    await exchange.deployed();
    console.log('Exchange contract deployed at address :',exchange.address);

}

main()
  .then(()=>process.exit(0))
  .catch(error=>{
    console.log(error);
    process.exit(1);
  });
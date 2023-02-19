import {ethers} from "hardhat";

async function main(){
    //Fetch the contract
    const Token = await ethers.getContractFactory("Token");

    //deploy the contract
    const token = await Token.deploy();
    await token.deployed();
    console.log(`Token deployed to: ${token.address}`);
}

main()
  .then(()=>process.exit(0))
  .catch(error=>{
    console.log(error);
    process.exit(1);
  });
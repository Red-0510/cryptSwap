import hre from "hardhat";
import { expect } from "chai";
const {ethers} = hre;
const tokens = (n)=>{
    return ethers.utils.parseUnits(n.toString(),'ether');
}

describe('Exchange',()=>{
    let deployer,feeAccount,exchange;
    const feePercent = 10;
    beforeEach(async ()=>{
        let accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];

        const Exchange = await ethers.getContractFactory('Exchange');
        exchange = await Exchange.deploy(feeAccount.address,feePercent);
    })

    describe('Deployment',()=>{
        it('tracks the fee Account',async ()=>{
            expect(await exchange.feeAccount()).to.equal(feeAccount.address);
        });

        it('checks the fee Percent',async ()=>{
            expect(await exchange.feePercent()).to.equal(feePercent);
        });
    });
});
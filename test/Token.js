import hre from "hardhat";
import { expect } from "chai";
const {ethers} = hre;
const tokens = (n)=>{
    return ethers.utils.parseUnits(n,'ether');
}

describe('Token', ()=>{
    let token;

    beforeEach(async ()=>{
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy('Red Coin','RED',1000000);
    })

    describe("Deployment",()=>{
        const name = "Red Coin";
        const symbol = "RED";
        const decimals = '18';
        const totalSupply = tokens('1000000');

        it('has correct name',async ()=>{
            expect(await token.name()).to.equal(name);
        });
    
        it('has correct symbol',async ()=>{
            expect(await token.symbol()).to.equal(symbol);
        });
    
        it('has correct decimals',async ()=>{
            expect(await token.decimals()).to.equal(decimals);
        });
    
        it('has correct totalSupply',async ()=>{
            expect(await token.totalSupply()).to.equal(totalSupply);
        });
    })
});
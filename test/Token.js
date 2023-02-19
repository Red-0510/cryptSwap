import hre from "hardhat";
import { expect } from "chai";
const {ethers} = hre;
const tokens = (n)=>{
    return ethers.utils.parseUnits(n.toString(),'ether');
}

describe('Token', ()=>{
    let token,receiver,deployer;
    beforeEach(async ()=>{
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy('Red Coin','RED',1000000);
        let accounts = await ethers.getSigners();
        deployer=accounts[0];
        receiver = accounts[1];
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

        it('assigned total supply to deployer',async ()=>{
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
        });
    })

    describe("Sending Tokens",()=>{
        let amount,transaction,result;

        describe("Success",()=>{
            beforeEach(async ()=>{
                amount = tokens(100);
                transaction = await token.connect(deployer).transfer(receiver.address,amount);
                result =await transaction.wait();
            })
    
            it("Transferred token balances",async ()=>{
                expect(await token.balanceOf(receiver.address)).to.equal(amount);
                // console.log(deployerBalance);
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));
            })
    
            it('Emits a Transfer Event',async ()=>{
                const event = result.events[0];
                expect(event.event).to.equal('Transfer');
                
                const args = event.args;
                expect(args.from).to.equal(deployer.address);
                expect(args.to).to.equal(receiver.address);
                expect(args.value).to.equal(amount);
            })
        })

        describe('Failure',()=>{
            it('Restrict Insufficient balances',async ()=>{
                const invalidAmount = tokens(10000000);
                await expect(token.connect(deployer).transfer(receiver.address,invalidAmount)).to.be.reverted;
            })

            it('Rejects Invalid recipient',async ()=>{
                const amount = tokens(100);
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000',amount)).to.be.reverted;
            })
        })
    })
});
import hre from "hardhat";
import { expect } from "chai";
const {ethers} = hre;
const tokens = (n)=>{
    return ethers.utils.parseUnits(n.toString(),'ether');
}

describe('Exchange',()=>{
    let deployer,feeAccount,exchange,token1,user1,token2;
    const feePercent = 10;
    beforeEach(async ()=>{
        const Exchange = await ethers.getContractFactory('Exchange');
        const Token = await ethers.getContractFactory('Token');

        token1 = await Token.deploy('Red Coin','RED',1000000);
        token2 = await Token.deploy('Mock DAI','mDAI',1000000);
        let accounts = await ethers.getSigners();
        deployer = accounts[0];
        feeAccount = accounts[1];
        user1 = accounts[2];

        let transaction = await token1.connect(deployer).transfer(user1.address,tokens(100));
        await transaction.wait();
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

    describe('Depositing Tokens',()=>{
        let transaction,result;
        let amount = tokens(10);

        
        describe('Success',()=>{
            beforeEach(async ()=>{
                transaction = await token1.connect(user1).approve(exchange.address,amount);
                result = await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(token1.address,
                amount);
                result = await transaction.wait();
            });

            it('tokens deposited to exchange',async()=>{
                expect(await token1.balanceOf(exchange.address)).to.equal(amount);
                let new_amount = tokens(90);
                expect(await token1.balanceOf(user1.address)).to.equal(new_amount);
                expect(await exchange.tokens(token1.address,user1.address)).to.equal(amount);
                expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(amount);
            });

            it('emits a deposit event',async ()=>{
                const event = result.events[1];

                expect(event.event).to.equal('Deposit');

                const args = event.args;
                expect(args.token).to.equal(token1.address);
                expect(args.user).to.equal(user1.address);
                expect(args.amount).to.equal(amount);
                expect(args.balance).to.equal(amount);
            })
        });

        describe('Failure',()=>{
            it('fails when no tokens are approved',async()=>{
                await expect(exchange.connect(user1).depositToken(token1.address,amount)).to.be.reverted;
            });
        })
    })

    describe('Withdrawing Tokens',()=>{
        let transaction,result;
        let amount = tokens(10);

        beforeEach(async()=>{
            transaction = await token1.connect(user1).approve(exchange.address,amount);
            result = await transaction.wait();
            transaction = await exchange.connect(user1).depositToken(token1.address,amount);
            result = await transaction.wait();
        })
        
        describe('Success',()=>{
            beforeEach(async ()=>{
                transaction = await exchange.connect(user1).withdrawToken(token1.address,amount);
                result = await transaction.wait();
            });

            it('tokens withdrawed',async()=>{
                expect(await token1.balanceOf(exchange.address)).to.equal(0);
                expect(await token1.balanceOf(user1.address)).to.equal(tokens(100));
                expect(await exchange.tokens(token1.address,user1.address)).to.equal(0);
                expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(0);
            });

            it('emits a withdraw event',async ()=>{
                const event = result.events[1];

                expect(event.event).to.equal('Withdraw');

                const args = event.args;
                expect(args.token).to.equal(token1.address);
                expect(args.user).to.equal(user1.address);
                expect(args.amount).to.equal(amount);
                expect(args.balance).to.equal(0);
            })
        });

        describe('Failure',()=>{
            let withdrawAmount = tokens(100);
            it('fails for insufficient balance',async()=>{
                await expect(exchange.connect(user1).withdrawToken(token1.address,withdrawAmount)).to.be.reverted;
            });
        })
    })

    describe('Checing Balances',()=>{
        let transaction,result;
        let amount = tokens(10);
        
        beforeEach(async()=>{
            transaction = await token1.connect(user1).approve(exchange.address,amount);
            result = await transaction.wait();
            transaction = await exchange.connect(user1).depositToken(token1.address,amount);
            result = await transaction.wait();
        })

        it('returns user balance',async()=>{
            expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(amount);
        });
    })

    describe('making an order',()=>{
        let transaction,result,amount;
        amount = tokens(10);
        describe('Success',async()=>{
            beforeEach(async()=>{
                transaction = await token1.connect(user1).approve(exchange.address,amount)
                result = await transaction.wait();
                transaction = await exchange.connect(user1).depositToken(token1.address,amount);
                result = await transaction.wait();
                transaction = await exchange.connect(user1).makeOrder(token2.address,amount,token1.address,amount);
                result = await transaction.wait();
            })
            it('created new order',async()=>{
                expect(await exchange.orderCount()).to.equal(1);
            })
            it('emits an order event',async()=>{
                const event = result.events[0];
                expect(event.event).to.equal('Order');
                const args = event.args;
                expect(args.id).to.equal(1);
                expect(args.user).to.equal(user1.address);
                expect(args.tokenGet).to.equal(token2.address);
                expect(args.amountGet).to.equal(amount);
                expect(args.tokenGive).to.equal(token1.address);
                expect(args.amountGive).to.equal(amount);
            });
        });

        describe('Failure',async ()=>{
            amount = tokens(20);
            it('rejects with no balance',async()=>{
                await expect(exchange.connect(user1).makeOrder(token2.address,amount, token1.address,amount)).to.be.reverted;
            })
        })
    })
});
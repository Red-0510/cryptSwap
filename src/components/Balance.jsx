import {React,useEffect,useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    loadBalances,
    transferTokens,
} from '../store/interactions.js';

import red from '../assets/red.svg';

const Balance = () => {

    const [depositAmount,setDepositAmount] = useState(0);

    const dispatch = useDispatch();
    const provider = useSelector(state=>state.provider.connection);
    const exchange = useSelector(state=> state.exchange.contract);
    const tokens = useSelector(state=> state.tokens.contracts);
    const account = useSelector(state=>state.provider.account);
    const symbols = useSelector(state=>state.tokens.symbols);

    const tokensBalance = useSelector(state=>state.tokens.balance);
    const exchangeBalance = useSelector(state=>state.exchange.balance);
    const transferInProgress = useSelector(state=>state.exchange.transferInProgress);
    

    
    const amountHandler = (e,token)=>{
        if(token.address===tokens[0].address){
            setDepositAmount(e.target.value);
        }
    }
    
    const depositHandler = (e,token)=>{
        e.preventDefault();
        if(token.address===tokens[0].address){
            transferTokens(provider,dispatch,exchange,'Deposit',token,depositAmount);
        }
    }

    useEffect(()=>{
        if(account && tokens[0] && tokens[1] && exchange){
            loadBalances(dispatch,exchange,tokens,account);
            setDepositAmount(0);
        }
    },[exchange,tokens,account,transferInProgress]);
    
    return (
      <div className='component exchange__transfers'>
        <div className='component__header flex-between'>
          <h2>Balance</h2>
          <div className='tabs'>
            <button className='tab tab--active'>Deposit</button>
            <button className='tab'>Withdraw</button>
          </div>
        </div>
  
        {/* Deposit/Withdraw Component 1 (DApp) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><img src={red} alt="token logo"/>{symbols && symbols[0]}</p>
            <p><small>Wallet</small><br />{tokensBalance && tokensBalance[0]}</p>
            <p><small>Exchange</small><br />{exchangeBalance && exchangeBalance[0]}</p>
          </div>
  
          <form onSubmit={(e)=>depositHandler(e,tokens[0])}>
            <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
            <input 
                type="text" 
                id='token0' 
                value={depositAmount===0 ? '' : depositAmount}
                placeholder='0.0000' 
                onChange={(e)=>amountHandler(e,tokens[0])}
            />
            <button className='button' type='submit'>
              <span>Deposit</span>
            </button>
          </form>
        </div>
  
        <hr />
  
        {/* Deposit/Withdraw Component 2 (mETH) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
  
          </div>
  
          <form>
            <label htmlFor="token1"></label>
            <input type="text" id='token1' placeholder='0.0000'/>
  
            <button className='button' type='submit'>
              <span></span>
            </button>
          </form>
        </div>
  
        <hr />
      </div>
    );
  }
  
  export default Balance;
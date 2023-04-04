import {React,useEffect,useState,useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    loadBalances,
    transferTokens,
} from '../store/interactions.js';

import red from '../assets/red.svg';
import eth from '../assets/eth.svg';


const Balance = () => {
    const [isDeposit,setIsDeposit] = useState(true);
    const [token1TransferAmount,setToken1TransferAmount] = useState(0);
    const [token2TransferAmount,setToken2TransferAmount] = useState(0);

    const dispatch = useDispatch();
    const provider = useSelector(state=>state.provider.connection);
    const exchange = useSelector(state=> state.exchange.contract);
    const tokens = useSelector(state=> state.tokens.contracts);
    const account = useSelector(state=>state.provider.account);
    const symbols = useSelector(state=>state.tokens.symbols);

    const tokensBalance = useSelector(state=>state.tokens.balance);
    const exchangeBalance = useSelector(state=>state.exchange.balance);
    const transferInProgress = useSelector(state=>state.exchange.transferInProgress);
    
    const depositRef = useRef(null);
    const withdrawRef = useRef(null);

    
    const amountHandler = (e,token)=>{
        if(token.address===tokens[0].address){
          setToken1TransferAmount(e.target.value);
        } else{
          setToken2TransferAmount(e.target.value);
        }
    }
    
    const depositHandler = (e,token)=>{
        e.preventDefault();
        if(token.address===tokens[0].address){
          transferTokens(provider,dispatch,exchange,'Deposit',token,token1TransferAmount);
          setToken1TransferAmount(0);
        }
        else{
          transferTokens(provider,dispatch,exchange,'Deposit',token,token2TransferAmount);
          setToken2TransferAmount(0);
        }
    }

    const withdrawHandler = (e,token)=>{
      e.preventDefault();
      if(token.address===tokens[0].address){
        transferTokens(provider,dispatch,exchange,'Withdraw',token,token1TransferAmount);
        setToken1TransferAmount(0);
      }
      else{
        transferTokens(provider,dispatch,exchange,'Withdraw',token,token2TransferAmount);
        setToken2TransferAmount(0);
      }
    }

    const tabHandler = (e)=>{
      if(e.target.className !== depositRef.current.className){
        depositRef.current.className = 'tab';
        setIsDeposit(false);
      }
      else {
        withdrawRef.current.className = 'tab';
        setIsDeposit(true);
      }
      e.target.className = 'tab tab--active';
    }

    useEffect(()=>{
        if(account && tokens[0] && tokens[1] && exchange){
            loadBalances(dispatch,exchange,tokens,account);
        }
    },[exchange,tokens,account,transferInProgress,dispatch]);
    
    return (
      <div className='component exchange__transfers'>
        <div className='component__header flex-between'>
          <h2>Balance</h2>
          <div className='tabs'>
            <button ref={depositRef} onClick={tabHandler} className='tab tab--active'>Deposit</button>
            <button ref={withdrawRef} onClick={tabHandler} className='tab'>Withdraw</button>
          </div>
        </div>
  
        {/* Deposit/Withdraw Component 1 (DApp) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><img src={red} alt="token logo"/>{symbols && symbols[0]}</p>
            <p><small>Wallet</small><br />{tokensBalance && tokensBalance[0]}</p>
            <p><small>Exchange</small><br />{exchangeBalance && exchangeBalance[0]}</p>
          </div>
  
          <form onSubmit={isDeposit ? (e)=>depositHandler(e,tokens[0]) : (e)=>withdrawHandler(e,tokens[0])}>
            <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
            <input 
                type="text" 
                id='token0' 
                value={token1TransferAmount===0 ? '' : token1TransferAmount}
                placeholder='0.0000' 
                onChange={(e)=>amountHandler(e,tokens[0])}
            />
            <button className='button' type='submit'>
              <span>{isDeposit ? 'Deposit' : 'Withdraw'}</span>
            </button>
          </form>
        </div>
  
        <hr />
  
        {/* Deposit/Withdraw Component 2 (mETH) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><img src={eth} alt="token logo"/>{symbols && symbols[1]}</p>
            <p><small>Wallet</small><br />{tokensBalance && tokensBalance[1]}</p>
            <p><small>Exchange</small><br />{exchangeBalance && exchangeBalance[1]}</p>
          </div>
  
          <form onSubmit={isDeposit ? (e)=>depositHandler(e,tokens[1]) : (e)=>withdrawHandler(e,tokens[1])}>
            <label htmlFor="token1">{symbols && symbols[1]}Amount</label>
            <input 
              type="text" 
              id='token1'
              placeholder='0.0000'
              value={token2TransferAmount===0 ? '' : token2TransferAmount}
              onChange={(e)=>amountHandler(e,tokens[1])}
            />
  
            <button className='button' type='submit'>
              <span>{isDeposit ? 'Deposit' : 'Withdraw'}</span>
            </button>
          </form>
        </div>
  
        <hr />
      </div>
    );
  }
  
  export default Balance;
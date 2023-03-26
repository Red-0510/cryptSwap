import {React,useState, useRef} from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

import {makeBuyOrder,makeSellOrder} from '../store/interactions.js';


const Order = () => {

    const [isBuy,setIsBuy] = useState(true);
    const [amount,setAmount] = useState(0);
    const [price,setPrice] = useState(0);

    const dispatch = useDispatch();
    const provider = useSelector(state=>state.provider.connection);
    const tokens = useSelector(state=>state.tokens.contracts);
    const exchange = useSelector(state=>state.exchange.contract);

    const buyRef = useRef(null);
    const sellRef = useRef(null);


    const tabHandler = (e)=>{
        if(e.target.className!==buyRef.current.className){
            buyRef.current.className = 'tab';
            setIsBuy(false);
        }
        else{
            sellRef.current.className = 'tab';
            setIsBuy(true);
        }
        e.target.className = 'tab tab--active';
    }

    const buyHandler = (e)=>{
        e.preventDefault();
        makeBuyOrder(provider,dispatch,exchange,tokens,{amount,price});
        setAmount(0);
        setPrice(0);
    }

    const sellHandler = (e)=>{
        e.preventDefault();
        makeSellOrder(provider,dispatch,exchange,tokens,{amount,price});
        setAmount(0);
        setPrice(0);
    }

    return (
      <div className="component exchange__orders">
        <div className='component__header flex-between'>
          <h2>New Order</h2>
          <div className='tabs'>
            <button ref={buyRef} onClick={tabHandler} className='tab tab--active'>Buy</button>
            <button ref={sellRef} onClick={tabHandler} className='tab'>Sell</button>
          </div>
        </div>
        
        <form onSubmit={isBuy ? buyHandler : sellHandler}>

          <label htmlFor='amount'>{ isBuy ? 'Buy Amount' : 'Sell Amount'}</label>
          <input type="text" id='amount' value={amount===0 ? '' : amount}  placeholder='0.0000' onChange={(e)=>setAmount(e.target.value)} />

          <label htmlFor='price'>{ isBuy ? 'Buy Price' : 'Sell Price'}</label>
          <input type="text" id='price' value={price===0 ? '' : price} placeholder='0.0000' onChange={(e)=>setPrice(e.target.value)}/>
  
          <button className='button button--filled' type='submit'>
            <span>{ isBuy ? 'Buy Order' : 'Sell Order'}</span>
          </button>
        </form>
      </div>
    );
  }
  
  export default Order;
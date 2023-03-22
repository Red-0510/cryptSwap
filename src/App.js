import react,{useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import config from './config.json';

import Navbar from './components/Navbar.jsx';
import Markets from './components/Markets.jsx';
import Balance from './components/Balance.jsx';
import Order from './components/Order.jsx';

import { 
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents,
} from './store/interactions.js';

import './App.css';

function App() {

  const dispatch = useDispatch();

  const loadBlockchaindata= async ()=>{
    const provider = loadProvider(dispatch);
    
    const chainId = await loadNetwork(provider,dispatch);
    console.log(chainId);

    window.ethereum.on('chainChanged',()=>{
      window.location.reload();
    });

    window.ethereum.on('accountsChanged',async()=>{
      await loadAccount(provider,dispatch);
    })
    // const account = await loadAccount(provider,dispatch);
    // console.log(account);

    const tokenAddresses = [config[chainId].red.address,config[chainId].mETH.address]
    const token = await loadTokens(provider,tokenAddresses,dispatch);

    const exchange = await loadExchange(provider,config[chainId].exchange.address,dispatch);
    
    subscribeToEvents(exchange,dispatch);
  }

  useEffect(()=>{
    loadBlockchaindata();
  },[]);

  return (
    <div className="App">
      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

          <Balance />

          <Order />

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}
        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;

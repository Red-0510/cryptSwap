import react,{useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import TOKEN_ABI from './abis/Token.json';
import config from './config.json';

import { loadProvider,loadNetwork } from './store/interactions.js';

import './App.css';

function App() {

  const dispatch = useDispatch();

  const loadBlockchaindata= async ()=>{
    const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
    console.log(accounts);
    const provider = loadProvider(dispatch);
    const chainId = await loadNetwork(provider,dispatch);
    console.log(chainId);
    const token = new ethers.Contract(config[chainId].mBTC.address,TOKEN_ABI,provider);
    console.log(token.address);
    const symbol = await token.symbol();
    console.log(symbol);
  }

  useEffect(()=>{
    loadBlockchaindata();
  },[]);

  return (
    <div className="App">
      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Markets */}

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

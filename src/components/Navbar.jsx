import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Blockies from 'react-blockies';
import { loadAccount } from '../store/interactions.js';
import config from '../config.json';

import logo from '../assets/logo.png';
import eth from '../assets/eth.svg';

const Navbar = () => {

    const provider = useSelector(state => state.provider.connection);
    const chainId = useSelector(state => state.provider.chainId);
    const account = useSelector(state => state.provider.account);
    const balance = useSelector(state => state.provider.balance);
    const dispatch = useDispatch();

    const connectHandler = async()=>{
        await loadAccount(provider,dispatch);
    }

    const networkHandler = async (e)=>{
        console.log(e.target.value);
        await window.ethereum.request({
            method:'wallet_switchEthereumChain',
            params:[{chainId:e.target.value}]
        });
    }

    return(
      <div className='exchange__header grid'>
        <div className='exchange__header--brand flex'>
            <img src={logo} alt='logo' className='logo'/> 
            <h1>CryptSwap</h1>
        </div>
  
        <div className='exchange__header--networks flex'>
            <img src={eth} className='Eth logo' alt='Eth logo'/>
            {chainId && (
                <select 
                    name='networks' 
                    id='networks' 
                    value={config[chainId] ? `0x${chainId.toString(16)}` : '0'} onChange={networkHandler}
                    >
                        <option value='0' disabled>Select Network</option>
                        <option value='0x7A69'>LocalHost</option>
                        <option value='0x5'>Goerli</option>
                </select>
            )}
        </div>
  
        <div className='exchange__header--account flex'>
            <p>
                <small>My Balance</small>
                {
                    balance ? Number(balance).toFixed(4)
                    : '0 ETH'
                }
            </p>
            {
                account ? 
                    <a href={config[chainId] ? `${config[chainId].explorerURL}/${account}` : '#'}
                        target='_blank'
                        rel='noreferrer'
                    >
                        {account.slice(0,5)+'...'+account.slice(-4)}
                        <Blockies 
                            seed={account}
                            size={10}
                            scale={3}
                            color='#ff0000'
                            spotColor='#000000'
                            className='identicon'
                        />
                    </a>
                : <button className='button' onClick={connectHandler}>Connect</button>
            }
        </div>
      </div>
    )
  };
export default Navbar;

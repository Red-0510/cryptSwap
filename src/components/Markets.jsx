import react from 'react';
import { useDispatch, useSelector } from 'react-redux';
import config from '../config.json';
import { loadTokens } from '../store/interactions.js';

const Markets = () => {
    const provider = useSelector(state=>state.provider.connection);
    const chainId = useSelector(state=>state.provider.chainId);
    const dispatch = useDispatch();
    const marketsHandler = async(e)=>{
      await loadTokens(provider,e.target.value.split(','),dispatch);
    }

    return(
      <div className='component exchange__markets'>
        <div className='component__header'>
          <h2>Select Market</h2>
        </div>
        {chainId && config[chainId]? (
          <select name='markets' id='markets' onChange={marketsHandler}>
            <option value={`${config[chainId].red.address},${config[chainId].mETH.address}`}>RED / mETH</option>
            <option value={`${config[chainId].red.address},${config[chainId].mBTC.address}`}>RED / mBTC</option>
            <option value={`${config[chainId].mETH.address},${config[chainId].mBTC.address}`}>mETH / mBTC</option>
          </select>
        )
        :
          (
            <div>
              <p>Not deployed to Network</p>
            </div>      
          )
        }
        <hr />
      </div>
    )
  }
  
  export default Markets;
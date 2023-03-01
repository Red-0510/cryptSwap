import { ethers } from "ethers";

export const loadProvider =  (dispatch)=>{
    const connection = new ethers.providers.Web3Provider(window.ethereum);
    dispatch({type:'PROVIDER_LOADED',connection});
    return connection;
};

export const loadNetwork =async (provider,dispatch) =>{
    const {chainId} = await provider.getNetwork();
    dispatch({type:'NETWORK_LOADED',chainId});
    return chainId;
};
export const provider = (state={},action)=>{
    switch(action.type){
        case 'PROVIDER_LOADED':
            return {
                ...state,
                connection:action.connection
            };
        case 'NETWORK_LOADED':
            return {
                ...state,
                chainId:action.chainId
            };
        default :
        return state;
    }
};



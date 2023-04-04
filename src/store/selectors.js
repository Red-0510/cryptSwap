import { createSelector } from "reselect";
import {get,groupBy,maxBy,minBy,reject} from 'lodash';
import { ethers } from 'ethers';
import moment from "moment";

const CLASSGREEN = '#25ce8f';
const CLASSRED = '#f45353';

const tokens = state =>get(state,'tokens.contracts',[]);
const account = state =>get(state,'provider.account');
const events = state=>get(state,'exchange.events',[]);

const allOrders = state => get(state,'exchange.allOrders.data',[]);
const cancelledOrders = state=>get(state,'exchange.cancelledOrders.data',[]);
const filledOrders = state=>get(state,'exchange.filledOrders.data',[]);

export const myEventsSelector = createSelector(account,events,(account,events)=>{
    events = events.filter(e=>e.args.user===account);
    return events;
});

const openOrders = (state)=>{
    const all = allOrders(state);
    const filled = filledOrders(state);
    const cancelled = cancelledOrders(state);
    const openOrders = reject(all,(order)=>{
        const orderFilled = filled.some(o=>o.id.toString()===order.id.toString())
        const orderCancelled = cancelled.some(o=>o.id.toString()===order.id.toString())
        return (orderFilled || orderCancelled);
    })
    return openOrders;
}

const decorateOrder = (order,tokens)=>{
    let token0Amount,token1Amount;
    if(order.tokenGive === tokens[1].address){
        token0Amount = order.amountGive;
        token1Amount = order.amountGet;
    }
    else{
        token0Amount = order.amountGet;
        token1Amount = order.amountGive;
    }

    let precision = 100000;
    let tokenPrice = (token1Amount/token0Amount);
    tokenPrice = Math.round(tokenPrice*precision)/precision;
    
    return {
        ...order,
        token0Amount:ethers.utils.formatUnits(token0Amount,'ether'),
        token1Amount:ethers.utils.formatUnits(token1Amount,'ether'),
        tokenPrice,
        formattedTimestamp:moment.unix(order.timestamp).format('h:mm:ssa d MM D'),
    }
};

export const myOpenOrdersSelector = createSelector(account, tokens,openOrders, (account,tokens,orders)=>{
    if(!tokens[0] || !tokens[1]) return;
    orders = orders.filter(o=>o.user===account);
    orders = orders.filter(o=>o.tokenGet === tokens[0].address || o.tokenGet===tokens[1].address);
    orders = orders.filter((o)=>o.tokenGive===tokens[0].address || o.tokenGive===tokens[1].address);

    orders = decorateMyOpenOrders(orders,tokens);

    orders = orders.sort((a,b)=>b.timestamp-a.timestamp);

    return orders;
});

const decorateMyOpenOrders = (orders,tokens)=>{
    return (
        orders.map(order=>{
            order = decorateOrder(order,tokens);
            order = decorateMyOpenOrder(order,tokens);
            return order;
        })
    );
};

const decorateMyOpenOrder = (order,tokens)=>{
    let orderType = order.tokenGive===tokens[1].address ? 'buy' : 'sell';
    let orderTypeClass = orderType==='buy' ? CLASSGREEN : CLASSRED;

    return {
        ...order,
        orderType,
        orderTypeClass,
    };
};

export const myFilledOrdersSelector = createSelector(account, tokens,filledOrders, (account,tokens,orders)=>{
    if(!tokens[0] || !tokens[1]) return;
    orders = orders.filter(o=>o.user===account || o.creator===account);
    orders = orders.filter(o=>o.tokenGet === tokens[0].address || o.tokenGet===tokens[1].address);
    orders = orders.filter((o)=>o.tokenGive===tokens[0].address || o.tokenGive===tokens[1].address);

    orders = orders.sort((a,b)=>b.timestamp - a.timestamp);

    orders = decorateMyFilledOrders(orders,tokens,account);
    return orders;
});

const decorateMyFilledOrders = (orders,tokens,account)=>{
    return (
        orders.map(order=>{
            order = decorateOrder(order,tokens);
            order = decorateMyFilledOrder(order,tokens,account);
            return order;
        })
    );
};

const decorateMyFilledOrder = (order,tokens,account)=>{
    const myOrder = order.creator === account;
    let orderType;
    if(myOrder) orderType = order.tokenGive===tokens[1].address ? 'buy' : 'sell';
    else orderType = order.tokenGive===tokens[0].address ? 'buy' : 'sell';
    return {
        ...order,
        orderType,
        orderTypeClass: orderType==='buy' ? CLASSGREEN: CLASSRED,
        orderTypeSign: orderType==='buy' ? '+' : '-',
    };
}

export const orderBookSelector = createSelector(openOrders,tokens, (orders,tokens)=>{
    if(!tokens[0] || !tokens[1]) return;
    orders = orders.filter(o=>o.tokenGet === tokens[0].address || o.tokenGet===tokens[1].address);
    orders = orders.filter((o)=>o.tokenGive===tokens[0].address || o.tokenGive===tokens[1].address) 

    orders = decorateOrderBookOrders(orders,tokens);
    orders = groupBy(orders,'orderType');
    const buyOrders = get(orders,'buy',[]);
    const sellOrders = get(orders,'sell',[]);
    
    orders = {
        ...orders,
        buyOrders:buyOrders.sort((a,b)=>b.tokenPrice - a.tokenPrice),
        sellOrders:sellOrders.sort((a,b)=>b.tokenPrice - a.tokenPrice),
    }
    return orders;
});

export const filledOrdersSelector = createSelector(filledOrders,tokens,(orders,tokens)=>{
    if(!tokens[0] || !tokens[1]) return;
    orders = orders.filter(o=>o.tokenGet === tokens[0].address || o.tokenGet===tokens[1].address);
    orders = orders.filter((o)=>o.tokenGive===tokens[0].address || o.tokenGive===tokens[1].address);

    orders = orders.sort((a,b)=>a.timestamp - b.timestamp);
    orders = decorateFilledOrders(orders,tokens);
    orders.reverse();
    return orders;
});

const decorateFilledOrders = (orders,tokens)=>{

    let previousOrder = null;
    return (
        orders.map(order=>{
            order = decorateOrder(order,tokens);
            order = decorateFilledOrder(order,tokens,previousOrder);
            previousOrder = order;
            return order;
        })
    );
}

const decorateFilledOrder = (order,tokens,previousOrder)=>{
    let tokenPriceClass;
    if(previousOrder===null) tokenPriceClass = CLASSGREEN;
    else if(order.tokenPrice>=previousOrder.tokenPrice) tokenPriceClass=CLASSGREEN;
    else tokenPriceClass=CLASSRED;
    return {
        ...order,
        tokenPriceClass,
    }
}

const decorateOrderBookOrders = (orders,tokens)=>{
    orders = orders.map(order=>{
        order = decorateOrder(order,tokens);
        order = decorateOrderBookOrder(order,tokens);
        return order;
    });
    return orders;
}

const decorateOrderBookOrder = (order,tokens)=>{
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell';
    
    return {
        ...order,
        orderType,
        orderTypeClass:(orderType==='buy'? CLASSGREEN : CLASSRED),
        orderFillAction:(orderType==='buy'?'sell':'buy'),
    }
};


export const priceChartSelector = createSelector(filledOrders,tokens,(orders,tokens)=>{
    if(!tokens[0] || !tokens[1]) return ;
    
    orders = orders.filter(o=>o.tokenGet === tokens[0].address || o.tokenGet===tokens[1].address);
    orders = orders.filter((o)=>o.tokenGive===tokens[0].address || o.tokenGive===tokens[1].address)

    orders = orders.sort((a,b)=>a.timestamp-b.timestamp);

    orders = orders.map(o=>decorateOrder(o,tokens));

    let lastOrder,secondLastOrder;
    [lastOrder,secondLastOrder] = orders.slice(orders.length - 2,orders.length);
    const lastPrice = get(lastOrder,'tokenPrice',0);
    const secondLastPrice = get(secondLastOrder,'tokenPrice',0);
    
    return ({
        lastPrice,
        lastPriceChange :(lastPrice>=secondLastPrice ? 'pos' : 'neg'),
        series:[{
            data:buildGraphData(orders),
        }]
    });
});

const buildGraphData = (orders)=>{
    orders=groupBy(orders,(o)=>moment.unix(o.timestamp).startOf('day').format());
    const hours = Object.keys(orders);

    const groupData = hours.map(hour=>{
        const group = orders[hour];

        const open = group[0];
        const close = group[group.length-1];
        const high = maxBy(group,'tokenPrice');
        const low = minBy(group,'tokenPrice');

        return ({
            x: new Date(hour),
            y:[open.tokenPrice,high.tokenPrice,low.tokenPrice,close.tokenPrice]
        });
    })
    return groupData;
}
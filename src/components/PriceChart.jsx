import React from "react";
import { useSelector } from "react-redux";
import Chart from 'react-apexcharts';
import {options,defaultSeries} from './PriceChart.config.js';

import Banner from "./Banner.jsx";
import { priceChartSelector } from "../store/selectors.js";

import upArrow from '../assets/up-arrow.svg';
import downArrow from '../assets/down-arrow.svg';


const PriceChart = () => {

    const account = useSelector(state=>state.provider.account);
    const symbols = useSelector(state=>state.tokens.symbols);
    const priceChart = useSelector(priceChartSelector);

    return (
      <div className="component exchange__chart">
        <div className='component__header flex-between'>
          <div className='flex'>
  
            <h2>{symbols && symbols[0] && symbols[1] && `${symbols[0]}/${symbols[1]}`}</h2>
  
            { priceChart && priceChart.length && (
              <div className='flex'>
                { priceChart.lastPriceChange==='pos' ? (
                  <img src={upArrow} alt="Arrow Up" />
                ) : (
                  <img src={downArrow} alt="Arrow Down" />
                )}
                <span className='up'></span>
              </div>
            )}
  
          </div>
        </div>
  
        {
            !account ? (
                <Banner text='Please Connect with Metamask'/>
            ) : (
                <Chart 
                    type='candlestick'
                    options={options}
                    series={priceChart ? priceChart.series : defaultSeries}
                    width='100%'
                    hegiht='100%'
                />
            )
        }
      </div>
    );
  }
  
  export default PriceChart;
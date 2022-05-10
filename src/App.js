import "./App.css";
import { useEffect, useState } from "react";
import { useLCDClient } from "@terra-money/wallet-provider";
import React from "react";
import { BarChart, Bar, Cell, YAxis, ReferenceLine, LabelList } from "recharts";

const colors = ["#0088FE", "#FFBB28"];

function App() {
  const [data, setData] = useState([]);
  const [scale, setScale] = useState([49000000, 51000000]);
  const lcd = useLCDClient();

  useEffect(() => {
    const fetchPools = async () => {
      const delta = await lcd.market.poolDelta();
      const { base_pool } = await lcd.market.parameters();
      const microTerraSide = base_pool.plus(delta);
      const micraLunaSide = base_pool.pow(2).div(microTerraSide);
      
      const terraSide = microTerraSide.times(0.000001).toNumber()
      const lunaSide = micraLunaSide.times(0.000001).toNumber()

      setData([
        {
          name: "Stablecoins",
          amt: terraSide,
        },
        {
          name: "LUNA",
          amt: lunaSide,
        },
      ]);

      if (terraSide < 49000000 || lunaSide < 49000000) {
        setScale([40000000, 60000000]);
      } else {
        setScale([49000000, 51000000]);
      }
    };

    fetchPools();
    const t = setInterval(fetchPools, 7000);
    return () => {
      clearTimeout(t);
    };
  }, [lcd.market]);

  return (
    <div className="App">
      <center>
        <h1>Terra Virtual Liquidity Pools</h1>
        <BarChart width={800} height={400} data={data}>
          <Bar isAnimationActive={false} label={false} dataKey="amt">
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % 20]} />)}
            <LabelList dataKey="name" position="top" />
            {/* <LabelList dataKey="amt" position="inside" fill="#000000" /> */}
          </Bar>
          <ReferenceLine
            isFront={false}
            label={{ position: "top", value: "BasePool" }}
            y={50000000}
            stroke="#000"
          />
          <YAxis
            hide
            type="number"
            ticks={10}
            stroke="#000000"
            interval={0}
            domain={scale}
          />
        </BarChart>
      </center>
    </div>
  );
}

export default App;

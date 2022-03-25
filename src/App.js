import "./App.css";
import { useEffect, useState } from "react";
import { useLCDClient } from "@terra-money/wallet-provider";
import React from "react";
import { BarChart, Bar, Cell, YAxis, ReferenceLine, LabelList } from "recharts";

const colors = ["#0088FE", "#FFBB28"];

function App() {
  const [data, setData] = useState([]);
  const lcd = useLCDClient();

  useEffect(() => {
    const fetchPools = async () => {
      const delta = await lcd.market.poolDelta();
      const { base_pool } = await lcd.market.parameters();
      const terraSide = base_pool.plus(delta);
      const lunaSide = base_pool.pow(2).div(terraSide);

      setData([
        {
          name: "Stablecoins",
          amt: terraSide.times(0.000001).toNumber(),
        },
        {
          name: "LUNA",
          amt: lunaSide.times(0.000001).toNumber(),
        },
      ]);
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
          <Bar isAnimationActive={false} label={true} dataKey="amt">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % 20]} />
            ))}
            <LabelList dataKey="name" position="top" />
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
            domain={[49000000, 51000000]}
          />
        </BarChart>
      </center>
    </div>
  );
}

export default App;

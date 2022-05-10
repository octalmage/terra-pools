import "./App.css";
import { useEffect, useState } from "react";
import { useLCDClient } from "@terra-money/wallet-provider";
import React from "react";
import { BarChart, Bar, Cell, YAxis, ReferenceLine, LabelList } from "recharts";
import abbreviate from "./abbreviate";

const colors = ["#0088FE", "#FFBB28"];

function App() {
  const [isAnimation, setIsAnimation] = useState(true);
  const [config, setConfig] = useState([[], [49000000, 51000000]]);

  const [data, scale] = config;
  const lcd = useLCDClient();

  useEffect(() => {
    const fetchPools = async () => {
      const delta = await lcd.market.poolDelta();
      const { base_pool } = await lcd.market.parameters();
      const microTerraSide = base_pool.plus(delta);
      const micraLunaSide = base_pool.pow(2).div(microTerraSide);

      const terraSide = microTerraSide.times(0.000001).toNumber();
      const lunaSide = micraLunaSide.times(0.000001).toNumber();

      let scale = [49000000, 51000000];

      if (terraSide < 49000000 || lunaSide < 49000000) {
        scale = [40000000, 59000000];
      }

      setConfig([
        [
          {
            name: "Stablecoins",
            amt: terraSide,
          },
          {
            name: "LUNA",
            amt: lunaSide,
          },
        ],
        scale,
      ]);
    };

    fetchPools();
    const t = setInterval(fetchPools, 1000);
    return () => {
      clearTimeout(t);
    };
  }, [lcd.market]);

  console.log("render");

  const Chart = React.memo(() => (
    <BarChart
      style={{ marginTop: "-100px" }}
      width={800}
      height={400}
      data={data}
    >
      <Bar
        isAnimationActive={isAnimation}
        onAnimationEnd={() => setIsAnimation(false)}
        label={false}
        dataKey="amt"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % 20]} />
        ))}
        <LabelList dataKey="name" position="top" fill="#000" />
        <LabelList
          formatter={(item) => abbreviate(item, 3, 3, "M")}
          dataKey="amt"
          position="inside"
          fill="#000000"
        />
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
  ));

  return (
    <div
      className="App"
      style={{
        textAlign: "left",
        marginLeft: "auto",
        marginRight: "auto",
        maxWidth: 800,
      }}
    >
      <h2 style={{ lineHeight: "1rem" }}>
        Relationship between Luna / Terra Stable assets in the Market module<br />
        <span style={{ fontWeight: "normal", fontSize: "16px" }}>
          (live view, updated every block):{" "}
        </span>
      </h2>

      <Chart />

      <hr />

      {/* <ul>
        <li>
          The Market module enables atomic swaps between different Terra
          stablecoin denominations and Luna. This module ensures an available,
          liquid market, stable prices, and fair exchange rates between the
          protocol’s assets.
        </li>

        <li>Terra uses a Constant Product market-making algorithm to ensure
        liquidity for Terra&lt;&gt;Luna swaps.</li>
        <li>
          The market starts out with two liquidity pools of equal sizes (BasePool above), one
          representing all denominations of Terra and another representing Luna.
        </li>
        <li>
          At the end of each block the market module attempts to replenish the
          pools by decreasing the magnitude of the delta between the Terra and
          Luna pools.
        </li>
        <li>
          This mechanism ensures liquidity and acts as a low-pass filter,
          allowing for the spread fee to drop back down when there is a change
          in demand, causing a necessary change in supply which needs to be
          absorbed.
        </li>
      </ul>
      <p>
        Pool values above are displayed in{" "}
        <a
          rel="noreferrer"
          target="_blank"
          href="https://docs.terra.money/docs/learn/glossary.html#sdr"
        >
          TerraSDR
        </a>
        .
      </p>
      <p>
        <b>
          This is a very high level overview. Visit the{" "}
          <a
            rel="noreferrer"
            target="_blank"
            href="https://docs.terra.money/docs/develop/module-specifications/spec-market.html"
          >
            
          </a>{" "}
          on the market module for more information.
        </b>
      </p> */}
      <p>Learn more: <a href="https://docs.terra.money/docs/develop/module-specifications/spec-market.html">Terra docs on the Market module.</a></p>
    </div>
  );
}

export default App;

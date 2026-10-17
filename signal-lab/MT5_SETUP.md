# SignalLab for MetaTrader 5 (MT5)

**Prepared 17 October 2026 — research prototype, not a verified profitable robot.**

The Expert Advisor (EA), `SignalLab_MT5_ExpertAdvisor.mq5`, is designed to run **inside MT5 desktop or an MT5 Windows VPS**, on your chosen broker's actual chart. The public SignalLab website is a separate research/paper-trading dashboard. A website cannot place orders in your MT5 terminal merely because the same strategy appears in both.

## What it does

- Waits until a **new candle begins** and inspects the previous completed candle.
- Signals **BUY** when the closed price exceeds the highest of the 20 *earlier* candles and EMA(50) is above EMA(200). Signals **SELL** for the opposite condition.
- Calculates proposed stop loss at 1 × ATR(14) and take profit at 1.5 × ATR(14) from the current broker quote. Stops/targets are adjusted to the symbol's tick-size grid.
- In order-enabled modes only: calculates lots using `OrderCalcProfit` in the **account's own currency**, rejects a size below the broker's minimum lot rather than rounding up, checks spread, margin, account equity risk, trade permissions and broker stop distances, and submits market orders with both SL and TP.
- Manages **only its own positions** for a 12-bar time expiry. Refuses to open additional positions if the symbol already has a position or pending order.
- Rejects new entries after 2% of the daily start-equity baseline has been lost or 8% below the tracked account equity peak. Daily/peak baselines are stored in MT5 terminal global variables. The limits do **not** liquidate positions or guarantee a maximum loss.
- Displays alerts and, if enabled, mobile push notifications. Writes a signal/event CSV to MT5's **Common Files** folder when writable.

## Install in MT5 desktop

1. On a computer with **MetaTrader 5 desktop installed**, choose **File → Open Data Folder**. Open `MQL5/Experts` and paste `SignalLab_MT5_ExpertAdvisor.mq5` there. **Never** upload your broker password or trading account details to a public website.
2. Press **F4** (MetaEditor), open the `.mq5` source, press **F7** to **compile**, and confirm **0 errors**. This file was statically reviewed, but has **not** been compiled in MetaEditor in this environment. Fix/confirm any platform-specific compiler messages *before using it*. An `.mq5` source alone is not an installed `.ex5` expert.
3. In MT5, enable **Market Watch** and find the exact symbol offered by your broker, e.g. `XAUUSD`, `XAUUSDm`, `BTCUSD` or `BTCUSDm`. **Do not assume** naming, contract size, minimum lot, trading hours or availability are consistent across brokers.
4. Open a **daily (D1)** chart of the instrument. Drag SignalLab from **Navigator → Expert Advisors** to this chart. By default, `ExecutionMode = SIGNAL_ONLY` and it **never opens a trade**. The `SignalTimeframe` input is D1 by default, regardless of chart period; this matches the timeframe of the earlier historical research.
5. For alerts, leave `PopupSignals=true`. For mobile notifications, configure your MetaQuotes ID under **Tools → Options → Notifications**, then enable `MobilePushSignals`. The MT5 desktop terminal (or VPS) must stay connected to process candles.
6. Repeat on a separate chart for the other symbol if your broker offers it. Only attach **one instance per symbol/account** to avoid confusing order management. Check the **Experts** and **Journal** tabs for explanations when a signal is blocked.

## Historical testing BEFORE any money

1. Open **View → Strategy Tester** (Ctrl+R). Choose `SignalLab_MT5_ExpertAdvisor`, the **exact broker symbol**, timeframe **D1**, and **Every tick based on real ticks** when available.
2. Select an appropriate multi-year date range with recent data. For **simulation only**, set `ExecutionMode=DEMO_AUTO`; the EA allows that setting within MT5's Strategy Tester. Do **not** interpret strategy tester trades as real fills. Spreads, swaps, broker symbols and tick modelling affect results.
3. Review equity curve, net profit **after costs**, profit factor, drawdown, number of trades, and stability across different periods. Hold out a recent contiguous slice and do not tune on it repeatedly. **Do not optimize purely for win rate.**
4. Re-test **Gold and BTC separately**. Historical research found >80% win rates for some parameter combinations that **lost money** after assumed costs. The sample 50–52% win-rate breakout strategies had positive backtest expectancy on prior public data, but these were not validated on your broker's tick history.

## Demo automatic trading

1. Log in to an **MT5 demo account** with an eligible broker; verify the title/status shows Demo.
2. Attach the EA to the broker's instrument chart. Set `ExecutionMode=DEMO_AUTO` and `EquityRiskPerTradePct=0.25` (default). The EA refuses `DEMO_AUTO` order placement on a non-demo account (outside Strategy Tester).
3. Turn on the MT5 platform's **Algo Trading** switch and allow algorithmic trading in EA properties. Confirm broker market status, margin and lot sizing. **No order is guaranteed**: insufficient minimum-lot risk budget, high spread, market closures, or equity limits can block execution.
4. Collect at least 30–50 demo trades, preferably across volatile and calm periods, *before deciding if this is viable*. Compare broker statements with the simulator and evaluate total return and worst drawdown, not win-rate alone.

## Live trading and eligibility

`ExecutionMode=REAL_AUTO` is technically present but **locked** unless all three are true: (1) MT5 account trade mode is real, (2) `AcknowledgeRealMoneyRisk=true`, and (3) `RealTradingUnlockPhrase=ENABLE_REAL_TRADING`. It also requires the MT5 Algo Trading controls enabled. **Do not unlock it until you have independently established that the broker accepts your country of residence, is properly licensed for your circumstances, and the exact broker-data test and extended demo trial justify it.**

For someone who resides in Australia: Exness's official help material lists Australia as a restricted country for resident clients. Check your residency and trading-provider eligibility before proceeding; consider an appropriately regulated Australian-licensed CFD issuer, if you choose to trade CFDs at all. Verify licences with ASIC rather than relying on a logo or claim. *MT5 software is not the broker.*

### Important limits

- Default setting **does not place trades**. Real-trading unlock is **not** a recommendation or a safety certification.
- Automatic trades require MT5 desktop or VPS online and running. **MT5 mobile does not run Expert Advisors.** Mobile MT5 can receive notifications or allow manual orders.
- This EA does not communicate with the SignalLab website, does not receive AI predictions, and has **no broker API credentials**. It uses native MT5 market data and trade functions.
- Server stops can be filled worse than requested during gaps/slippage. Actual net risk includes commissions, spread, swaps, currency conversion, leverage, liquidation, and taxes not fully captured by stop-distance sizing.
- In `SIGNAL_ONLY` mode the EA **will not manage existing positions**. If you turn off automated trading while positions are open, broker-side SL/TP should remain, but the optional time exit will not run.
- Account equity baselines are stored in local **MT5 terminal global variables**, not centrally across computers/VPS or different brokers. Reinstallation, new terminal, lost globals, or different broker accounts can reset limits; do not treat them as institutional risk management.
- `Gold 1H`, `Gold 4H`, `BTC 1H` and `BTC 4H` have **not** established profitable out-of-sample performance on your specific MT5 broker. The prior positive exploratory samples were daily and imperfect. Do not treat 80% as a promised accuracy metric.
- The EA's expiry logic and market orders differ somewhat from the prior candle-open OHLC backtester; **MT5 Strategy Tester** is the correct next measurement for this exact implementation.

## Data export

The EA writes `SignalLab_MT5_Signals.csv` (semicolon separated) to **File → Open Data Folder** → navigate to terminal common data `Terminal/Common/Files` when permissions allow. Columns: broker server candle time, symbol, timeframe, side, reference price, SL, TP, proposed lots and result. Broker order/transaction history in MT5 remains the authoritative record of executed deals.

## Official technical references

- MQL5 CTrade buy/sell order submission and server result checks: https://www.mql5.com/en/docs/standardlibrary/tradeclasses/ctrade/ctradebuy
- MQL5 `OrderCalcProfit` (account-currency P/L): https://www.mql5.com/en/docs/trading/ordercalcprofit
- MQL5 `OrderCalcMargin`: https://www.mql5.com/en/docs/trading/ordercalcmargin
- MQL5 account demo/real modes: https://www.mql5.com/en/docs/constants/environment_state/accountinformation
- Exness country restrictions: https://get.exness.help/hc/en-us/articles/16719521110044-Country-restrictions-for-Exness-services
- ASIC CFD risk information: https://moneysmart.gov.au/complex-investment-products/contracts-for-difference-cfds
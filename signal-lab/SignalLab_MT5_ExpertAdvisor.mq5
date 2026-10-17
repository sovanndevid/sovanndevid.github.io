//+------------------------------------------------------------------+
//| SignalLab_MT5_ExpertAdvisor.mq5                                  |
//| Research prototype: Donchian/EMA/ATR trading for MetaTrader 5.   |
//| Signal ONLY by default. Demo auto-trading requires opt-in.        |
//| Real-account auto-trading requires two additional opt-ins.        |
//| NO win rate or profitability is promised.                         |
//+------------------------------------------------------------------+
#property strict
#property version "2.00"
#property description "SignalLab | 20-bar breakout + EMA50/200 trend + ATR stops."
#property description "Default SIGNAL_ONLY; optional demo/live trading with explicit safeguards."

#include <Trade/Trade.mqh>
CTrade trade;

enum ENUM_SIGNALLAB_EXECUTION
{
   SIGNAL_ONLY = 0,           // Show alerts; NEVER place orders
   DEMO_AUTO = 1,             // Trade ONLY on MT5 demo account
   REAL_AUTO = 2              // Trade real account only after two confirmations
};

input ENUM_SIGNALLAB_EXECUTION ExecutionMode = SIGNAL_ONLY;
input bool   AcknowledgeRealMoneyRisk = false;
input string RealTradingUnlockPhrase = ""; // Must be exactly: ENABLE_REAL_TRADING
input ENUM_TIMEFRAMES SignalTimeframe = PERIOD_D1; // D1 is the research reference, NOT a live promise
input int    DonchianLookback = 20;
input int    TrendFastEMA = 50;
input int    TrendSlowEMA = 200;
input int    ATRPeriod = 14;
input double StopLossATR = 1.0;
input double TakeProfitATR = 1.5;
input int    TimeExitBars = 12;
input double EquityRiskPerTradePct = 0.25; // Percentage of current equity, NOT guaranteed worst-case loss
input double MaxDailyEquityDropPct = 2.0;   // New-entry guard, not guaranteed liquidation protection
input double MaxPeakEquityDrawdownPct = 8.0;
input double MaxMarginPerTradePct = 10.0;
input double MaxSpreadAsATR = 0.10;         // Reject if bid/ask spread > 10% of 14-ATR
input int    MaxQuoteAgeSeconds = 120;
input int    MaxDeviationPoints = 30;
input ulong  ExpertMagic = 26101721;
input bool   PopupSignals = true;
input bool   MobilePushSignals = false;    // Requires MT5 notification configuration
input bool   WriteSignalCSV = true;

int fastHandle = INVALID_HANDLE;
int slowHandle = INVALID_HANDLE;
int atrHandle  = INVALID_HANDLE;
datetime lastBarTime = 0;
string commonLog = "SignalLab_MT5_Signals.csv";

string ExecutionLabel()
{
   if(ExecutionMode == DEMO_AUTO) return "DEMO_AUTO";
   if(ExecutionMode == REAL_AUTO) return "REAL_AUTO";
   return "SIGNAL_ONLY";
}

bool IsExecutionEligible()
{
   if(ExecutionMode == SIGNAL_ONLY) return false;
   ENUM_ACCOUNT_TRADE_MODE accountMode = (ENUM_ACCOUNT_TRADE_MODE)AccountInfoInteger(ACCOUNT_TRADE_MODE);
   if(ExecutionMode == DEMO_AUTO && accountMode != ACCOUNT_TRADE_MODE_DEMO &&
      !MQLInfoInteger(MQL_TESTER))
   {
      Print("SignalLab blocked order: DEMO_AUTO will not trade on a non-demo account.");
      return false;
   }
   if(ExecutionMode == REAL_AUTO)
   {
      if(accountMode != ACCOUNT_TRADE_MODE_REAL || !AcknowledgeRealMoneyRisk ||
         RealTradingUnlockPhrase != "ENABLE_REAL_TRADING")
      {
         Print("SignalLab blocked order: REAL_AUTO requires a real account plus explicit confirmations.");
         return false;
      }
   }
   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED) ||
      !MQLInfoInteger(MQL_TRADE_ALLOWED) ||
      !AccountInfoInteger(ACCOUNT_TRADE_ALLOWED) ||
      !AccountInfoInteger(ACCOUNT_TRADE_EXPERT))
   {
      Print("SignalLab blocked order: terminal/account automated trading is disabled.");
      return false;
   }
   return true;
}

bool GuardInputParameters()
{
   if(DonchianLookback < 2 || TrendFastEMA < 2 || TrendSlowEMA <= TrendFastEMA ||
      ATRPeriod < 2 || StopLossATR <= 0 || TakeProfitATR <= 0 || TimeExitBars < 1 ||
      EquityRiskPerTradePct <= 0 || EquityRiskPerTradePct > 1.0 ||
      MaxDailyEquityDropPct <= 0 || MaxDailyEquityDropPct > 10.0 ||
      MaxPeakEquityDrawdownPct <= 0 || MaxPeakEquityDrawdownPct > 30.0 ||
      MaxMarginPerTradePct <= 0 || MaxMarginPerTradePct > 25.0 ||
      MaxSpreadAsATR <= 0 || MaxSpreadAsATR > 0.50 ||
      MaxQuoteAgeSeconds <= 0 || MaxDeviationPoints < 0 || ExpertMagic == 0)
   {
      Print("SignalLab: invalid or unsafe input parameter.");
      return false;
   }
   return true;
}

int OnInit()
{
   if(!GuardInputParameters()) return INIT_PARAMETERS_INCORRECT;
   // Fail fast for an obvious account-mode mismatch. This cannot validate jurisdiction.
   ENUM_ACCOUNT_TRADE_MODE mode = (ENUM_ACCOUNT_TRADE_MODE)AccountInfoInteger(ACCOUNT_TRADE_MODE);
   if(ExecutionMode == DEMO_AUTO && mode != ACCOUNT_TRADE_MODE_DEMO &&
      !MQLInfoInteger(MQL_TESTER))
      Print("SIGNALLAB WARNING: DEMO_AUTO chosen on a non-demo account: no orders allowed.");
   if(ExecutionMode == REAL_AUTO && (!AcknowledgeRealMoneyRisk ||
      RealTradingUnlockPhrase != "ENABLE_REAL_TRADING" || mode != ACCOUNT_TRADE_MODE_REAL))
      Print("SIGNALLAB WARNING: REAL_AUTO locked; no orders until all conditions met.");

   fastHandle = iMA(_Symbol,SignalTimeframe,TrendFastEMA,0,MODE_EMA,PRICE_CLOSE);
   slowHandle = iMA(_Symbol,SignalTimeframe,TrendSlowEMA,0,MODE_EMA,PRICE_CLOSE);
   atrHandle = iATR(_Symbol,SignalTimeframe,ATRPeriod);
   if(fastHandle == INVALID_HANDLE || slowHandle == INVALID_HANDLE || atrHandle == INVALID_HANDLE)
   {
      Print("SignalLab: indicator handle failed: ",GetLastError());
      return INIT_FAILED;
   }
   trade.SetExpertMagicNumber(ExpertMagic);
   trade.SetDeviationInPoints(MaxDeviationPoints);
   trade.SetAsyncMode(false);
   if(!trade.SetTypeFillingBySymbol(_Symbol))
      Print("SignalLab: could not determine broker order-filling method; new orders may fail.");

   // Ignore existing just-closed candle when attaching; act only when a NEW bar begins.
   lastBarTime = iTime(_Symbol,SignalTimeframe,0);
   PrintFormat("SignalLab init: symbol=%s, timeframe=%s, execution=%s, account mode=%d. No backtest guarantee.",
               _Symbol,EnumToString(SignalTimeframe),ExecutionLabel(),(int)mode);
   Comment("SignalLab ",ExecutionLabel()," | ",_Symbol," ",EnumToString(SignalTimeframe),
           " | Waiting for next completed candle. SL/TP are NOT a guarantee.");
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   if(fastHandle != INVALID_HANDLE) IndicatorRelease(fastHandle);
   if(slowHandle != INVALID_HANDLE) IndicatorRelease(slowHandle);
   if(atrHandle  != INVALID_HANDLE) IndicatorRelease(atrHandle);
   Comment("");
}

void LogSignal(datetime barTime,int direction,double referencePrice,double sl,double tp,
               double volume,string status)
{
   if(!WriteSignalCSV) return;
   int file = FileOpen(commonLog,FILE_READ|FILE_WRITE|FILE_CSV|FILE_ANSI|FILE_COMMON|FILE_SHARE_READ,';');
   if(file == INVALID_HANDLE)
   {
      Print("SignalLab CSV not writable: ",GetLastError());
      return;
   }
   bool empty = (FileSize(file)==0);
   FileSeek(file,0,SEEK_END);
   if(empty) FileWrite(file,"bar_time_server","symbol","timeframe","direction","reference_price","SL","TP","lots","status");
   FileWrite(file,TimeToString(barTime,TIME_DATE|TIME_MINUTES),_Symbol,
             EnumToString(SignalTimeframe),direction>0?"BUY":"SELL",
             DoubleToString(referencePrice,_Digits),DoubleToString(sl,_Digits),
             DoubleToString(tp,_Digits),DoubleToString(volume,8),status);
   FileClose(file);
}

// Daily loss and peak drawdown are EQUITY checks from terminal-global baselines.
// They persist across restart of THIS MT5 terminal, not across devices/VPS installations.
// They only reject NEW entries; they cannot prevent gaps, margin calls, or stop slippage.
bool EquityGuardsPassed()
{
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   if(equity <= 0) return false;
   MqlDateTime d;
   TimeToStruct(TimeCurrent(),d);
   string id = IntegerToString((long)AccountInfoInteger(ACCOUNT_LOGIN));
   string dayName = StringFormat("SL.D.%s.%04d%02d%02d",id,d.year,d.mon,d.day);
   string peakName = "SL.P."+id;
   if(!GlobalVariableCheck(dayName)) GlobalVariableSet(dayName,equity);
   if(!GlobalVariableCheck(peakName)) GlobalVariableSet(peakName,equity);
   double dayStart = GlobalVariableGet(dayName);
   double peak = GlobalVariableGet(peakName);
   if(equity>peak)
   {
      peak=equity;
      GlobalVariableSet(peakName,peak);
   }
   if(dayStart<=0 || peak<=0) return false;
   double todayPct = 100.0*(dayStart-equity)/dayStart;
   double peakPct = 100.0*(peak-equity)/peak;
   if(todayPct >= MaxDailyEquityDropPct || peakPct >= MaxPeakEquityDrawdownPct)
   {
      PrintFormat("SignalLab risk lock: daily equity change=%.2f%%, peak drawdown=%.2f%%. NO NEW TRADES.",todayPct,peakPct);
      return false;
   }
   return true;
}

// Refuse to stack an EA position on top of ANY open position or pending order in this symbol.
bool SymbolIsBusy()
{
   for(int i=PositionsTotal()-1;i>=0;i--)
   {
      ulong ticket=PositionGetTicket(i);
      if(ticket>0 && PositionGetString(POSITION_SYMBOL)==_Symbol) return true;
   }
   for(int i=OrdersTotal()-1;i>=0;i--)
   {
      ulong ticket=OrderGetTicket(i);
      if(ticket>0 && OrderGetString(ORDER_SYMBOL)==_Symbol) return true;
   }
   return false;
}

// Evaluate account-currency risk using broker's real symbol contract specifications.
// Never round UP to broker minimum lot if doing so exceeds the risk budget.
double RiskSizedVolume(ENUM_ORDER_TYPE type,double entry,double stop)
{
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   double budget = equity*EquityRiskPerTradePct/100.0;
   double oneLotProfit=0;
   if(!OrderCalcProfit(type,_Symbol,1.0,entry,stop,oneLotProfit) || oneLotProfit>=0)
   {
      Print("SignalLab: could not calculate one-lot stop loss in account currency.");
      return 0;
   }
   double lossPerLot = -oneLotProfit;
   if(lossPerLot<=0) return 0;
   double minVol=SymbolInfoDouble(_Symbol,SYMBOL_VOLUME_MIN);
   double maxVol=SymbolInfoDouble(_Symbol,SYMBOL_VOLUME_MAX);
   double step=SymbolInfoDouble(_Symbol,SYMBOL_VOLUME_STEP);
   if(minVol<=0 || maxVol<minVol || step<=0) return 0;
   double raw = MathMin(maxVol,budget/lossPerLot);
   if(raw < minVol) { Print("SignalLab: minimum lot would exceed permitted risk; skipped."); return 0; }
   double steps=MathFloor((raw-minVol)/step+1e-8);
   double vol=NormalizeDouble(minVol+steps*step,8);
   if(vol < minVol || vol > maxVol) return 0;
   double stopProfit=0;
   if(!OrderCalcProfit(type,_Symbol,vol,entry,stop,stopProfit) || -stopProfit>budget*1.001 || stopProfit>=0)
      return 0;
   double margin=0;
   if(!OrderCalcMargin(type,_Symbol,vol,entry,margin) || margin<=0) return 0;
   if(margin>equity*MaxMarginPerTradePct/100.0 ||
      margin>AccountInfoDouble(ACCOUNT_MARGIN_FREE)*0.75)
   {
      Print("SignalLab: broker margin exceeds risk limits; skipped.");
      return 0;
   }
   return vol;
}

// Time exit on NEW bars. It intentionally touches only positions opened by this EA.
void ManageTimeExits()
{
   if(!IsExecutionEligible()) return;
   for(int i=PositionsTotal()-1;i>=0;i--)
   {
      ulong ticket=PositionGetTicket(i);
      if(ticket==0 || PositionGetString(POSITION_SYMBOL)!=_Symbol) continue;
      if((ulong)PositionGetInteger(POSITION_MAGIC)!=ExpertMagic) continue;
      datetime opened=(datetime)PositionGetInteger(POSITION_TIME);
      int heldBars=iBarShift(_Symbol,SignalTimeframe,opened,false);
      if(heldBars < TimeExitBars) continue;
      bool sent=trade.PositionClose(ticket,MaxDeviationPoints);
      uint code=trade.ResultRetcode();
      PrintFormat("SignalLab time exit ticket=%I64u, held bars=%d, sent=%d, retcode=%u (%s)",
                  ticket,heldBars,(int)sent,code,trade.ResultRetcodeDescription());
   }
}

void OnTick()
{
   datetime currentBar=iTime(_Symbol,SignalTimeframe,0);
   if(currentBar<=0 || currentBar==lastBarTime) return;
   lastBarTime=currentBar;
   ManageTimeExits();
   if(Bars(_Symbol,SignalTimeframe) < MathMax(TrendSlowEMA+20,DonchianLookback+20)) return;
   double fast[],slow[],atr[];
   if(CopyBuffer(fastHandle,0,1,1,fast)!=1 || CopyBuffer(slowHandle,0,1,1,slow)!=1 ||
      CopyBuffer(atrHandle,0,1,1,atr)!=1 || atr[0]<=0) return;

   // Only completed signal candle (shift 1), compared with prior N candles (shifts 2..N+1).
   int hiShift=iHighest(_Symbol,SignalTimeframe,MODE_HIGH,DonchianLookback,2);
   int loShift=iLowest (_Symbol,SignalTimeframe,MODE_LOW,DonchianLookback,2);
   if(hiShift<0 || loShift<0) return;
   double signalClose=iClose(_Symbol,SignalTimeframe,1);
   double previousHigh=iHigh(_Symbol,SignalTimeframe,hiShift);
   double previousLow =iLow (_Symbol,SignalTimeframe,loShift);
   int direction=0;
   if(fast[0]>slow[0] && signalClose>previousHigh) direction=1;
   else if(fast[0]<slow[0] && signalClose<previousLow) direction=-1;
   if(direction==0)
   {
      Comment("SignalLab ",ExecutionLabel()," | ",_Symbol," | No breakout on closed candle");
      return;
   }

   MqlTick tick;
   if(!SymbolInfoTick(_Symbol,tick) || tick.ask<=0 || tick.bid<=0 || tick.ask<tick.bid) return;
   if((long)(TimeCurrent()-tick.time)>MaxQuoteAgeSeconds) return;
   double spread=tick.ask-tick.bid;
   if(spread>atr[0]*MaxSpreadAsATR)
   {
      PrintFormat("SignalLab spread gate: spread=%.5f ATR=%.5f",spread,atr[0]);
      return;
   }
   double entry=direction>0 ? tick.ask : tick.bid;
   // Broker tick sizes are sometimes coarser than displayed digits.
   double priceStep=SymbolInfoDouble(_Symbol,SYMBOL_TRADE_TICK_SIZE);
   if(priceStep<=0) return;
   double desiredStop=entry-direction*StopLossATR*atr[0];
   double desiredTarget=entry+direction*TakeProfitATR*atr[0];
   double stop=NormalizeDouble((direction>0?MathFloor(desiredStop/priceStep):
                                          MathCeil(desiredStop/priceStep))*priceStep,_Digits);
   double target=NormalizeDouble((direction>0?MathFloor(desiredTarget/priceStep):
                                            MathCeil(desiredTarget/priceStep))*priceStep,_Digits);
   double points=SymbolInfoDouble(_Symbol,SYMBOL_POINT);
   double minStops=(double)SymbolInfoInteger(_Symbol,SYMBOL_TRADE_STOPS_LEVEL)*points;
   // Relative to broker stop-trigger side of quote. Never silently widen stop and risk.
   if((direction>0 && ((tick.bid-stop)<=minStops || (target-tick.bid)<=minStops)) ||
      (direction<0 && ((stop-tick.ask)<=minStops || (tick.ask-target)<=minStops)))
   {
      Print("SignalLab: SL/TP too close to current broker market; signal skipped.");
      return;
   }
   datetime closedBar=iTime(_Symbol,SignalTimeframe,1);
   string side=direction>0?"BUY":"SELL";
   string info=StringFormat("SignalLab %s %s %s | ref=%.*f stop=%.*f target=%.*f | %s",
                            _Symbol,EnumToString(SignalTimeframe),side,
                            _Digits,entry,_Digits,stop,_Digits,target,ExecutionLabel());
   Print(info);
   Comment(info,"\nResearch signal; actual fills may differ. No guaranteed win rate.");
   if(PopupSignals && !MQLInfoInteger(MQL_TESTER)) Alert(info);
   if(MobilePushSignals && !MQLInfoInteger(MQL_TESTER)) SendNotification(info);

   if(ExecutionMode==SIGNAL_ONLY)
   {
      LogSignal(closedBar,direction,entry,stop,target,0,"ALERT_ONLY");
      return;
   }
   if(!IsExecutionEligible())
   {
      LogSignal(closedBar,direction,entry,stop,target,0,"BLOCKED_ACCOUNT_OR_TOGGLE");
      return;
   }
   if(!EquityGuardsPassed() || SymbolIsBusy())
   {
      LogSignal(closedBar,direction,entry,stop,target,0,"BLOCKED_RISK_OR_EXISTING_ORDER");
      return;
   }
   ENUM_ORDER_TYPE type=direction>0?ORDER_TYPE_BUY:ORDER_TYPE_SELL;
   double volume=RiskSizedVolume(type,entry,stop);
   if(volume<=0)
   {
      LogSignal(closedBar,direction,entry,stop,target,0,"BLOCKED_POSITION_SIZING");
      return;
   }
   bool submitted=direction>0 ? trade.Buy(volume,_Symbol,entry,stop,target,"SignalLab ATR breakout") :
                                 trade.Sell(volume,_Symbol,entry,stop,target,"SignalLab ATR breakout");
   uint retcode=trade.ResultRetcode();
   bool completed=submitted && (retcode==TRADE_RETCODE_DONE || retcode==TRADE_RETCODE_DONE_PARTIAL) &&
                  trade.ResultDeal()>0;
   string status=completed?"BROKER_FILLED":"ORDER_FAILED";
   PrintFormat("SignalLab %s %.8f %s; request=%d, retcode=%u (%s), deal=%I64u. Exact fill may differ.",
               status,volume,side,(int)submitted,retcode,trade.ResultRetcodeDescription(),trade.ResultDeal());
   LogSignal(closedBar,direction,entry,stop,target,volume,status);
}


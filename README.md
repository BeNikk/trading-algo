# Trading exchange
This is a basic Order book implementation using Typescript.

It mimics a trading systems where users can buy or sell a single hypothetical stock, named Tata. Here we are only handling the limit orders

## Finance terms

- Orderbook- It is a list of buy and sell orders waiting to be fulfilled, showing how much quantity people are willing to buy or sell.
- Order Matching - When a buy order is placed, the system tries to match it with existing sell orders at prices less than or equal to the buyer's price.
When a sell order is placed, it tries to match with existing buy orders at prices greater than or equal to the seller's price.
If there is enough quantity on the other side, the trade is executed fully.
If the quantity is less, partial fulfillment happens and remaining quantity is kept as an open order.
- Limit orders - A limit order is an instruction to buy or sell a stock at a specific price or better.
Buy limit order: You want to buy shares only at your specified price or lower.
Sell limit order: You want to sell shares only at your specified price or higher.

### An interesting technical design
As you will notice, we are not maintaining the orderbook in a database, not that I am lazy, but even in real production systems who does this high frequency trading, where speed is important, orderbook is maintained in memory to reduce the latency as it is avoiding a database call, and snapshots of the orderbook is taken time to time. 






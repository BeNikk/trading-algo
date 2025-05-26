import express, { Request, Response } from 'express';
const orderBook = express.Router();

orderBook.get('/',(req:Request,res:Response)=>{
    res.json({message:"Test route"});
})

interface UsersInterface{
    id:number,
    Balances:{
        Tata:number,
        Inr:number
    }
}

const Users:UsersInterface[] = [{
    id:1,
    Balances:{
        Tata:500,
        Inr:50000
    }
},{
    id:2,
    Balances:{
        Tata:300,
        Inr:70000
    }
},{
    id:3,
    Balances:{
        Tata:600,
        Inr:100000
    }
}]

interface OrderInterface{
    userId:number,
    price:number,
    quantity:number,
}

let sellStockOrders:OrderInterface[]=[];
let buyStockOrders:OrderInterface[]=[];


orderBook.post('/order',(req:Request,res:Response)=>{
    let {id,side,price,quantity} = req.body;
    const user = Users.find((user)=>user.id==id);
    if(!user){
        res.json({message:"User does not exist"});
        return;
    }
    if(side=="buy"){
        if(price*quantity > user.Balances.Inr){
            res.json({message:"Insufficient INR Balance"});
            return;
        }
        sellStockOrders.sort((a, b) => a.price - b.price);


        for(let i=0;i<sellStockOrders.length;i++){
            //selling price is less than or equal to the the buying price, make the sale;
            if(sellStockOrders[i].price<=price){
                const tradePrice = sellStockOrders[i].price;
                const tradeQuantity = sellStockOrders[i].quantity;
                // make the trade 
                const sellingUser = Users.find((usr)=>sellStockOrders[i].userId == usr.id);
                if(!sellingUser) return;
                //i have to check 2 test cases, based on the quantity of the stock sellable;
                if(tradeQuantity>quantity){
                    sellingUser.Balances.Tata -=quantity;
                    sellingUser.Balances.Inr +=quantity*tradePrice;
                    user.Balances.Tata+=quantity;
                    user.Balances.Inr -= quantity*tradePrice;
                    sellStockOrders[i].quantity -= quantity;
                    quantity = 0;
                    break;
                }
                else{
                    sellingUser.Balances.Tata -= tradeQuantity;
                    sellingUser.Balances.Inr += tradeQuantity*tradePrice;
                    user.Balances.Tata += tradeQuantity;
                    user.Balances.Inr -= tradeQuantity*tradePrice;
                    quantity -=tradeQuantity;
                    sellStockOrders.splice(i,1);                    
                    continue;
                }

            }
        }
        if(quantity>0){
            buyStockOrders.push({
                userId:user.id,
                price:price,
                quantity:quantity
            })
        }
        res.json({message:"Order fulfilled"});
        return;
        

    }
    if(side=="sell"){
        if(user.Balances.Tata<quantity){
            res.json({message:"Insufficient stock balance"})
            return;
        }
        buyStockOrders.sort((a, b) => b.price - a.price);
        for(let i=0;i<buyStockOrders.length;i++){
            //buying price is greater than or equal to selling price, sell the stock
            if(buyStockOrders[i].price>=price){
                const tradeQuantity = buyStockOrders[i].quantity;
                const tradePrice = buyStockOrders[i].price;
                let buyer = Users.find((usr)=>usr.id==buyStockOrders[i].userId);
                if(!buyer)return;
                if(tradeQuantity>quantity){
                    /*more people want to buy this stock at this price, so fulfill the order
                    we will add money to the seller account, we will subtract stocks from the seller account, we will 
                    subtract money from buyer account, we will add stocks to buyer account, and update the buyOrder book with the
                    updated quantity of stocks and continue;
                    */
                   user.Balances.Inr +=tradePrice*quantity;
                   buyer.Balances.Inr -= tradePrice*quantity;
                   user.Balances.Tata -= quantity;
                   buyer.Balances.Tata += quantity;
                   //order fulfilled, now we just need to update the buying orders
                   buyStockOrders[i].quantity -= quantity;
                   break;

                }else{
                    //quantity of stock selling is more than what is buying;
                    user.Balances.Inr += tradePrice*tradeQuantity;
                    buyer.Balances.Inr -= tradePrice*tradeQuantity;
                    user.Balances.Tata -=tradeQuantity;
                    buyer.Balances.Tata += tradeQuantity;
                    quantity -= tradeQuantity;
                    buyStockOrders.splice(i,1);
                    i--;

                }
            }
        }
        if(quantity>0){
            sellStockOrders.push({
                quantity,
                price,
                userId:id
            })
        }
        res.json({message:"Order fulfilled"});
        return;
    }
})

orderBook.get("/user/:userId",(req:Request,res:Response)=>{
    try{
        let userId = req.params.userId;
        const user = Users.find(x=>x.id==parseInt(userId));
        if(!user){
            res.json({message:"No such user found"});
            return;
        }
        res.json({
            message:"This is a user's balance request",
            stockBalances:user.Balances.Tata,
            rupeeBalances:user.Balances.Inr
        });
        return;
    }
    catch(e){
        console.log(`Error occured ${e}`);
    }
})

orderBook.get('/depth',(req:Request,res:Response)=>{
    const depth:{
        [price:number]:{
            type:"sell"|"buy",
            quantity:number,
        } 
    } = {};
    for(const order of buyStockOrders){
        if(!depth[order.price]){
            depth[order.price] = {type:"buy",quantity:order.quantity}
        }
        else{
            depth[order.price].quantity +=order.quantity;
        }
    }
    for(const order of sellStockOrders){
        if(!depth[order.price]){
            depth[order.price] = {type:"sell",quantity:order.quantity}
        }
        else{
            depth[order.price].quantity+=order.quantity;
        }
    }
    res.json({depth});
    return;
})


export default orderBook;


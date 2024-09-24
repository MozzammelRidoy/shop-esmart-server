

// order summery read, like : 
// total orders, pending, confirm, processing, delivered, cancel & return order, 

import { ObjectId } from "mongodb";

export const getAllOrderSummery = (ordersCollection, usersCollection) =>{
    return async(req, res)=>{

        const {startDate, endDate} = req.query; 

       
        const matchQuery = {
            createdAt : {$gte : new Date(startDate), $lte : new Date(endDate)}
        }
         try{
                const totalOrders = await ordersCollection.countDocuments(matchQuery); 
                const pendingOrders = await ordersCollection.countDocuments({...matchQuery, order_status : 'Pending'}); 
                const confirmOrders = await ordersCollection.countDocuments({...matchQuery, order_status : 'Confirm'}); 
                const onCuriarOrders = await ordersCollection.countDocuments({...matchQuery, order_status : 'Processing'}); 
                const deliveredOrders = await ordersCollection.countDocuments({...matchQuery, order_status : "Delivered"}); 
                const cancelOrders = await ordersCollection.countDocuments({...matchQuery, order_status : "Cancel"}); 
                const returnOders = await ordersCollection.countDocuments({...matchQuery, order_status : "Return"}); 
                const totalUsers = await usersCollection.countDocuments({...matchQuery, type : "user"}); 

                const results = {totalOrders, pendingOrders, confirmOrders, onCuriarOrders, deliveredOrders, cancelOrders, returnOders, totalUsers}
                return res.status(200).send({data : results}); 
        }
        catch(err){
            return res.status(400).send({ message: 'Error fetching order summary' })
        }
    }
}


// revenue calculation , like : revenue, profit, coupon discount, product discount
export const getRevenueSummery = (ordersCollection, productsCollection)=>{
    return async(req, res)=>{
        const {startDate, endDate} = req.query; 

        const matchQuery = {
            createdAt : {$gte : new Date(startDate), $lte : new Date(endDate)}
        }; 

        try{
                const revenueSummery = await Promise.all([
                    ordersCollection.aggregate([
                        {$match : {...matchQuery, order_status : 'Delivered'}},
                        {
                            $group : {
                                _id : null,
                                totalRevenue : {$sum : '$orderRevenue'},
                                totalProfit : {$sum : '$orderProfit'},
                                totalCouponDiscount : {$sum : '$discount'},
                            }
                        }
                    ]).toArray(),
                    productsCollection.aggregate([
                        {
                            $match : {...matchQuery}
                        }, 
                        {
                            $group : {
                                _id : null,
                                totalProductsDiscount : {$sum : '$discountAmount'}
                            }
                        }
                    ]).toArray()
                ])

                const {totalRevenue = 0, totalCouponDiscount = 0, totalProfit = 0} = revenueSummery[0][0] || {} ;

                const {totalProductsDiscount = 0} = revenueSummery[1][0] || {}; 

                const results = {totalRevenue, totalCouponDiscount, totalProfit, totalProductsDiscount}; 

                return res.status(200).send({data : results}); 



        }
        catch(err){
            return res.status(400).send({ message: 'Error fetching revenue summary' })
        }

    }
}


// extended summary : like top selling products, categorywise profit , trending product, low stock alets, total ratings

export const getExtendedSummary = (ordersCollection, productsCollection) => {
    return async(req, res)=>{
        const {startDate, endDate} = req.query ;
        const matchQuery = {
            createdAt : {$gte : new Date(startDate), $lte : new Date(endDate)}
        }

        const projection = {
            '_id' : 1, 
            'images' : {$slice : 1},
            'totalSold' : 1,
            'finalPrice' : 1,
            'stockQuantity' : 1,
            'productCode' : 1,
        }

        try{

            const topSellingProducts = await productsCollection.find({...matchQuery}, {projection}).sort({totalSold : -1}).limit(10).toArray(); 

            const trendingProducts = await productsCollection.find({...matchQuery}, {projection}).sort({ratings : -1, totalSold : -1}).limit(10).toArray(); 

            const lowStockAlerts = await productsCollection.find({...matchQuery, stockQuantity : {$lte : 10}}, {projection}).sort({stockQuantity : 1}).limit(15).toArray(); 

            const deliveredOrder = await ordersCollection.find({...matchQuery, order_status : 'Delivered'}).toArray(); 

            let categoryWiseSales = {}; 

            for(const order of deliveredOrder){
                for(const cartItem of order.carts){
                    

                    const category = cartItem.productCategory; 

                    if(categoryWiseSales[category]){
                        categoryWiseSales[category] += cartItem.quantity; 
                    }
                    else{
                        categoryWiseSales[category] = cartItem.quantity;
                    }
                }
            }


            const siteWideRatings = await productsCollection.aggregate([
                {
                    $match : {...matchQuery}
                },
                {
                    $group : {
                        _id : null,
                        totalRatingsCount : {$sum : '$totalRatingsCount'},
                        totalRatingsPoint : {$sum : {$multiply : ['$averageRating', '$totalRatingsCount']}}
                    }
                },
                {
                    $project : {
                        _id : 0,
                        totalRatingsCount : 1, 
                        siteAverageRatings : {
                            $cond : {
                                if : {$gt : ['$totalRatingsCount',0]},
                                then : {$divide : ['$totalRatingsPoint', '$totalRatingsCount']},
                                else : 0
                            }
                        }
                    }
                }
            ]).toArray(); 

            const {totalRatingsCount = 0, siteAverageRatings = 0} = siteWideRatings[0] || {}; 

            const ratings = {totalRatingsCount, siteAverageRatings}; 

             const results = {topSellingProducts, trendingProducts, lowStockAlerts, categoryWiseSales, ratings}; 
            return res.status(200).send({data : results}); 
          }
        catch(err){
            return res.status(400).send({ message: 'Error fetching Extedned Summery'})
        }
    }
}
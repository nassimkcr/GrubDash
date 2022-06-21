const { format } = require("path");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function bodyDataHas(properyName){
    return function (req ,res, next){
        const {data={}}= req.body
        if(data[properyName]){
            return next()
        }
        
            next({status: 400, message:`${properyName} is missing`})
        
    }
}

function ValidateDishesProperty(req ,res, next){
    const {data: {dishes}={}} = req.body
    if(dishes.length == 0 || !Array.isArray(dishes) ){
        return next({status: 400, message: 'dishes should be an array wwtih at least one item'})
    }
    
    for(let dish of dishes ){
        const index = dishes.indexOf(dish)
        if(!dish.quantity || dish.quantity < 0 || !Number.isInteger(dish.quantity)){
            return next({status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`})
        }
    }
    
    next()
}

function orderExists(req, res, next){
    const {orderId} = req.params
    const foundOrder = orders.find(order => order.id == orderId)

    
    if(foundOrder){
        res.locals.order = foundOrder
       return next()
    }
    
    next({status: 404, message: `Not found: ${orderId}`})
    
}

function validateStatusProperty(req, res, next){
    const {data: {status}={}}= req.body
    const statusArr = ["pending", "preparing", "out-for-delivery", "delivered"]
    if(status == "delivered"){
        return next({status: 400, message: "A delivered order cannot be changed"})
    }
    if(!statusArr.includes(status)){
        return next({status: 400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered"})
    }
    next()

}
function list(req, res){
    res.json({data: orders})
}

function create(req, res, next){
    const {data: {deliverTo, mobileNumber, dishes} ={}} = req.body
    const newId = nextId()
    const newOrder={
        id:newId,
        deliverTo,
        mobileNumber,
        dishes
        
    }
    orders.push(newOrder)
    res.status(201).json({data: newOrder})
}


function update(req, res, next){
    const {data:{id, deliverTo, mobileNumber, status, dishes}={}}= req.body
    const order = res.locals.order
    const {orderId} = req.params
    if(id && order.id !== id){
        return next({status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`})
    }

    order.deliverTo = deliverTo
    order.mobileNumber = mobileNumber
    order.status = status
    order.dishes = dishes
    res.status(200).json({data: order})
}

function read(req, res){
    res.send({data: res.locals.order})
}

function destroy(req, res, next){
    const order = res.locals.order
    if(order.status !== "pending"){
        next({status: 400, message: "An order cannot be deleted unless it is pending"})
    }
    
    const indexToDelete = orders.indexOf(order)
    const deletedOrder = orders.splice(indexToDelete, 1)

    res.status(204).json({data: deletedOrder})

}

module.exports = {list, 
    read:[orderExists, read], 
    create:[bodyDataHas("deliverTo"), bodyDataHas("mobileNumber"), bodyDataHas("dishes"), ValidateDishesProperty, create],
    update:[orderExists,bodyDataHas("deliverTo"), bodyDataHas("mobileNumber"), bodyDataHas("dishes"),bodyDataHas("status"), ValidateDishesProperty, validateStatusProperty, update],
    delete:[orderExists, destroy]
}
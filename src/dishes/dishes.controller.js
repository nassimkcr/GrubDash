const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res){
    res.json({data: dishes})
}

function bodyDataHas(properyName){
    return function (req, res, next){
        const {data = {}} = req.body;
        if(data[properyName]){
            return next()
        }
        next({status: 400, message: `Must include a ${properyName}`})
    }
}



function pricePropertyIsValid(req, res, next){
    const {data : {price}={}}= req.body

    if(Number.isInteger(price) && price >= 0){
        return next()
    }
    next({status: 400, message: 'price must be an integer and greater than 0'})
}

function create(req, res){
    const {data:{name, description, price, image_url}={}} = req.body
    const newId = nextId()
    const newDish = {
        id: newId,
        name,
        description,
        price,
        image_url,
    }
    dishes.push(newDish)
    res.status(201).json({data: newDish})
    
}

function dishExists(req, res, next){
    const {dishId} = req.params
    const foundDish = dishes.find(dish => dish.id == dishId)

    if(foundDish){
        res.locals.dish = foundDish
       return next()
    }
    next({status: 404, message: `Not found: ${dishId}`})
}

function read(req, res){
    res.json({data: res.locals.dish})

}

function update(req, res, next){
    dish = res.locals.dish
    const {data:{id, name, description, price, image_url}={}} = req.body
    
    if(id !== dish.id && id){
        return  next({status: 400, message: `data id ${id} and dish id does not match`})

    }

    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    res.status(200).json({data: dish})
}

module.exports = {list, create:[bodyDataHas("name"), bodyDataHas("description"), bodyDataHas("price"), bodyDataHas("image_url"), pricePropertyIsValid, create], read:[dishExists, read], update:[dishExists,bodyDataHas("name"), bodyDataHas("description"), bodyDataHas("price"), bodyDataHas("image_url"), pricePropertyIsValid, update]}
const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const session = require('express-session')
const Joi = require('joi')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({
    name:'MySession',
    secret:'ShemCode',
    saveUninitialized:false,
    resave:true
}))

const conn = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'myshop'
})

conn.connect()

const trans = nodemailer.createTransport({
  service:'Gmail',
  auth:{
    user:'roeireznik@gmail.com',
    pass:'pcfweupuwyyfbipt'
  }
})

app.engine('handlebars', exphbs.engine({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

app.use(express.static('public'));

const regi1 = Joi.object().keys({
    id:Joi.number().min(100000000).max(999999999).required(),
    email:Joi.string().email().required(),
    password: Joi.string().min(3).max(15).required(),
    repassword: Joi.any().valid(Joi.ref('password')).required()
})

const regi2 = Joi.object().keys({
    city:Joi.string().required(),
    street:Joi.string().required(),
    first:Joi.string().required(),
    last:Joi.string().required()
})

var future = new Date();
future.setTime(future.getTime() + 31 * 24 * 60 * 60 * 1000); 

const checkout = Joi.object().keys({
  first:Joi.string().required(),
  last:Joi.string().required(),
  city:Joi.string().required(),
  street:Joi.string().required(),
  date:Joi.date().min(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`).max(`${future.getFullYear()}-${future.getMonth() + 1}-${future.getDate()}`),
  card:Joi.number().required()
})


app.get('/logout',(req,res)=>{
  let logged = req.session.logged
  let del
  conn.query('SELECT * FROM delivery',(err,result)=>{
    del = true
    result.forEach(elm=>{
        if(elm.cartID == logged.cartID){
          del = false
        }
    })
    if(del == true){
      conn.query(`DELETE FROM shoping_cart WHERE id = ${logged.cartID}`,(err,result)=>{
        req.session.destroy()
        res.send('logout')
      })
    }else{
      req.session.destroy()
      res.send('logout')
    }
  })

})

app.get('/',(req,res)=>{
    res.redirect('/shop')
})

app.get('/shop', (req,res)=>{
    let logged = req.session.logged
    if(!logged){
      res.redirect('/login')
    }else{
      let fullname = logged.first + ' ' + logged.last
      if(logged.role == 'admin'){
        res.render('shopadmin',{layout:'admin',name:fullname})
      }else if(logged.role == 'user'){
        res.render('shop',{layout:'main',name:fullname})
      }
    }
})

app.get('/deleteproduct', (req,res)=>{
    let logged = req.session.logged
    if(logged){
        if(logged.role == 'user'){
          sql = `DELETE FROM products_cart WHERE product = ${req.query.name} AND user_cart = ${logged.cartID}`
          conn.query(sql,(err,result)=>{
              res.send(result)
          })
        }
    }else{
      res.redirect('/login')
    }
})


app.get('/getproducts', (req,res)=>{
    let logged = req.session.logged
    if(logged){
      conn.query('SELECT products.*,categories.category_name FROM products INNER JOIN categories ON products.category_cart = categories.id',(err,result)=>{
        res.send(result)
      })
    }else{
      res.redirect('/login')
    }

})

app.get('/getcategories',(req,res)=>{
    let logged = req.session.logged
    if(logged.role == 'admin'){
        conn.query('SELECT * FROM categories',(err,result)=>{
            res.send(result)
        })
    }
})


app.get('/getcart', (req,res)=>{
    let logged = req.session.logged
    if(logged){
        if(logged.role == 'user'){
            sql = `SELECT products_cart.price,products_cart.quantity,products_cart.product,products.product_name,products.image
                    FROM products_cart
                    INNER JOIN products ON products_cart.product = products.id 
                    INNER JOIN shoping_cart ON products_cart.user_cart = shoping_cart.id 
                    WHERE products_cart.user_cart = ${logged.cartID}`
            conn.query(sql ,(err,result)=>{
                res.send(result)
            })
        }
    }else{
      res.redirect('/login')
    }
})

app.get('/adminedit',(req,res)=>{
    let logged = req.session.logged
    let sql;
    if(logged){
        if(logged.role == 'admin'){
                sql = `UPDATE products
                SET product_name = "${req.query.name}", price = ${req.query.price}, image = "${req.query.image}",category_cart = ${req.query.categoryid}
                WHERE id = ${req.query.id}`
                conn.query(sql,(err,result)=>{
                    res.send('updated')
                })
        }
    }
})

app.get('/addproduct',(req,res)=>{
    let logged = req.session.logged
    if(logged){
        if(logged.role == 'user'){
            conn.query(`SELECT * FROM products_cart WHERE user_cart = ${logged.cartID}`,(err,result)=>{
                sql = `INSERT INTO products_cart (product, quantity, price, user_cart) VALUES ("${req.query.name}", ${req.query.quantity}, ${req.query.price}, ${logged.cartID})`
                if(result.length > 0){
                  result.forEach((product)=>{
                    if(req.query.name == product.product){
                      sql = `UPDATE products_cart SET quantity = ${req.query.quantity}, price = ${req.query.price}  WHERE product = ${req.query.name} AND user_cart = ${logged.cartID}`
                    }
                  })
                }
                conn.query(sql,(err,result)=>{
                  res.send(result)
                })
            })
        }else if(logged.role == 'admin'){
          sql = `INSERT INTO products (product_name, price, image, category_cart)
          VALUES ("${req.query.name}", "${req.query.price}", "${req.query.image}","${req.query.categoryid}")`
          conn.query(sql,(err,result)=>{
              res.send('added')
          })
        }
    }else{
        res.redirect('/login')
    }
})

app.get('/orders',(req,res)=>{
  conn.query(`SELECT * FROM delivery`,(err,result)=>{
    const countObj = {};
    const targetCount = 3;
    const resultArr = [];

    result.forEach(obj => {
      const value = obj.delivery_date;
      if (!countObj[value]) {
        countObj[value] = 1;
      } else {
        countObj[value]++;
      }
    });

    for (let key in countObj) {
      if (countObj[key] === targetCount) {
        var blocked = new Date(key)
        if(blocked.getMonth() + 1 < 10){
          var month = `0${blocked.getMonth() + 1}`
        }else{
          var month = blocked.getMonth() + 1
        }
        foramted = `${blocked.getFullYear()}-${month}-${blocked.getDate()}`
        resultArr.push(foramted);
      }
    }

    
    res.send(resultArr)


  })
})   

app.get('/checkoutview',(req,res)=>{
    let logged = req.session.logged
    if(!logged){
      res.redirect('/login')
    }else{
      conn.query(`SELECT * FROM products_cart WHERE user_cart = ${logged.cartID}`,(err,result)=>{
        if(result.length == 0){
          res.redirect('/shop')
        }else{
          let fullname = logged.first + ' ' + logged.last
          res.render('checkoutview',{layout:'checkout1',name:fullname})
        }
    })

    }
})

app.get('/checkout', (req,res)=>{
    let logged = req.session.logged

    if(!logged){
      res.redirect('/login')
    }else{
      conn.query(`SELECT * FROM products_cart WHERE user_cart = ${logged.cartID}`,(err,result)=>{
          if(result.length == 0){
            res.redirect('/shop')
          }else{
            res.render('checkout',{layout:'checkout2'})
          }
      })
    }
})

app.get('/getdetails', (req,res)=>{
    let logged = req.session.logged
    if(logged){
      let address = [{
          first:logged.first,
          last:logged.last,
          city:logged.city,
          street:logged.street
      }]
      res.send(address)
    }else{
        res.redirect('/login')
    }

})

app.get('/payment', (req,res)=>{

    if(req.session.logged){
      var orderobj = {};
      req.query.fields.forEach(cred =>{
        orderobj[cred.name] = cred.value
      })

      if(checkout.validate(orderobj).error){
        res.send(checkout.validate(orderobj).error.details)
      }else{
        let logged = req.session.logged
        const creditCardRegex = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})$/;
        var price = 0
        var total = 0
        var products = [];
        var index = 0
  

  
        sql = `SELECT products_cart.price as total,products_cart.quantity,products_cart.product,products.product_name,products.image,products.price
                FROM products_cart
                INNER JOIN products ON products_cart.product = products.id 
                INNER JOIN shoping_cart ON products_cart.user_cart = shoping_cart.id 
                WHERE shoping_cart.id = ${logged.cartID}`
  
            conn.query(sql,(err,result)=>{
                result.forEach(order=>{
                  index++
                  products.push({
                    index:index,
                    name:order.product_name,
                    quantity:order.quantity,
                    price:order.price,
                    total:(order.price * order.quantity).toFixed(2)
                  })
  
                  price = order.price * order.quantity
                  total += price
                })
                if(total == 0){
                  res.send('{"products":"none"}')
                }else{
                  var now = new Date()
                  var formatednow = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}`
  
                  orderobj.price = total
                  orderobj.cartID = logged.cartID
                  
                  if (creditCardRegex.test(orderobj.card)) {
                      orderobj.card = orderobj.card.substr(orderobj.card.length - 4)
                      sql = `INSERT INTO delivery (first,last,cartID,price,city,street,delivery_date,last_digits) VALUES 
                      ("${orderobj.first}", "${orderobj.last}", "${orderobj.cartID}", "${orderobj.price}", "${orderobj.city}","${orderobj.street}", "${orderobj.date}", "${orderobj.card}")`
                      conn.query(sql,(err,result)=>{
                          if(err){
                            res.redirect('/shop')
                          }else{
                              req.session.order = {
                                name:orderobj.first + ' ' + orderobj.last,
                                address:orderobj.city + ' ' + orderobj.street,
                                orderDate: formatednow,
                                deliveryDate:orderobj.date, 
                                price:total.toFixed(2),
                                products
                              }
                                
                              conn.query(`INSERT INTO shoping_cart (user_cart) VALUES (${logged.id})`,(err,result)=>{
                                  if(err){
                                    console.log('failes order')
                                  }else{
  
                                    logged.cartID = result.insertId
                                    req.session.logged = logged
                                    res.send('{"order":"succed"}')
                                  }
                              })
                          }
                      })
                  } else {
                    console.log("Invalid credit card number");
                  }
                }
            })
      }
    }else{
      res.redirect('/login')
    }
})


app.get('/receipt',(req,res)=>{
      if(req.session.logged){
        res.render('receipt',{layout:'checkout2',lastOrder:req.session.order})
      }else{
        res.redirect('/login')
      }
})

app.get('/getreceipt', (req,res)=>{
    res.send(req.session.order)
})


app.get('/about',(req,res)=>{
    sql = 'SELECT * FROM delivery'
    var numorders;
    var numproducts;
    conn.query(sql,(err,result)=>{
      numorders = result.length
      sql = 'SELECT * FROM products'
      conn.query(sql,(err,result)=>{
        numproducts = result.length
        res.send(`{"orders":"${numorders}","products":"${numproducts}"}`)
      })
    })
})

app.post('/api/product',(req,res)=>{
    if(req.body.price <= 0  || typeof req.body.price ==! "number"){
      res.send({"success":false,"price":"price have to be larger then 0"})
    }else if(typeof req.body.name ==! "string" || typeof req.body.image ==! "string"){
        res.send({"success":false,"name":"name have to be string","image":"image have to be string"})
    }else{
      conn.query('SELECT * FROM products',(err,result)=>{
          for(i=0;i<result.length;i++){
            if(result[i].product_name === req.body.name){
              res.send({"success":false,"name":"name already exist"})
              return false
            }
          }
          var sql = `INSERT INTO products (product_name, price, image,category_cart) VALUES ("${req.body.name}", ${req.body.price}, "${req.body.image}", ${req.body.categoryid})`
          conn.query(sql,(err,result)=>{
            if(err){
              res.send({"success":false})
            }else{
              res.send({"success":true,"data":[{"id":`${result.insertId}`}]})
            }
          })
      })
    }
})

app.get('/login',(req,res)=>{
  if(req.session.logged){
    res.redirect('/shop')
  }

  if(req.query.email){

      let sql = `SELECT * FROM user WHERE email = "${req.query.email}"` 
      let logged
      conn.query(sql,(err,result)=>{
        if(result.length == 0){
          res.send('{"failed":"Email or Pass wrong"}')
        }else{

          if(req.query.password == result[0].password){ 
            logged = result[0]
            var sql = `SELECT shoping_cart.* FROM shoping_cart LEFT JOIN delivery ON (shoping_cart.id = delivery.cartID) WHERE delivery.cartID IS NULL AND shoping_cart.user_cart = ${logged.id}`
            conn.query(sql,(err,result)=>{
              if(result.length == 0){
                sql = `INSERT INTO shoping_cart (user_cart) VALUES ("${logged.id}")`
                conn.query(sql,(err,result)=>{
                  logged.cartID = result.insertId
                  req.session.logged = logged
                  res.send('{"success":"yes"}')
                })
              }else{
                  logged.cartID = result[(result.length)-1].id
                  req.session.logged = logged
                  res.send('{"success":"yes"}')
              }
            })
          }else{
            res.send('{"failed":"Email or Pass wrong"}')
          }
        }
      })   

  }else{
    res.render('login',{layout:'minimal'})
  }
})

app.get('/register1',(req,res)=>{
  if(req.query.fields) {
    var userInfo = req.query.fields
    var obj = {};
    userInfo.forEach(user => {
      obj[user.name] = user.value
    })

    var obj1 = {
        id:obj.id,
        email:obj.email,
        password:obj.password
    }


    if(regi1.validate(obj).error){
      res.send(regi1.validate(obj).error.details)
    }else{
      conn.query(`SELECT * FROM user`,(err,result)=>{
          let id = true
          let email = true
          result.forEach((elm,index)=>{
              if(elm.id == obj.id) {
                id = false
              }
              if(elm.email == obj.email) {
                email = false
              }
          })

          if(!id && !email){
              res.send('{"email":"Email already exist", "id":"id already exist"}')
          }else if(!id){
            res.send('{"id":"Id already exist"}')
          }else if(!email){
            res.send('{"email":"Email already exist"}')
          }

          if(id && email){
              req.session.regi1 = obj1
              res.send('{"success":"yes"}')
          }
    })
    }

  }else{
    res.render('register',{layout:'minimal'})
  }
})

app.get('/register2',(req,res)=>{

  if(req.query) {
    let obj = {
        city:req.query.city,
        street:req.query.street,
        first:req.query.first,
        last:req.query.last
    }

    if(regi2.validate(obj).error){
      res.send(regi2.validate(obj).error.details)
    }else{
        let register0 = req.session.regi1
        let register1 = {
            ...obj,
            ...register0
        }
        req.session.register2 = register1
      
 
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789'
      var charsLength = chars.length
      var code = ''
      for(var i = 0; i <= 8; i++ ){
        code += chars.charAt(Math .floor(Math.random() * charsLength))
      }
      req.session.code = code

      const mailoptions = {
        from: 'roeireznik@gmail.com',
        to:register1.email,
        subject:'validation code',
        html:'Please type your confirmation code: ' + code
      }
      trans.sendMail(mailoptions, (err,info)=>{
          if(err){
            res.send(err.message)
          }else{
            res.send('{"success":"yes"}')
          }
      })
    }
  }
})

app.get('/register3',(req,res) => {
    let code = req.session.code
    if(code == req.query.code) {
      let name = ''
      let value = ''
      let register1 = req.session.register2

      for (const user in register1) {
        name += `${user},`
        value += `"${register1[user]}",`
      }

      let namestr = name.slice(0,-1)
      let valstr = value.slice(0,-1)

      let sql = `INSERT INTO user (${namestr}) VALUES (${valstr});`

      conn.query(sql,(err,result)=>{
          res.send(result)
      })     
    }
})

app.listen(3030,console.log('listening to 3030'))

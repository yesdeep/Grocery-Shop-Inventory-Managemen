const express = require('express'); //includes express

const app = express(); //creates server

const bodyParser = require('body-parser')

const MongoClient = require('mongodb').MongoClient;

var db;
var s;

MongoClient.connect('mongodb://localhost:27017/GroceryShopInventory', (err,database) => 
{
    if(err) return console/log(err);
    db=database.db('GroceryShopInventory')
    app.listen(3000, ()=> 
    {
        console.log("listening at port number 3000")
    })
} )

app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get("/",(req,res)=>{
    db.collection('Groceries').find().toArray((err,result)=>{
        if(err) return console.log(err)
        res.render('index.ejs',{data:result})
    })
})

app.get('/edit', (req,res)=>{
    db.collection('Groceries').find({pid: req.query.id}).toArray((err,result)=>{
        if(err) return console.log(err);
        console.log(req.query.id);
    res.render('edit.ejs' ,{data:result});
    })
    
})

app.get("/sales",(req,res)=>{
    db.collection('Sales').find().toArray((err,result)=>{
        if(err) return console.log(err)
        var minr = Number.MAX_VALUE;
        var maxr = Number.MIN_VALUE;
        for(var i=0;i<result.length;i++)
        {
            if(maxr<result[i].sales)
            {
                
                maxr = result[i].sales;
            }
            if(minr>result[i].sales)
            {
                
                minr = result[i].sales;
            }
        }
        var max=[],min=[];
        for(var i=0;i<result.length;i++)
        {
            if(result[i].sales==minr)
            {
                min.push(result[i].pt);
            }
            if(result[i].sales==maxr)
            {
                max.push(result[i].pt);
            }
        }
        console.log(min+" "+max);
        res.render('sales.ejs',{data:result , max : max , min : min})
    })
})

app.get("/stock_update", (req,res)=>{
    res.render('stock_update.ejs')
})

app.get('/add_data',(req,res)=>{
    res.render('add_data.ejs')
})

app.get('/delete_stock',(req,res)=>{
    res.render('delete_stock.ejs')
})


app.post("/stock_update" , (req,res)=>{
    db.collection('Groceries').find().toArray((err,result)=>{
        
        if(err) return console.log(err)
        console.log(typeof(result))
        for(var i=0;i<result.length;i++)
        {
            console.log(typeof(result[i].pid)+' '+typeof(req.body.pid))
            if((result[i].pid).localeCompare(req.body.pid)==0)
            {
                s = result[i].stock;
                break;
            }
        }
        db.collection('Groceries').findOneAndUpdate({pid : req.body.pid},
            {$set :{stock : parseInt(s)+parseInt(req.body.ns)}},(err,result)=>{
                console.log(s+'  '+req.body.stock)

                if(err) return console.log(err)
                console.log(req.body.id+' stock updated')
                res.redirect('/')
        })
    })
})

app.post('/add_data',(req,res)=>{
    db.collection('Groceries').save(req.body,(err,result)=>{
        if(err) return console.log(err);
        res.redirect('/')
    })
})

app.post('/delete_stock',(req,res)=>
{
    db.collection('Groceries').deleteOne({pid: req.body.pid},(err,result)=>{
        if(err) return console.log(err);
        console.log("item with product id "+req.body.pid+" is deleted")
        res.redirect('/')
    })
})



app.post('/edit',(req,res)=>{
    console.log(req.body.pid);
    db.collection('Groceries').findOneAndUpdate({pid : req.body.pid},
        {$set :{stock : req.body.ns , cp:req.body.cp ,sp : req.body.sp}},(err,result)=>{
            if(err) return console.log(err)
            console.log("edit oeration of product ID = "+req.body.pid+" successful")
    })
    res.redirect('/')
})



app.get('/delete',(req,res)=>{
    console.log(req.body.id);
    db.collection('Groceries').find({pid: req.query.id}).toArray((err,result)=>{
        if(err) return console.log(err);
        console.log(req.query.id);
    res.render('delete.ejs' ,{data:result});
    })
})

app.post('/delete',(req,res)=>{
    console.log(req.body.id);
    db.collection('Groceries').deleteOne({pid: req.body.pid},(err,result)=>{
        if(err) return console.log(err);
        console.log("item with product id "+req.body.pid+" is deleted")
        res.redirect('/')
    })
})


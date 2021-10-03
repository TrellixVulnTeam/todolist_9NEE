let express = require('express');
let app = express();
let httpServer = require('http').createServer(app);
let {MongoClient} = require('mongodb');

app.set('views', 'views')
app.set('view engine', 'ejs')

app.use(express.static('./public'))


let uri = 'mongodb+srv://m001-student:m001-mongodb-basics@sandbox.hprah.mongodb.net/sample_analytics?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
	try{
		await client.connect()
		console.log("connected to mongodb")
		let results = await client.accounts.find({limits:10000})
		console.log(results)
	}
	finally{
		await client.close()
		console.log("connection to mongodb closed")
	}
}

run().catch(console.dir)



app.get('/', (req, res)=>{
    res.render('index')
})



httpServer.listen(8000)

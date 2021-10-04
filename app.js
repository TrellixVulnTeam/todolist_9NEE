let express = require('express');
let app = express();
let httpServer = require('http').createServer(app);
let {MongoClient} = require('mongodb');
let bodyParser = require('body-parser');
let multer = require('multer');
let upload = multer();
let session = require('express-session');

app.set('views', 'views')
app.set('view engine', 'ejs')

app.use(express.static('./public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(session({
	secret: "89fdj39f8h378fhwds78fhw87hf3dhf98273hf2w397fwueidafhsdkfh378",
	resave: true,
	saveUninitialized: false
}))


let uri = 'mongodb+srv://m001-student:m001-mongodb-basics@sandbox.hprah.mongodb.net/todoapp?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


///////////Render Manpage/////////////
app.get('/', (req, res)=>{
	if(req.session.user == undefined){
		res.render('index', {todos: false, login: true})
	}
	else{
		res.render('index', {todos: true, login: false})
	}
})

/////////User Login/////////////
app.post('/login', (req, res)=>{
	let user = req.body;

	loginUser(user, req, res).catch(console.dir)
})

app.post('/addTask', upload.none(), (req, res)=>{
	let data = req.body;
	addTask(req, res)
})


httpServer.listen(8000)



async function loginUser(user, req, res){
	try{
		await client.connect()
		
		let user_from_db = await client.db('todoapp').collection('users').findOne({'name': user.username, 'password': user.password});
		if(user_from_db.name == undefined){
			throw new userNotFound("user not found")
		}
		else{
			req.session.user = user_from_db;
			console.log("user: " + user_from_db.name + " signed in.")
			res.render('index', {todos: true, login: false})
		}
	}
	catch(userNotFound){
		res.render('index', {todos: false, login: true, err_msg: userNotFound.message})
	}
	finally{
		await client.close()
	}
}

async function addTask(req, res){
	try{
		let newTask = req.body.task;
		let user = req.session.user.username;

		await client.connect()
		
	}
}

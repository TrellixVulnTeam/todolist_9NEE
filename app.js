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
app.use(bodyParser.json())
app.use(session({
	secret: "89fdj39f8h378fhwds78fhw87hf3dhf98273hf2w397fwueidafhsdkfh378",
	resave: true,
	saveUninitialized: false
}))


let uri = 'mongodb+srv://m001-student:m001-mongodb-basics@sandbox.hprah.mongodb.net/todoapp?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


///////////Render Mainpage/////////////
app.get('/', (req, res)=>{
	if(req.session.user == undefined){
		res.render('index', {todos: false, login: true})
	}
	else{
		let username = req.session.user.name;

		getAllTasks(username).then((allTasks)=>{
			res.send(JSON.stringify(allTasks))
		})
		
		res.render('index', {todos: true, login: false, registration: false})
	}
})

/////////User Login/////////////
app.post('/login', (req, res)=>{
	let user = req.body;

	loginUser(user, req, res).catch(console.dir)
})

//////////////Add New Task///////////////////////
app.post('/addTask', upload.none(), (req, res)=>{
	let task = req.body.task;
	let username = req.session.user.name;
	
	addTask(task, username).then(()=>{
		getAllTasks(username).then((allTasks)=>{
			res.send(JSON.stringify(allTasks))
		})
	})
})

//////Send Todos when index.ejs is send/////////
app.get('/getTodos', (req, res)=>{
	let name = req.session.user.name;
	
	getAllTasks(name).then((allTasks)=>{
		res.send(JSON.stringify(allTasks))
	})
})

/////////////////Remove Task/////////////////
app.post('/removeTask', (req, res)=>{
	let username = req.session.user.name;
	let index = req.body.index;
	
	removeTask(username, index).then((result)=>{
		console.log(result)
		getAllTasks(username).then((allTasks)=>{
			res.send(JSON.stringify(allTasks))
		})
	})
})

//////////////Sign Up User//////////////////
app.get('/registration', (req, res)=>{
	res.render('index', {todos: false, login: false, registration: true})	

})

app.post('/registration', (req, res)=>{
	let credentials = req.body;
	let userFound = false;

	findUser(credentials.name).then((result)=>{
		if(result != undefined){
			userFound = true;
			res.render('index', {todos: false, login: false, registration: true, userExists: true})
		}
	})
	/*

	if(!userFound){
		registrateUser(credentials)
		addTaskDoc(credentials.name).then(()=>{
			req.session.user = {name: credentials.name, password: credentials.password};
			res.render('index', {todos: true, login: false, registration: false})		
		})
	}
*/
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

async function addTask(task, username){
	try{
		let newTask = task; 
		let name = username;
		
		await client.connect()
		
		const db = client.db('todoapp');
		const collection = db.collection('tasks');
		const filter = {name: name};
		const updateDoc = {
			$push:{
				tasks: newTask
			}
		};
		
		const result = await collection.updateOne(filter, updateDoc);
		return result;
	}
	catch{
	}
	finally{
		await client.close()
	}
}

async function getAllTasks(username){
	let name = username;
	
	try{
		await client.connect()

		const db = client.db('todoapp');
		const tasks = db.collection('tasks');
		const query = {name: name};
		const options = {
			projection: {tasks: 1, _id: 0}
		}

		const allTasks = await tasks.findOne(query, options);
		return allTasks;
	}
	catch{
	}
	finally{
		await client.close()
	}
}

async function removeTask(username, index){
	let name = username;
	let array_tasks = await getAllTasks(name);
	array_tasks = array_tasks.tasks;
	array_tasks.splice(index, 1)
	console.log(array_tasks)
	
	try{
		await client.connect()

		const db = client.db('todoapp');
		const collection_tasks = db.collection('tasks');
		const query = {name: name};
		const updateDoc = {
			$set:{
				tasks: array_tasks 
			}
		};
		
		const remainingTasks = await collection_tasks.updateOne(query, updateDoc);
		return remainingTasks;
	}
	catch{
	}
	finally{
		await client.close()
	}
}

async function findUser(username){
	try{
		await client.connect()

		const db = client.db('todoapp');
		const collection_user = db.collection('users');
		
		const result = await collection_user.findOne({name: username});
		return result;
	}
	catch{
	}
	finally{
		await client.close()
	}
}

async function registrateUser(credentials){
	let name = credentials.name;
	let password = credentials.password;

	try{
		await client.connect()

		const db = client.db('todoapp');
		const collection_user = db.collection('users');
		const doc_newUser = {name: name, password: password};
		
		result = await collection_user.insertOne(doc_newUser)
		return result;
	}
	catch{
	}
	finally{
		await client.close()
	}
}

async function addTaskDoc(username){
	try{
		await client.connect()

		const db = client.db('todoapp');
		const collection_tasks = db.collection('tasks');
		const doc_task = {name: username, tasks: []};

		await collection_tasks.insertOne(doc_task)
		return result;
	}
	catch{
	}
	finally{
		await client.close()
	}
}

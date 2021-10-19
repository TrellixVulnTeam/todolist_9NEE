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


let uri = 'mongodb+srv://tom:1Meta-Mesa1@cluster0.vsnlk.mongodb.net/todoapp?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


///////////Render Mainpage/////////////
app.get('/', async (req, res)=>{
	if(req.session.user == undefined){
		res.render('index', {todos: false, login: true})
	}
	else{
		let username = req.session.user.name;
		
		const allTasks = await getAllTasks(username);
		res.render('index', {todos: true, login: false, registration: false})
	}
})

/////////User Login/////////////
app.post('/login', async (req, res)=>{
	let user = req.body;

	const user_from_db = await loginUser(user);
	console.log(user_from_db)
	if(user_from_db == null){
		res.render('index', {todos: false, login: true, err_msg: "Username or Password incorrect."})	
	}
	else{
		req.session.user = user_from_db;
		console.log("user: " + user_from_db.name + " signed in.")
		res.render('index', {todos: true, login: false})
	}
})

//////////////Add New Task///////////////////////
app.post('/addTask', upload.none(), async (req, res)=>{
	let task = req.body.task;
	
	if(typeof req.session.user.name == 'undefined'){
		res.redirect('/login')
	}
	else{
		let username = req.session.user.name;
				
		await addTask(task, username)	
		let allTasks = await getAllTasks(username);
		console.log(allTasks)
		res.send(JSON.stringify(allTasks))
	}
})

//////Send Todos when index.ejs is send/////////
app.get('/getTodos', async (req, res)=>{
	if(typeof req.session.user == undefined){
		res.redirect('/login')
	}
	else{
		let name = req.session.user.name;
		let allTasks = await getAllTasks(name);
		res.send(JSON.stringify(allTasks))
	}
})

/////////////////Remove Task/////////////////
app.post('/removeTask', async (req, res)=>{
	let username = req.session.user.name;
	let index = req.body.index;
	
	await removeTask(username, index)
	let allTasks = await getAllTasks(username);
	res.send(JSON.stringify(allTasks))
})

//////////////Sign Up User//////////////////
app.get('/registration', (req, res)=>{
	res.render('index', {todos: false, login: false, registration: true})	

})

app.post('/registration', async (req, res)=>{
	let credentials = req.body;

	const userFound = await findUser(credentials.name);
	console.log(userFound)
	if(userFound != null){
		res.render('index', {todos: false, login: false, registration: true, userExists: true})
	}
	else{
		await registrateUser(credentials)
		await addTaskDoc(credentials.name)
		req.session.user = {name: credentials.name, password: credentials.password};
		res.render('index', {todos: true, login: false, registration: false})		
	}
})


httpServer.listen(8000)



async function loginUser(user, req, res){
	try{
		await client.connect()
		
		let user_from_db = await client.db('todoapp').collection('users').findOne({'name': user.username, 'password': user.password});
		return user_from_db;
	}
	catch{
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
		
		await collection_user.insertOne(doc_newUser)
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
	}
	catch(err){
		console.log(err)
	}
	finally{
		await client.close()
	}
}

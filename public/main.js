let app = new Vue({
	el: '#todolist',
	data: {
		todos: [],
		input_task: ""
	},
	computed: {
		getTodos: function(){
			let self = this;

			if(this.todos.length == 0){
				let xhr = new XMLHttpRequest();
				xhr.open('get', '/getTodos', true)
				xhr.send()
				xhr.onload = function(){
					let allTasks = JSON.parse(xhr.response).tasks;
					for(task of allTasks){
						self.todos.push(task)
					}
				}
			}
		}
	},
	methods:{
		addTask: function(){
			let xhr = new XMLHttpRequest()
			let data = new FormData()
			let self = this;
			
			data.append('task', this.input_task)
			xhr.open('post', '/addTask', true)
			xhr.send(data)
			xhr.onload = function(){
				let newTasks = JSON.parse(xhr.response).tasks;
				self.todos = [];
				for(task of newTasks){
					self.todos.push(task)
				}
			}
		},
		deleteTask: function(index){
			let indexSend = JSON.stringify({index: index});
			let xhr = new XMLHttpRequest();
			let self = this;

			xhr.open('post', '/removeTask', true)
			xhr.setRequestHeader('Content-Type', 'application/json')
			xhr.send(indexSend)
			
			xhr.onload = function(){
				self.todos = [];
			}
		}
	}
});

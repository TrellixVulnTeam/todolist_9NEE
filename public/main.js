let app = new Vue({
	el: '#todolist',
	data: {
		todos: ['first', 'second', 'third'],
		input_task: ""
	},
	methods:{
		addTask: function(){
			let xhr = new XMLHttpRequest()
			let data = new FormData()
			data.append('task', this.input_task)
			xhr.open('post', '/addTask', true)
			xhr.send(data)
			xhr.onload = function(){
				console.log(xhr.response)
			}
		}
	}
});

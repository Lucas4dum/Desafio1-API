const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { json } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username}=request.headers;
  const user=users.find((user)=>user.username===username)
  if (!user){
    return response.status(400).json({error:"User not found"});
  }
  request.user=user;
  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const userExist=users.some((users)=>users.username===username)
  if(userExist){
    return response.status(400).json({error:"User exists!S"})
  }
  const user={
    id: uuidv4(),
    name,
    username,
    todos: []}
  users.push(user)
  return response.status(201).json(user);
});
app.use(checksExistsUserAccount)
app.get('/todos',(request, response) => {
  const {username}=request.headers;
  const user=users.find((user)=>user.username===username)
  return response.json(user.todos)
});
app.post('/todos', (request, response) => {
  const {username}=request.headers;
  const {title, deadline}=request.body;
  const user=users.find((user)=>user.username===username)
  const todo = {
    id: uuidv4(),
    title,
    done:false,
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  user.todos.push(todo)
  return response.status(201).json(todo);
});

app.put('/todos/:id', (request, response) => {  
  const {id} = request.params;
  const {user} = request;
  const {title, deadline} = request.body;
  const todo = user.todos.find((todo) => todo.id === id);
  if(todo!=undefined){
    todo.title=title;
    todo.deadline=deadline;
    return response.status(201).json(todo)
    }
  return response.status(404).json({error: "User todo id not exists!"})    
});

app.patch('/todos/:id/done', (request, response) => {
  const {id} = request.params;
  const {user} = request;
  const todo = user.todos.find(todo => todo.id === id)
  if(!todo){
    return response.status(404).json({error:'User todo id not exists!'})
  }
  todo.done=true
  return response.status(201).json(todo)  
});

app.delete('/todos/:id', (request, response) => {
  const{id}=request.params;
  const{username}=request.headers;
  const user=users.find((user)=>user.username===username)
  const todo=user.todos.find((todo)=>todo.id===id)
  if(todo!=undefined){
    const positionTodo=user.todos.indexOf(todo)
    user.todos.splice(positionTodo,1)
    return response.status(204).json(user.todos)
  }
  return response.status(404).json({error:"User todo id not exists!"})
});

module.exports = app;
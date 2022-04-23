const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { userName } = request.body;
  const { username } = request.headers;
  const alreadyExist = users.some((user) => user.userName === userName);

  if (alreadyExist) {
    return response.status(400).json({ error: "userName alredy exist!" });
  }

  if (username) {
    const user = users.find((user) => user.userName === username);

    if (!user) {
      return response.status(400).json({ error: "user do not exist!" });
    }
    request.user = user;
  }

  return next();
}

app.post("/users", checksExistsUserAccount, (request, response) => {
  /* 
    	id: 'uuid', // precisa ser um uuid
	    name: '', 
	    username: '', 
	    todos: []
  */
  const { name, userName } = request.body;

  users.push({
    name,
    userName,
    id: uuidv4(),
    todos: [],
  });

  return response.status(201).send();
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  /* { 
	id: 'uuid', // precisa ser um uuid
	title: 'Nome da tarefa',
	done: false, 
	deadline: '2021-02-27T00:00:00.000Z', 
	created_at: '2021-02-22T00:00:00.000Z'
} */
  const { user } = request;
  const { title, deadline } = request.body;
  user.todos.push({
    title,
    deadline: new Date(deadline).toDateString(),
    done: false,
    created_at: new Date().toDateString(),
    id: uuidv4(),
  });

  return response.status(201).json({ success: "Todo create!" });
});

app.put("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.query;
  const { user } = request;

  if (!user.todos.length) {
    return response.json({ error: "You dont have todos!" });
  }

  const userTodo = user.todos.find((todo) => todo.id === id);

  if (!userTodo) {
    return response.status(404).json({ error: "Todo Id Invalid!" });
  }

  userTodo.title = title;
  userTodo.deadline = new Date(deadline);
  return response.status(200).json({ success: "Todo Edited" });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.query;

  const userTodo = user.todos.find((todo) => todo.id === id);

  if (!userTodo) {
    return response.status(404).json({ error: "Todos Id Invalid!" });
  }
  if (userTodo.done) {
    response.status(404).json({ error: "Todo alredy done!" });
  }
  userTodo.done = true;

  return response.status(201).json({ success: "Todo done!" });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.query;

  const todoIndex = user.todos.find((todo) => todo.id === id);

  if (todoIndex.index === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todo.splice(user, 1);

  return response.status(204);
});

module.exports = app;

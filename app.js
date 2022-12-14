const express = require("express");
const path = require("path");
//const jwt = require("jsonwebtoken");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
var format = require("date-fns/format");
const dbPath = path.join(__dirname, "todoApplication.db");
var isValid = require("date-fns/isValid");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/todos/", async (req, res) => {
  const {
    search_q = "",
    priority = "",
    status = "",
    category = "",
  } = req.query;
  let statusarr = ["TO DO", "IN PROGRESS", "DONE"];
  let priorityarr = ["HIGH", "MEDIUM", "LOW"];
  let categoryarr = ["WORK", "HOME", "LEARNING"];

  let issearch_q = false;
  let ispriority = false;
  let iscategory = false;
  console.log(priorityarr.includes(priority));

  if (status === "" || statusarr.includes(status)) {
    issearch_q = true;
  } else {
    res.status(400);
    res.send("Invalid Todo Status");
  }
  if (priority === "" || priorityarr.includes(priority)) {
    ispriority = true;
  } else {
    res.status(400);
    res.send("Invalid Todo Priority");
  }
  if (category === "" || categoryarr.includes(category)) {
    iscategory = true;
  } else {
    res.send("Invalid Todo Category");
    res.status(400);
  }
  console.log(iscategory, ispriority, issearch_q);
  if (issearch_q === true && ispriority === true && iscategory === true) {
    const Query = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE status LIKE '%${status}%' and 
        priority LIKE '%${priority}%' and todo LIKE '%${search_q}%' and category LIKE '%${category}%';`;

    const result = await db.all(Query);
    res.send(result);
  }
});

app.get("/todos/:todoId/", async (req, res) => {
  const todoId = req.params;
  const Query = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE id = '${todoId.todoId}'`;
  const dbresult = await db.get(Query);
  res.send(dbresult);
});
//
app.get("/agenda/", async (req, res) => {
  const { date } = req.query;

  var result = isValid(new Date(date));
  console.log(result);

  if (result === true) {
    const year = date.split("-")[0];
    const month = date.split("-")[1] - 1;
    const day = date.split("-")[2];
    console.log(day, year, month);
    const newDate = format(new Date(year, month, day), "yyyy-MM-dd");
    console.log(newDate);
    const Query = `SELECT id,todo,priority,status,category,due_date as dueDate FROM todo WHERE due_date='${newDate}';`;
    const dbresult = await db.all(Query);
    if (dbresult.length === 0) {
      res.status(400);
      res.send("Invalid Due Date");
    } else {
      res.send(dbresult);
    }
  } else {
    res.status(400);
    res.send("Invalid Due Date");
  }
});

//API4
app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status, category, dueDate } = req.body;

  let statusarr = ["TO DO", "IN PROGRESS", "DONE"];
  let priorityarr = ["HIGH", "MEDIUM", "LOW"];
  let categoryarr = ["WORK", "HOME", "LEARNING"];

  let issearch_q = false;
  let ispriority = false;
  let iscategory = false;
  var result = isValid(new Date(dueDate));
  let isduedate = false;
  if (result === true) {
    const year = dueDate.split("-")[0];
    const month = dueDate.split("-")[1] - 1;
    const day = dueDate.split("-")[2];
    console.log(day, year, month);
    // var result = format(new Date(year, month, date), "MM/dd/yyyy");
    const newDate = format(new Date(year, month, day), "yyyy-MM-dd");
    isduedate = true;
  } else {
    res.status(400);
    res.send("Invalid Due Date");
  }
  if (category === "" || categoryarr.includes(category)) {
    iscategory = true;
  } else {
    res.send("Invalid Todo Category");
    res.status(400);
  }
  if (status === "" || statusarr.includes(status)) {
    issearch_q = true;
  } else {
    res.status(400);
    res.send("Invalid Todo Status");
  }
  if (priority === "" || priorityarr.includes(priority)) {
    ispriority = true;
  } else {
    res.status(400);
    res.send("Invalid Todo Priority");
  }

  console.log(iscategory, ispriority, issearch_q);
  if (issearch_q === true && ispriority === true && iscategory === true) {
    const Query = `INSERT INTO todo(id,todo,category,priority,status,due_date) VALUES('${id}','${todo}','${priority}',
   '${status}','${category}','${dueDate}');`;
    let addedtodo = await db.run(Query);
    res.send("Todo Successfully Added");
  }
});

app.put("/todos/:todoId/", async (req, res) => {
  const todoId = req.params;
  const {
    status = "",
    priority = "",
    todo = "",
    category = "",
    dueDate = "",
  } = req.body;

  let statusarr = ["TO DO", "IN PROGRESS", "DONE"];
  let priorityarr = ["HIGH", "MEDIUM", "LOW"];
  let categoryarr = ["WORK", "HOME", "LEARNING"];

  let issearch_q = false;
  let ispriority = false;
  let iscategory = false;

  var result = isValid(new Date(dueDate));
  let isduedate = false;
  let flag = true;
  if (result === true) {
    const year = dueDate.split("-")[0];
    const month = dueDate.split("-")[1] - 1;
    const day = dueDate.split("-")[2];
    console.log(day, year, month);
    // var result = format(new Date(year, month, date), "MM/dd/yyyy");
    try {
      const newDate = format(new Date(year, month, day), "yyyy-MM-dd");
      isduedate = true;
    } catch (error) {}
  } else {
    if (dueDate !== "") {
      res.status(400);
      res.send("Invalid Due Date");
      flag = false;
    }
  }
  if (flag === true) {
    if (status === "" || statusarr.includes(status)) {
      issearch_q = true;
    } else {
      res.status(400);
      res.send("Invalid Todo Status");
    }
    if (priority === "" || priorityarr.includes(priority)) {
      ispriority = true;
    } else {
      res.status(400);
      res.send("Invalid Todo Priority");
    }
    if (category === "" || categoryarr.includes(category)) {
      iscategory = true;
    } else {
      res.send("Invalid Todo Category");
      res.status(400);
    }

    if (issearch_q === true && ispriority === true && iscategory === true) {
      switch (true) {
        case req.body.status !== undefined:
          const Query = `UPDATE todo SET status='${status}'
             WHERE id = ${todoId.todoId};`;

          await db.run(Query);
          res.send("Status Updated");
          break;
        case req.body.priority !== undefined:
          const Query2 = `UPDATE todo SET priority='${priority}'
             WHERE id = ${todoId.todoId};`;

          await db.run(Query2);
          res.send("Priority Updated");
          break;
        case req.body.todo !== undefined:
          const Query3 = `UPDATE todo SET todo='${todo}'
             WHERE id = ${todoId.todoId};`;

          await db.run(Query3);
          res.send("Todo Updated");
          break;
        case req.body.category !== undefined:
          const Query4 = `UPDATE todo SET todo='${category}' WHERE id = ${todoId.todoId};`;
          await db.run(Query4);
          res.send("Category Updated");
          break;
        case req.body.dueDate !== undefined:
          const Query5 = `UPDATE todo SET todo='${dueDate}' WHERE id = ${todoId.todoId};`;
          await db.run(Query5);
          res.send("Due Date Updated");
          break;
      }
    }
  }
});

app.delete("/todos/:todoId/", async (req, res) => {
  const todoId = req.params;
  const Query = `DELETE FROM todo WHERE id = ${todoId.todoId};`;
  await db.run(Query);
  res.send("Todo Deleted");
});

module.exports = app;

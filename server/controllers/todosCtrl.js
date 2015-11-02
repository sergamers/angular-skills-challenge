'use strict';

var _ = require('lodash');
var url = require('url');

var data = {
  tags: {
    1: '#низкий приоритет',
    2: '#средний приоритет',
    3: '#высокий приоритет',
    4: '#АЛЯРМ!!!'
  },
  todos: [
    {id: 1, tag: 2, content: 'challenge#1'},
    {id: 2, tag: 5, content: 'challenge#2'},
    {id: 3, tag: 2, content: 'challenge#3'},
    {id: 4, tag: 3, content: 'challenge#4'},
    {id: 5, tag: 1, content: 'challenge#5'},
    {id: 6, tag: 4, content: 'challenge#6'},
    {id: 7, tag: 1, content: 'challenge#7'},
    {id: 8, tag: 4, content: 'challenge#8'},
    {id: 9, tag: 3, content: 'challenge#9'},
    {id: 10, tag: 2, content: 'challenge#10'}
  ]
}

var sessionHashes = {};


var todosCtrl =  {
  options: {},
  routes: {
    getTodoItems: {
        method: "GET",
        path: ["items"]
    },
    getTodoTags: {
      method: "GET",
      path: ["tags"]
    },
    addTodoItem: {
      method: "POST",
      path: ["item"]
    },
    removeTodoItem: {
      method: "DELETE",
      path: ["item", "%itemId"]
    }
  },
  helpers: {
    getNextChunk: function(hash) {
      var info = sessionHashes[hash];
      info.requestDone++;
      var chunk = {hash: hash};

      if (info.requestDone > info.requestsNum) {
        chunk.finish = true;
        chunk.items = [];
        return chunk;
      }

      if (info.requestsNum === info.requestDone) {
        chunk.finish = true;
        chunk.items = data.todos.slice((info.requestDone - 1) * info.chunkLength, data.todos.length );
      } else {
        chunk.finish = false;
        chunk.items = data.todos.slice((info.requestDone - 1) * info.chunkLength, info.requestDone * info.chunkLength);
      }
      return chunk;
    },
    getGETParams: function(requestedUrl) {
      return url.parse(requestedUrl, true).query;
    },
    validateNewItem: function(item) {
      console.log(item);
      return item.tag && item.content;
    }
  },
  actions: {
    getTodoItems: function(req, res) {
        var params = this.helpers.getGETParams(req.url);
        if (!params.hash) {
          params.hash = _.uniqueId();
          sessionHashes[params.hash] = {
            requestsNum:  parseInt(Math.random() * 100 % 4 + 1), // кол-во запросов от 1 до 4
            requestDone: 0
          }
          sessionHashes[params.hash].chunkLength = Math.ceil(data.todos.length / sessionHashes[params.hash].requestsNum);
        } else {
          // проверка на наличие хеша
          if (sessionHashes[params.hash] === undefined) {
            res.statusCode = 400;
            res.end('{"message":"hash not valid"}');
            return;
          }
        }
        var chunk = this.helpers.getNextChunk(params.hash);
        console.log(sessionHashes[params.hash])
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(chunk))

        res.end();

    },
    getTodoTags: function(req, res) {
      res.setHeader('Content-Type', 'application/json; charset=utf8');
      res.write(JSON.stringify({items: data.tags}))
      res.end();
    },
    addTodoItem: function(req, res, params) {
      res.setHeader('Content-Type', 'application/json');
      console.log(req.body);
      if (req.body.item && this.helpers.validateNewItem(req.body.item)) {
        var newItem =  {
          tag: req.body.item.tag,
          content: req.body.item.content,
          id: data.todos.length + 1
        };
        data.todos.push(newItem);
        res.write(JSON.stringify(newItem));
        res.end();
      } else {
        res.statusCode = 400;
        res.end('{"message": "item is Invalid"}');
      }
    },
    removeTodoItem: function(req, res, params) {
      console.log(params);
      res.setHeader('Content-Type', 'application/json');
      if (!params.itemId) {
        res.statusCode = 400;
        res.end('{"message" : "itemId undefined"}');
        return;
      }
      var itemId = parseInt(params.itemId);
      var removedItem = _.remove(data.todos, {id: itemId});
      if (removedItem.length) {
        res.end('{"status" : "Ok"}')
      } else {
        res.statusCode = 404;
        res.end('{"message" : "item not found"}');
      }
    }
  }
}

module.exports = exports = todosCtrl;

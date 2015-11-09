'use strict'


var app = angular.module('todos', []);

app.controller("TodoList", function($scope, $http){
	$http.get('/api/v0/todos/tags').success(function(request){
		$scope.allTags = request.items;
	});					
	
	$scope.tasks = [];

	var getTask = function(hash){		
	 	var url = '/api/v0/todos/items';

	 	if(hash){
	 		url += '?hash='+hash;
	 	}else{
	 		hash=0;
	 	}

	 	$http.get(url).success(function(request){
	 		$scope.tasks = $scope.tasks.concat(request.items);
	 		if(request.finish === false){
	 			hash++;
	 			getTask(hash);
	 		}
	 	});			
	}	

	$scope.deleteTask = function(id){
		$scope.tasks.splice(id, 1);
	}

	getTask();
});
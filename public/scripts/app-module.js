'use strict'

var app = angular.module('todos', []);

app.controller("TodoList", function($scope, $http, $window){
	$scope.tasks = []; // Все задачиж
	$scope.showFon = false; // Отображение фона
	// $scope.alert - Какой блок popup окна выведется
	// $scope.deleteIndex - Какой index надо удалить
	// $scope.deleteId - Какой id надо удалить
	// $scope.alertMsg - Сообщение в popup окне
	// $scope.allTags - Все теги	

	// Получаем теги
	$http.get('/api/v0/todos/tags').success(function(request){
		$scope.allTags = request.items;
	});					
	

	// Получаем все задачи
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

	// Событие по кнопке - удалить задачу (папка)
	$scope.deleteTaskAlert = function($index, id){
		$scope.alert = 1;	
		$scope.showFon = true;
		$scope.alertMsg = 'Вы уверены, что хотите удалить задачу № '+($index+1)+' ?';		
		$scope.deleteIndex = $index;
		$scope.deleteId = id;
	}

	// Удаляем задачу
	$scope.deleteTask = function(){
		$scope.tasks.splice($scope.deleteIndex, 1);
		
		$http.delete('/api/v0/todos/item/'+$scope.deleteId).success(function(request){			
			$scope.showFon = false;			
		});
	};

	// Нажатие кнопки esc в момент открытия Popup
	$scope.$watch("showFon", function(newValue, oldValue){
		if(newValue == true){
			angular.element($window).bind("keydown", function(e){
				if(e.keyCode == 27){
					$scope.showFon = false;	
					$scope.$digest();
				}
			});
		}else{
			angular.element($window).unbind("keydown");
		}
	});

	// Нажатие на фон popup окна
	$scope.clickToFon = function(e){
		if(e.target == e.currentTarget){
			$scope.showFon = false;			
		}
	};	

	// popup с добавлением новой задачи
	$scope.addTaskAlert = function(){
		$scope.alert=2; 
		$scope.showFon=true;
		$scope.alertMsg = "Создание новой задачи";
	}


	$scope.addTask = function(task){
		var data = {item: task};

		$http.post('/api/v0/todos/item', data).success(function(request){
			$scope.tasks.push(request);
			console.log(request);
		});

		$scope.showFon=false;
	}

	getTask();	
});
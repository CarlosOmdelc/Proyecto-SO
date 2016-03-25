angular.module('SOweb', [
  'ui.router'
]).
config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('home');
	$stateProvider.
	state('home', {
		url: '/home',
		templateUrl: 'views/index.html',
		controller: 'indexController'
	});
}]);

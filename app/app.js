angular.module('SOweb', [
  'ui.router'
]).
config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('home');
	$stateProvider.
	state('home', {
		url: '/home',
    views: {
      '': { /* no caracter ni espacios coloca esta view como la default */
        templateUrl: 'views/index.html',
        controller: 'homeController'
      }
    }
		templateUrl: 'views/index.html',
		controller: 'indexController'\
	});
}]);

angular.module('SOweb', [
  'ui.router',
  'ngMaterial',
  'angular-click-outside'
]).
config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', function($stateProvider, $urlRouterProvider, $mdThemingProvider) {
  $mdThemingProvider.definePalette('main', {
		'50': '#E0F2F1',
		'100': '#B2DFDB',
		'200': '#80CBC4',
		'300': '#4DB6AC',
		'400': '#26A69A',
		'500': '#009688',
		'600': '#00897B',
		'700': '#00796B',
		'800': '#00695C',
		'900': '#004D40',
		'A100': '#A7FFEB',
		'A200': '#64FFDA',
		'A400': '#1DE9B6',
		'A700': '#00BFA5',
		'contrastDefaultColor': 'light',
		'contrastDarkColors': '50 100 200 300 400 A100 A200 A400'
	});

	$mdThemingProvider.definePalette('accent', {
		'50': '#ffffff',
		'100': '#fffbfc',
		'200': '#ffc3d8',
		'300': '#ff7ba9',
		'400': '#ff5d95',
		'500': '#ff3e81',
		'600': '#ff1f6d',
		'700': '#ff0159',
		'800': '#e1004e',
		'900': '#c30044',
		'A100': '#ffffff',
		'A200': '#fffbfc',
		'A400': '#ff5d95',
		'A700': '#ff0159',
		'contrastDefaultColor': 'light',
		'contrastDarkColors': '50 100 200 300 400 A100 A200 A400'
	});

	$mdThemingProvider.theme( 'SOweb' )
	.primaryPalette( 'main' )
    .accentPalette( 'indigo' );

	$mdThemingProvider.setDefaultTheme( 'SOweb' );

  $urlRouterProvider.otherwise('home');
	$stateProvider.
	state('home', {
		url: '/home',
    views: {
      '': { /* no caracter ni espacios coloca esta view como la default */
        templateUrl: 'states/home.view.html',
    		controller: 'homeController'
      }
    }
	});
}]);

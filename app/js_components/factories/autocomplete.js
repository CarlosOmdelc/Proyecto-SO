angular.module( 'SOweb' ).factory( '$autocomplete', $autocomplete );

$autocomplete.$inject = [];

function $autocomplete() {

	return {
		createFilterFor: createFilterFor, // filtro para buscar en un arreglo, necesario para md-autocomplete
		search: search, // param: texto a buscar y arreglo donde se buscara, return: resultados de la busqueda del arreglo
	}

	function createFilterFor( query ) { // function necesaria para el autocomplete
		var lowercaseQuery = angular.lowercase( query );
		return function filterFn( element ) {
			return ( element.value.indexOf( lowercaseQuery ) === 0 );
		}
	}

	function search( query, array ) { // busca query en el arreglo
		var results = query ? array.filter( createFilterFor( query ) ) : [];
		return results;
	}

}

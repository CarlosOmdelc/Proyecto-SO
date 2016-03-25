angular.module('SOweb').controller('indexController', indexController);

indexController.$inject = ['$scope', '$state', '$timeout'];
var colaReady = new Array();
var colaBlockedIO = new Array();

function indexController($scope, $state, $timeout){
	SO1=new SO();
	$scope.tog=4;
	$scope.algmem="NUR";
	$scope.algcpu="Round Robin";
	$scope.tamq=6;
	$scope.tiempo=1;
	$scope.numpag=5;
	$scope.numalg=1;
	$scope.maxpag=0;
	$scope.numprocesos=0;
	$scope.nombre=1;
	$scope.NombrePA=0;
	$scope.LlegadaPA=0;
	$scope.CPUAsignadoPA=0;
	$scope.EnvejecimientoPA=0;
	$scope.CPURestantePA=0;
	$scope.QRestantePA=0;
	$scope.isText = false;
	$scope.fallopag=false;
	$scope.procfinished=false;
	$scope.roundrobin=1;
	$scope.nohayprocesos=true;
	$scope.hayinterrupcion=false;

	function SO (){
		this.arregloPcb=[];
	}

	function Pagina(r, llegada, ultacc, numacc, nur1, nur2){
		this.r=r;
		this.llegada=llegada;
		this.ultacc=ultacc;
		this.numacc=numacc;
		this.nur1=nur1;
		this.nur2=nur2;
		this.accesosdenur=numacc;
	}

	function Proceso(llegada, tte, estado, numpags){
		this.llegada=llegada;
		this.tte=tte;
		this.estado=estado;
		this.envejecimiento=0;
		this.cpuasignado=0;
		this.cpurestante=tte;
		this.qrestante=$scope.tamq;
		this.numpags=numpags;
		this.arreglopag=[];
		this.tiempoenblocked=0;
		this.blockedIO=false;
	}

	$scope.ActualizarPantalla = function(){
		var i;
		for (i = 0; i < $scope.numprocesos; i++) {
			if(SO1.arregloPcb[i].estado==1)
				break;
		}
		if($scope.numprocesos!=i){
		$scope.NombrePA=i+1;
		$scope.LlegadaPA=SO1.arregloPcb[i].llegada;
		$scope.CPUAsignadoPA=SO1.arregloPcb[i].cpuasignado;
		$scope.EnvejecimientoPA=SO1.arregloPcb[i].envejecimiento;
		$scope.CPURestantePA=SO1.arregloPcb[i].cpurestante;
		$scope.QRestantePA=SO1.arregloPcb[i].qrestante;

		document.getElementById("pagejecutar").setAttribute("max", SO1.arregloPcb[i].numpags-1);
		var stringtbody="";
		for (var k = 0; k < SO1.arregloPcb[i].numpags; k++) {
			stringtbody+="<tr><td>"+k+"</td><td>"+SO1.arregloPcb[i].arreglopag[k].r+
			"</td><td>"+SO1.arregloPcb[i].arreglopag[k].llegada+
			"</td><td>"+SO1.arregloPcb[i].arreglopag[k].ultacc+
			"</td><td>"+SO1.arregloPcb[i].arreglopag[k].numacc+
			"</td><td>"+SO1.arregloPcb[i].arreglopag[k].nur1+" "+
			SO1.arregloPcb[i].arreglopag[k].nur2+"</td></tr>";
		};
		document.getElementById("tabladepag").innerHTML = stringtbody;
		$scope.actualizarEstados();
		}else{
		$scope.NombrePA=0;
		$scope.LlegadaPA=0;
		$scope.CPUAsignadoPA=0;
		$scope.EnvejecimientoPA=0;
		$scope.CPURestantePA=0;
		$scope.QRestantePA=0;

		document.getElementById("pagejecutar").setAttribute("max", 0);
		document.getElementById("tabladepag").innerHTML = "";
		$scope.actualizarEstados();
		}
	}

	$scope.actualizarEstados = function(){
		document.getElementById("prunning").innerHTML = $scope.NombrePA;
		var stringselectready="";
		var stringselectblocked="";
		var stringselectfinish="";
		for(var l=0; l<$scope.numprocesos;l++){
			if(SO1.arregloPcb[l].estado==2){
				stringselectblocked+="<option>"+(l+1)+"</option>";
			}
			if(SO1.arregloPcb[l].estado==3){
				stringselectready+="<option>"+(l+1)+"</option>";
			}
			if(SO1.arregloPcb[l].estado==4){
				stringselectfinish+="<option>"+(l+1)+"</option>";
			}
		}
		document.getElementById("pblocked").innerHTML = stringselectblocked;
		document.getElementById("pready").innerHTML = stringselectready;
		document.getElementById("pfinished").innerHTML = stringselectfinish;
	}

	$scope.controldeBlocked = function(){
		for (var i = 0; i < $scope.numprocesos; i++) {
			if(SO1.arregloPcb[i].estado==2 && !SO1.arregloPcb[i].blockedIO){
				SO1.arregloPcb[i].tiempoenblocked++;
			}
		}
		for (var i = 0; i < $scope.numprocesos; i++) {
			if(SO1.arregloPcb[i].estado==2){
				if(SO1.arregloPcb[i].tiempoenblocked>=5){
					SO1.arregloPcb[i].estado=3;
					colaReady.push(i);
					SO1.arregloPcb[i].tiempoenblocked=0;
				}
			}
		}
	}

	$scope.cambiarPagina = function(){
		switch($scope.tog){
					case 1:
						$scope.algMemFifo();break;

					case 2:
						$scope.algMemLru();break;

					case 3:
						$scope.algMemLfu();break;

					case 4:
						$scope.algMemNur();break;
				}
		$scope.cargarPagina();
	}

	$scope.algMemFifo = function(){
		var cont=0;
		var procesoactual=$scope.NombrePA-1;
		var llegadamenor=1000;
		var pagfifo=0;
		for(var i=0; i<SO1.arregloPcb[procesoactual].numpags;i++){
				if(SO1.arregloPcb[procesoactual].arreglopag[i].r==1){
					if(SO1.arregloPcb[procesoactual].arreglopag[i].llegada<llegadamenor){
						llegadamenor=SO1.arregloPcb[procesoactual].arreglopag[i].llegada;
						pagfifo=i;
					}
				}
			}
		$scope.resetearPagina(pagfifo);
	}

	$scope.algMemLru = function(){
		var cont=0;
		var procesoactual=$scope.NombrePA-1;
		var ultaccmenor=1000;
		var paglru=0;
		for(var i=0; i<SO1.arregloPcb[procesoactual].numpags;i++){
				if(SO1.arregloPcb[procesoactual].arreglopag[i].r==1){
					if(SO1.arregloPcb[procesoactual].arreglopag[i].ultacc<ultaccmenor){
						ultaccmenor=SO1.arregloPcb[procesoactual].arreglopag[i].ultacc;
						paglru=i;
					}
				}
			}
		$scope.resetearPagina(paglru);
	}

	$scope.algMemLfu = function(){
		var cont=0;
		var procesoactual=$scope.NombrePA-1;
		var accesomenor=1000;
		var paglfu=0;
		for(var i=0; i<SO1.arregloPcb[procesoactual].numpags;i++){
				if(SO1.arregloPcb[procesoactual].arreglopag[i].r==1){
					if(SO1.arregloPcb[procesoactual].arreglopag[i].numacc<accesomenor){
						accesomenor=SO1.arregloPcb[procesoactual].arreglopag[i].numacc;
						paglfu=i;
					}
				}
			}
		$scope.resetearPagina(paglfu);
	}

	$scope.algMemNur = function(){
		var procesoactual=$scope.NombrePA-1;
		var pagnur=0;
		for(var j=0; j<4;j++){
							for(var i=SO1.arregloPcb[procesoactual].numpags-1; i>=0;i--){
								if(SO1.arregloPcb[procesoactual].arreglopag[i].r==1){
									switch(j){
										case 0:
											if(SO1.arregloPcb[procesoactual].arreglopag[i].nur1==1 && SO1.arregloPcb[procesoactual].arreglopag[i].nur2==1){
												pagnur=i;
											}break;

										case 1:
											if(SO1.arregloPcb[procesoactual].arreglopag[i].nur1==1 && SO1.arregloPcb[procesoactual].arreglopag[i].nur2==0){
												pagnur=i;
											}break;

										case 2:
											if(SO1.arregloPcb[procesoactual].arreglopag[i].nur1==0 && SO1.arregloPcb[procesoactual].arreglopag[i].nur2==1){
												pagnur=i;
											}break;

										case 3:
											if(SO1.arregloPcb[procesoactual].arreglopag[i].nur1==0 && SO1.arregloPcb[procesoactual].arreglopag[i].nur2==0){
												pagnur=i;
											}break;
									}
								}
							}
						}
		$scope.resetearPagina(pagnur);
	}

	$scope.resetearPagina = function(pagina){
		pagina=parseInt(pagina);
		var procesoactual=$scope.NombrePA-1;
		SO1.arregloPcb[procesoactual].arreglopag[pagina].r=0;
		SO1.arregloPcb[procesoactual].arreglopag[pagina].llegada=0;
		SO1.arregloPcb[procesoactual].arreglopag[pagina].ultacc=0;
		SO1.arregloPcb[procesoactual].arreglopag[pagina].numacc=0;
		SO1.arregloPcb[procesoactual].arreglopag[pagina].nur1=0;
		SO1.arregloPcb[procesoactual].arreglopag[pagina].nur2=0;
	}

	$scope.cargarPagina = function(){
		var procesoactual=$scope.NombrePA-1;
		var pag = document.getElementById("pagejecutar").value;
		SO1.arregloPcb[procesoactual].arreglopag[pag].r=1;
		SO1.arregloPcb[procesoactual].arreglopag[pag].llegada=$scope.tiempo;
		SO1.arregloPcb[procesoactual].arreglopag[pag].ultacc=$scope.tiempo;
		SO1.arregloPcb[procesoactual].arreglopag[pag].numacc=1;
		SO1.arregloPcb[procesoactual].arreglopag[pag].nur1=1;
		SO1.arregloPcb[procesoactual].arreglopag[pag].accesosdenur=0;
	}

	$scope.leerPagina = function(){
		var procesoactual=$scope.NombrePA-1;
		var pag = document.getElementById("pagejecutar").value;
		SO1.arregloPcb[procesoactual].arreglopag[pag].ultacc=$scope.tiempo;
		SO1.arregloPcb[procesoactual].arreglopag[pag].numacc++;
		SO1.arregloPcb[procesoactual].arreglopag[pag].accesosdenur++;
		SO1.arregloPcb[procesoactual].arreglopag[pag].nur1=1;
		if(SO1.arregloPcb[procesoactual].arreglopag[pag].accesosdenur>4){
			SO1.arregloPcb[procesoactual].arreglopag[pag].nur2=1;
		}
	}

	$scope.actualizarEnvejecimiento = function(){
		for (var i = 0; i < $scope.numprocesos; i++) {
			if(SO1.arregloPcb[i].estado==3){
				SO1.arregloPcb[i].envejecimiento++;
			}
		}
	}

	$scope.ejecutarPagina = function(){
		$scope.tiempo++;
		$scope.controldeBlocked();
		$scope.fallopag=false;
		$scope.procfinished=false;
		var pag = document.getElementById("pagejecutar").value;
		var procesoactual=$scope.NombrePA-1;
		SO1.arregloPcb[procesoactual].cpuasignado++;
		SO1.arregloPcb[procesoactual].cpurestante--;
		SO1.arregloPcb[procesoactual].qrestante--;
		$scope.actualizarEnvejecimiento();
		if(SO1.arregloPcb[procesoactual].cpurestante==0){
			SO1.arregloPcb[procesoactual].estado=4;
			$scope.procfinished=true;
			alert("Este proceso a terminado su ejecución.");
			$scope.cambiarProceso();
		}else{
			var cont=0;
			for(var i=0; i<SO1.arregloPcb[procesoactual].numpags;i++){
				if(SO1.arregloPcb[procesoactual].arreglopag[i].r==1){
					cont++;
				}
			}
			if(SO1.arregloPcb[procesoactual].arreglopag[pag].r==0){
				if(cont<$scope.maxpag){
					$scope.cargarPagina();
				}else{
					$scope.cambiarPagina();
				}
				SO1.arregloPcb[procesoactual].estado=2;
				SO1.arregloPcb[procesoactual].qrestante=0;
				$scope.fallopag=true;
				alert("Ocurrió un fallo de página, es momento de cambiar de proceso.");
				$scope.cambiarProceso();
			}else{
				$scope.leerPagina();
				$scope.cambiarProceso();
			}
		}
	}

	$scope.sumar = function(){
		$scope.tamq++;
		SO1.arregloPcb[$scope.NombrePA-1].qrestante++;
		$scope.ActualizarPantalla();
	}

	$scope.restar = function(){
		if ($scope.tamq>1) {
			$scope.tamq--;
			SO1.arregloPcb[$scope.NombrePA-1].qrestante--;
			if(SO1.arregloPcb[$scope.NombrePA-1].qrestante==0){
				$scope.algRoundRobin();
			}
		$scope.ActualizarPantalla();
		}
	}

	$scope.manejoInterrupciones = function(){
		var procesoactual=$scope.NombrePA-1;
		var num=parseInt(document.getElementById("selectdeinterrupciones").value);
		switch(num){
			case 1:
				SO1.arregloPcb[procesoactual].estado=4;
				$scope.procfinished=true;
				alert("Este proceso a terminado su ejecución.");
				$scope.cambiarProceso();
				break;

			case 2:
				SO1.arregloPcb[procesoactual].estado=4;
				$scope.procfinished=true;
				alert("Este proceso a terminado su ejecución.");
				$scope.cambiarProceso();
				break;

			case 3:
				SO1.arregloPcb[procesoactual].blockedIO=true;
				SO1.arregloPcb[procesoactual].estado=2;
				colaBlockedIO.push(procesoactual);
				$scope.hayinterrupcion=true;
				$scope.cambiarProceso();
				break;

			case 4:
				SO1.arregloPcb[procesoactual].estado=2;
				$scope.hayinterrupcion=true;
				$scope.cambiarProceso();
				break;

			case 5:
				SO1.arregloPcb[procesoactual].estado=4;
				$scope.procfinished=true;
				alert("Este proceso a terminado su ejecución.");
				$scope.cambiarProceso();
				break;

			case 6:
				SO1.arregloPcb[procesoactual].estado=3;
				colaReady.push(procesoactual);
				$scope.hayinterrupcion=true;
				$scope.cambiarProceso();
				break;

			case 7:
				var indice=-1;
				if(colaBlockedIO[0]!=null)
					indice=colaBlockedIO.shift();
				if(indice==-1)
					alert("No existe un proceso esperando respuesta de I/O");
				else{
					SO1.arregloPcb[procesoactual].estado=3;
					colaReady.push(procesoactual);
					$scope.cargarProceso(indice);
					SO1.arregloPcb[indice].blockedIO=false;
					$scope.ActualizarPantalla();
				}
				break;
		}
	}

	$scope.cargarProceso = function(i){
		i=parseInt(i);
		SO1.arregloPcb[i].qrestante=$scope.tamq;
		SO1.arregloPcb[i].estado=1;
	}

	$scope.cambiarProceso = function(){
		switch($scope.numalg){
			case 1:
				$scope.algRoundRobin(); break;

			case 2:
				$scope.algFifo(); break;

			case 3:
				$scope.algSjf();break;

			case 4:
				$scope.algSrt();break;

			case 5:
				$scope.algHrrn();break;

			default:
				$scope.algRoundRobin(); break;
		}
		$scope.hayinterrupcion=false;
	}

	$scope.cpuOscioso = function(){
		var flag=false;
		var cont=0;
		alert("No hay procesos en ready, el CPU estará oscioso hasta que encuentre un proceso en ready.");
		do{
			$scope.tiempo++;
			cont++;
			$scope.controldeBlocked();
			var i=0;
			for (i = 0; i < $scope.numprocesos; i++) {
				if(SO1.arregloPcb[i].estado==3){
					flag=true;
					SO1.arregloPcb[i].estado=1;
					SO1.arregloPcb[i].qrestante=$scope.tamq;
					var indice=colaReady.shift();
					break;
				}
			}
		}while(!flag && cont<100);
		if(cont>10){
			var procesoactual=$scope.NombrePA-1;
			SO1.arregloPcb[procesoactual].estado=4;
			$scope.nohayprocesos=true;
			alert("No hay ningun proceso en el CPU.");
		}
	}

	$scope.algRoundRobin = function(){
		var procesoactual=$scope.NombrePA-1;
		var procesoviejo=procesoactual;
		if(SO1.arregloPcb[procesoactual].qrestante==0){
			if($scope.fallopag){
				if(colaReady[0]!=null){
					var indice=colaReady.shift();
					$scope.cargarProceso(indice);
					document.getElementById("pagejecutar").value=0;
				}else{
					$scope.cpuOscioso();
				}
			}else{
				SO1.arregloPcb[procesoactual].estado=3;
				colaReady.push(procesoactual);
				alert("Su quantum a terminado, es momento de cambiar de proceso.");
				if(colaReady[0]!=null){
					var indice=colaReady.shift();
					$scope.cargarProceso(indice);
				}
			}
			document.getElementById("pagejecutar").value=0;
		}
		if($scope.procfinished){
			if(colaReady[0]!=null){
					var indice=colaReady.shift();
					$scope.cargarProceso(indice);
				}else{
					$scope.cpuOscioso();
				}
			document.getElementById("pagejecutar").value=0;
		}
		if($scope.hayinterrupcion){
			if(colaReady[0]!=null){
					var indice=colaReady.shift();
					$scope.cargarProceso(indice);
				}else{
					$scope.cpuOscioso();
				}
			document.getElementById("pagejecutar").value=0;
		}
		$scope.ActualizarPantalla();
	}

	$scope.algFifo = function(){
		var procesoactual=$scope.NombrePA-1;
		var procesoviejo=procesoactual;
		if($scope.fallopag || $scope.procfinished || $scope.hayinterrupcion){
				if(colaReady[0]!=null){
					var indice=colaReady.shift();
					$scope.cargarProceso(indice);
				}else{
					$scope.cpuOscioso();
				}
				document.getElementById("pagejecutar").value=0;
			}
		$scope.ActualizarPantalla();
	}

	$scope.algSjf = function(){
		if($scope.fallopag || $scope.procfinished || $scope.hayinterrupcion){
			var menor=1000;
			var indice=-1;
			var procesoactual=$scope.NombrePA-1;
			for (i = 0; i < $scope.numprocesos; i++) {
					if(SO1.arregloPcb[i].estado==3){
						if(menor>SO1.arregloPcb[i].tte){
							menor=SO1.arregloPcb[i].tte;
							indice=i;
						}
					}
				}
			if(indice==-1){
				$scope.cpuOscioso();
				$scope.fallopag=false;
			}else{
				colaReady.splice(indice,1);
				$scope.cargarProceso(indice);
				document.getElementById("pagejecutar").value=0;
			}
		}
		$scope.ActualizarPantalla();
	}

	$scope.algSrt = function(){
		if($scope.fallopag || $scope.procfinished || $scope.hayinterrupcion){
			var menor=1000;
			var indice=-1;
			var procesoactual=$scope.NombrePA-1;
			for (i = 0; i < $scope.numprocesos; i++) {
					if(SO1.arregloPcb[i].estado==3){
						if(menor>SO1.arregloPcb[i].cpurestante){
							menor=SO1.arregloPcb[i].cpurestante;
							indice=i;
						}
					}
				}
			if(indice==-1){
				$scope.cpuOscioso();
				$scope.fallopag=false;
			}else{
				colaReady.splice(indice,1);
				$scope.cargarProceso(indice);
				document.getElementById("pagejecutar").value=0;
			}
		}
		$scope.ActualizarPantalla();
	}

	$scope.algHrrn = function(){
		if($scope.fallopag || $scope.procfinished || $scope.hayinterrupcion){
			var mayor=0;
			var prioridad=0;
			var indice=-1;
			var procesoactual=$scope.NombrePA-1;
			for (i = 0; i < $scope.numprocesos; i++) {
					if(SO1.arregloPcb[i].estado==3){
						prioridad=(SO1.arregloPcb[i].envejecimiento+SO1.arregloPcb[i].tte)/SO1.arregloPcb[i].tte;
						if(mayor<prioridad){
							mayor=prioridad;
							indice=i;
						}
					}
				}
			if(indice==-1){
				$scope.cpuOscioso();
				$scope.fallopag=false;
			}else{
				colaReady.splice(indice,1);
				$scope.cargarProceso(indice);
				document.getElementById("pagejecutar").value=0;
			}
		}
		$scope.ActualizarPantalla();
	}

	$scope.sumarpag = function(){
		$scope.numpag++;
	}

	$scope.restarpag = function(){
		if ($scope.numpag>1) {
			$scope.numpag--;
		}
	}

	$scope.cambiarAlg = function(){
		$scope.numalg++;
		switch($scope.numalg){
			case 1:
				$scope.algcpu="Round Robin";
				$scope.roundrobin=1;
				break;

			case 2:
				$scope.algcpu="FIFO";$scope.roundrobin=0;break;

			case 3:
				$scope.algcpu="SJF";$scope.roundrobin=0;break;

			case 4:
				$scope.algcpu="SRT";$scope.roundrobin=0;break;

			case 5:
				$scope.algcpu="HRRN"
				$scope.roundrobin=0;
				break;

			case 6:
				$scope.numalg=1;
				$scope.algcpu="Round Robin";
				$scope.roundrobin=1;
				break;

			default:
				$scope.algcpu="Round Robin";break;
		}
	}

	$scope.resetearNur = function(){
		for(var i=0; i<SO1.arregloPcb[$scope.NombrePA-1].numpags;i++){
			SO1.arregloPcb[$scope.NombrePA-1].arreglopag[i].nur1=0;
			SO1.arregloPcb[$scope.NombrePA-1].arreglopag[i].nur2=0;
			SO1.arregloPcb[$scope.NombrePA-1].arreglopag[i].accesosdenur=0;
		}
		$scope.ActualizarPantalla();
	}

	$scope.actualizar = function(num){
	 	$scope.tog=num;
		switch($scope.tog){
			case 1: $scope.algmem="FIFO";break;
			case 2: $scope.algmem="LRU";break;
			case 3: $scope.algmem="LFU";break;
			case 4: $scope.algmem="NUR";break;
			default: $scope.algmem="NUR";break;
		}
	}

  $scope.showContent = function($fileContent){
  	var procrunning=0;
  	$scope.nohayprocesos=false;
    $scope.checkFile();
    if($scope.isText){
    	var i=1;
    	var numpaglocal=0;
      $scope.content = $fileContent;
      var lines = $scope.content.split('\n');
      $scope.maxpag=parseInt(lines[0]);
      $scope.numprocesos=parseInt(lines[1]);
      for (var j=0; j < $scope.numprocesos; j++) {
      	i++;
      	lines[i]=lines[i].replace(" ", "");
  		var detalle = lines[i].split(',');
  		numpaglocal=lines[++i];
  		SO1.arregloPcb[j]=new Proceso(parseInt(detalle[0]), parseInt(detalle[1]), parseInt(detalle[2]), parseInt(numpaglocal));
  		for (var k = 0; k < numpaglocal; k++) {
  			i++;
  			lines[i]=lines[i].replace(" ", "");
  			var detallepag=lines[i].split(',');
  			if(detallepag[0]==1 && detallepag[2]>$scope.tiempo){
  				$scope.tiempo=detallepag[2];
  				}
  			SO1.arregloPcb[j].arreglopag[k]= new Pagina(parseInt(detallepag[0]), parseInt(detallepag[1]), parseInt(detallepag[2]), parseInt(detallepag[3]), parseInt(detallepag[4]), parseInt(detallepag[5]));
  			}
  		if(SO1.arregloPcb[j].estado==1){
  			procrunning=j;
      	}
      	if(SO1.arregloPcb[j].estado==3){
  			colaReady.push(j);
      	}
      }
      $scope.ActualizarPantalla();
      $scope.nombre=$scope.numprocesos;
      $scope.nombre++;
    }
    else
      alert(' Error de archivo');
  }

  $scope.uploadFile = function(){
    angular.element('#upload').trigger('click');
  }

  $scope.checkFile = function(){
    if(angular.element('#upload')[0].files[0].type == 'text/plain')
      $scope.isText = true;
    else
      $scope.isText = false;
  }

  $scope.crearProceso = function(){
	$scope.nombre++;
  	var ejtotal = document.getElementById("ejtotal").value;
  	SO1.arregloPcb[$scope.numprocesos]=new Proceso($scope.tiempo, ejtotal, 3, $scope.numpag);
  	for(var p=0; p < $scope.numpag; p++){
  		SO1.arregloPcb[$scope.numprocesos].arreglopag[p]=new Pagina(0,0,0,0,0,0);
  }
  	if($scope.nohayprocesos){
  		SO1.arregloPcb[$scope.numprocesos].estado=1;
  		$scope.nohayprocesos=false;
  	}
  	$scope.ActualizarPantalla();
  	$scope.numprocesos++;
  }

};

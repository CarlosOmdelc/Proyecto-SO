angular.module('SOweb').controller('homeController', homeController);

homeController.inject$ = ['$state', '$timeout'];

	var ready = new Array();			//mi fila de procesos en ready
	var blocked = new Array();		//mi fila de procesos en blocked
	var finished = new Array();		//mi fila de procesos en finished

//son mis tres arreglos temporales
	var r = new Array();
	var b = new Array();
	var f = new Array();

function homeController ($state, $timeout){
	var vm=this;

	SCREEN=new InfoProceso();		//manda a llamar a mi metodo InfoProceso
	//variables de algoritmos de memoria
	vm.numalgoritmoMemoria=4;	//numero del algoritmo de memoria		1-FIFO	2-LRU		3-LFU		4-NUR
	vm.algoritmoMemoria="NUR";		//el 4 es NUR

	//variables de algoritmos de cpu
	vm.numalgoritmoCPU=1;		//numero del algoritmo de CPU				1-Round Robin		2-FIFO		3-SJF		4-SRT		5-HRRN
	vm.algoritmoCPU="Round Robin";
	//vm.RoundRobin=1;
	vm.quantum=5;			//quantum para Round Robin

	//variables para proceso nuevo (el que se esta creando)
	vm.numpag=5;			//numero de paginas
	vm.nombreN=1;			//nombre del proceso nuevo

	//variables del proceso actual (el que se esta corriendo)
	vm.maxpag=0;			//maximo de paginas que puede tener un proceso
	vm.numprocesos=1;	//numero de procesos

	vm.nombrePA=0;		//nombre del proceso actual
	vm.llegadaPA=0;		//llegada del proceso actual
	vm.cpuaPA=0;			//cpu asignado del proceso actual
	vm.envejecimientoPA=0;	//envejevimientoPA
	vm.cpuresPA=0;		//cpu restante del proceso actual
	vm.quantumresPA=0;	//quantum restante del proceso actual

	//otras variables
	vm.tiempoA=1;			//tiempo actual
	vm.isText = false;
	vm.fallopag=false;
	vm.procfinished=false;
	vm.nohayprocesos=true;
	vm.hayinterrupcion=false;
	vm.toppingUno=false;
	vm.toppingDos=false;
	vm.toppingTres=false;
	vm.disableUno=false;				//se deshabilitan cuando estan en false
	vm.disableDos=false;
	vm.disableTres=false;
	vm.Uquantum=0;
	vm.procesoOld=0;
	vm.disableButton=false;

	//LLAMADAS A LOS METODOS

	vm.ActualizarPantalla=ActualizarPantalla;
	vm.CargarProceso=CargarProceso;									//vm.cargarProceso
	vm.RoundRobinCPU=RoundRobinCPU;									//vm.algRoundRobin
	vm.FIFOcpu=FIFOcpu;															//vm.algFifo
	vm.SJFcpu=SJFcpu;																//vm.algSjf
	vm.SRTcpu=SRTcpu;																//vm.algSrt
	vm.HRRNcpu=HRRNcpu;															//vm.algHrrn
	vm.ActEnvejecimiento=ActEnvejecimiento;					//vm.actualizarEnvejecimiento
	//vm.QuantumMas=QuantumMas;												//vm.sumar										//se usa para sumar quantum en el boton
	//vm.QuantumMenos=QuantumMenos;										//vm.restar										//se usa para sumar quantum en el boton
	vm.BlockedHistory=BlockedHistory;								//vm.controldeBlocked
	vm.CambiarAlgoritmo=CambiarAlgoritmo;						//vm.cambiarProceso						//checar quien lo usa
	vm.CPUWaiting=CPUWaiting;												//vm.cpuOscioso
	vm.CambiarAlgoritmo2=CambiarAlgoritmo2;					//vm.cambiarAlg								//cambia el algoritmo desde home (boton)
	vm.LecturaArchivo=LecturaArchivo;								//vm.showContent
	vm.UploadArchivo=UploadArchivo;									//vm.uploadFile
	vm.VerificarArchivo=VerificarArchivo;						//vm.checkFile
	vm.Interrupciones=Interrupciones;								//vm.manejoInterrupciones	//ya
	vm.FIFOmemoria=FIFOmemoria;											//vm.algoritmoMemoriaFifo
	vm.LRUmemoria=LRUmemoria;												//vm.algoritmoMemoriaLru
	vm.LFUmemoria=LFUmemoria;												//vm.algoritmoMemoriaLfu
	vm.NURmemoria=NURmemoria;												//vm.algoritmoMemoriaNur
	vm.ResetNUR=ResetNUR;														//vm.resetearNur					//ya
	vm.Cambiarpg=Cambiarpg;													//vm.cambiarPagina
	vm.Resetpg=Resetpg;															//vm.resetearPagina
	vm.Cargarpg=Cargarpg;														//vm.cargarPagina
	vm.Leerpg=Leerpg;																//vm.leerPagina
	vm.Ejecutarpg=Ejecutarpg;												//vm.ejecutarPagina				//ya
	vm.AlgoritmoMemoria=AlgoritmoMemoria;						//vm.actualizar						//ya
	vm.Maspg=Maspg;																	//vm.sumarpag									//se usa para sumar pg en el boton
	vm.Menospg=Menospg;															//vm.restarpag								//se usa para restar pg en el boton
	vm.CreateProceso=CreateProceso;									//vm.crearProceso					//ya
	vm.ActStates=ActStates;													//vm.actualizarEstados		//estados en pantalla
	vm.Toppings=Toppings;
	vm.obtenerQ=obtenerQ;

	//values			era tabladepag
	//pag 				era pagejecutar

	function InfoProceso (){
		this.pcb=[];
	}

	function Proceso(arrivalTime, burstTime, state, numpags){
		//private String name;
		this.burstTime=burstTime;
		this.arrivalTime=arrivalTime;
		this.state=state;
		this.numpags=numpags;
		this.pags=[];

		//CALCULAR
		this.serviceTime=0;
		this.timeUntilComplete=burstTime;
		this.quantumres=vm.Uquantum;
		this.envejecimiento=0;
		this.blockedTime=0;
		this.blockedIO=false;
		//int totalServiceTime; //Tiempo de servicio acumulado
		//int waitingTime; //Tiempo de espera (Dónde ha estado el proceso menos en Running)
		//float prioridad; //(tiempo de espera+tiempo estimado de servicio)/tiempo estimado de servicio
	}

	function Pagina(r, arrivalTime, ultacc, numacc, nur1, nur2){	//variables de la lista
		this.r=r;
		this.arrivalTime=arrivalTime;
		this.ultacc=ultacc;
		this.numacc=numacc;
		this.nur1=nur1;
		this.nur2=nur2;
		this.accesosdenur=numacc;		//se le asignan los accesos
	}
/*
	function prueba(index){
		alert("WORKING!");
		console.log("true");
	}

	vm.prueba=prueba;

	for (var k = 0; k < SCREEN.pcb[i].numpags; k++) {
		stringtbody+="<tr><td>"+k+"</td><td>"+SCREEN.pcb[i].pags[k].r+
		"</td><td>"+SCREEN.pcb[i].pags[k].arrivalTime+
		"</td><td>"+SCREEN.pcb[i].pags[k].ultacc+
		"</td><td>"+SCREEN.pcb[i].pags[k].numacc+
		"</td><td>"+SCREEN.pcb[i].pags[k].nur1+" "+
		SCREEN.pcb[i].pags[k].nur2+"</td></tr>";
	};*/

	vm.lista = [
    {pgs: "1", r: "0", arrivalTime:"0", ultacc: "0", numacc: "0", nurUno:"0", nurDos:'0'},
		{pgs: "2", r: "0", arrivalTime:"0", ultacc: "0", numacc: "0", nurUno:"0", nurDos:'0'},
		{pgs: "3", r: "0", arrivalTime:"0", ultacc: "0", numacc: "0", nurUno:"0", nurDos:'0'}
  ];

	function ActLista(i){
			vm.lista = [
		    {pgs: "1", r: SCREEN.pcb[i].pags[0].r, arrivalTime:SCREEN.pcb[i].pags[0].arrivalTime,
					ultacc: SCREEN.pcb[i].pags[0].ultacc, numacc: SCREEN.pcb[i].pags[0].numacc,
					nurUno:SCREEN.pcb[i].pags[0].nur1, nurDos:SCREEN.pcb[i].pags[0].nur2},

				{pgs: "2", r: SCREEN.pcb[i].pags[1].r, arrivalTime:SCREEN.pcb[i].pags[1].arrivalTime,
					ultacc: SCREEN.pcb[i].pags[1].ultacc, numacc: SCREEN.pcb[i].pags[1].numacc,
					nurUno:SCREEN.pcb[i].pags[1].nur1, nurDos:SCREEN.pcb[i].pags[1].nur2},

				{pgs: "3", r: SCREEN.pcb[i].pags[2].r, arrivalTime:SCREEN.pcb[i].pags[2].arrivalTime,
					ultacc: SCREEN.pcb[i].pags[2].ultacc, numacc: SCREEN.pcb[i].pags[2].numacc,
					nurUno:SCREEN.pcb[i].pags[2].nur1, nurDos:SCREEN.pcb[i].pags[2].nur2}
		  ];
	}

	function ActualizarPantalla(){
		//console.log("true");		ya entra
		for (var i = 1; i < vm.numprocesos; i++) {		//i es el numero del proceso
			if(SCREEN.pcb[i].state==1){		//si el estado esta en running, break
			//alert(SCREEN.pcb[i].state);		aqui sigue siendo el proceso 1 corriendose	------esta correcto
				break;
			}
		}
		if(vm.numprocesos!=i){			//mientras no se corra el ultimo proceso??
		vm.nombrePA=i;		//tenia +1
		vm.llegadaPA=SCREEN.pcb[i].arrivalTime;
		vm.cpuaPA=SCREEN.pcb[i].serviceTime;
		vm.envejecimientoPA=SCREEN.pcb[i].envejecimiento;
		vm.timeUntilCompletePA=SCREEN.pcb[i].timeUntilComplete;
		vm.quantumresPA=SCREEN.pcb[i].quantumres;

		 //Contarpg(vm.nombrePA);
		var nuevopg = document.getElementById("page").value;
		//document.getElementById("pag").setAttribute("max", SCREEN.pcb[i].numpags-1);
			//esta es la linea que me da el total de paginas por PA

		Contarpg(nuevopg);

		//var stringtbody="";
		//AQUI VA A LLAMAR AL METODO DE LA LISTA
		ActLista(i);	//se manda el numero de proceso
		/*for (var k = 0; k < SCREEN.pcb[i].numpags; k++) {		//k es el numero de paginas
			stringtbody+="<tr><td>"+k+"</td><td>"+SCREEN.pcb[i].pags[k].r+
			"</td><td>"+SCREEN.pcb[i].pags[k].arrivalTime+
			"</td><td>"+SCREEN.pcb[i].pags[k].ultacc+
			"</td><td>"+SCREEN.pcb[i].pags[k].numacc+
			"</td><td>"+SCREEN.pcb[i].pags[k].nur1+" "+
			SCREEN.pcb[i].pags[k].nur2+"</td></tr>";
		};*/
		//document.getElementById("values").innerHTML = stringtbody;
		ActStates();
		}else{
		vm.nombrePA=0;
		vm.llegadaPA=0;
		vm.cpuaPA=0;
		vm.envejecimientoPA=0;
		vm.timeUntilCompletePA=0;
		vm.quantumresPA=0;
		//AQUI TIENES QUE PONER ALGO PARA EL CASO DE QUE NO ESTE EN READY NO TIENE PAGINAS
		//document.getElementById("pag").setAttribute("max", 0);
		//document.getElementById("values").innerHTML = "";
		ActStates();
		//alert('ENTRASTE AL ELSE');
		}
		//alert('WORKING');
		ActStates();
	}

	function CargarProceso(i){
		var j=parseInt(i);
		//alert(j);
		//j-1;
		SCREEN.pcb[j].quantumres=vm.quantum;
		SCREEN.pcb[j].state=1;
	}

//------------------------------algoritmos de CPU------------------------------
	function RoundRobinCPU(){
		var procesoactual=vm.nombrePA;		//tenia -1
		//var procesoviejo=procesoactual;
		//printArray();
		if(SCREEN.pcb[procesoactual].quantumres==0){
			if(vm.fallopag){
				if(ready[0]!=null){
					var indice=ready.shift();		//metodo para eliminar el primer valor
					//alert(indice);
					CargarProceso(indice);		//cambias la cabeza del ready a running
					//document.getElementById("pag").value=0; 		ni idea de para que sirven
				}else{
					CPUWaiting();		//entra a CPUWaiting cuando no hay procesos en ready
				}
			}else{
				SCREEN.pcb[procesoactual].state=3;
				//ready.push(procesoactual);
				ActStates();
				alert("Su quantum a terminado, es momento de cambiar de proceso.");
				if(ready[0]!=null){
					var indice=ready.shift();
					CargarProceso(indice);
				}
			}
			//document.getElementById("pag").value=0;			ni idea de para que sirven
		}
		if(vm.procfinished){
			alert("Proceso terminado");
			if(ready[0]!=null){
					var indice=ready.shift();
					CargarProceso(indice);
				}else{
					CPUWaiting();
				}
			//document.getElementById("pag").value=0;			ni idea de para que sirven
		}
		if(vm.hayinterrupcion){
			if(ready[0]!=null){
					var indice=ready.shift();
					CargarProceso(indice);
				}else{
					CPUWaiting();
				}
			//document.getElementById("pag").value=0;
		}
		//hasta aqui va bien		vm.nombrePA es 1 	---es correcto
		ActualizarPantalla();
	}

	function FIFOcpu(){
		var procesoactual=vm.nombrePA;		//tenia -1
		//var procesoviejo=procesoactual;
		if(vm.fallopag || vm.procfinished || vm.hayinterrupcion){
				if(ready[0]!=null){
					var indice=ready.shift();
					CargarProceso(indice);
				}else{
					CPUWaiting();
				}
				//document.getElementById("pag").value=0;			ni idea de para que sirven
			}
		ActualizarPantalla();
	}

	function SJFcpu(){
		if(vm.fallopag || vm.procfinished || vm.hayinterrupcion){
			var menor=1000;
			var indice=-1;
			var procesoactual=vm.nombrePA;		//tenia -1
			for (i = 1; i < vm.numprocesos; i++) {
					if(SCREEN.pcb[i].state==3){
						if(menor>SCREEN.pcb[i].burstTime){
							menor=SCREEN.pcb[i].burstTime;
							indice=i;
						}
					}
				}
			if(indice==-1){
				CPUWaiting();
				vm.fallopag=false;
			}else{
				ready.splice(indice,1);
				CargarProceso(indice);
				//document.getElementById("pag").value=0;			ni idea de para que sirven
			}
		}
		ActualizarPantalla();
	}

	 function SRTcpu(){
		if(vm.fallopag || vm.procfinished || vm.hayinterrupcion){
			var menor=1000;
			var indice=-1;
			var procesoactual=vm.nombrePA;		//tenia -1
			for (i = 1; i < vm.numprocesos; i++) {
					if(SCREEN.pcb[i].state==3){
						if(menor>SCREEN.pcb[i].timeUntilComplete){
							menor=SCREEN.pcb[i].timeUntilComplete;
							indice=i;
						}
					}
				}
			if(indice==-1){
				CPUWaiting();
				vm.fallopag=false;
			}else{
				ready.splice(indice,1);
				CargarProceso(indice);
				//document.getElementById("pag").value=0;			ni idea de para que sirven
			}
		}
		ActualizarPantalla();
	}

	function HRRNcpu(){
		if(vm.fallopag || vm.procfinished || vm.hayinterrupcion){
			var mayor=0;
			var prioridad=0;
			var indice=-1;
			var procesoactual=vm.nombrePA;		//tenia -1
			for (i = 1; i < vm.numprocesos; i++) {
					if(SCREEN.pcb[i].state==3){
						prioridad=(SCREEN.pcb[i].envejecimiento+SCREEN.pcb[i].burstTime)/SCREEN.pcb[i].burstTime;
						if(mayor<prioridad){
							mayor=prioridad;
							indice=i;
						}
					}
				}
			if(indice==-1){
				CPUWaiting();
				vm.fallopag=false;
			}else{
				ready.splice(indice,1);
				CargarProceso(indice);
				//document.getElementById("pag").value=0;			ni idea de para que sirven
			}
		}
		ActualizarPantalla();
	}

//------------------------------fin de algoritmos de CPU------------------------------

	function CambiarAlgoritmo(){				//checar quien lo utiliza
		switch(vm.numalgoritmoCPU){
			case 1:
				RoundRobinCPU(); break;

			case 2:
				FIFOcpu(); break;

			case 3:
				SJFcpu();break;

			case 4:
				SRTcpu();break;

			case 5:
				HRRNcpu();break;

			default:
				RoundRobinCPU(); break;
		}
		vm.hayinterrupcion=false;
	}

	function CambiarAlgoritmo2(num){
		vm.numalgoritmoCPU=num;
		switch(vm.numalgoritmoCPU){
			case 1:vm.algoritmoCPU="Round Robin";break;
			case 2:vm.algoritmoCPU="FIFO";break;
			case 3:vm.algoritmoCPU="SJF";break;
			case 4:vm.algoritmoCPU="SRT";break;
			case 5:vm.algoritmoCPU="HRRN";break;
			default: vm.algoritmoCPU="Round Robin";break;
		}
	}

	function CPUWaiting(){
		var flag=false;
		var cont=0;
		alert("No hay procesos en ready, el CPU estará oscioso hasta que encuentre un proceso en ready.");
		do{
			vm.tiempoA++;
			cont++;
			BlockedHistory();
			var i=0;
			for (i = 1; i < vm.numprocesos; i++) {
				if(SCREEN.pcb[i].state==3){
					flag=true;
					SCREEN.pcb[i].state=1;
					SCREEN.pcb[i].quantumres=vm.quantum;
					var indice=ready.shift();
					break;
				}
			}
		}while(!flag && cont<100);
		if(cont>10){
			var procesoactual=vm.nombrePA;		//tenia -1
			SCREEN.pcb[procesoactual].state=4;
			vm.nohayprocesos=true;
			alert("No hay ningun proceso en el CPU.");
		}
	}

	function ActEnvejecimiento(){
		for (var i = 1; i < vm.numprocesos; i++) {
			if(SCREEN.pcb[i].state==3){
				SCREEN.pcb[i].envejecimiento++;
			}
		}
	}
/*
//ELIMINAR ESTOS DOS!!-----------------------------------------ELIMINAR ESTOS DOS!!
	function QuantumMas(){
		vm.quantum++;
		SCREEN.pcb[vm.nombrePA-1].quantumres++;
		ActualizarPantalla();
	}

	function QuantumMenos(){
		if (vm.quantum>1) {
			vm.quantum--;
			SCREEN.pcb[vm.nombrePA-1].quantumres--;
			if(SCREEN.pcb[vm.nombrePA-1].quantumres==0){
				RoundRobinCPU();
			}
		ActualizarPantalla();
		}
	}
//----------------------------------------------------------------------------------
*/
	function BlockedHistory(){
		for (var i = 1; i < vm.numprocesos; i++) {
			if(SCREEN.pcb[i].state==2 && !SCREEN.pcb[i].blockedIO){
				SCREEN.pcb[i].blockedTime++;
			}
		}
		for (var i = 1; i < vm.numprocesos; i++) {
			if(SCREEN.pcb[i].state==2){
				if(SCREEN.pcb[i].blockedTime>=5){
					SCREEN.pcb[i].state=3;
					//ready.push(i);
					ActStates();
					SCREEN.pcb[i].blockedTime=0;
				}
			}
		}
	}

	function LecturaArchivo($fileContent){
  	var procrunning=0;
  	vm.nohayprocesos=false;
    VerificarArchivo();
    if(vm.isText){
    	var i=1;
    	var numpaglocal=0;
      vm.content = $fileContent;
      var lines = vm.content.split('\n');
      vm.maxpag=parseInt(lines[0]);
      vm.numprocesos=parseInt(lines[1]);
      for (var j=1; j < vm.numprocesos; j++) {		//j es proceso
      	i++;
      	lines[i]=lines[i].replace(" ", "");
  		var detalle = lines[i].split(',');
  		numpaglocal=lines[++i];
  		SCREEN.pcb[j]=new Proceso(parseInt(detalle[0]), parseInt(detalle[1]), parseInt(detalle[2]), parseInt(numpaglocal));
  		for (var k = 0; k < numpaglocal; k++) {		//k es pagina
  			i++;
  			lines[i]=lines[i].replace(" ", "");
  			var detallepag=lines[i].split(',');
  			if(detallepag[0]==1 && detallepag[2]>vm.tiempoA){
  				vm.tiempoA=detallepag[2];
  				}
  			SCREEN.pcb[j].pags[k]= new Pagina(parseInt(detallepag[0]), parseInt(detallepag[1]), parseInt(detallepag[2]), parseInt(detallepag[3]), parseInt(detallepag[4]), parseInt(detallepag[5]));
  			}
  		if(SCREEN.pcb[j].state==1){
  			procrunning=j;
      	}
      	if(SCREEN.pcb[j].state==3){
  			//ready.push(j);
				ActStates();
      	}
      }
      ActualizarPantalla();
      vm.nombreN=vm.numprocesos;
      vm.nombreN++;
    }
    else
      alert(' Error de archivo');
  }

	function UploadArchivo(){
	  angular.element('#upFile').trigger('click');
		//LecturaArchivo($fileContent);
	}

	function VerificarArchivo(){
	  if(angular.element('#upFile')[0].files[0].type == 'text/plain')
	    vm.isText = true;
	  else
	    vm.isText = false;
	}

	function Interrupciones(num){
		var procesoactual=vm.nombrePA;		//tenia -1
		//var num=parseInt(document.getElementById("selectdeinterrupciones").value);
		switch(num){
			case 1:
				SCREEN.pcb[procesoactual].state=4;
				vm.procfinished=true;
				alert("Este proceso a terminado su ejecución.");
				CambiarAlgoritmo();
				break;

			case 2:
				SCREEN.pcb[procesoactual].state=4;
				vm.procfinished=true;
				alert("Este proceso a terminado su ejecución.");
				CambiarAlgoritmo();
				break;

			case 3:
				SCREEN.pcb[procesoactual].blockedIO=true;
				SCREEN.pcb[procesoactual].state=2;
				//blocked.push(procesoactual);
				ActStates();
				vm.hayinterrupcion=true;
				CambiarAlgoritmo();
				break;

			case 4:
				SCREEN.pcb[procesoactual].state=2;
				vm.hayinterrupcion=true;
				CambiarAlgoritmo();
				break;

			case 5:
				SCREEN.pcb[procesoactual].state=4;
				vm.procfinished=true;
				alert("Este proceso a terminado su ejecución.");
				CambiarAlgoritmo();
				break;

			case 6:
				SCREEN.pcb[procesoactual].state=3;
				//ready.push(procesoactual);
				ActStates();
				vm.hayinterrupcion=true;
				CambiarAlgoritmo();
				break;

			case 7:
				var indice=-1;
				if(blocked[0]!=null)
				ActStates();
					//indice=blocked.shift();
				if(indice==-1)
					alert("No existe un proceso esperando respuesta de I/O");
				else{
					SCREEN.pcb[procesoactual].state=3;
					//ready.push(procesoactual);
					ActStates();
					CargarProceso(indice);
					SCREEN.pcb[indice].blockedIO=false;
					ActualizarPantalla();
				}
				break;
		}
	}

	//------------------------------algoritmos de MEMORIA------------------------------
	function FIFOmemoria(){
		var cont=0;
		var procesoactual=vm.nombrePA;		//tenia -1
		var llegadamenor=1000;
		var pagfifo=0;
		for(var i=0; i<SCREEN.pcb[procesoactual].numpags;i++){
				if(SCREEN.pcb[procesoactual].pags[i].r==1){
					if(SCREEN.pcb[procesoactual].pags[i].arrivalTime<llegadamenor){
						llegadamenor=SCREEN.pcb[procesoactual].pags[i].arrivalTime;
						pagfifo=i;
					}
				}
			}
		Resetpg(pagfifo);
	}

	function LRUmemoria(){
		var cont=0;
		var procesoactual=vm.nombrePA;		//tenia -1
		var ultaccmenor=1000;
		var paglru=0;
		for(var i=0; i<SCREEN.pcb[procesoactual].numpags;i++){
				if(SCREEN.pcb[procesoactual].pags[i].r==1){
					if(SCREEN.pcb[procesoactual].pags[i].ultacc<ultaccmenor){
						ultaccmenor=SCREEN.pcb[procesoactual].pags[i].ultacc;
						paglru=i;
					}
				}
			}
		Resetpg(paglru);
	}

	function LFUmemoria(){
		var cont=0;
		var procesoactual=vm.nombrePA;		//tenia -1
		var accesomenor=1000;
		var paglfu=0;
		for(var i=0; i<SCREEN.pcb[procesoactual].numpags;i++){
				if(SCREEN.pcb[procesoactual].pags[i].r==1){
					if(SCREEN.pcb[procesoactual].pags[i].numacc<accesomenor){
						accesomenor=SCREEN.pcb[procesoactual].pags[i].numacc;
						paglfu=i;
					}
				}
			}
		Resetpg(paglfu);
	}

	function NURmemoria(){
		var procesoactual=vm.nombrePA;		//tenia -1
		var pagnur=0;
		for(var j=0; j<4;j++){
							for(var i=SCREEN.pcb[procesoactual].numpags-1; i>=0;i--){
								if(SCREEN.pcb[procesoactual].pags[i].r==1){
									switch(j){
										case 0:
											if(SCREEN.pcb[procesoactual].pags[i].nur1==1 && SCREEN.pcb[procesoactual].pags[i].nur2==1){
												pagnur=i;
											}break;

										case 1:
											if(SCREEN.pcb[procesoactual].pags[i].nur1==1 && SCREEN.pcb[procesoactual].pags[i].nur2==0){
												pagnur=i;
											}break;

										case 2:
											if(SCREEN.pcb[procesoactual].pags[i].nur1==0 && SCREEN.pcb[procesoactual].pags[i].nur2==1){
												pagnur=i;
											}break;

										case 3:
											if(SCREEN.pcb[procesoactual].pags[i].nur1==0 && SCREEN.pcb[procesoactual].pags[i].nur2==0){
												pagnur=i;
											}break;
									}
								}
							}
						}
		Resetpg(pagnur);
	}
//------------------------------fin de algoritmos de MEMORIA------------------------------

	function ResetNUR(){		//es llamado desde el boton
		for(var i=0; i<SCREEN.pcb[vm.nombrePA].numpags;i++){		//tenia -1
			SCREEN.pcb[vm.nombrePA].pags[i].nur1=0;		//tenia -1
			SCREEN.pcb[vm.nombrePA].pags[i].nur2=0;		//tenia -1
			SCREEN.pcb[vm.nombrePA].pags[i].accesosdenur=0;		//tenia -1
		}
		ActualizarPantalla();
	}

	function Cambiarpg() {
		switch(vm.numalgoritmoMemoria){
					case 1:
						FIFOmemoria();break;

					case 2:
						LRUmemoria();break;

					case 3:
						LFUmemoria();break;

					case 4:
						NURmemoria();break;
				}
		Cargarpg();
	}

	function Resetpg(pagina){
		pagina=parseInt(pagina);
		var procesoactual=vm.nombrePA;		//tenia -1
		SCREEN.pcb[procesoactual].pags[pagina].r=0;
		SCREEN.pcb[procesoactual].pags[pagina].arrivalTime=0;
		SCREEN.pcb[procesoactual].pags[pagina].ultacc=0;
		SCREEN.pcb[procesoactual].pags[pagina].numacc=0;
		SCREEN.pcb[procesoactual].pags[pagina].nur1=0;
		SCREEN.pcb[procesoactual].pags[pagina].nur2=0;
	}

	function Cargarpg(){
		var procesoactual=vm.nombrePA;		//tenia -1
		var pag;
		if(vm.toppingUno==true){		//si topping uno esta activo
			pag=1;
		}else{ if(vm.toppingDos==true){	//si topping dos esta activo
						pag=2;
					}else{ if(vm.toppingTres==true){	//si topping tres esta activo
													pag=3;
										}
									}//llave del primer else
					}//llave del segundo else
					//alert(pag);
					//var pag = document.getElementById("pag").value;
		SCREEN.pcb[procesoactual].pags[pag].r=1;
		SCREEN.pcb[procesoactual].pags[pag].arrivalTime=vm.tiempoA;
		SCREEN.pcb[procesoactual].pags[pag].ultacc=vm.tiempoA;
		SCREEN.pcb[procesoactual].pags[pag].numacc=1;
		SCREEN.pcb[procesoactual].pags[pag].nur1=1;
		SCREEN.pcb[procesoactual].pags[pag].accesosdenur=0;
	}

	function Leerpg(){
		var procesoactual=vm.nombrePA;		//tenia -1
		var pag;
		if(vm.toppingUno==true){		//si topping uno esta activo
			pag=1;
		}else{ if(vm.toppingDos==true){	//si topping dos esta activo
						pag=2;
					}else{ if(vm.toppingTres==true){	//si topping tres esta activo
													pag=3;
										}
									}//llave del primer else
					}//llave del segundo else
					//alert(pag);
					//var pag = document.getElementById("pag").value;
		SCREEN.pcb[procesoactual].pags[pag].ultacc=vm.tiempoA;
		SCREEN.pcb[procesoactual].pags[pag].numacc++;
		SCREEN.pcb[procesoactual].pags[pag].accesosdenur++;
		SCREEN.pcb[procesoactual].pags[pag].nur1=1;
		if(SCREEN.pcb[procesoactual].pags[pag].accesosdenur>4){
			SCREEN.pcb[procesoactual].pags[pag].nur2=1;
		}
	}

	function Ejecutarpg(){
		vm.tiempoA++;
		BlockedHistory();
		vm.fallopag=false;
		vm.procfinished=false;
		//tengo que obtener el valor del topping
		var pag;
		if(vm.toppingUno==true){		//si topping uno esta activo
			pag=1;
		}else{ if(vm.toppingDos==true){	//si topping dos esta activo
						pag=2;
					}else{ if(vm.toppingTres==true){	//si topping tres esta activo
													pag=3;
										}
									}//llave del primer else
					}//llave del segundo else
					//alert(pag);
		//var pag = document.getElementById("pag").value;
		var procesoactual=vm.nombrePA;		//tenia -1
		SCREEN.pcb[procesoactual].serviceTime++;
		SCREEN.pcb[procesoactual].timeUntilComplete--;
		SCREEN.pcb[procesoactual].quantumres--;
		ActEnvejecimiento();
		if(SCREEN.pcb[procesoactual].timeUntilComplete==0){
			SCREEN.pcb[procesoactual].state=4;
			vm.procfinished=true;
			alert("Este proceso a terminado su ejecución.");
			CambiarAlgoritmo();
		}else{
			var cont=0;
			for(var i=0; i<SCREEN.pcb[procesoactual].numpags;i++){
				if(SCREEN.pcb[procesoactual].pags[i].r==1){
					cont++;
				}
			}
			if(SCREEN.pcb[procesoactual].pags[pag].r==0){
				if(cont<vm.maxpag){
					Cargarpg();
				}else{
					Cambiarpg();
				}
				SCREEN.pcb[procesoactual].state=2;
				SCREEN.pcb[procesoactual].quantumres=0;
				vm.fallopag=true;
				alert("Ocurrió un fallo de página, es momento de cambiar de proceso.");
				CambiarAlgoritmo();
			}else{
				Leerpg();
				CambiarAlgoritmo();
			}
		}
		vm.disableButton=false;
	}

	function AlgoritmoMemoria(num){
	 	vm.numalgoritmoMemoria=num;
		switch(vm.numalgoritmoMemoria){
			case 1: vm.algoritmoMemoria="FIFO";break;
			case 2: vm.algoritmoMemoria="LRU";break;
			case 3: vm.algoritmoMemoria="LFU";break;
			case 4: vm.algoritmoMemoria="NUR";break;
			default: vm.algoritmoMemoria="NUR";break;
		}
		//alert(vm.numalgoritmoMemoria);
	}

	//ELIMINAR ESTOS DOS!!-----------------------------------------ELIMINAR ESTOS DOS!!
	function Maspg(){
		vm.numpag++;
	}

	function Menospg(){
		if (vm.numpag>1) {
			vm.numpag--;
		}
	}
	//----------------------------------------------------------------------------------


	function CreateProceso(){
		//if(vm.nombreN>1){
			vm.nombreN++;
		//}
		var nuevo=vm.nombreN;
		if(vm.nombreN>1){		//si hay mas de 1 proceso
			vm.procesoOld=--nuevo;
		}
  	var bt = document.getElementById("burstTime").value;		//obtengo el valor del input en bt
		var pg = document.getElementById("page").value;					//obtengo el valor del input en pg
		//console.log(bt);
		//console.log(pg);
		//alert(vm.numprocesos);
  	SCREEN.pcb[vm.numprocesos]=new Proceso(vm.tiempoA, bt, 3, vm.numpag);	//automaticamente le das ready
  	for(var p=0; p < vm.numpag; p++){
  		SCREEN.pcb[vm.numprocesos].pags[p]=new Pagina(0,0,0,0,0,0);		//se asignan sus atributos de paginas
  }
  	if(vm.nohayprocesos){
  		SCREEN.pcb[vm.numprocesos].state=1;			//si no hay procesos se va a running
  		vm.nohayprocesos=false;
  	}else{
			//vm.numprocesos++;
			//alert(vm.procesoOld);
			vm.procesoOld=vm.procesoOld-1;
			//ready.push(vm.procesoOld);			//si ya hay un proceso en running
			ActStates();
			vm.procesoOld=vm.procesoOld+1;
		}
		vm.numprocesos++;
  	ActualizarPantalla();
  	//vm.numprocesos++;
  }

	function ActStates(){
			document.getElementById("Running").innerHTML = vm.nombrePA;	//remplaza lo escrito para poner el nombre
			/*
			var stringselectready="";
			var stringselectblocked="";
			var stringselectfinish="";
			*/
			var bool=false;
			for(var l=1; l<vm.numprocesos;l++){
				if(SCREEN.pcb[l].state==2){
					//stringselectblocked+="<option>"+(l+1)+"</option>";
					//l=l+1;
					//alert("Blocked el proceso "+l);
					//l=l-1;
					for(var i=0; i<blocked.length; i++){
						if(blocked[i]==l){
							bool = true;
						}
					}
					if(!bool){		//si no se repite el numero
						//alert("Blocked el proceso "+l);
						blocked.push(l);
					}
					bool=false;
				}
				if(SCREEN.pcb[l].state==3){
					//stringselectready+="<option>"+(l+1)+"</option>";
					//l=l+1;
					//alert("Ready el proceso "+l);
					//l=l-1;
					for(var i=0; i<ready.length; i++){
						if(ready[i]==l){
							bool = true;
						}
					}
					if(!bool){		//si no se repite el numero
						//alert("Ready el proceso "+l);
						ready.push(l);
					}
					bool=false;
				}
				if(SCREEN.pcb[l].state==4){
					//stringselectfinish+="<option>"+(l+1)+"</option>";
					//l=l+1;
					//alert("Finish el proceso "+l);
					//l=l-1;
					for(var i=0; i<finished.length; i++){
						if(finished[i]==l){
							bool = true;
						}
					}
					if(!bool){		//si no se repite el numero
						//alert("Finish el proceso "+l);
						finished.push(l);
					}
					bool=false;
				}
			}

			//comparar que los procesos no esten en otro estado
			for(var i=0; i<ready.length; i++){
				for(var j=0; j<blocked.length; j++){
						if(ready[i]==blocked[j]){
							blocked.shift(j);
					}
				}
			}
			//StateArray();
			document.getElementById("Blocked").innerHTML = blocked.toString();
			document.getElementById("Ready").innerHTML = ready.toString();
			document.getElementById("Finished").innerHTML = finished.toString();
			//ReturnArray();
		}

		function Contarpg(pag){
			//alert(pag);
			if(pag==1){
				vm.toppingUno=false;
				vm.toppingDos=false;
				vm.toppingTres=false;
				vm.disableUno=true;
				vm.disableDos=false;
				vm.disableTres=false;
				//vm.pagina=[1];
				//document.getElementById("pag").setAttribute("max", SCREEN.pcb[i].numpags-1);
			}else{ if(pag==2){
				vm.toppingUno=false;
				vm.toppingDos=false;
				vm.toppingTres=false;
				vm.disableUno=true;
				vm.disableDos=true;
				vm.disableTres=false;
				//vm.pagina=[1,2];
				//document.getElementById("pag").setAttribute(vm.pagina);
							}else{ if(pag==3){
								vm.toppingUno=false;
								vm.toppingDos=false;
								vm.toppingTres=false;
								vm.disableUno=true;
								vm.disableDos=true;
								vm.disableTres=true;
								//vm.pagina=[1,2,3];
								//document.getElementById("pag").setAttribute(vm.pagina);
																}
										}//ultimo else
						}//segundo else
		}

		function Toppings(num){
			//alert(num);
			if(num==1){
				vm.toppingUno=false;
				vm.disableUno=true;
				vm.disableDos=false;
				vm.disableTres=false;
				vm.disableButton=true;
				//vm.toppingDos=false;
				//vm.toppingTres=false;
			}else{ if(num==2){
				//vm.toppingUno=false;
				vm.toppingDos=false;
				vm.disableUno=false;
				vm.disableDos=true;
				vm.disableTres=false;
				vm.disableButton=true;
				//vm.toppingTres=false;
							}else{ if(num==3){
								//vm.toppingUno=false;
								//vm.toppingDos=false;
								vm.toppingTres=false;
								vm.disableUno=false;
								vm.disableDos=false;
								vm.disableTres=true;
								vm.disableButton=true;
																}
										}//ultimo else
						}//segundo else
		}

		function obtenerQ(){
			var tamq = document.getElementById("quantum0").value;
			vm.Uquantum = tamq;
			alert("El tamaño del quantum es "+tamq);
		}

/*
		function StateArray(){
			var temp=0;
			var sizer=ready.length;
			var sizeb=blocked.length;
			var sizef=finished.length;


			for(var l=0; l<sizer;l++){
				temp=ready.shift();
				temp=temp+1;
				r[l]=temp;
				alert(r[l]);
			}


			for(var l=0; l<sizeb;l++){
				temp=blocked.shift();
				temp=temp+1;
				b[l]=temp;
			}

			for(var l=0; l<sizef;l++){
				temp=finished.shift();
				temp=temp+1;
				f[l]=temp;
			}
		}

		function ReturnArray(){
			var temp=0;
			var sizer=r.length;
			var sizeb=b.length;
			var sizef=f.length;

			for(var l=0; l<sizer;l++){
				temp=r.shift();
				temp=temp+1;
				ready[l]=temp;
			}

			for(var l=0; l<sizeb;l++){
				temp=b.shift();
				temp=temp+1;
				blocked[l]=temp;
			}

			for(var l=0; l<sizef;l++){
				temp=f.shift();
				temp=temp+1;
				finished[l]=temp;
			}
		}
		*/

/*
		function printArray(){
			ready.toString();
			console.log(ready);
		}

		vm.printArray=printArray;

//lo agregado por NANCY

		//vm.pagina = [1,2,3,4,5];

	  //vm.entrevistaTipo = ["1","2","3","4"];
		*/

} //llave de mi funcion controller

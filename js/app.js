//   json-server --watch db.json --port 4000
let cliente = {
    mesa: '',
    hora: '',
    pedido: []
};

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    //Revisar si hay campos vacios
    const camposVacios = [ mesa, hora ].some( campo => campo === '' );

    if(camposVacios) {
        //Verificar si ya hay una alerta
        const existeAlerta = document.querySelector('.invalid-feedback');

        if(!existeAlerta) {
            const alerta = document.querySelector('.modal-body form');

            const alertaDiv = document.createElement('div');
            alertaDiv.classList.add('invalid-feedback', 'd-block', 'text-center');
            alertaDiv.textContent = 'Todos los campos son obligatorios';
    
            alerta.appendChild(alertaDiv);

            //Eliminar alerta
            setTimeout(() => {
                alertaDiv.remove();
            }, 3000);
        }

        return;

    }
    
    //Asignar datos del formulario
    cliente = { ...cliente, mesa, hora }

    //Ocultar modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();

    //Mostrar secciones
    mostrarSecciones();

    //Obterner platillos de la api
    obternerPatillos();
}

function mostrarSecciones() {
    const seccionesOcultas = document.querySelectorAll('.d-none');

    seccionesOcultas.forEach( seccion => seccion.classList.remove('d-none') );
}

function obternerPatillos() {
    const url = 'http://localhost:4000/platillos';

    fetch(url)
        .then( respuesta => respuesta.json() )
        .then( resultado => mostrarPlatillos(resultado) )
        .catch( error => console.log(error) )
}

function mostrarPlatillos(platillos) {
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach( platillo => {
        const row = document.createElement('div');
        row.classList.add('row', 'py-3', 'border-top');

        const nombre = document.createElement('div');
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('div');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `$ ${platillo.precio}`;

        const categoria = document.createElement('div');
        categoria.classList.add('col-md-3', 'fw-bold');
        categoria.textContent = categorias[ platillo.categoria ];

        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control');

        //Funcion que detecta la cantida y el platillo que se esta agregando
        inputCantidad.onchange = function() {
            const cantidad = parseInt(inputCantidad.value);
            agregarPlatillo({...platillo, cantidad});
        }

        const agregar = document.createElement('div');
        agregar.classList.add('col-md-2');

        agregar.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);

        contenido.appendChild(row);
    });
}

function agregarPlatillo(producto) {
    //Extraer pedido actual
    let {pedido} = cliente;
    //Revisar que la cantidad sea mayor a 0
    if(producto.cantidad > 0) {

        //Comprueba si el elemento ya existe en el arreglo
        if( pedido.some( articulo => articulo.id === producto.id ) ) {
            //El articulo ya existe,Actualizar la cantidad al arreglo de pedido
            const pedidoActualizado = pedido.map( articulo => {
                if( articulo.id === producto.id ) {
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            });
            //Se asigna el nuevo array a cliente.pedido
            cliente.pedido = [...pedidoActualizado];
        } else {
            //El articulo no existe, lo agregamos al arreglo de pedido
            cliente.pedido = [...pedido, producto];
        }
    } else {
        //Eliminar elemento cuando la cantidad es 0
        const resultado = pedido.filter( articulo => articulo.id !== producto.id );
        cliente.pedido = [...resultado];
    }
    //LimpiarHtml
    limpiarHTML();

    if( cliente.pedido.length ) {
        //Mostrar el resumen
        actualizarResumen();

    } else {
        mensajePedidoVacio();

    }
    
}

function actualizarResumen() {
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('div');
    resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

    //Mesa
    const mesa = document.createElement('p');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('span');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    //Hora
    const hora = document.createElement('p');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('span');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    //Agregar a elemntos padre
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    //Titulo de la seccion
    const heading = document.createElement('h3');
    heading.textContent = 'Platillos Consumidos';
    heading.classList.add('my-4', 'text-center');

    //Iterar sobre el array de pedidos
    const grupo = document.createElement('ul');
    grupo.classList.add('lista-grupo');

    const { pedido } = cliente;
    pedido.forEach( articulo => {
        const { nombre, cantidad, precio, id } = articulo;

        const lista = document.createElement('li');
        lista.classList.add('list-group-item');

        //Nombre
        const nombreElemento = document.createElement('h4');
        nombreElemento.classList.add('my-4');
        nombreElemento.textContent = nombre;

        //Cantidad
        const cantidadElemento = document.createElement('p');
        cantidadElemento.classList.add('fw-bold');
        cantidadElemento.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('span');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        //Precio
        const precioElemento = document.createElement('p');
        precioElemento.classList.add('fw-bold');
        precioElemento.textContent = 'Precio unidad: ';

        const precioValor = document.createElement('span');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$ ${precio}`;

        //SubTotal
        const subtotalElemento = document.createElement('p');
        subtotalElemento.classList.add('fw-bold');
        subtotalElemento.textContent = 'SubTotal: ';

        const subtotalValor = document.createElement('span');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal( precio, cantidad );

        //Boton para Eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar';

        //Funcion para eliminar del pedido
        btnEliminar.onclick = function() {
            eliminarProducto(id);
        }

        //Agregar valores a sus contenedores
        cantidadElemento.appendChild(cantidadValor);
        precioElemento.appendChild(precioValor);
        subtotalElemento.appendChild(subtotalValor);

        //Agregar elementos al li
        lista.appendChild(nombreElemento);
        lista.appendChild(cantidadElemento);
        lista.appendChild(precioElemento);
        lista.appendChild(subtotalElemento);
        lista.appendChild(btnEliminar);

        //Agregar lista a grupo principal
        grupo.appendChild(lista);
    });

    //Agregar al contenido
    
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);

    //Mostrar formulario de propinas
    formularioPropinas();
}

function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido');
    while( contenido.firstChild ) {
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(precio, cantidad) {
    let subtotal = precio * cantidad;

    return `$ ${subtotal}`;
}

function eliminarProducto(id) {
    const { pedido } = cliente;

     //Eliminar elemento cuadno la cantidad es 0
     const resultado = pedido.filter( articulo => articulo.id !== id );
     cliente.pedido = [...resultado];

    //LimpiarHtml
    limpiarHTML();
    
    if( cliente.pedido.length ) {
        //Mostrar el resumen
        actualizarResumen();

    } else {
        mensajePedidoVacio();
        
    }

    //El producto se elimino regresamos a 0 el formulario
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;



}

function mensajePedidoVacio() {
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('p');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pueblo';

    contenido.appendChild(texto);
}

function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido');
    
    const formulario = document.createElement('div');
    formulario.classList.add('col-md-6', 'formulario');

    const divformulario = document.createElement('div');
    divformulario.classList.add( 'card', 'py-2', 'px-3', 'shadow');

    const heading = document.createElement('h3');
    heading.textContent = 'Propina';
    heading.classList.add('my-4', 'text-center');

    //Radio button sin propina
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'propina';
    radio.value = '0';
    radio.classList.add('form-check-input');
    radio.onclick = calcularPropina;

    const radioLabel = document.createElement('label');
    radioLabel.textContent = 'Sin propina ';
    radioLabel.classList.add('form-check-label');

    const radioDiv = document.createElement('div');
    radioDiv.classList.add('form-check');

    radioDiv.appendChild(radio);
    radioDiv.appendChild(radioLabel);

    //Radio button propina 5%
    const radio5 = document.createElement('input');
    radio5.type = 'radio';
    radio5.name = 'propina';
    radio5.value = '5';
    radio5.classList.add('form-check-input');
    radio5.onclick = calcularPropina;

    const radio5Label = document.createElement('label');
    radio5Label.textContent = '5% ';
    radio5Label.classList.add('form-check-label');

    const radio5Div = document.createElement('div');
    radio5Div.classList.add('form-check');

    radio5Div.appendChild(radio5);
    radio5Div.appendChild(radio5Label);

    //Radio button propina 10%
    const radio10 = document.createElement('input');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('label');
    radio10Label.textContent = '10% ';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('div');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    //Radio button propina 15%
    const radio15 = document.createElement('input');
    radio15.type = 'radio';
    radio15.name = 'propina';
    radio15.value = '15';
    radio15.classList.add('form-check-input');
    radio15.onclick = calcularPropina;

    const radio15Label = document.createElement('label');
    radio15Label.textContent = '15% ';
    radio15Label.classList.add('form-check-label');

    const radio15Div = document.createElement('div');
    radio15Div.classList.add('form-check');

    radio15Div.appendChild(radio15);
    radio15Div.appendChild(radio15Label);

    //Radio button propina 20%
    const radio20 = document.createElement('input');
    radio20.type = 'radio';
    radio20.name = 'propina';
    radio20.value = '20';
    radio20.classList.add('form-check-input');
    radio20.onclick = calcularPropina;

    const radio20Label = document.createElement('label');
    radio20Label.textContent = '20% ';
    radio20Label.classList.add('form-check-label');

    const radio20Div = document.createElement('div');
    radio20Div.classList.add('form-check');

    radio20Div.appendChild(radio20);
    radio20Div.appendChild(radio20Label);

    //Radio button propina 30%
    const radio30 = document.createElement('input');
    radio30.type = 'radio';
    radio30.name = 'propina';
    radio30.value = '30';
    radio30.classList.add('form-check-input');
    radio30.onclick = calcularPropina;

    const radio30Label = document.createElement('label');
    radio30Label.textContent = '30% ';
    radio30Label.classList.add('form-check-label');

    const radio30Div = document.createElement('div');
    radio30Div.classList.add('form-check');

    radio30Div.appendChild(radio30);
    radio30Div.appendChild(radio30Label);

    //Radio button propina 40%
    const radio40 = document.createElement('input');
    radio40.type = 'radio';
    radio40.name = 'propina';
    radio40.value = '40';
    radio40.classList.add('form-check-input');
    radio40.onclick = calcularPropina;

    const radio40Label = document.createElement('label');
    radio40Label.textContent = '40% ';
    radio40Label.classList.add('form-check-label');

    const radio40Div = document.createElement('div');
    radio40Div.classList.add('form-check');

    radio40Div.appendChild(radio40);
    radio40Div.appendChild(radio40Label);

    //Agregar al div principal
    divformulario.appendChild(heading);
    divformulario.appendChild(radioDiv);
    divformulario.appendChild(radio5Div);
    divformulario.appendChild(radio10Div);
    divformulario.appendChild(radio15Div);
    divformulario.appendChild(radio20Div);
    divformulario.appendChild(radio30Div);
    divformulario.appendChild(radio40Div);

    formulario.appendChild(divformulario);
    
    //Agregar al formulario
    contenido.appendChild(formulario);
    
}

function calcularPropina() {

    const { pedido } = cliente;
    let subtotal = 0;

    //Calcular el subtotal a a pagar
    pedido.forEach( articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    });

    //Selecciona el radio del boton de la propina
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    //Calcular la propina
    const propina = ((subtotal * parseInt( propinaSeleccionada )) / 100 );

    //Calcular el total a pagar
    const total = subtotal + propina;

    mostrarTotalHTML( subtotal, total, propina );
}

function mostrarTotalHTML( subtotal, total, propina ) {

    const divTotales = document.createElement('div');
    divTotales.classList.add('total-pagar', 'my-5');

    //Subtotal
    const subtotalParrafo = document.createElement('p');
    subtotalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    subtotalParrafo.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('span');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$ ${subtotal}`;


    subtotalParrafo.appendChild(subtotalSpan);

    //Propina
    const propinaParrafo = document.createElement('p');
    propinaParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('span');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$ ${propina}`;


    propinaParrafo.appendChild(propinaSpan);

    //Total
    const totalParrafo = document.createElement('p');
    totalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    totalParrafo.textContent = 'Total Consumo: ';

    const totalSpan = document.createElement('span');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$ ${total}`;


    totalParrafo.appendChild(totalSpan);

    //Eliminar el ultimmo resultado
    const totalPagarDiv = document.querySelector('.total-pagar');
    if(totalPagarDiv) {
        totalPagarDiv.remove();
    }
    
    //Agregar al div principal
    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    //Agregar el div al formulario
    const formulario = document.querySelector('.formulario > div');
    formulario.appendChild(divTotales);


}
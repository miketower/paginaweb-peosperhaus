(() => {
    const cabecera = document.getElementById('cabecera');
    const boton = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu-principal');
    if (!cabecera || !boton || !menu) return;

    const escritorio = window.matchMedia('(min-width: 1280px)');
    function cambiar(abierto, devolverFoco = false) {
        cabecera.classList.toggle('menu-abierto', abierto);
        boton.setAttribute('aria-expanded', String(abierto));
        boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
        if (devolverFoco) boton.focus({ preventScroll: true });
    }

    cabecera.classList.add('menu-listo');
    boton.hidden = false;
    boton.addEventListener('click', () => cambiar(boton.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (evento) => {
        const enlace = evento.target.closest('a');
        if (!enlace || escritorio.matches) return;
        cambiar(false, true);
    });
    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape' && boton.getAttribute('aria-expanded') === 'true') {
            cambiar(false, true);
        }
    });
    document.addEventListener('click', (evento) => {
        if (!cabecera.contains(evento.target)) cambiar(false);
    });
    document.addEventListener('focusin', (evento) => {
        if (!cabecera.contains(evento.target)) cambiar(false);
    });
    escritorio.addEventListener('change', () => {
        const focoDentro = menu.contains(document.activeElement);
        cambiar(false, !escritorio.matches && focoDentro);
    });
})();

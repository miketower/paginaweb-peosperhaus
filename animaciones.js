(() => {
    const elementos = [...document.querySelectorAll('[data-reveal]')];
    const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preferencia.matches || !('IntersectionObserver' in window)) return;

    function mostrar(elemento, inmediato = false) {
        if (inmediato) elemento.style.transition = 'none';
        elemento.classList.remove('reveal-pending');
        observador.unobserve(elemento);
    }

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) mostrar(entrada.target);
        });
    }, { threshold: 0, rootMargin: '0px 0px -32px 0px' });

    elementos.forEach((elemento) => {
        // Deja visible el contenido inicial y los destinos de enlaces directos.
        if (elemento.getBoundingClientRect().top < window.innerHeight - 32) return;
        const hermanos = [...elemento.parentElement.children].filter((hijo) => hijo.hasAttribute('data-reveal'));
        elemento.style.setProperty('--reveal-delay', `${Math.min(hermanos.indexOf(elemento), 3) * 80}ms`);
        elemento.classList.add('reveal-visible', 'reveal-pending');
        observador.observe(elemento);
    });

    // El acceso con teclado muestra inmediatamente el bloque enfocado.
    document.addEventListener('focusin', (evento) => {
        const elemento = evento.target.closest('[data-reveal]');
        if (elemento) mostrar(elemento, true);
    });

    preferencia.addEventListener('change', (evento) => {
        if (!evento.matches) return;
        elementos.forEach((elemento) => mostrar(elemento, true));
        observador.disconnect();
    });
})();

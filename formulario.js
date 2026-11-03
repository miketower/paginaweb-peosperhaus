(() => {
    const formulario = document.getElementById('formulario-incorporacion');
    const dialogo = document.getElementById('resultado-solicitud');
    // Conserva el envío HTML tradicional si el navegador no admite esta mejora.
    if (!formulario || !dialogo || !window.fetch || typeof dialogo.showModal !== 'function') return;

    const boton = formulario.querySelector('button[type="submit"]');
    const titulo = document.getElementById('resultado-titulo');
    const mensaje = document.getElementById('resultado-mensaje');
    const icono = document.getElementById('resultado-icono');
    let enviando = false;

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        if (enviando) return;
        enviando = true;
        const textoOriginal = boton.textContent;
        boton.disabled = true;
        boton.textContent = 'Enviando solicitud…';
        formulario.setAttribute('aria-busy', 'true');

        try {
            const respuesta = await fetch(formulario.action, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: new FormData(formulario),
            });
            const resultado = await respuesta.json();
            if (typeof resultado.ok !== 'boolean' || typeof resultado.titulo !== 'string'
                || typeof resultado.mensaje !== 'string') {
                throw new Error('Respuesta inesperada');
            }
            const exito = respuesta.ok && resultado.ok;
            dialogo.dataset.estado = exito ? 'exito' : 'error';
            icono.textContent = exito ? '✓' : '!';
            titulo.textContent = resultado.titulo;
            mensaje.textContent = resultado.mensaje;
            if (exito) formulario.reset();
        } catch {
            dialogo.dataset.estado = 'error';
            icono.textContent = '!';
            titulo.textContent = 'No pudimos confirmar el envío';
            mensaje.textContent = 'Revisa tu conexión. Conservamos tus datos en el formulario. Si el envío se interrumpió, la solicitud podría haberse guardado; evita reenviarla sin comprobarlo.';
        } finally {
            enviando = false;
            boton.disabled = false;
            boton.textContent = textoOriginal;
            formulario.removeAttribute('aria-busy');
        }
        dialogo.showModal();
    });
})();

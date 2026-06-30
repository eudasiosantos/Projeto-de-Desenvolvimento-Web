function formatarDataBR(dataISO) {
  if (!dataISO) return '';
  return dataISO.split('-').reverse().join('/');
}

document.addEventListener('DOMContentLoaded', () => {
  // Menu Mobile Toggle
  const btnMenuMobile = document.querySelector('.btn-menu-mobile');
  const menu = document.querySelector('.menu');
  if (btnMenuMobile && menu) {
    btnMenuMobile.addEventListener('click', () => {
      menu.classList.toggle('aberto');
    });
  }

  // Container de Avisos (index.html)
  const avisosContainer = document.getElementById('avisos-dinamicos');
  if (avisosContainer) {
    db.collection("avisos").orderBy("criadoEm", "desc").limit(4).onSnapshot(snapshot => {
      avisosContainer.innerHTML = '';
      if (snapshot.empty) {
        avisosContainer.innerHTML = '<p>Nenhum aviso no momento.</p>';
        return;
      }
      snapshot.forEach(doc => {
        const data = doc.data();
        avisosContainer.innerHTML += `
          <div class="aviso">
            <h3>${data.titulo}</h3>
            <p>${formatarDataBR(data.data)}</p>
          </div>
        `;
      });
    });
  }

  // Container de Notícias na Home (index.html)
  const noticiasHomeContainer = document.getElementById('noticias-home-dinamicas');
  if (noticiasHomeContainer) {
    db.collection("noticias").orderBy("criadoEm", "desc").limit(3).onSnapshot(snapshot => {
      noticiasHomeContainer.innerHTML = '';
      if (snapshot.empty) {
        noticiasHomeContainer.innerHTML = '<p>Nenhuma notícia no momento.</p>';
        return;
      }
      snapshot.forEach(doc => {
        const data = doc.data();
        let resumoCurto = data.resumo || '';
        if (resumoCurto.length > 200) {
          resumoCurto = resumoCurto.substring(0, 200) + '...';
        }
        noticiasHomeContainer.innerHTML += `
          <article class="card-noticia">
            <img src="${data.imagem || 'img/noticia1.jpg'}" alt="${data.titulo}">
            <p>${formatarDataBR(data.data)}</p>
            <h3>${data.titulo}</h3>
            <p>${resumoCurto}</p>
            <a href="noticias.html">Ler mais</a>
          </article>
        `;
      });
    });
  }

  // Container de Notícias na Página de Notícias (noticias.html)
  const noticiasPageContainer = document.getElementById('lista-noticias-dinamicas');
  const inputBusca = document.getElementById('input-busca-noticias');
  const btnVerMais = document.getElementById('btn-ver-mais-noticias');

  if (noticiasPageContainer) {
    let todasNoticias = [];
    let noticiasFiltradas = [];
    let limite = 4;

    const renderNoticias = () => {
      noticiasPageContainer.innerHTML = '';
      if (noticiasFiltradas.length === 0) {
        noticiasPageContainer.innerHTML = '<p>Nenhuma notícia encontrada.</p>';
        if (btnVerMais) btnVerMais.style.display = 'none';
        return;
      }

      const noticiasParaMostrar = noticiasFiltradas.slice(0, limite);
      
      noticiasParaMostrar.forEach(data => {
        noticiasPageContainer.innerHTML += `
          <article class="noticia-linha">
            <img src="${data.imagem || 'img/noticia1.jpg'}" alt="${data.titulo}">
            <div class="noticia-conteudo">
              <div class="noticia-meta">
                <span class="tag">${data.categoria}</span>
                <span>${formatarDataBR(data.data)}</span>
              </div>
              <h3>${data.tituloCompleto || data.titulo}</h3>
              <p>${data.resumo}</p>
            </div>
          </article>
        `;
      });

      if (btnVerMais) {
        if (limite >= noticiasFiltradas.length) {
          btnVerMais.style.display = 'none';
        } else {
          btnVerMais.style.display = 'inline-block';
        }
      }
    };

    db.collection("noticias").orderBy("criadoEm", "desc").onSnapshot(snapshot => {
      todasNoticias = [];
      snapshot.forEach(doc => {
        todasNoticias.push(doc.data());
      });
      // Aplica o filtro atual ao receber novos dados
      if (inputBusca && inputBusca.value) {
        const termo = inputBusca.value.toLowerCase();
        noticiasFiltradas = todasNoticias.filter(n => 
          n.titulo.toLowerCase().includes(termo) || 
          (n.resumo && n.resumo.toLowerCase().includes(termo))
        );
      } else {
        noticiasFiltradas = [...todasNoticias];
      }
      renderNoticias();
    });

    if (inputBusca) {
      inputBusca.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        noticiasFiltradas = todasNoticias.filter(n => 
          n.titulo.toLowerCase().includes(termo) || 
          (n.resumo && n.resumo.toLowerCase().includes(termo))
        );
        limite = 4; // Reseta o limite de exibição sempre que busca algo novo
        renderNoticias();
      });
    }

    if (btnVerMais) {
      btnVerMais.addEventListener('click', () => {
        limite += 4;
        renderNoticias();
      });
    }
  }

  // Container de Eventos na Home (index.html)
  const eventosHomeContainer = document.getElementById('eventos-home-dinamicos');
  if (eventosHomeContainer) {
    db.collection("eventos").orderBy("criadoEm", "asc").limit(4).onSnapshot(snapshot => {
      eventosHomeContainer.innerHTML = '';
      if (snapshot.empty) {
        eventosHomeContainer.innerHTML = '<tr><td colspan="4">Nenhum evento no momento.</td></tr>';
        return;
      }
      snapshot.forEach(doc => {
        const data = doc.data();
        eventosHomeContainer.innerHTML += `
          <tr>
            <td>${data.titulo}</td>
            <td>${formatarDataBR(data.data)}</td>
            <td>${data.horario || '--:--'}</td>
            <td>${data.local}</td>
          </tr>
        `;
      });
    });
  }

  // Container de Eventos na Página de Eventos (eventos.html)
  const eventosPageContainer = document.getElementById('eventos-page-dinamicos');
  if (eventosPageContainer) {
    db.collection("eventos").orderBy("criadoEm", "asc").onSnapshot(snapshot => {
      eventosPageContainer.innerHTML = '';
      if (snapshot.empty) {
        eventosPageContainer.innerHTML = '<p>Nenhum evento agendado.</p>';
        return;
      }
      snapshot.forEach(doc => {
        const data = doc.data();
        const destaqueClass = data.destaque ? 'destaque' : '';
        eventosPageContainer.innerHTML += `
          <article class="evento-card ${destaqueClass}">
            <h3>${data.titulo}</h3>
            <div class="evento-meta">${formatarDataBR(data.data)} • ${data.horario || '--:--'} • ${data.local}</div>
            <p>${data.descricao}</p>
          </article>
        `;
      });
    });
  }

  // Formulário de Contato (contato.html)
  const formContato = document.getElementById('form-contato');
  if (formContato) {
    formContato.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = document.getElementById('nome').value;
      const email = document.getElementById('email').value;
      const mensagem = document.getElementById('mensagem').value;
      const botaoSubmit = formContato.querySelector('button[type="submit"]');

      // Desabilitar botão para evitar duplo clique
      botaoSubmit.disabled = true;
      botaoSubmit.textContent = 'Enviando...';

      db.collection("mensagens").add({
        nome: nome,
        email: email,
        mensagem: mensagem,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        alert("Sua mensagem foi enviada com sucesso! A escola entrará em contato em breve.");
        formContato.reset();
        botaoSubmit.disabled = false;
        botaoSubmit.textContent = 'Enviar Mensagem';
      }).catch(err => {
        console.error("Erro ao enviar mensagem:", err);
        alert("Erro ao enviar a mensagem. Tente novamente mais tarde.");
        botaoSubmit.disabled = false;
        botaoSubmit.textContent = 'Enviar Mensagem';
      });
    });
  }
});

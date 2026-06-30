function formatarDataBR(dataISO) {
  if (!dataISO) return '';
  return dataISO.split('-').reverse().join('/');
}

document.addEventListener('DOMContentLoaded', () => {
  // --- PROTEÇÃO DE ROTA E INICIALIZAÇÃO ---
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'login.html';
    }
  });

  // --- LOGOUT ---
  const btnSair = document.getElementById('btn-sair');
  if (btnSair) {
    btnSair.addEventListener('click', (e) => {
      e.preventDefault();
      auth.signOut().then(() => {
        window.location.href = 'login.html';
      });
    });
  }

  // --- NAVEGAÇÃO DE ABAS E SEÇÕES (MOVIDO DO HTML) ---
  const abas = document.querySelectorAll('.aba');
  const secoes = document.querySelectorAll('.admin-secao');
  const botoes = document.querySelectorAll('[data-ir-para]');

  function mostrarSecao(id) {
    secoes.forEach(secao => {
      secao.classList.toggle('secao-oculta', secao.id !== id);
    });
    abas.forEach(aba => {
      aba.classList.toggle('ativa', aba.dataset.secao === id);
    });
  }

  abas.forEach(aba => {
    aba.addEventListener('click', () => mostrarSecao(aba.dataset.secao));
  });

  botoes.forEach(botao => {
    botao.addEventListener('click', () => {
      const alvo = botao.dataset.irPara;
      if (alvo === 'noticias' || alvo === 'form-noticia') mostrarSecao('noticias');
      if (alvo === 'eventos' || alvo === 'form-evento') mostrarSecao('eventos');
      if (alvo === 'avisos' || alvo === 'form-aviso') mostrarSecao('avisos');

      setTimeout(() => {
        const el = document.getElementById(alvo);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    });
  });

  // Inicia na aba de dashboard
  mostrarSecao('dashboard');

  // --- INTEGRAÇÃO FIRESTORE ---

  let editIdAviso = null;
  let editIdNoticia = null;
  let editIdEvento = null;

  window.editarDocumento = function(colecao, id) {
    db.collection(colecao).doc(id).get().then(doc => {
      if (!doc.exists) return;
      const data = doc.data();
      if (colecao === 'avisos') {
        document.getElementById('avisoTitulo').value = data.titulo;
        document.getElementById('avisoData').value = data.data;
        document.getElementById('avisoDescricao').value = data.descricao;
        editIdAviso = id;
        const formAviso = document.getElementById('form-aviso-add');
        formAviso.querySelector('button[type="submit"]').textContent = 'Atualizar Aviso';
        formAviso.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (colecao === 'noticias') {
        document.getElementById('noticiaTitulo').value = data.titulo;
        document.getElementById('noticiaData').value = data.data;
        document.getElementById('noticiaCategoria').value = data.categoria;
        document.getElementById('noticiaImagem').value = data.imagem || '';
        document.getElementById('noticiaResumo').value = data.resumo;
        editIdNoticia = id;
        const formNoticia = document.getElementById('form-noticia-add');
        formNoticia.querySelector('button[type="submit"]').textContent = 'Atualizar Notícia';
        formNoticia.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (colecao === 'eventos') {
        document.getElementById('eventoTitulo').value = data.titulo;
        document.getElementById('eventoData').value = data.data;
        document.getElementById('eventoHorario').value = data.horario || '';
        document.getElementById('eventoLocal').value = data.local;
        document.getElementById('eventoDescricao').value = data.descricao;
        editIdEvento = id;
        const formEvento = document.getElementById('form-evento-add');
        formEvento.querySelector('button[type="submit"]').textContent = 'Atualizar Evento';
        formEvento.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  // Avisos
  db.collection("avisos").orderBy("criadoEm", "desc").onSnapshot((snapshot) => {
    const tabela = document.querySelector("#tabela-avisos tbody");
    if (tabela) {
      tabela.innerHTML = "";
      const totalEl = document.getElementById('total-avisos');
      if (totalEl) totalEl.textContent = snapshot.size;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${data.titulo}</td>
          <td>${formatarDataBR(data.data)}</td>
          <td><span class="status ativo">Ativo</span></td>
          <td>
            <span class="acao" style="cursor:pointer;" onclick="editarDocumento('avisos', '${doc.id}')">✏️</span>
            <span class="acao" style="cursor:pointer;" onclick="excluirDocumento('avisos', '${doc.id}')">🗑</span>
          </td>
        `;
        tabela.appendChild(tr);
      });
    }
  });

  const formAviso = document.getElementById('form-aviso-add');
  if (formAviso) {
    formAviso.addEventListener('submit', (e) => {
      e.preventDefault();
      const titulo = document.getElementById('avisoTitulo').value;
      const data = document.getElementById('avisoData').value;
      const descricao = document.getElementById('avisoDescricao').value;
      
      const dataObj = { titulo, data, descricao };
      if (editIdAviso) {
        db.collection("avisos").doc(editIdAviso).update(dataObj).then(() => {
          alert("Aviso atualizado com sucesso!");
          formAviso.reset();
          editIdAviso = null;
          formAviso.querySelector('button[type="submit"]').textContent = 'Salvar Aviso';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }).catch(err => {
          console.error("Erro ao atualizar aviso:", err);
          alert("Erro ao atualizar aviso.");
        });
      } else {
        dataObj.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
        db.collection("avisos").add(dataObj).then(() => {
          alert("Aviso salvo com sucesso!");
          formAviso.reset();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }).catch(err => {
          console.error("Erro ao salvar aviso:", err);
          alert("Erro ao salvar aviso.");
        });
      }
    });
  }

  // Notícias
  db.collection("noticias").orderBy("criadoEm", "desc").onSnapshot((snapshot) => {
    const tabela = document.querySelector("#tabela-noticias tbody");
    if (tabela) {
      tabela.innerHTML = "";
      const totalEl = document.getElementById('total-noticias');
      if (totalEl) totalEl.textContent = snapshot.size;

      snapshot.forEach((doc) => {
        const data = doc.data();
        let statusClass = "publicado";
        let statusText = "Publicado";
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${data.titulo}</td>
          <td>${formatarDataBR(data.data)}</td>
          <td><span class="status ${statusClass}">${statusText}</span></td>
          <td>
            <span class="acao" style="cursor:pointer;" onclick="editarDocumento('noticias', '${doc.id}')">✏️</span>
            <span class="acao" style="cursor:pointer;" onclick="excluirDocumento('noticias', '${doc.id}')">🗑</span>
          </td>
        `;
        tabela.appendChild(tr);
      });
    }
  });

  const formNoticia = document.getElementById('form-noticia-add');
  if (formNoticia) {
    formNoticia.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const dataObj = {
        titulo: document.getElementById('noticiaTitulo').value,
        data: document.getElementById('noticiaData').value,
        categoria: document.getElementById('noticiaCategoria').value,
        imagem: document.getElementById('noticiaImagem').value,
        resumo: document.getElementById('noticiaResumo').value
      };
      
      if (editIdNoticia) {
        db.collection("noticias").doc(editIdNoticia).update(dataObj).then(() => {
          alert("Notícia atualizada com sucesso!");
          formNoticia.reset();
          editIdNoticia = null;
          formNoticia.querySelector('button[type="submit"]').textContent = 'Salvar Notícia';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }).catch(err => alert("Erro ao atualizar notícia."));
      } else {
        dataObj.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
        db.collection("noticias").add(dataObj).then(() => {
          alert("Notícia salva com sucesso!");
          formNoticia.reset();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }).catch(err => alert("Erro ao salvar notícia."));
      }
    });
  }

  // Eventos
  db.collection("eventos").orderBy("criadoEm", "desc").onSnapshot((snapshot) => {
    const tabela = document.querySelector("#tabela-eventos tbody");
    if (tabela) {
      tabela.innerHTML = "";
      const totalEl = document.getElementById('total-eventos');
      if (totalEl) totalEl.textContent = snapshot.size;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${data.titulo}</td>
          <td>${formatarDataBR(data.data)}</td>
          <td><span class="status confirmado">Confirmado</span></td>
          <td>
            <span class="acao" style="cursor:pointer;" onclick="editarDocumento('eventos', '${doc.id}')">✏️</span>
            <span class="acao" style="cursor:pointer;" onclick="excluirDocumento('eventos', '${doc.id}')">🗑</span>
          </td>
        `;
        tabela.appendChild(tr);
      });
    }
  });

  const formEvento = document.getElementById('form-evento-add');
  if (formEvento) {
    formEvento.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const dataObj = {
        titulo: document.getElementById('eventoTitulo').value,
        data: document.getElementById('eventoData').value,
        horario: document.getElementById('eventoHorario').value,
        local: document.getElementById('eventoLocal').value,
        descricao: document.getElementById('eventoDescricao').value
      };
      
      if (editIdEvento) {
        db.collection("eventos").doc(editIdEvento).update(dataObj).then(() => {
          alert("Evento atualizado com sucesso!");
          formEvento.reset();
          editIdEvento = null;
          formEvento.querySelector('button[type="submit"]').textContent = 'Salvar Evento';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }).catch(err => alert("Erro ao atualizar evento."));
      } else {
        dataObj.criadoEm = firebase.firestore.FieldValue.serverTimestamp();
        db.collection("eventos").add(dataObj).then(() => {
          alert("Evento salvo com sucesso!");
          formEvento.reset();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }).catch(err => alert("Erro ao salvar evento."));
      }
    });
  }

  // Mensagens
  db.collection("mensagens").orderBy("criadoEm", "desc").onSnapshot((snapshot) => {
    const lista = document.querySelector(".lista-mensagens");
    if (lista) {
      lista.innerHTML = "";
      const totalEl = document.getElementById('total-mensagens');
      if (totalEl) totalEl.textContent = snapshot.size;

      snapshot.forEach((doc) => {
        const data = doc.data();
        let init = data.nome ? data.nome.charAt(0).toUpperCase() : '?';
        
        // Formatar data se existir (fallback para string)
        let dataStr = "";
        if (data.criadoEm) {
            const dateObj = data.criadoEm.toDate();
            dataStr = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        }

        const article = document.createElement("article");
        article.classList.add("mensagem-item");
        article.innerHTML = `
          <div class="avatar">${init}</div>
          <div class="mensagem-conteudo">
            <h3>${data.nome || 'Anônimo'}</h3>
            <span>${data.email || 'Sem e-mail'}</span>
            <p>${data.mensagem || ''}</p>
          </div>
          <div class="mensagem-info">${dataStr}</div>
        `;
        lista.appendChild(article);
      });
    }
  });

  // Função global de exclusão
  window.excluirDocumento = function(colecao, id) {
    if (confirm("Tem certeza que deseja excluir?")) {
      db.collection(colecao).doc(id).delete()
        .then(() => alert("Item excluído!"))
        .catch(err => console.error("Erro ao excluir:", err));
    }
  }

});

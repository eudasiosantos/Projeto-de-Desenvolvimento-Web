document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('form-login');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const mensagemErro = document.getElementById('login-erro');
  const btnEntrar = document.getElementById('btn-entrar');

  // Verifica se já está logado
  auth.onAuthStateChanged(user => {
    if (user) {
      // Se já está logado, redireciona para o admin
      window.location.href = 'admin.html';
    }
  });

  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const senha = senhaInput.value;

    mensagemErro.style.display = 'none';
    btnEntrar.disabled = true;
    btnEntrar.innerHTML = 'Aguarde...';

    auth.signInWithEmailAndPassword(email, senha)
      .then((userCredential) => {
        // Login com sucesso, o onAuthStateChanged fará o redirecionamento
      })
      .catch((error) => {
        const errorCode = error.code;
        let msg = 'Erro ao realizar login.';

        if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
          msg = 'E-mail ou senha incorretos.';
        } else if (errorCode === 'auth/invalid-email') {
          msg = 'Formato de e-mail inválido.';
        }

        mensagemErro.textContent = msg;
        mensagemErro.style.display = 'block';
        btnEntrar.disabled = false;
        btnEntrar.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Entrar
        `;
      });
  });
});

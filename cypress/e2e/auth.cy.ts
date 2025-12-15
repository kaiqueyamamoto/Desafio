describe('Autenticação E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.logout();
  });

  it('deve registrar um novo usuário', () => {
    cy.visit('/register');
    
    cy.get('input[name="name"]').type('Usuário Teste');
    cy.get('input[name="email"]').type(`teste${Date.now()}@example.com`);
    cy.get('input[name="password"]').type('Senha123!@#');
    cy.get('input[name="confirmPassword"]').type('Senha123!@#');
    
    cy.get('button[type="submit"]').click();
    
    // Deve redirecionar para login após registro
    cy.url().should('include', '/login');
    cy.contains('Usuário criado com sucesso').should('be.visible');
  });

  it('deve fazer login com credenciais válidas', () => {
    const email = `teste${Date.now()}@example.com`;
    const password = 'Senha123!@#';
    
    // Registrar usuário primeiro
    cy.register('Usuário Teste', email, password);
    
    // Fazer login
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    
    // Deve redirecionar para dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('deve mostrar erro com credenciais inválidas', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('email@invalido.com');
    cy.get('input[name="password"]').type('senhaerrada');
    cy.get('button[type="submit"]').click();
    
    cy.contains('Email ou senha inválidos').should('be.visible');
  });

  it('deve fazer logout', () => {
    const email = `teste${Date.now()}@example.com`;
    const password = 'Senha123!@#';
    
    cy.register('Usuário Teste', email, password);
    cy.login(email, password);
    
    cy.visit('/dashboard');
    cy.contains('Sair').click();
    
    cy.url().should('include', '/login');
  });
});

describe('Gerenciamento de Tarefas E2E', () => {
  const email = `teste${Date.now()}@example.com`;
  const password = 'Senha123!@#';

  beforeEach(() => {
    cy.register('Usuário Teste', email, password);
    cy.login(email, password);
    cy.visit('/dashboard');
  });

  it('deve criar uma nova tarefa', () => {
    cy.get('input[placeholder*="título"]').type('Nova Tarefa E2E');
    cy.get('textarea[placeholder*="descrição"]').type('Descrição da tarefa E2E');
    cy.get('button[type="submit"]').contains('Criar').click();
    
    cy.contains('Nova Tarefa E2E').should('be.visible');
    cy.contains('Tarefa criada com sucesso').should('be.visible');
  });

  it('deve editar uma tarefa existente', () => {
    // Criar tarefa primeiro
    cy.get('input[placeholder*="título"]').type('Tarefa para Editar');
    cy.get('button[type="submit"]').contains('Criar').click();
    
    cy.contains('Tarefa para Editar').should('be.visible');
    
    // Editar tarefa
    cy.contains('Tarefa para Editar').parent().find('button').contains('Editar').click();
    cy.get('input[value="Tarefa para Editar"]').clear().type('Tarefa Editada');
    cy.contains('Salvar').click();
    
    cy.contains('Tarefa Editada').should('be.visible');
    cy.contains('Tarefa editada com sucesso').should('be.visible');
  });

  it('deve deletar uma tarefa', () => {
    // Criar tarefa primeiro
    cy.get('input[placeholder*="título"]').type('Tarefa para Deletar');
    cy.get('button[type="submit"]').contains('Criar').click();
    
    cy.contains('Tarefa para Deletar').should('be.visible');
    
    // Deletar tarefa
    cy.contains('Tarefa para Deletar').parent().find('button').contains('Deletar').click();
    cy.on('window:confirm', () => true);
    
    cy.contains('Tarefa para Deletar').should('not.exist');
    cy.contains('Tarefa deletada com sucesso').should('be.visible');
  });

  it('deve filtrar tarefas por status', () => {
    // Criar tarefas com diferentes status
    cy.get('input[placeholder*="título"]').type('Tarefa Pendente');
    cy.get('button[type="submit"]').contains('Criar').click();
    
    // Filtrar por pendente
    cy.contains('Pendente').click();
    cy.contains('Tarefa Pendente').should('be.visible');
  });

  it('deve buscar tarefas', () => {
    // Criar tarefa
    cy.get('input[placeholder*="título"]').type('Tarefa de Busca');
    cy.get('button[type="submit"]').contains('Criar').click();
    
    // Buscar tarefa
    cy.get('input[placeholder*="Buscar tarefas"]').type('Busca');
    cy.contains('Tarefa de Busca').should('be.visible');
  });

  it('deve ordenar tarefas', () => {
    // Criar algumas tarefas
    cy.get('input[placeholder*="título"]').type('Tarefa A');
    cy.get('button[type="submit"]').contains('Criar').click();
    
    cy.get('input[placeholder*="título"]').clear().type('Tarefa B');
    cy.get('button[type="submit"]').contains('Criar').click();
    
    // Ordenar por título
    cy.get('select').first().select('title');
    cy.contains('Tarefa A').should('be.visible');
  });

  it('deve usar paginação quando há muitas tarefas', () => {
    // Criar múltiplas tarefas
    for (let i = 1; i <= 15; i++) {
      cy.get('input[placeholder*="título"]').clear().type(`Tarefa ${i}`);
      cy.get('button[type="submit"]').contains('Criar').click();
      cy.wait(500); // Aguardar um pouco entre criações
    }
    
    // Verificar se há paginação
    cy.contains('Página').should('be.visible');
    cy.contains('Próxima').click();
    cy.url().should('include', 'page=2');
  });

  it('deve alternar entre modo lista e kanban', () => {
    cy.contains('Lista').should('be.visible');
    cy.contains('Kanban').click();
    cy.contains('Kanban').parent().should('have.class', 'bg-white');
    
    cy.contains('Lista').click();
    cy.contains('Lista').parent().should('have.class', 'bg-white');
  });

  it('deve alternar entre tema claro e escuro', () => {
    cy.get('button[aria-label="Alternar tema"]').click();
    cy.get('html').should('have.class', 'dark');
    
    cy.get('button[aria-label="Alternar tema"]').click();
    cy.get('html').should('not.have.class', 'dark');
  });
});

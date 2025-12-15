/// <reference types="cypress" />

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      email,
      password,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property('accessToken');
    expect(response.body).to.have.property('refreshToken');
    
    // Salvar tokens no localStorage
    window.localStorage.setItem('auth_token', response.body.accessToken);
    window.localStorage.setItem('refresh_token', response.body.refreshToken);
  });
});

Cypress.Commands.add('register', (name: string, email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/register',
    body: {
      name,
      email,
      password,
    },
  }).then((response) => {
    expect(response.status).to.eq(201);
  });
});

Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('auth_token');
  window.localStorage.removeItem('refresh_token');
});

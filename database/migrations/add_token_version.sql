-- Migration: Adicionar campo token_version na tabela users
-- Este campo é usado para invalidar tokens JWT antigos quando um novo login é realizado

USE task_manager;

ALTER TABLE users 
ADD COLUMN token_version INT DEFAULT 0 NOT NULL AFTER password;

-- Atualizar todos os usuários existentes para ter token_version = 0
UPDATE users SET token_version = 0 WHERE token_version IS NULL;

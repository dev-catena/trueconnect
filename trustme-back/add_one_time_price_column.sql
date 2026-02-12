-- Script SQL para adicionar a coluna one_time_price à tabela plans
-- Execute este script diretamente no banco de dados se a migration não funcionar

ALTER TABLE `plans` 
ADD COLUMN `one_time_price` DECIMAL(8,2) NULL AFTER `annual_price`;





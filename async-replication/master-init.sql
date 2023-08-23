CREATE USER 'repl'@'%' IDENTIFIED WITH mysql_native_password BY 'repl';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';

CREATE DATABASE social;
USE social;
CREATE TABLE users(id VARCHAR(36) PRIMARY KEY NOT NULL, password VARCHAR(64), first_name VARCHAR(64), second_name VARCHAR(64), age INTEGER, birthdate VARCHAR(10), biography VARCHAR(1024), city VARCHAR(64));
CREATE INDEX first_name_second_name_idx ON users (first_name, second_name, id);
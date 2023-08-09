CREATE DATABASE social;
USE social;
CREATE TABLE users(id VARCHAR(36) PRIMARY KEY NOT NULL, password VARCHAR(64), first_name VARCHAR(64), second_name VARCHAR(64), age INTEGER, birthdate VARCHAR(10), biography VARCHAR(1024), city VARCHAR(64));
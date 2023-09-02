CREATE DATABASE social;
USE social;

CREATE TABLE users(id VARCHAR(36) PRIMARY KEY NOT NULL, password VARCHAR(64), first_name VARCHAR(64), second_name VARCHAR(64), age INTEGER, birthdate VARCHAR(10), biography VARCHAR(1024), city VARCHAR(64), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX users_first_name_second_name_id_idx ON users (first_name, second_name, id);

CREATE TABLE tokens(user_id VARCHAR(36) PRIMARY KEY NOT NULL, id VARCHAR(36) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX tokens_user_id_idx ON tokens (user_id);

CREATE TABLE posts(id VARCHAR(36) PRIMARY KEY NOT NULL, user_id VARCHAR(36) NOT NULL, text TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX posts_user_id_id_idx ON posts (user_id, id);

CREATE TABLE friends(user_id VARCHAR(36) NOT NULL, friend_id VARCHAR(36) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX friends_user_id_friend_id_idx ON friends (user_id, friend_id);

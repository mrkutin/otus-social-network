CHANGE MASTER TO MASTER_HOST='master', MASTER_PORT=3306, MASTER_USER='repl', MASTER_PASSWORD='repl', MASTER_LOG_FILE='', MASTER_LOG_POS=4;
start slave;
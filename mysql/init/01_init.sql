-- MySQL 初始化脚本，Docker 启动时自动执行
-- 表结构由 SQLAlchemy 自动创建，这里只做额外初始化
GRANT ALL PRIVILEGES ON dev_toolbox.* TO 'toolbox'@'%';
FLUSH PRIVILEGES;

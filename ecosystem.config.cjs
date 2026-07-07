module.exports = {
  apps: [{
    name: 'gencv-api',
    script: 'src/server/app.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
    },
    env_development: {
      NODE_ENV: 'development',
    },
    max_memory_restart: '500M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    restart_delay: 5000,
  }]
};

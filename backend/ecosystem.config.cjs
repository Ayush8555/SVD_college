module.exports = {
  apps: [
    {
      name: 'college-result-system',
      script: './src/server.js',
      instances: 1, // Start with 1 instance to debug
      exec_mode: 'fork', // Fork mode simpler for debugging
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5001
      },
      // Error handling and Restart policies
      max_memory_restart: '1G',
      exp_backoff_restart_delay: 100,
      
      // Logs
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      time: true
    }
  ]
};

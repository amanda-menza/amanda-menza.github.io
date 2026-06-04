module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 10000 // Wait 10 seconds between restarts
    },
    {
      name: 'backend',
      script: './start.sh',
      cwd: './backend',
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 10000 // Wait 10 seconds between restarts
    }
  ]
}
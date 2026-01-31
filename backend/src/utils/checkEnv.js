import chalk from 'chalk';

/**
 * Validate required environment variables
 */
export const checkEnv = () => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(chalk.red.bold('\n❌ FATAL ERROR: Missing required environment variables:'));
    missing.forEach(key => console.error(chalk.red(`   - ${key}`)));
    console.error(chalk.yellow('\nPlease check your .env file or deployment configuration.\n'));
    process.exit(1);
  }

  console.log(chalk.green('✅ Environment variables verified'));
};

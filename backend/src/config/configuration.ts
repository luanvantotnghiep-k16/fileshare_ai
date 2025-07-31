//https://docs.nestjs.com/techniques/configuration
//use it
//constructor(private configService: ConfigService) {}

// get an environment variable
//const dbUser = this.configService.get<string>('DATABASE_USER');

// get a custom configuration value
//const dbHost = this.configService.get<string>('database.host');

export default () => ({
  // jwt_secret: process.env.JWT_SECRET ||'',
  // jwt_token_expiration: process.env.JWT_TOKEN_EXPIRATION || '30s',
  node_env: process.env.NODE_ENV,
  database: {
    mongo_url: process.env.MONGODB_URI,
  },
  jwt: {
    token_secret: process.env.JWT_TOKEN_SECRET,
    token_expiration: process.env.JWT_TOKEN_EXPIRATION,
  },
});

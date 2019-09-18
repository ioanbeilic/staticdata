# Hotels static data

## Globals

- all environment variable must have a alias on 'config/config.keys.json'

the global variable must be imported with getter method form Config service
EX:

```ts
AppModule.port = this._configService.get(Configuration.PORT);
```

## Imports

- all injected component must be initialized with \_
  EX:
  ```ts
  private readonly _configService: ConfigService
  ```

## Project module structure

- the modules folder must include all individual modules for easy deciphering
- config module -- all environment variable and all configuration files
- database module -- database provider(s), one or multiple provider depend of needs. Must contain all database configuration  
   Ex:

  ```ts
  export const databaseProviders = [
  TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  async useFactory(config: ConfigService) {
    return {
      //  ssl: true,
      type: 'postgres',
      host: config.get(Configuration.HOST),
      username: config.get(Configuration.USERNAME),
      password: config.get(Configuration.PASSWORD),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
    } as ConnectionOptions;
  },
  }),
  ```

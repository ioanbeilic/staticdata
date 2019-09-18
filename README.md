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

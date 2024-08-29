# navio-indexer
npm install
  Create a database on MySQL server and import "db.sql" file.
  Open .env file and set MySQL server connection credentials for testnet and mainnet.
  Start indexer with :
  ```node index.js -network=<testnet or mainnet> -rpchost=<hostname or ip> -rpcusername=<username> -rpcpassword=<password>"```

  Tested with Node.js v12.22.12 and v20.11.1
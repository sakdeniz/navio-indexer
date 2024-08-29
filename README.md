# navio-indexer
npm install<br/>
Create a database on MySQL server and import "db.sql" file.<br/>
Open .env file and set MySQL server connection credentials for testnet and mainnet.<br/>
Start indexer with :<br/>
```node index.js -network=<testnet or mainnet> -rpchost=<hostname or ip> -rpcusername=<username> -rpcpassword=<password>"```<br/>
<br/>
Tested with Node.js v12.22.12 and v20.11.1
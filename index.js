const {argv} = require('process');
const Client = require('bitcoin-core');
var mysql = require('mysql');
var log4js = require('log4js');
var logger = log4js.getLogger('Indexer');
var network=undefined;
var network_id=undefined;
var height=0;
var block_indexing_cycle=100; // in miliseconds
var block=undefined;
var is_block_processing=false;
var rpcusername=undefined;
var rpcpassword=undefined;
var rpchost=undefined;
var rpcport=undefined;
var mysql_host=undefined;
var mysql_user=undefined;
var mysql_password=undefined;
var mysql_database=undefined;
var client;
require('dotenv').config();
log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: { type: 'file', filename: network+'.log' }
  },
  categories: {
  default: { appenders: [ 'out', 'app' ], level: 'debug' }
  }
});
async function main()
{
  argv.forEach((arg, index) => {
    let argument=arg.split("=");
    if (argument[1]) logger.debug(argument[0]+"="+argument[1]);
    if (argument[0]=="-network")
    {
      network=argument[1];
      if (argument[1]=="testnet")
      {
        network="testnet";
        network_id=1;
        rpcport=48485;
        mysql_host=process.env.MYSQL_HOST_TESTNET;
        mysql_user=process.env.MYSQL_USER_TESTNET;
        mysql_password=process.env.MYSQL_PASSWORD_TESTNET;
        mysql_database=process.env.MYSQL_DATABASE_TESTNET;
      }
      if (argument[1]=="mainnet")
      {
        network="mainnet";
        network_id=2;
        rpcport=48485;
        mysql_host=process.env.MYSQL_HOST_MAINNET;
        mysql_user=process.env.MYSQL_USER_MAINNET;
        mysql_password=process.env.MYSQL_PASSWORD_MAINNET;
        mysql_database=process.env.MYSQL_DATABASE_MAINNET;
      }
    }
    if (argument[0]=="-rpchost") rpchost=argument[1];
    if (argument[0]=="-rpcusername") rpcusername=argument[1];
    if (argument[0]=="-rpcpassword") rpcpassword=argument[1];
  });
  if (!network)
  {
    logger.error("network argument not set. use -network=testnet or -network=mainnet");
    process.exit();
  }
  if (!rpchost)
  {
    logger.error("rpchost argument not set. use -rpchost=value");
    process.exit();
  }
  if (!rpcusername)
  {
    logger.error("rpcusername argument not set. use -rpcusername=value");
    process.exit();
  }
  if (!rpcpassword)
  {
    logger.error("rpcpassword argument not set. use -rpcpassword=value");
    process.exit();
  }
  logger.info("Indexer started for network '" + network + "' Network ID : " + network_id);
  logger.info("Using environment variables for MySQL server connection from .env file.");
  logger.info("Connecting naviod node via RPC client. Host:'" + rpchost + "'. Port:"+rpcport + " Username:'"+rpcusername + "' Password:'"+rpcpassword + "'");
  try {
    client = new Client({
      host:rpchost,
      port: rpcport,
      username: rpcusername,
      password: rpcpassword,
      wallet: '',
      timeout:30000
    });
  }
  catch(e) {
    console.log(e);
    process.exit();
  }
  logger.info("Connecting to MySQL Server. Host:'"+mysql_host+"' Username:'"+mysql_user+"' Password:'"+mysql_password+"'"+" Database:'"+mysql_database+"'");
  var con = mysql.createPool({
    host: mysql_host,
    user: mysql_user,
    password: mysql_password,
    connectionLimit:1024
  });

  con.getConnection(function(err, connection) {
    if (err) {
      console.log("MySQL server connection failed. Error No:" + err.errorno + " Code:" + err.code);
      process.exit();
    }
    con.on('error', function(err) {
      console.log(err);
      process.exit();
    });
  });
  logger.info("Checking latest indexed block details from database...");
  con.query("SELECT MAX(block_id) AS block_id FROM `"+mysql_database+"`.`blocks` WHERE network_id="+network_id + " LIMIT 1", async function (err, result, fields)
  {
    if (err)
    {
      logger.error(err);
    }
    else
    {
      if (result[0].block_id)
      {
        logger.info("Database query returned " + result.length + " records");
        logger.info("Latest indexed block : " + result[0].block_id);
        logger.info("Synchronization process is in progress.");
        height=result[0].block_id+1;
      }
      else
      {
        logger.info("No indexed block found, starting indexing from block " + height);
      }
      getBlockChainInfo();
      getPeerInfo();
      getBlock();
    }
  });

  function getBlock()
  {
   let interval;
   interval = setInterval(() => {
     if (is_block_processing||!block||(height-1)==block)
     {
      return;
    }
    is_block_processing=true;
    let txno=-1;
    client.getBlockHash(height).then((block_hash) => 
    {
      client.getBlock(block_hash).then((block) => 
      {
        let sql = `INSERT INTO `+mysql_database+`.blocks(
        id,
        network_id,
        block_id,
        hash,
        data,
        created
        )
        VALUES(
        NULL,
        `+network_id+`,
        `+height+`,
        '`+block_hash+`',
        ?,
        NOW()
        );`;
        con.query(sql,[JSON.stringify(block)], async function (err, result)
        {
          if (err)
          {
            logger.info("Block record not added -> " + err);
          }
          else
          {
            height=height+1;
            if (height>0)
            {
              block.tx.forEach(txid =>
              {
                client.getRawTransaction(txid).then((rawTransaction) => 
                {
                  client.decodeRawTransaction(rawTransaction).then((decodedRawTransaction) => 
                  {
                    txno++;
                    let sql = `INSERT INTO `+mysql_database+`.txs(
                    id,
                    network_id,
                    txno,
                    txid,
                    block_hash,
                    height,
                    data,
                    created
                    )
                    VALUES(
                    NULL,
                    `+network_id+`,
                    `+txno+`,
                    '`+txid+`',
                    '`+block_hash+`',
                    `+height+`,
                    ?,
                    NOW()
                    );`;
                    con.query(sql,[JSON.stringify(decodedRawTransaction)], async function (err, result)
                    {
                      if (err)
                      {
                        logger.info("TX record not added -> " + err);
                      }
                      else
                      {
                        is_block_processing=false;
                      }
                    });
                  }).catch((r) =>
                  {
                    logger.error(r);
                    is_block_processing=false;
                  })
                }).catch((r) =>
                {
                  logger.error(r);
                  is_block_processing=false;
                })
              });
            }
            else
            {
              is_block_processing=false;
            }
          }
        });
      //
      }).catch((r) =>
      {
        logger.error(r);
        is_block_processing=false;
      })
    }).catch((r) =>
    {
      logger.error(r);
      is_block_processing=false;
    })
  }, block_indexing_cycle);
 }

 function getBlockChainInfo()
 {
  let interval;
  interval = setInterval(() => {
    client.command([{ method: "getblockchaininfo" }]).then((r) => 
    {
      if (!r[0].code)
      {
        block=r[0].blocks;
        logger.info("Syncing : [" + r[0].chain + "] Indexed Blocks (Database) : " + (height-1) + " Synced Blocks (Node) : " + r[0].blocks + " Headers (Node) : " + r[0].headers);
        let sql = `UPDATE `+mysql_database+`.data SET data=?,last_updated=NOW() WHERE network_id=`+network_id+` AND k='blockchaininfo' LIMIT 1;`;
        con.query(sql,[JSON.stringify(r)], async function (err, result)
        {
          if (err)
          {
            logger.info("Block chain info not updated -> " + err);
          }
        });
      }
      else
      {
        logger.error(r[0].message);
      }
    }).catch((r) =>
    {
      //logger.error(r);
    })
  }, 1000);
}

function getBlockCount()
{
  let interval;
  interval = setInterval(() => {
    client.command([{ method: "getblockcount"}]).then((r) => 
    {
      logger.info("Current height:"+r);
    }).catch((r) =>
    {
     logger.error(r);
    });
  }, 1000);
}

function getPeerInfo()
{
  let interval;
  interval = setInterval(() => {
    client.command([{ method: "getpeerinfo"}]).then((r) => 
    {
      if (!r[0].code)
      {
        let sql = `UPDATE `+mysql_database+`.peers SET data=?,last_updated=NOW() WHERE network_id=`+network_id+` LIMIT 1;`;
        con.query(sql,[JSON.stringify(r)], async function (err, result)
        {
          if (err)
          {
            logger.info("Peer info not updated -> " + err);
          }
        });
      }
      else
      {
        logger.error(r);
      }
    }).catch((r) =>
    {
      logger.error(r);
    });
  }, 5000);
}
}
main()

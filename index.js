const { argv } = require('process');
const Client = require('bitcoin-core');
var mysql = require('mysql');
var log4js = require('log4js');
var logger = log4js.getLogger('Indexer');
var network = undefined;
var height = 0;
var block_indexing_cycle = 100; // in miliseconds
var block = undefined;
var is_block_processing = false;

var rpc_user = undefined;
var rpc_pass = undefined;
var rpc_host = undefined;
var rpc_port = undefined;

var db_host = undefined;
var db_user = undefined;
var db_pass = undefined;
var db_name = undefined;

var faucet = false;
var client;
require('dotenv').config();
async function main() {
  argv.forEach((arg) => {
    let argument = arg.split('=');
    if (argument[0] == '-network') {
      network = argument[1];
      log4js.configure({
        appenders: {
          out: { type: 'stdout' },
          app: { type: 'file', filename: `/tmp/${network}.log` },
        },
        categories: {
          default: { appenders: ['out'], level: 'debug' },
        },
      });

      if (argument[1] == 'testnet') {
        network = 'testnet';
        rpc_port = 48485;
        rpc_host = process.env.RPC_HOST_TESTNET;
        rpc_user = process.env.RPC_USER_TESTNET;
        rpc_pass = process.env.RPC_PASS_TESTNET;
        db_host = process.env.DB_HOST_TESTNET;
        db_user = process.env.DB_USER_TESTNET;
        db_pass = process.env.DB_PASS_TESTNET;
        db_name = process.env.DB_NAME_TESTNET;
      }

      if (argument[1] == 'mainnet') {
        network = 'mainnet';
        rpc_port = 48485;
        rpc_host = process.env.RPC_HOST_MAINNET;
        rpc_user = process.env.RPC_USER_MAINNET;
        rpc_pass = process.env.RPC_PASS_MAINNET;
        db_host = process.env.DB_HOST_MAINNET;
        db_user = process.env.DB_USER_MAINNET;
        db_pass = process.env.DB_PASS_MAINNET;
        db_name = process.env.DB_NAME_MAINNET;
      }
    }

    if (argument[0] == '-rpchost') rpc_host = argument[1];
    if (argument[0] == '-rpcusername') rpc_user = argument[1];
    if (argument[0] == '-rpcpassword') rpc_pass = argument[1];
    if (argument[0] == '-faucet') faucet = true;
    if (argument[1]) logger.debug(argument[0] + '=' + argument[1]);
  });

  if (!network) {
    logger.error('network not set. use -network=testnet or -network=mainnet');
    process.exit();
  }

  if (!rpc_host) {
    logger.error('rpchost not set. use -rpchost=value');
    process.exit();
  }

  if (!rpc_user) {
    logger.error('rpcusername not set. use -rpcusername=value');
    process.exit();
  }

  if (!rpc_pass) {
    logger.error('rpcpassword not set. use -rpcpassword=value');
    process.exit();
  }

  logger.info(`indexing [${network}]`);
  logger.info(`rpc: ${rpc_user}:${rpc_pass}@${rpc_host}:${rpc_port}`);
  try {
    client = new Client({
      host: rpc_host,
      port: rpc_port,
      username: rpc_user,
      password: rpc_pass,
      wallet: '',
      timeout: 600000,
    });
  } catch (e) {
    console.log(e);
    process.exit();
  }

  logger.info(`db: ${db_user}:${db_pass}@${db_host}/${db_name}`);
  var con = mysql.createPool({
    host: db_host,
    user: db_user,
    password: db_pass,
    connectionLimit: 1024,
  });

  con.getConnection(function (err, connection) {
    if (err) {
      console.log(
        'MySQL server connection failed. Error No:' +
          err.errorno +
          ' Code:' +
          err.code,
      );
      process.exit();
    }
    con.on('error', function (err) {
      console.log(err);
      process.exit();
    });
  });

  if (!faucet) {
    logger.info('Checking latest indexed block details from database...');
    con.query(
      `select max(block_id) as block_id from ${db_name}.blks limit 1`,
      async function (err, result, fields) {
        if (err) {
          logger.error(err);
        } else {
          if (result[0].block_id) {
            logger.info(
              'Database query returned ' + result.length + ' records',
            );
            logger.info('Latest indexed block : ' + result[0].block_id);
            logger.info('Synchronization process is in progress.');
            height = result[0].block_id + 1;
          } else {
            logger.info(
              'No indexed block found, starting indexing from block ' + height,
            );
          }

          getBlockChainInfo();
          getPeerInfo();
          getBlock();
        }
      },
    );
  } else {
    logger.info('Faucet TX Index mode enabled.');
    getFaucetTransactions();
  }

  function getBlock() {
    let interval;
    interval = setInterval(() => {
      if (is_block_processing || !block || height - 1 == block) {
        return;
      }

      is_block_processing = true;
      let txno = -1;
      client
        .getBlockHash(height)
        .then((block_hash) => {
          client
            .getBlock(block_hash)
            .then((block) => {
              let sql = `insert into ${db_name}.blks (block_id, hash, data, created) values (${height}, '${block_hash}', ?, now())`;
              con.query(sql, [JSON.stringify(block)], async function (err) {
                if (err) {
                  logger.info('Block record not added -> ' + err);
                } else {
                  height = height + 1;
                  if (height > 0) {
                    block.tx.forEach((txid) => {
                      client
                        .getRawTransaction(txid)
                        .then((rawTransaction) => {
                          client
                            .decodeRawTransaction(rawTransaction)
                            .then((decodedRawTransaction) => {
                              txno++;
                              let sql = `insert into ${db_name}.txs (txno, txid, block_hash, height, data, created) values (${txno}, '${txid}', '${block_hash}', ${height}, ?, NOW())`;
                              con.query(
                                sql,
                                [JSON.stringify(decodedRawTransaction)],
                                async function (err) {
                                  if (err) {
                                    logger.info(
                                      'TX record not added -> ' + err,
                                    );
                                  } else {
                                    is_block_processing = false;
                                  }
                                },
                              );
                            })
                            .catch((r) => {
                              logger.error(r);
                              is_block_processing = false;
                            });
                        })
                        .catch((r) => {
                          logger.error(r);
                          is_block_processing = false;
                        });
                    });
                  } else {
                    is_block_processing = false;
                  }
                }
              });
            })
            .catch((r) => {
              logger.error(r);
              is_block_processing = false;
            });
        })
        .catch((r) => {
          logger.error(r);
          is_block_processing = false;
        });
    }, block_indexing_cycle);
  }

  function getBlockChainInfo() {
    let sql = `insert ignore into ${db_name}.data (\`key\`, data, updated) values ('blockchaininfo', '{}', now())`;
    con.query(sql, [], async function (err) {
      if (err) logger.error(err);
      let interval;
      interval = setInterval(() => {
        client
          .command([{ method: 'getblockchaininfo' }])
          .then((r) => {
            if (!r[0].code) {
              block = r[0].blocks;
              logger.info(
                `Syncing : [${r[0].chain}] Indexed Blocks (Database) : ${height - 1} Synced Blocks (Node) : ${r[0].blocks} Headers (Node) : ${r[0].headers}`,
              );
              let sql = `update ${db_name}.data SET data = ?, updated = now() where key = 'blockchaininfo'`;
              con.query(sql, [JSON.stringify(r)], async function (err) {
                if (err) {
                  logger.info('Block chain info not updated -> ' + err);
                }
              });
            } else {
              logger.error(r[0].message);
            }
          })
          .catch((r) => {
            logger.error(r);
          });
      }, 1000);
    });
  }

  function getPeerInfo() {
    let sql = `insert ignore into ${db_name}.data (\`key\`, data, updated) values ('peerinfo', '{}', now())`;
    con.query(sql, [], async function (err) {
      if (err) logger.error(err);

      let interval;
      interval = setInterval(() => {
        client
          .command([{ method: 'getpeerinfo' }])
          .then((r) => {
            if (!r[0].code) {
              let sql = `update ${db_name}.data set data = ?, updated = now() where key = 'peerinfo' limit 1`;
              con.query(sql, [JSON.stringify(r)], async function (err) {
                if (err) {
                  logger.info('Peer info not updated -> ' + err);
                }
              });
            } else {
              logger.error(r[0].message);
            }
          })
          .catch((r) => {
            logger.error(r.message);
          });
      }, 5000);
    });
  }
  function getFaucetTransactions() {
    let sql = `insert ignore into ${db_name}.data (\`key\`, data, updated) values ('faucet_txs', '{}', now())`;
    con.query(sql, [], async function (err) {
      if (err) logger.error(err);

      let interval;
      interval = setInterval(() => {
        logger.info('Checking tx list for faucet... It can take some time...');
        client
          .command([{ method: 'listtransactions', parameters: ['*', 100000] }])
          .then((r) => {
            if (!r[0].code) {
              let sql = `update ${db_name}.data set data = ?, updated = now() where key = 'faucet_txs'`;
              con.query(
                sql,
                [JSON.stringify(r[0].reverse())],
                async function (err) {
                  if (err) {
                    logger.info('Faucet txs not updated -> ' + err);
                  } else {
                    logger.info('Faucet txs updated.');
                  }
                },
              );
            } else {
              logger.error(r[0].message);
            }
          })
          .catch((r) => {
            logger.error(r.message);
          });
      }, 60000 * 10);
    });
  }
}
main();

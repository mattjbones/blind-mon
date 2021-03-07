const DB = require('./database');
require('dotenv').config();

const testData = {
  1: { value: 96, id: 'id1', position: 'left' },
  2: { value: 40, id: 'id2', position: 'right' },
};

async function setupDb() {
  DB.setHost(process.env.DB_HOST);
  await DB.init();
}

async function runTest() {
  console.log('writing');
  DB.addToDatabase(testData);

  console.log('reading');
  await DB.readFromDatabase();
}

setupDb();
runTest();

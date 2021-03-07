const Influx = require('influx');
require('dotenv').config();

const schema = [
  {
    measurement: 'battery',
    fields: {
      position: Influx.FieldType.STRING,
      id: Influx.FieldType.STRING,
      value: Influx.FieldType.INTEGER,
    },
    tags: [],
  },
];

let host = 'localhost';

function setHost(name, defaultHost) {
  host = name || defaultHost;
}

let influx;
async function init() {
  influx = new Influx.InfluxDB({
    host,
    database: 'blind_battery_data',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  console.log({ influx });
  const databases = await influx.getDatabaseNames();
  console.log(`Databases: ${databases.join(', ')}`);
}

function addToDatabase(details) {
  Object.values(details).forEach((entry) => {
    const { value, id, position } = entry;
    console.log({
      value,
      id,
      position,
    });
    influx.writePoints([
      {
        measurement: 'battery',
        fields: {
          value,
          id,
          position,
        },
      },
    ]);
  });
}

async function readFromDatabase() {
  var query = `SELECT * FROM battery where time > now() - 1m`;
  const results = await influx.query(query);
  console.log({
    results,
  });
}

module.exports = {
  addToDatabase,
  readFromDatabase,
  init,
  setHost,
};

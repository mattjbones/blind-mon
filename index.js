// setup
const readLine = require('readline');
require('dotenv').config();

// Bluetooth lib
const noble = require('@abandonware/noble');

// Database lib
const DB = require('./database');

const noop = () => {};
if (!process.env.DEBUG) {
  console.log = noop;
}

const { LEFT_BLIND, RIGHT_BLIND, TIMEOUT_S } = process.env;

const TIMEOUT_MS = TIMEOUT_S * 60 * 1000;
const left = LEFT_BLIND.replaceAll(':', '').toLowerCase();
const right = RIGHT_BLIND.replaceAll(':', '').toLowerCase();
const blinds = [left, right];

let discoveredDevices = 0;
const discoveredBlinds = [];

const batteryService = '180f';
const batteryLevelUUID = '2a19';

const batteryStatus = {
  [left]: {
    position: 'left',
    id: left,
  },
  [right]: {
    position: 'right',
    id: right,
  },
};

async function startDB() {
  DB.setHost(process.env.DB_HOST, 'localhost');
  await DB.init();
}

startDB();
startTimeout();

noble.on('stateChange', function (state) {
  state === 'poweredOn' ? startScan(true) : stopScan();
});

noble.on('discover', async function (peripheral) {
  const { id } = peripheral;
  printProgress(++discoveredDevices);
  const isBlindDevice = blinds.includes(id);
  const hasAlreadySeen = discoveredBlinds.includes(id);

  if (isBlindDevice && !hasAlreadySeen) {
    noble.stopScanning();

    await peripheral.connectAsync();
    const {
      characteristics,
    } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
      [batteryService],
      [batteryLevelUUID]
    );
    const batteryLevel = (await characteristics[0].readAsync())[0];
    batteryStatus[id].value = batteryLevel;

    resetLine();
    printLine(`Blind with ID: ${id} found - batteryLevel: ${batteryLevel}\n`);
    discoveredBlinds.push(peripheral);

    if (blinds.length === discoveredBlinds.length) {
      stopScan();
      console.log(`Found ${discoveredBlinds.length} blinds`);
      console.log('writing to database');
      DB.addToDatabase(batteryStatus);
      printLine('\nUpdated');
      await DB.readFromDatabase();
      process.exit(0);
    } else {
      startScan();
    }
  }
});

noble.on('connect', function (state) {
  console.log({ state });
});

noble.on('warning', function (message) {
  console.warn({ message });
});

async function startScan(initial = false) {
  initial && printLine(`Scanning...\n`);
  await noble.startScanningAsync();
}

async function stopScan() {
  await noble.stopScanningAsync();
}

function printLine(text, withDate = true) {
  process.stdout.write(`${withDate ? new Date() : ''} ${text}`);
}

function printProgress(devices) {
  resetLine();
  printLine(devices + ' scanned', false);
}

function resetLine() {
  readLine.clearLine(process.stdout, 0);
  readLine.cursorTo(process.stdout, 0, null);
}

function startTimeout() {
  setTimeout(async () => {
    await noble.stopScanningAsync();
    process.stderr.write(`\n\nTimeout after ${TIMEOUT_MS / 1000 / 60} mins`);
    process.exit(1);
  }, TIMEOUT_MS);
}

const express = require('express');
const fs = require('fs').promises;
const app = express();
const accountsRouter = require('./routes/grades.js');
const winston = require('winston');

app.use(express.json);
app.use('/grades', accountsRouter);

global.fileName = 'grades.json';

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'grades-control-api.log' }),
  ],
  format: combine(
    label({ label: 'grades-control-api' }),
    timestamp(),
    myFormat
  ),
});

app.listen(3001, async () => {
  try {
    await fs.readFile(global.fileName, 'utf8');
    logger.info('API Started');
  } catch (err) {
    logger.error(err);
  }
});

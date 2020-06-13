const express = require('express');
const fs = require('fs').promises;
const router = express.Router();

router.post('/', async (req, res) => {
  let grades = req.body;
  try {
    let data = await fs.readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);

    grades = { id: json.nextId++, ...grades };
    json.grades.push(grades);

    await fs.writeFile(global.fileName, JSON.stringify(json));
    res.end();

    logger.info(`POST /grades - ${JSON.stringify(grades)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });

    logger.error(`POST /grades - ${err.message}`);
  }
});

router.get('/', async (_, res) => {
  try {
    let data = await fs.readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    delete json.nextId;
    res.send(json);

    logger.info(`GET /grades`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /grades - ${err.message}`);
  }
});

router.get('/:id', async (req, res) => {
  try {
    let data = await fs.readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    const grades = json.grades.find(
      (grades) => grades.id === parseInt(req.params.id, 10)
    );
    if (grades) {
      res.send(grades);
      logger.info(`GET /grades/:id - ${JSON.stringify(grades)}`);
    } else {
      res.end();
      logger.info(`GET /grades/:id`);
    }
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /grades/:id - ${err.message}`);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    let data = await fs.readFile(global.fileName, 'utf8');

    let json = JSON.parse(data);
    let gradess = json.grades.filter(
      (grades) => grades.id !== parseInt(req.params.id, 10)
    );
    json.grades = gradess;

    await fs.writeFile(global.fileName, JSON.stringify(json));
    res.end();

    logger.info(`DELETE /grades/ - ${req.params.id}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`DELETE /grades/ - ${err.message}`);
  }
});

router.put('/', async (req, res) => {
  let newgrades = req.body;
  try {
    let data = await fs.readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    let oldIndex = json.grades.findIndex(
      (grades) => grades.id === newgrades.id
    );

    json.grades[oldIndex].student = newgrades.student;
    json.grades[oldIndex].subject = newgrades.subject;
    json.grades[oldIndex].type = newgrades.type;
    json.grades[oldIndex].value = newgrades.value;
    json.grades[oldIndex].timestamp = newgrades.timestamp;

    await fs.writeFile(global.fileName, JSON.stringify(json));
    res.end();

    logger.info(`PUT /grades/ - ${JSON.stringify(newgrades)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`PUT /grades/ - ${err.message}`);
  }
});

router.post('/transaction', async (req, res) => {
  try {
    let params = req.body;
    let data = await fs.readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    let index = json.grades.findIndex((grades) => grades.id === params.id);
    // prettier-ignore
    if ((params.value < 0) && ((json.grades[index].balance + params.value) < 0)) {
        throw new Error('Não há saldo suficiente');
      }
    json.grades[index].balance += params.value;

    await fs.writeFile(global.fileName, JSON.stringify(json));
    res.send(json.grades[index]);

    logger.info(`POST /grades/transaction - ${JSON.stringify(params)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`POST /grades/transaction - ${err.message}`);
  }
});

module.exports = router;

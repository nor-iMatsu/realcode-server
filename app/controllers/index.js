var express = require('express');
var mongoClient = require("mongodb").MongoClient;
var router = express.Router();

const dbName = 'realcode';
const answersDatabaseName = 'answers'
const collectionName = 'exercises_filtered_py'
const answersCollectionName = 'exercises_filtered_py'

// require('dotenv').config();
const dbUrl = "mongodb://realcode-mongo:27017"


// FUNCTIONS
// =============================================================================

/**
 * Return the number of exercises stored in realcode.exercises
 */
function getNumberOfExercises() {
  return new Promise((resolve, reject) => {
    mongoClient.connect(dbUrl, (err, db) => {
      if (err) {
        reject(err);
      }

      const collection = db.db(dbName).collection(collectionName);
      collection.find({}).count((err, res) => {
        if (err) {
          reject(err);
        }

        db.close();
        resolve(res);
      });
    });
  });
}

async function getExercise(quizIndex) {

  return new Promise((resolve, reject) => {
    mongoClient.connect(dbUrl, function (err, db) {
      if (err) {
        reject(err);
      }
      const collection = db.db(dbName).collection(collectionName);
      collection.find({})
        .sort({
          'ID': 1
        })
        .limit(1)
        .skip(quizIndex)
        .toArray((err, docs) => {
          db.close()
          if (err) {
            reject(err);
          } else {
            resolve(docs);
          }
        });

    });
  });
}

/**
 * Return a randomly-fetched exercise
 */
// async function getExerciseRandomly() {
//   const quizCount = await getNumberOfExercises();
//   return new Promise((resolve, reject) => {
//     mongoClient.connect(dbUrl, function (err, db) {
//       if (err) {
//         reject(err);
//       }
//       const collection = db.db(dbName).collection(collectionName);
//       const skipNumber = Math.floor(Math.random() * (quizCount));
//       collection.find({})
//         .sort({
//           'ID': 1
//         })
//         .limit(1)
//         .skip(skipNumber)
//         .toArray((err, docs) => {
//           db.close()
//           if (err) {
//             reject(err);
//           } else {
//             resolve(docs);
//           }
//         });
//     });
//   });
// }

function registerAnswer(quizIndex, name, validity, reasonForValidity, difficulty, timeToAnswer, type, descriptionForType) {
  return new Promise((resolve, reject) => {
    mongoClient.connect(dbUrl, (err, db) => {
      if (err) {
        reject(err);
      }

      const collection = db.db(answersDatabaseName).collection(answersCollectionName);
      collection.insertOne({
        "quizIndex": quizIndex,
        "name": name,
        "validity": validity,
        "reasonForValidity": reasonForValidity,
        "difficulty": difficulty,
        "timeToAnswer": timeToAnswer,
        "type": type,
        "descriptionForType": descriptionForType
      }, () => {
        db.close();
        resolve();
      });
    });
  });
}

// ROUTES FOR OUR API
// =============================================================================

router.get('/', function (req, res) {
  res.json({
    message: 'Welcome to our api!'
  });
});

router.post('/', (req, res) => {
  const requestBody = req.body;
  res.json(requestBody);
});

router.get('/exercise-number', async (req, res) => {
  const exerciseNumber = await getNumberOfExercises();
  res.json({
    number: exerciseNumber
  });
});

router.get('/exercise', async (req, res) => {
  const exerciseIndex = Number(req.query['index']);
  const exercise = await getExercise(exerciseIndex);
  if (exercise.length === 0) {
    res.json({
      'error': 'Quiz not found. Try other programming languages.'
    });
  } else {
    res.json({
      exercise: exercise[0]
    });
  }
});

router.post('/answer', async (req, res) => {
  const requestBody = req.body;
  
  const quizIndex = requestBody.quizIndex;
  const name = requestBody.name;
  const validity = requestBody.validity;
  const reasonForValidity = requestBody.reasonForValidity;
  const difficulty = requestBody.difficulty;
  const timeToAnswer = requestBody.timeToAnswer;
  const type = requestBody.type;
  const descriptionForType = requestBody.descriptionForType;

  try {
    await registerAnswer(quizIndex, name, validity, reasonForValidity, difficulty, timeToAnswer, type, descriptionForType);
    res.status(200).send('Successfully registered data.');
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
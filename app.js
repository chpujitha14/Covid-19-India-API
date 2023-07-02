const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

//accept json data
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
//get list Players
app.get("/states/", async (request, response) => {
  const sqlQuery = `SELECT state_id as stateId,state_name as stateName,population FROM state;`;
  const listData = await db.all(sqlQuery);
  response.send(listData);
});

//2 API save data
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const sqlQuery = `SELECT state_id as stateId,state_name as stateName,population FROM state where state_id='${stateId}';`;
  const listData = await db.get(sqlQuery);
  response.send(listData);
});

//3 API save data
app.post("/districts/", async (request, response) => {
  const requestDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = requestDetails;
  const insertQuery = `INSERT into district(district_name,state_id,cases,cured,active,deaths) values
   (
       '${districtName}','${stateId}','${cases}','${cured}','${active}','${deaths}'
   );`;
  const dbResponse = await db.run(insertQuery);
  response.send("District Successfully Added");
});

//4 API Get single value
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const sqlQuery = `SELECT district_id as districtId,district_name as districtName,state_id as stateId,cases,cured,active,deaths FROM district where district_id='${districtId}';`;
  const listData = await db.get(sqlQuery);
  response.send(listData);
});

//5 API delete
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `DELETE FROM district where district_id='${districtId}';`;
  const teamMates = await db.exec(deleteQuery);
  response.send("District Removed");
});

//6 API update single value
app.put("/districts/:districtId/", async (request, response) => {
  const requestDetails = request.body;
  const { districtId } = request.params;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = requestDetails;
  const updateQuery = `update district set district_name='${districtName}',state_id='${stateId}'
  ,cases='${cases}',cured='${cured}',active='${active}',deaths='${deaths}' where district_id='${districtId}'`;
  const dbResponse = await db.run(updateQuery);
  response.send("District Details Updated");
});

//7 get list Directors
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const sqlQuery = `SELECT sum(cases) as totalCases,sum(cured) as totalCured,
  sum(active) as totalActive, sum(deaths) as totalDeaths FROM district where state_id='${stateId}';`;
  const directorArray = await db.get(sqlQuery);
  response.send(directorArray);
});

// 8 get list Directors
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const sqlQuery = `SELECT state_id as stateId FROM district where district_id='${districtId}';`;
  const districtData = await db.get(sqlQuery);

  const stateQuery = `SELECT state_name as stateName FROM state where state_id='${districtData.stateId}';`;
  const stateData = await db.get(stateQuery);

  response.send(stateData);
});
module.exports = app;

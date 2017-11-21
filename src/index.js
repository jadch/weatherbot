// @flow
// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const http = require('http');

const host = 'api.worldweatheronline.com';
const wwoApiKey = 'a17da0fa27f34ffa8ed111206172111';

/**
 * This function calls the weather API to get the weather
 * @param {string} city The city
 * @param {string} date The date
 * @returns {string} A string describing weather conditions
 */
function callWeatherApi(city: string, date: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Creating the path for the HTTP request
    const path = `/premium/v1/weather.ashx?format=json&num_of_days=1&q=${encodeURIComponent(city)}&key=${wwoApiKey}&date=${date}`;

    // Making the HTTP request
    http.get({ host, path }, (res) => {
      let body = ''; // used to store the response chunks
      res.on('data', (d) => { body += d; }); // storing each response chunk
      res.on('end', () => {
        const response = JSON.parse(body);
        const forecast = response.data.weather[0];
        const location = response.data.request[0];
        const conditions = response.data.current_condition[0];
        const currentConditions = conditions.weatherDesc[0].value;

        // Creating response
        const output = `Current conditions in the ${location.type}
        ${location.query} are ${currentConditions} with a projected high of
        ${forecast.maxtempC}°C and a low of
        ${forecast.mintempC}°C on
        ${forecast.date}.`;
        // Resolve the promise with the output text
        resolve(output);
      });
      res.on('error', (error) => {
        reject(error);
      });
    });
  });
}

exports.weatherWebhook = (req: {body: {result: {parameters: {date: string, 'geo-city': string}}}}, res: {setHeader: Function, send: Function}) => {
  // Get the city and date from the request
  const city = req.body.result.parameters['geo-city']; // required param
  let date = ''; // non-required

  if (req.body.result.parameters.date) {
    date = req.body.result.parameters.date;
  }
  // Calling the weather API and returning the results if they exist, sending an error otherwise
  callWeatherApi(city, date).then((output) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ speech: output, displayText: output }));
  }).catch((error) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ speech: error, displayText: error }));
  });
};

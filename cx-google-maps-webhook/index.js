/*
# Copyright 2021 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
*/

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */

 var axios = require('axios');

 exports.findPlace = async (req, res) => {
    //the variable called "tag" will be called in V3
    console.log('Cloud Function:', 'Invoked cloud function from Dialogflow');
    let tag = req.body.fulfillmentInfo.tag;
    var agentMessage;
    var predictions = [];
    var targetPage;

    if (!!tag) {
        switch (tag) {
            //BEGIN findPlace
            case 'findPlace':
                console.log(tag + ' was triggered.');
                
                // Check if required params have been populated
                if (!(req.body.intentInfo && req.body.intentInfo.parameters)) {
                  return res.status(404).send({ error: 'Not enough information.' });
                }
                // Set place-of-birth to the place-of-birth param value collected from the user.
                let destination = req.body.intentInfo.parameters['destination'].originalValue.replace(/[, ]+/g, " ").trim().toLowerCase();
                console.log('User place_of_birth: ' + destination);
                
                // invokes Maps FindPlace APIs and looks for a match
                try {
                    var config = {
                      method: 'get',
                      url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + destination + '&types=(cities)&&language=us&components=country:us&key=AIzaSyBY8Vs6cReQZE4j-e1TILT8IX-AuQ-QZ98',
                      headers: { }
                    };
                        
                    axios(config)
                    .then(function (response) {
                      //handle ZERO_RESULTS
                      if(response.data.predictions.length > 0) {
                        for(var i in response.data.predictions){
                          //create an object with properties "id", "prediction" with values from response obj
                          var prediction = response.data.predictions[i].description;
                          predictions.push(prediction);
                          //predictions[i] = response.data.predictions[i].description.toLowerCase().replace(',','');
                        }
                        
                        // single match scenario. No other options will be displayed. Transition to single_match
                        if (predictions.length == 1){
                          targetPage = "projects/diaologflow-cx-playground/locations/us-central1/agents/5b0d10a9-8bca-49f2-bb17-50144df939e0/flows/00000000-0000-0000-0000-000000000000/pages/58faf379-b661-496d-afde-9c5a2dbfca54";
                          agentMessage = "";
                        } else {
                          // multiple predictions, initially display first option. Transition to mutiple_matches 
                          targetPage = "projects/diaologflow-cx-playground/locations/us-central1/agents/5b0d10a9-8bca-49f2-bb17-50144df939e0/flows/00000000-0000-0000-0000-000000000000/pages/9d9b5bb1-2979-4462-b4bf-115513b1d6d5";
                          agentMessage = "Just to confirm, did you mean " + predictions[0] + "?";
                        } 
                        
                      } else {
                        // no matches found. Transition to no_match 
                        targetPage = 'projects/diaologflow-cx-playground/locations/us-central1/agents/5b0d10a9-8bca-49f2-bb17-50144df939e0/flows/00000000-0000-0000-0000-000000000000/pages/9654ab50-008d-4785-a854-592154b55eff';
                        agentMessage = "Sorry, I couldn't any places that match your desired departure city";
                      }
                      // send fullfilment status and a text message back to agent
                      res.status(200).send({
                        sessionInfo: {
                          parameters: {
                            predictions: predictions
                          }
                        },
                        fulfillmentResponse: {
                          messages: [{
                            text: {
                              text: [agentMessage]
                            }
                          }]
                        },
                        targetPage: targetPage
                      }); 
                    });
                    
                  } catch (error) {
                    res.status(500).send(error);
                    console.log(error);
                  }
                
                break;


            default:
                console.log('default case called');
                res.status(200).end();
                break;
        }
    }
};

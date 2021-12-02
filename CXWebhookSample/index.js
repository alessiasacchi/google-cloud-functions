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
exports.feeWaiver = (req, res) => {
    //the variable called "tag" will be called in V3
    console.log('Cloud Function:', 'Invoked cloud function from Dialogflow');
    let tag = req.body.fulfillmentInfo.tag;

    if (!!tag) {
        switch (tag) {
            //BEGIN fee-waiver
            case 'feewaiver':
                console.log(tag + ' was triggered.');
                
                // Check if required params have been populated
                if (!(req.body.sessionInfo && req.body.sessionInfo.parameters)) {
                  return res.status(404).send({ error: 'Not enough information.' });
                }
                // Set genre to the genre param value collected from the user.
                let credit_card_type = req.body.sessionInfo.parameters['credit_card_type'];
                let card_4_digits = req.body.sessionInfo.parameters['card_4_digits'];
                console.log('Credit card type: ' + credit_card_type);
                console.log('Last four digits: ' + card_4_digits);
                
                // For demo purposes: type 'VISA returns 'OK' otherwise 'KO'
                var waiver_status = 'OK';
                var answer;
                if(credit_card_type !== 'Visa') {
                  waiver_status = 'KO';
                  answer = 'Sorry, I need to transfer you to an agent that will help you with your request';    
                } else {
                  answer = 'All done! Your request was successfully submitted and you will receive a confirmation very shortly';
                }

                console.log('Credit card type is ' + credit_card_type + ' hence waiver status is ' + waiver_status + '.');
                
                // send fullfilment status and a text message back to agent
                res.status(200).send({
                        sessionInfo: {
                          parameters: {
                            waiver_status: waiver_status,
                          }
                        },
                        fulfillmentResponse: {
                          messages: [{
                            text: {
                              text: [answer]
                            }
                          }]
                        }
                }); 
                
                break;


            default:
                console.log('default case called');
                res.status(200).end();
                break;
        }
    }
};

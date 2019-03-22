/*

 ----------------------------------------------------------------------------
 | qewd-ripple: QEWD-based Middle Tier for Ripple OSI                       |
 |                                                                          |
 | Copyright (c) 2016-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

30 March 2019

*/

var dateTime = require('../../lib/shared/dateTime');

var heading = {
  name: 'respectforms',
  textFieldName: 'dateCreated',
  headingTableFields: ['dateCreated'],
  
  get: {
    
    transformTemplate: {
      author:              '{{author}}',
      dateCreated:          '=> getRippleTime(date_created)',
      source:              '=> getSource()',
      sourceId:            '=> getUid(uid)'
    }
    
  },
  
  post: {
    templateId: 'RESPECT_NSS-v0',
    
    helperFunctions: {
      formatDate: function(date) {
        return dateTime.format(new Date(date));
      }
    },
    
    transformTemplate: {
      ctx: {
        language:  'en',
        territory: 'GB'
      },
      nss_respect_form: {
        'language|code':         'en',
        'language|terminology':  'ISO_639-1',
        'territory|code':        'GB',
        'territory|terminology': 'ISO_3166-1',
        context: {
          '_health_care_facility|id':           '=> either(gpSurgeryId, "FV-DGH")',
          '_health_care_facility|id_scheme':    'NHSScotland',
          '_health_care_facility|id_namespace': 'NHSScotland',
          '_health_care_facility|name':         '=> either(healthcareFacility, "Forth Valley DGH")',
          start_time:                           '=> formatDate(dateUpdated)',
          'setting|code':                       '238',
          'setting|value':                      'other care',
          'setting|terminology':                'openehr',
          status:                              '{{formStatus}}' //Started|Incomplete| Complete and Signed
        },
        'composer|name':         '{{author}}',
        'composer|id':           '=> either(author_id, "12345")',
        'composer|id_scheme':    'NHSScotland',
        'composer|id_namespace': 'NHSScotland',
        respect_headings: {
          'a2._summary_of_relevant_information': {
            'a2.0_relevant_information': {
              respect_summary: {
                narrative_summary:                '{{summaryInformation.summary}}'
              }
            },
            'a2.3_other_relevant_planning_documents' : {
              advance_planning_documentation: {
                advance_planning_document: [
                  {
                    name: '{{summaryInformation.details}}'
                  }
                ]
              }
            }
          },
          'a3._personal_preferences': {
            preferred_priorities_of_care: {
              patient_care_priority:              '{{personalPreferences.preferencesText}}',
              care_priority_scale:                '{{personalPreferences.preferencesValue}}'
            }
          },
          'a4._clinical_recommendations': {
            recommendation: {
              clinical_focus:                     '{{clinicalRecommendation.focusValue}}',
              clinical_guidance_on_interventions: '{{clinicalRecommendation.clinicalGuidance}}',
            },
            cpr_decision: {
              'cpr_decision|code':                '{{clinicalRecommendation.cprValue}}',  // at0004 | at0005 | at0027
              date_of_cpr_decision:               '=> formatDate(clinicalRecommendation.dateCompleted)'
            }
          },
          'a5._capacity_and_representation': {
            capacity_respect: {
              sufficient_capacity:                '=> toBoolean(capacityFirst)',
              'legal_proxy|code':                 '{{capacitySecond}}' // at0004 | at0005 | at0006
            }
          },
          'a6._involvement_in_making_plan': {
            involvement_respect: {
              involvement_in_recommendations: {
                'involvement|code':               '{{involvementCode}}', // at0003 | 04 | 05 | 11 | 12 | 13
                reason_for_not_selecting_options_a_or_b_or_c:     '{{notSelectingReason}}',
              },
              name_and_role_of_those_involved_in_decision_making: '{{decisionMakers}}'
            }
          },
          'a7._clinician_signatures': {
            clinician_signature: [
              {
                ism_transition: {
                  'current_state|value': 'completed'
                },
                service_name: 'ReSPECT clinician signature',
                signing_clinician: {
                  practitioner_role: {
                    designation: '{{clinicalSignatures.signaturesArray[0].designation}}'
                  },
                  'name/use|code': 'at0002',
                  text: '{{clinicalSignatures.signaturesArray[0].clinicialName}}}',
                  identifier: {
                    value:            '{{clinicalSignatures.signaturesArray[0].gmcNumber}}',
                    'value|issuer':   'ProfessionalID',
                    'value|assigner': 'ProfessionalID',
                    'value|ty pe': 'ProfessionalID',
                    'use|code':   'at0004'
                  }
                },
                time: '=> formatDate(clinicalSignatures.signaturesArray[0].dateAndTime)'
              }
            ]
          },
          'a8._emergency_contacts': {
            emergency_contacts: {
              name: 'ReSPECT emergency contacts',
              participant: [
                {
                  role: '{{emergencyContacts.contactsArray[0].role}}',  // Legal proxy or parent|Family or friend or other|GP|Lead consultant
                  contact: {
                    name: {
                      text: '{{emergencyContacts.contactsArray[0].name}}',
                      'use|code': 'at0002'
                    },
                    telephone: {
                      'system|code': 'at0012',  // at0002
                      telephone_number: '{{emergencyContacts.contactsArray[0].phone}}'
                    }
                  }
                }
              ],
              other_details: '{{emergencyContactsOtherDetails}}',
            }
          },
          'a9._confirmation_of_validity': {
            service: [
              {
                ism_transition: {
                  'current_state|value': 'completed',
                  service_name:          'Respect form - confirmation of validity',
                },
                responsible_clinician: {
                  practitioner_role: {
                    designation:         '{{confirmation.confirmationsArray[0].designation}}'
                  },
                  name: {
                    'use|code': '{{responsibleClinicianNameUseCode}}',  // "at0002"
                    text:       '{{confirmation.confirmationsArray[0].clinicialName}}'
                  },
                  identifier: {
                    value:            '{{confirmation.confirmationsArray[0].gmcNumber}}',
                    'value|issuer':   'ProfessionalID',
                    'value|assigner': 'ProfessionalID',
                    'value|type':     'ProfessionalID',
                    'use|code':       'at0004',
                  }
                },
                review_date: '{{confirmation.confirmationsArray[0].reviewDate}}',  // "2019-04-23",
                time: '=> formatDate(confirmation.dateCompleted)'
              }
            ]
          }
        }
      }
    }
  }
};

module.exports = heading;

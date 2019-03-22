  /*

    Create version 1 of a new reSPECT form for a patient

    API:

       POST /api/patients/:patientId/respectforms

    QEWD Document Storage:

    RespectForm('next_id')=next id counter

    RespectForm('by_id', id, 'version', versionNo) <= data
    RespectForm('by_id', id, 'next_version')

    RespectFormIndex('by_patientId', patientId, id) = ''

    RespectFormIndex('by_uid', uid) = id   // composition id

  */

var uuid = require('uuid/v4');
var getRespectFormVersions = require('../getRespectFormVersions');

module.exports = function(args, finished) {

  var patientId = args.patientId;

  if (!patientId) {
    return finished({error: 'Patient Id was not defined'});
  }

  var data = args.req.body;
  var formsDoc = this.db.use('RespectForm');
  var id = formsDoc.$('next_id').increment();
  var patientFormsDoc = formsDoc.$(['by_id', id]);
  var version = patientFormsDoc.$('next_version').increment();
  var formDoc = patientFormsDoc.$(['version', version]);
  data.uuid = uuid();
  data.patientId = patientId;

  formDoc.setDocument(data);

  getRespectFormVersions.call(this, args, finished);

};

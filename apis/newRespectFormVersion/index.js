  /*

    Create a new version of an existing reSPECT form for a patient

    API:

       POST /api/patients/:patientId/respectforms/:sourceId

    QEWD Document Storage:

    RespectForm('next_id')=next id counter

    RespectForm('by_id', id, 'version', versionNo) <= data
    RespectForm('by_id', id, 'next_version')

    RespectFormIndex('by_patientId', patientId, id) = ''

    RespectFormIndex('by_uid', uid, versionNo) = id   // composition id

  */

var getRespectFormVersions = require('../getRespectFormVersions');

module.exports = function(args, finished) {

  var patientId = args.patientId;

  if (!patientId) {
    return finished({error: 'Patient Id was not defined'});
  }
  var patientIndex = this.db.use('RespectFormIndex', 'by_patientId', patientId);
  if (!patientIndex.exists) {
    return finished({error: 'The selected patient does not have any Respect Forms'});
  };
  var sourceId = args.sourceId;
  if (!sourceId) {
    return finished({error: 'SourceId was not defined'});
  }
  var uidIndex = this.db.use('RespectFormIndex', 'by_uid', sourceId);
  if (!uidIndex.exists) {
    return finished({error: 'The specified sourceId does not exist'});
  };

  var version = uidIndex.firstChild.name;
  console.log('*** version = ' + version);
  var id = uidIndex.$(version).value;
  console.log('*** id=' + id);
  var data = args.req.body;
  var formsDoc = this.db.use('RespectForm');
  var patientFormsDoc = formsDoc.$(['by_id', id]);
  var version = patientFormsDoc.$('next_version').increment();
  var formDoc = patientFormsDoc.$(['version', version]);
  data.uuid = sourceId;
  data.patientId = patientId;

  formDoc.setDocument(data);

  getRespectFormVersions.call(this, args, finished);

};

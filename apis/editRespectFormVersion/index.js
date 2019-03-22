  /*

    Edit an existing version of an existing reSPECT form for a patient

    API:

       PUT /api/patients/:patientId/respectforms/:sourceId/:version

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
  var version = args.version;
  if (!version) {
    return finished({error: 'version was not defined'});
  }
  var versionIndex = uidIndex.$(version);
  if (!versionIndex.exists) {
    return finished({error: 'The specified sourceId and version does not exist'});
  };

  var id = versionIndex.value;
  console.log('*** id=' + id);
  var data = args.req.body;
  data.uuid = sourceId;
  data.patientId = patientId;

  var formDoc = this.db.use('RespectForm', 'by_id', id, 'version', version);
  formDoc.delete(); // just in case - so old data isn't merged
  formDoc.setDocument(data);

  getRespectFormVersions.call(this, args, finished);

};

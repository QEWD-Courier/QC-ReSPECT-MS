  /*
    API:

       GET /api/patients/:patientId/respectforms

    QEWD Document Storage:

    RespectForm('next_id')=next id counter

    RespectForm('by_id', id, 'version', versionNo) <= data

    RespectForm('by_id', id, 'next_version')

    RespectFormIndex('by_patientId', patientId, id) = ''

    RespectFormIndex('by_uid', uid, versionNo) = id   // composition id

  */

module.exports = function(args, finished) {

  var patientId = args.patientId;

  if (!patientId) {
    return finished({error: 'Patient Id was not defined'});
  }

  var patientIndex = this.db.use('RespectFormIndex', 'by_patientId', patientId);
  var results = [];

  var formsDoc = this.db.use('RespectForm', 'by_id');

  patientIndex.forEachChild(function(id) {
    var versionsDoc = formsDoc.$([id, 'version']);
    versionsDoc.forEachChild(function(versionNo, versionDoc) {
      var author = versionDoc.$('author').value;
      var dateCreated = versionDoc.$('dateCompleted').value;
      var status = versionDoc.$('status').value;
      var sourceId = versionDoc.$('uuid').value;  // defined and added when originally posted
      results.push({
        version: versionNo,
        author: author,
        dateCreated: dateCreated,
        status: status,
        sourceId: sourceId,
        source: 'ethercis'
      });
    });
  });

  finished({
    api: 'getRespectFormVersions',
    use: 'results',
    results: results
  });

};

module.exports = function(args, finished) {
  //console.log('** beforeHandler: jwt = ' + JSON.stringify(args.session, null, 2));
  if (!args.session.nhsNumber) {
    finished({error: 'You must be logged in'});
    return false;
  }
};

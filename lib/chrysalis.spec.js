'use strict';
var sinon = require('sinon');
var chrysalis = require('./index');
var httpExtractor = require('http-extractor');
var nock = require('nock');
var q = require('q');

describe('chrysis Framework', function() {

  beforeEach(function() {

  });

  afterEach(function() {
    nock.cleanAll();
  });

  it('should throw an error if an extractor is not supplied', function() {
    (function() {
      var chrysis = chrysalis();
      chrysis.setTransformer('transformer')
          .setComparator('comparator')
          .setLoader('loader')
          .run();
    }).should.throw('Extractor not found, set one with setExtractor(extractor)');
  });

  it('should throw an error if a transformer is not supplied', function() {
    (function() {
      var chrysis = chrysalis();
      chrysis.setExtractor('extractor')
          .setComparator('comparator')
          .setLoader('loader')
          .run();
    }).should.throw('Transformer not found, set one with setTransformer(transformer)');
  });

  it('should throw an error if a loader is not supplied', function() {
    (function() {
      var chrysis = chrysalis();
      chrysis.setExtractor('extractor')
          .setTransformer('transformer')
          .setComparator('comparator')
          .run();
    }).should.throw('Loader not found, set one with setLoader(loader)');
  });

  it('should NOT throw an error if the optional comparator is not supplied', function() {
    (function() {
      var chrysis = chrysalis();
      chrysis.setExtractor({extract: function(){return q.resolve();}})
          .setTransformer({transform: function(){return q.resolve();}})
          .setLoader({load: function(){return q.resolve();}})
          .run();
    }).should.not.throw();
  });

  it('should throw an error if the extractor throws an error', function(done) {
    var extractor = httpExtractor('http://google.com/geturl');
    nock('http://google.com')
      .get('/geturl')
      .once()
      .reply(500, '<?xml version="1.0"?><test><data><deep><data>test</data></deep></data></test>',
        {
          'content-type': 'text/xml'
        });
    var chrysis = chrysalis();
    chrysis.setExtractor(extractor)
      .setTransformer({transform: function(){return q.resolve();}})
      .setLoader({load: function(){return q.resolve();}})
      .run()
      .then(null, function(reason) {
        reason.error.should.equal('STATUS_CODE_ERROR');
        done();
      });
  });
});

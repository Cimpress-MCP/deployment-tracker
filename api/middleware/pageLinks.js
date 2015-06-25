"use strict";

function constructLinks(baseUrl, offset, limit) {
  var links = {
    next: baseUrl + "?offset=" + (offset + limit) + "&limit=" + limit
  };

  if(offset !== 0){
    links.prev = baseUrl + "?offset=" + Math.max(offset - limit, 0) + "&limit=" + limit;
  }

  return links;
}

// Middleware to construct link headers to next and previous pages for requests
// that are serviced by a Swagger endpoint and have offset and limit QSPs
module.exports = function(req, res, next) {
  var baseUrl = req.protocol + "://" + req.get("host") + req.path;
  if(req.hasOwnProperty("swagger") && req.swagger.params.hasOwnProperty("offset") && req.swagger.params.hasOwnProperty("limit")) {
    res.links(constructLinks(baseUrl, req.swagger.params.offset.value, req.swagger.params.limit.value));
  }
};

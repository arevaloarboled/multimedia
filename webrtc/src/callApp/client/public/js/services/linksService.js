'use strict';

/**
 * @ngdoc function
 * @name webApp.service:LinksService
 * @description
 * # LinksService
 * Service of the webApp
 */

(function() {
  angular.module('webApp')
    .factory('LinksService', ['$http','$q','httpFilter', 'tagsFilter',
    function($http, $q, httpFilter, tagsFilter) {
      var api = 'http://192.168.1.16:5000';
      var links = [];
      var tags = [];
      var search = "*";

      function getLinks(){
        return links;
      };

      function getTags(){
        return tags;
      };

      function getSearchFilter(){
        return search;
      };

      function setSearchFilter(value){
        search = value;
      };

      function getLinkById(id){
        return  _.find(links,function(rw){ return rw.id == id });
      };

      function addLink(title, url, _tags){
        var tagsfil = tagsFilter(_tags);

        //var d = new Date(1382086394000);
        /*links.unshift({
          id: links.length + 1,
          title: title,
          url: httpFilter(url),
          tags: tagsfil,
          date: new Date(Date.now())
        });
        */

        $http.post(api + '/link/add', 
          {
            title: title,
            url: httpFilter(url),
            tags: tagsfil,
            date: new Date(Date.now())
          }
        ).then(function success(response) {
            console.log(response);
          },function error(response) {
            console.log(response);
        });
      };
      
      function editLink(id, title, url, _tags){
        var tagsfil = tagsFilter(_tags);

        $http.post(api + '/link/edit', 
          {
            id: id,
            link:{
              title: title,
              url: httpFilter(url),
              tags: tagsfil,
              date: new Date(Date.now())
            }
          }
        ).then(function success(response) {
            console.log(response);
          },function error(response) {
            console.log(response);
        });
      };

      function deleteLink(id){
        $http.post(api + '/link/delete', 
          {
            id: id
          }
        ).then(function success(response) {
            console.log(response);
          },function error(response) {
            console.log(response);
        });
      };

      function updateTags(){
        tags = [];
        _.each(links, function(link){
          _.each(link.tags, function(tag){
            if(tags.indexOf(tag) == -1) {
              tags.push(tag);
            }
          });
        });
      };

      function getTagsCount(tagName){
        var result = 0;
        _.each(links, function(link){
          if(link.tags.indexOf(tagName) !== -1) {
            result++;
          }
        });
        return result;
      };

      function getLinksByTag(tagName){
        links = [];
        return links;
      };



      /*
      * API Calls
      */
      function refreshFromAPI(){
        var deferred = $q.defer();
        
        getLinksFromAPI();
        updateTags();

        deferred.resolve();
        return deferred.promise;
      }

      function getLinksFromAPI(){
        $http.get(api + '/links')
          .then(function success(response) {
            links = response.data;

          },function error(response) {
              console.log(response);
        });
      }

      function getTagsFromAPI(){
        $http.get(api + '/tags')
          .then(function success(response) {
            tags = response.data;
            tags.sort();
          },function error(response) {
              console.log(response);
        });
      }

      return {
        getLinks: getLinks,
        getTags: getTags,
        getSearchFilter: getSearchFilter,
        setSearchFilter: setSearchFilter,
        getLinkById: getLinkById,
        addLink: addLink,
        editLink: editLink,
        deleteLink: deleteLink,
        getTagsCount: getTagsCount,
        getLinksByTag: getLinksByTag,
        refreshFromAPI: refreshFromAPI,
      };
    }]
  );

})();

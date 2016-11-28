'use strict';

var loginPage = document.querySelector('#login-page'),
    usernameInput = document.querySelector('#username'),
    loginButton = document.querySelector('#login'),
    callPage = document.querySelector('#call-page'),
    theirUsernameInput = document.querySelector('#their-username'),
    callButton = document.querySelector('#call'),
    hangUpButton = document.querySelector('#hang-up'),
    signinPage = document.querySelector('#signin-page');

callPage.style.display = "none";

var name,
    connectedUser;
var connection = new WebSocket('wss://192.168.0.18:8888');

connection.onopen = function() {
    console.log("Connected");
};

//Make sure websocket is closed before page is closed
window.onbeforeunload = function() {
    angular.element(document.getElementById('MAIN')).scope().closet();
    connection.onclose = function () {}; // disable onclose handler first
    connection.close()
};

// Handle all messages through this callback
connection.onmessage = function(message) {
    console.log("Got message", message.data);
    var data = JSON.parse(message.data);
    switch (data.type) {
        case "login":
            onLogin(data.success);
            break;
        case "offer":
            if (confirm("Llamada entrante de "+data.name) == true) {
                onOffer(data.offer, data.name);
                angular.element(document.getElementById('MAIN')).scope().en_llamada();                
            }else{
              onOffer(data.offer, data.name);
              send({
                  type: "leave"
              });
              onLeave();
              angular.element(document.getElementById('MAIN')).scope().rechazada();
            }            
            break;
        case "answer":
            onAnswer(data.answer);
            break;
        case "candidate":
            onCandidate(data.candidate);
            break;
        case "leave":
            onLeave();
            angular.element(document.getElementById('MAIN')).scope().finalizada();
            break;
        default:
            break;
    }
};
connection.onerror = function(err) {
    console.log("Got error", err);
};
// Alias for sending messages in JSON format
function send(message) {
    if (connectedUser) {
        message.name = connectedUser;
    }
    connection.send(JSON.stringify(message));
};


(function() {

  /**
   * @ngdoc function
   * @name webApp.controller:MenuCtrl
   * @description
   * # MenuCtrl
   * Controller of the webApp
   */
  angular.module('webApp')
    .controller('MenuCtrl', [
      '$scope',
      '$q',
      '$mdSidenav',
      '$mdMedia',
      'LinksService','$window','$http','$mdDialog','$mdToast',
      MenuCtrl]);

  function MenuCtrl($scope, $q, $mdSidenav, $mdMedia, LinksService, $window, $http, $mdDialog, $mdToast) {
    $scope.random=false;
    $scope.contactos=[];
    $scope.tags;
    $scope.id=getCookie("id");
    $scope.user=getCookie("user");
    
    $scope.$watch(function() { return LinksService.getTags(); },
      function(value) {
        $scope.tags = value;
      }
    );

    $scope.getMinRes = function(){
      return $mdMedia('gt-xs');
    };

    $scope.openLeftMenu = function() {
      $mdSidenav('left').toggle();
    };

    $scope.searchByTag = function(tagName){
      LinksService.setSearchFilter(tagName);
      $mdSidenav('left').close();
    };

    $scope.searchByAllTags = function(){
      LinksService.setSearchFilter("*");
      $mdSidenav('left').close();
    };

    $scope.getAllLinksCount = function(){
      return LinksService.getLinks().length;
    };

    $scope.getTagsCount = function(tagName){
      return LinksService.getTagsCount(tagName);
    };    

    $scope.finalizada = function(){        
        $mdToast.show(
          $mdToast.simple()
            .textContent('Llamanda finalizada...')
            .hideDelay(3000)
        );

        $http.get(rest_dir+'no_llamada/'+getCookie("id")).then(function(data) {              
              console.log(data);
        },(function (data) {
            console.log('error');
        }));        
      };

      $scope.rechazada = function(){        
        $mdToast.show(
          $mdToast.simple()
            .textContent('Llamanda rechazada!')
            .hideDelay(3000)
        );
      };

    $scope.send_login = function () {
          $http.post(rest_dir+'login', {
              usuario : $scope.usuario,
              pass : $scope.pass
        }).then(function (data) {
            data=data['data'];
            if(data=="null"){
              $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.querySelector('#popupContainer')))
              .clickOutsideToClose(true)
              .title('Error en inicio de session')
              .textContent('usuario o contraseña invalida, intente de nuevo')
              .ariaLabel('Alert Dialog Demo')
              .ok('Entiendo')
            );
            }
            else{                
                setCookie("id",data['idusuarios']);
                setCookie("user",data['user']);  
                name = data['user'];
                if (name.length > 0) {
                    send({
                        type: "login",
                        name: name
                    });
                }
                $scope.id=getCookie("id");
                $scope.user=getCookie("user");   
                $scope.search();
                $http.get(rest_dir+'online/'+getCookie("id")).then(function(data) {              
                      console.log(data);
                },(function (data) {
                    console.log('error');
                }));           
                //$window.location.href = $window.location.pathname;
                //$window.reload;
            }
            //console.log(data);
            //do something with data
            
        },(function (data) {
            console.log(data,'Error contacte el administrador');
        }));
      };

      $scope.send_signin = function () {
          $http.post(rest_dir+'signin', {
              usuario : $scope.usuario,
              pass : $scope.pass                    
              }).then(function (data) {
                console.log(data);
                //data = data['data'];
                //$window.location.href = $window.location.pathname;                
                //$window.reload;
                $mdToast.show(
                  $mdToast.simple()
                    .textContent('Usuario creado!')
                    .hideDelay(3000)
                );
                $window.location.href = $window.location.pathname;
                $window.reload;
              },(function (data) {
                  console.log(data,'Error contacte el administrador');
              }));                          
      }

      $scope.ver_user = function () {
          $http.post(rest_dir+'ver_user', {
              user : $scope.usuario
              }).then(function (data) {
                data = data['data'];
                if(data[1][0]['num']==0){
                  $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('Verificacion de usuario')
                .textContent('Usuario disponible!')
                .ariaLabel('Alert Dialog Demo')
                .ok('Entiendo')
              );
                }
                else{
                  $mdDialog.show(
              $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('Verificacion de usuario')
                .textContent('Usuario no disponible..')
                .ariaLabel('Alert Dialog Demo')
                .ok('Entiendo')
              );
                }
              },(function (data) {
                  console.log(data,'Error contacte el administrador');
              }));
      }

      $scope.logout= function(){
        $http.get(rest_dir+'out/'+getCookie("id")).then(function(data) {              
              $window.location.href = $window.location.pathname;
              $window.reload;  
              console.log(data);
        },(function (data) {
            console.log('error');
        }));
        delete_cookie("id");
        delete_cookie("user");      
        $scope.openLeftMenu();                   
      };

      if($scope.id!=undefined){      
        $scope.logout();
      }


      $scope.search = function() {
          $http.get(rest_dir+'users/'+getCookie("id")).then(function(data) {
                data = data['data'];
                $scope.contactos=data[0];
                console.log(data);
          },(function (data) {
              console.log('error');
          }));
      };     
      $scope.eliminar = function (user) {
          $http.post(rest_dir+'eliminar', {
              user : user,
              usuario : $scope.id
              }).then(function (data) {
                $scope.search();
                $mdToast.show(
                  $mdToast.simple()
                    .textContent('Usuario eliminado...')
                    .hideDelay(3000)
                );                
              },(function (data) {
                  console.log(data,'Error contacte el administrador');
              }));                          
      }
      $scope.llamar = function(user){
        var theirUsername = user;
        if (theirUsername.length > 0) {
            startPeerConnection(theirUsername);
        }
        $mdToast.show(
          $mdToast.simple()
            .textContent('Llamando...')
            .hideDelay(3000)
        );
        $http.get(rest_dir+'en_llamada/'+getCookie("id")).then(function(data) {              
              console.log(data);
        },(function (data) {
            console.log('error');
        }));
      }

      $scope.agregar=function(){
        var confirm = $mdDialog.prompt()
        .title('Nombre del usuario')
        .placeholder('Usuario')
        .ok('Agregar')
        .cancel('Cancelar');
  
      $mdDialog.show(confirm).then(function(result) {
        $http.post(rest_dir+'agregar', {
              user : result,
              usuario : $scope.id
        }).then(function(data) {
          if(data['data']!='"ok"'){
            $mdToast.show(
              $mdToast.simple()
                .textContent('Usuario no existe...')
                .hideDelay(3000)
            );    
            return;
          }
          else{
            $scope.search();
            $mdToast.show(
              $mdToast.simple()
                .textContent('Usuario añadido!')
                .hideDelay(3000)
            );
          }
        });                
      });
      $scope.search();
      };

      $scope.colgar = function(){
        send({
            type: "leave"
        });
        onLeave();
        $mdToast.show(
          $mdToast.simple()
            .textContent('Llamanda finalizada...')
            .hideDelay(3000)
        );
        $http.get(rest_dir+'no_llamada/'+getCookie("id")).then(function(data) {              
              console.log(data);
        },(function (data) {
            console.log('error');
        }));        
      }

      $scope.en_random = function(){
        if ($scope.random) {
          $scope.no_random();
          return;
        };        
        $http.get(rest_dir+'en_random/'+getCookie("id")).then(function(data) {              
              console.log(data);
        },(function (data) {
            console.log('error');
        }));
        $mdToast.show(
          $mdToast.simple()
            .textContent('Buscando random ...')
            .hideDelay(3000)
        );
        $http.get(rest_dir+'get_random/'+getCookie("id")).then(function(data) {
                console.log(data);
                data = data['data'];                
                data=data[1];
                if(data.length>0){
                    var rand_user=data[Math.floor((Math.random() * data.length))].user;
                    var theirUsername = rand_user;
                    if (theirUsername.length > 0) {
                        startPeerConnection(theirUsername);
                    }                    
                    $scope.en_llamada();
                }                
          },(function (data) {
              console.log('error');
          }));
        $scope.random=true;
      }
      $scope.no_random = function(){
        if(!$scope.random){
          return;
        }
        $http.get(rest_dir+'no_random/'+getCookie("id")).then(function(data) {              
              console.log(data);
        },(function (data) {
            console.log('error');
        }));
        $mdToast.show(
          $mdToast.simple()
            .textContent('Saliendo de random...')
            .hideDelay(3000)
        );
        $scope.random=false;        
      }

      $scope.en_llamada = function(){        
        $http.get(rest_dir+'en_llamada/'+getCookie("id")).then(function(data) {              
              console.log(data);
        },(function (data) {
            console.log('error');
        }));
        $mdToast.show(
          $mdToast.simple()
            .textContent('En llamada...')
            .hideDelay(3000)
        );
        $scope.no_random();
      }

      $scope.closet = function(){        
        $http.get(rest_dir+'out/'+getCookie("id")).then(function(data) {              
              console.log(data);
        },(function (data) {
            console.log('error');
        }));        
      }

  }

})();

var rest_dir="https://restaurant-arevaloarboled.c9users.io/Rest/rest/rest.php/"

var epeControllers = angular.module('webApp')
    .controller('MainCtrl', [
      '$scope',
      '$q',
      '$mdPanel',
      '$mdMedia',
      'LinksService',
      'PollingService',
      'httpFilter','ngMaterial', 'ngMessages', 'material.svgAssetsCache','$mdToast','$mdSidenav']);
      
function actualizar_scope(){
      $scope.id=getCookie("id");
      $scope.user=getCookie("user");
      $scope.lvl=getCookie("lvl");
    };
function add_edit_array(item){
  item.edit=false;
};


epeControllers.controller('LogIn', ['$scope', '$http','$window','$mdDialog',
  function ($scope, $http,$window,$mdDialog) {
      if(getCookie("id")!=undefined){
          $window.location.href = $window.location.pathname+'#/principal';
          $window.reload;
      }
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
                $window.location.href = $window.location.pathname;
                $window.reload;
            }
            //console.log(data);
            //do something with data
            
        },(function (data) {
            console.log(data,'Error contacte el administrador');
        }));
      }
  }]);
  
  epeControllers.controller('signin', ['$scope', '$http','$window','$mdDialog','$mdToast',
  function ($scope, $http,$window,$mdDialog,$mdToast) {
      if(getCookie("id")!=undefined){
          $window.location.href = $window.location.pathname+'#/principal';
          $window.reload;
      }      
      
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

  }]);
  
  
  epeControllers.controller('principal', ['$scope', '$http','$window','$mdDialog',
  function ($scope, $http,$window) {
      if(getCookie("id")==undefined){
          $window.location.href = $window.location.pathname;
          $window.reload;
      }

      $scope.search = function() {
          $http.get(rest_dir+'users/'+getCookie("id")).then(function(data) {
                data = data['data'];
                console.log(data);
          },(function (data) {
              console.log('error');
          }));
      };

      $scope.search();

  }]);

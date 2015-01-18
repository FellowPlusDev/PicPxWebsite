angular
  .module('DeepPicApp', ['angularFileUpload'])
  .controller('UploadCtrl', function($scope, FileUploader) {
    var uploader = $scope.uploader = new FileUploader({
      url: '/image/upload',
      autoUpload: true,
      alias: 'image',
      filters: [{
        name: 'imageFilter',  
        fn: function(item, options) {
          return /image\/.*/.test(item.type)  ;
        }
      }]
    });

    uploader.onAfterAddingFile = function(item) {
        console.log(item);
    };

    uploader.onProgressItem = function(fileItem, progress) {
      console.info('onProgressItem', fileItem, progress);
    };

    uploader.onSuccessItem = function(fileItem, response, status, headers) {
      fileItem.remoteUrl = response.message;
      console.info('onSuccessItem', fileItem, response, status, headers);
    };


    $scope.clickUpload = function() {
      angular.element('#file').trigger('click');
    }
  });

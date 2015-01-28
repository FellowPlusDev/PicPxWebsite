var app = angular.module('DeepPicApp', ['angularFileUpload', 'ngClipboard']);

app.config(['ngClipProvider', function(ngClipProvider) {
  ngClipProvider.setPath("/bower_components/zeroclipboard/dist/ZeroClipboard.swf");
}]);

app.controller('UploadCtrl', function($scope, FileUploader) {
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

  angular.element('body').on('paste', function($event) {
    var items = $event.originalEvent.clipboardData.items;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (/image\/.*/i.test(item.type)) {
        var file = item.getAsFile();
        console.log(item.type);
        file.name = file.fileName = item.type.replace(/image\//i, 'paste.');
        uploader.addToQueue(file);
      }
    }
  });

  uploader.onSuccessItem = function(fileItem, response, status, headers) {
    fileItem.remoteUrl = response.message;
  };

  $scope.clickUpload = function() {
    angular.element('#file').trigger('click');
  };

  $scope.toggleSelect = function(item) {
    if (item.isSuccess) {
      item.isSelected = !(item.isSelected);
    }
  };

  $scope.selectOutput = function() {
    angular.element('.sidebar textarea').focus().select();
  };

  $scope.selectAll = function() {
    _.each(uploader.queue, function(item) {
      if (item.isSuccess) {
        item.isSelected = true;
      }
    });
  };

  $scope.selectNone = function() {
    _.each(uploader.queue, function(item) {
      if (item.isSuccess) {
        item.isSelected = false;
      }
    });
  };

  $scope.isOutputVisible = function() {
    return _.any(uploader.queue, { isSelected: true });
  };

  $scope.output = function() {
    return _.chain(uploader.queue)
            .where({ isSelected: true })
            .map(function(item) { return item.remoteUrl + '\n'; })
            .value().join('');
  };
});

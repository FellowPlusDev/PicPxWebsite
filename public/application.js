var app = angular.module('DeepPicApp', ['angularFileUpload', 'ngClipboard']);

app.config(['ngClipProvider', function(ngClipProvider) {
  ngClipProvider.setPath("/assets/lib/zeroclipboard/dist/ZeroClipboard.swf");
}]);

app.controller('UploadCtrl', function($scope, $timeout, $http, FileUploader) {
  var uploader = $scope.uploader = new FileUploader({
    url: 'http://v0.api.upyun.com/deeppic',
    autoUpload: false,
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
    fileItem.remoteUrl = 'http://deeppic.b0.upaiyun.com' + response.url;
  };

  uploader.onAfterAddingFile = function(fileItem) {
    var request = $http.post('/uptoken', { image: fileItem.file.name });
    
    request.success(function(data, status, headers, config) {
      fileItem.formData = [data];
      fileItem.upload();
    });

    request.error(function(data, status, headers, config) {
      console.error(data);
      fileItem.remove();
    });
  };

  $scope.clickUpload = function() {
    angular.element('#file').trigger('click');
  };

  $scope.toggleSelect = function(item) {
    if (item.isSuccess) {
      item.isSelected = !(item.isSelected);
    }

    angular.element('#btn-copy').triggerHandler('click');
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

  $scope.removeItem = function(item) {
    item.cancel();
    item.remove();
  };

  $scope.getItemUrl = function(item) {
    return item.remoteUrl;
  };

  $scope.showCopySuccess = function(item) {
    item.isJustCopied = true;
    $timeout(function() {
      item.isJustCopied = false;
    }, 1000);
  };

  $scope.removeSelection = function() {
    while(true) {
      var item = _.chain(uploader.queue)
                  .where({ isSelected: true })
                  .last().value();

      if (item) {
        item.remove();
      } else {
        break;
      }
    }
  }

  // 清除当前所有图片
  $scope.handleKey = function($event) {
    if ($event.keyCode == 27) {
      uploader.clearQueue();
    }
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

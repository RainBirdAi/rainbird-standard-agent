angular.module('rbApp.tryGoal', ['rbApp.tryGoal.service', 'ng-showdown'])
    .config(['$showdownProvider', function($showdownProvider) {
        $showdownProvider.setOption('omitExtraWLInCodeBlocks', true);
        $showdownProvider.setOption('literalMidWordUnderscores', true);
        $showdownProvider.setOption('strikethrough', true);
        $showdownProvider.setOption('tables', true);
        $showdownProvider.setOption('ghCodeBlocks', true);
        $showdownProvider.setOption('tasklists', true);
        $showdownProvider.setOption('disableForced4SpacesIndentedSublists', true);
        $showdownProvider.setOption('simpleLineBreaks', true);
        $showdownProvider.setOption('noHeaderId', true);
        $showdownProvider.setOption('parseImgDimensions', true);
        $showdownProvider.setOption('openLinksInNewWindow', true);
    }]);

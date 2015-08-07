var Remoting = (function () {
    var retrieveSobjectRelatedMetadata = function (sobjectName, callbackFunction) {
        result = AspContext.resultFromServer;
        result = JSON.parse(window.atob(result));
        if (result != null) {
            if (result.listviewsMetadata != null) {
                welinkStorage['welink_' + sobjectName + '_orderedlistviews'] = JSON.stringify(result.listviewsMetadata);
                AjaxResponses.orderedListviews = result.listviewsMetadata;
            } else {
                sobject.ordered_listviews = AjaxResponses.listviews.listviews;
            }

            if (result.businessprocessesMetadata != null) {
                welinkStorage['welink_' + sobjectName + '_recordtype'] = JSON.stringify(result.recordtypesMetadata);
                AjaxResponses.recordtype = result.recordtypesMetadata;
            };
            if (result.recordtypesMetadata != null) {
                AjaxResponses.businessprocess = result.businessprocessesMetadata;
                welinkStorage['welink_' + sobjectName + '_businessprocess'] = JSON.stringify(result.businessprocessesMetadata);
            };

            if (result.recordtypeLayouts != null) {
                var welinkLayouts = {};
                for (var property in result.recordtypeLayouts) {
                    welinkLayouts[property] = JSON.parse(window.decodeURIComponent(window.atob(result.recordtypeLayouts[property]).replace(/spaceescaper/g, ' ')));
                };
                AjaxResponses.welinklayouts = welinkLayouts;
                welinkStorage['welink_' + sobjectName + '_welinklayouts'] = JSON.stringify(welinkLayouts);
            };
        }

        welinkStorage['welink_' + sobjectName + '_hasRetrievedSobjectRelated'] = 'true';
        AjaxResponses.has_retrieved_sobject_related = true;
        callbackFunction();
    };

    return {
        retrieveSobjectRelated: retrieveSobjectRelatedMetadata
    };
})();
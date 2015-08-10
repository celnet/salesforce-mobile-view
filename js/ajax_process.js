var AjaxProcessor = (function(){
        var handleDescribeLayoutsAndSearchFields = function(response){
		AjaxResponses.sobjectdescribe = response.results[0].result;
                AjaxResponses.layouts = response.results[1].result;
                
                if(response.results[1].result.layouts != null && response.results[1].result.layouts.length > 0){
                    AjaxResponses.layout = response.results[1].result.layouts[0];
                }
        
		AjaxResponses.searchlayout = response.results[2].result;
	};
	
	var prepareLayoutDetailsRequestBody = function(recordTypeLayoutMappings){
                var recordTypeIds = [];
                var reqBody = {
                    batchRequests:[]
                };
                
                for(var i = 0; i < recordTypeLayoutMappings.length; i++){
                    var singleRequestUrl = recordTypeLayoutMappings[i].urls.layout.substring(15);
                    var recordTypeId = recordTypeLayoutMappings[i].recordTypeId;
                    
                    reqBody.batchRequests.push({
                        "method":"GET",
                        "url":singleRequestUrl
                    });
                    
                    recordTypeIds.push(recordTypeId);
                };
		
		return {
                        reqBody:reqBody,
                        recordTypeIds:recordTypeIds
                };
	};
	
        var handleLayoutDetails = function(response, recordTypeIds){
                var layoutMappings = {};
                
                for(var i = 0; i < recordTypeIds.length; i++){
                    layoutMappings[recordTypeIds[i]] = response.results[i].result;
                    if(i == (recordTypeIds.length - 1)){
                        layoutMappings['norecordtype'] = response.results[i].result;
                    }
                }
                AjaxResponses.layoutsMapping = layoutMappings;
        };
        
	return {
		handleDescribeLayoutsAndSearchFields:handleDescribeLayoutsAndSearchFields,
                prepareLayoutDetailRequestBody:prepareLayoutDetailsRequestBody,
                handleLayoutDetails:handleLayoutDetails
	};
})();
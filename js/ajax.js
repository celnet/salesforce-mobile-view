var Ajax = {
    remoting:function(action,params,success,failure){
        Visualforce.remoting.Manager.invokeAction(
            context.remote_action,
            action,
            params,
            function(result, event){
                if(event.status){
                    success(result);
                } else {
                    if(failure){
                        failure(result, event);
                    }
                }
            },
            {escape:false}
        );
    },

    ajax:function(method, endpoint, data, success, failure){
        endpoint = '/services/data/v' + context.api_version + endpoint + (endpoint.indexOf('?') > -1?'&':'?') + '_t=' + new Date().getTime();

        var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

        var callbackNotExecuted = true;
        xmlhttp.onreadystatechange = function(){
            if (xmlhttp.readyState == 4 && callbackNotExecuted) {
                callbackNotExecuted = false;
                if((method == 'GET' || method == 'POST') && ["200","201"].indexOf(xmlhttp.status + "") > -1 && success) {
                    success(JSON.parse(xmlhttp.responseText));
                } else if((method == 'DELETE' || method == 'PATCH') && ["204"].indexOf(xmlhttp.status + "") > -1 && success){
                    success();
                } else {
                    if(params.retry == 'true'){
                        //alert(context.labels.error);
                    } else if (method == 'GET'){
                        //window.location.replace(window.location.href + '&retry=true');
                    } else if (failure){
                        try {
                            failure(JSON.parse(xmlhttp.responseText));
                        } catch(e) {
                            failure({});
                        }
                    }
                }
            }
        };

        xmlhttp.ontimeout = function(){
            if(method == 'GET') {
                if(params.retry == 'true'){
                    alert(context.labels.close);
                } else {
                    alert(context.labels.retry);
                    window.location.replace(window.location.href + '&retry=true');
                }
            } else {
                alert(context.labels.retry);
                View.stopLoading('jqm-record');
            }
        };
        xmlhttp.open(method, endpoint, true);
        xmlhttp.setRequestHeader('Content-Type', 'application/json');
        xmlhttp.setRequestHeader('Authorization', 'Bearer ' + context.session_id);
        xmlhttp.timeout = context.timeout_amount;
        
        if(data){
            xmlhttp.send(JSON.stringify(data));
        } else {
            xmlhttp.send();
        }
    },

    get:function(endpoint, callback_function){
        Ajax.ajax('GET',endpoint,null,callback_function,null)
    }
};

var AjaxPools = (function(){
    /**
     * Sobject Related
     */
     
    var retrieveSobjectRelatedByBatchRequest = function(sobjectName, callbackFunction){
        var version_number = 'v' + context.api_version;
        var reqBody = {
            batchRequests:[
                {
                    "method":"GET",
                    "url":version_number + "/sobjects/" + sobjectName + "/describe"
                },
                {
                    "method":"GET",
                    "url":version_number + "/sobjects/" + sobjectName + "/describe/layouts/"
                },
                {
                    "method":"GET",
                    "url":version_number + "/search/layout/?q=" + sobjectName
                }
            ]
        };
        
        Ajax.ajax(
            "POST", 
            "/composite/batch", 
            reqBody, 
            function(response){
                if(response.results != null && response.results.length > 0){
                    welinkStorage['welink_' + sobjectName + '_sobjectdescribe'] = JSON.stringify(response.results[0].result);
                    AjaxResponses.sobjectdescribe = response.results[0].result;
                    
                    welinkStorage['welink_' + sobjectName + '_layouts'] = JSON.stringify(response.results[1].result);
                    AjaxResponses.layouts = response.results[1].result;
                    
                    if(response.results[1].result.layouts != null && response.results[1].result.layouts.length > 0){
                        welinkStorage['welink_' + sobjectName + '_layout'] = JSON.stringify(response.results[1].result.layouts[0]);
                        AjaxResponses.layout = response.results[1].result.layouts[0];
                    }
                    
                    welinkStorage['welink_' + sobjectName + '_searchlayout'] = JSON.stringify(response.results[2].result);
                    AjaxResponses.searchlayout = response.results[2].result;
                }
                
                
                retrieveLayouts(sobjectName, callbackFunction);
            }, 
            function(response){
                
            }
        );
    };
    
    var retrieveLayouts = function(sobjectName, callbackFunction){
        var recordTypeMappings = AjaxResponses.layouts.recordTypeMappings;
        var recordTypeIds = [];
        var reqBody = {
            batchRequests:[]
        };
        
        if(recordTypeMappings.length == 0){
            retrieveListViews(sobjectName, callbackFunction);
            return;
        }
        
        for(var i = 0; i < recordTypeMappings.length; i++){
            var singleRequest = {
                "method":"GET",
                "url":recordTypeMappings[i].urls.layout.substring(15)
            };
            reqBody.batchRequests.push(singleRequest);
            recordTypeIds.push(recordTypeMappings[i].recordTypeId);
        };
        
        Ajax.ajax(
            "POST", 
            "/composite/batch", 
            reqBody, 
            function(response){
                var layoutMappings = {};
                
                for(var i = 0; i < recordTypeIds.length; i++){
                    layoutMappings[recordTypeIds[i]] = response.results[i].result;
                    if(i == (recordTypeIds.length - 1)){
                        layoutMappings['norecordtype'] = response.results[i].result;
                    }
                }
                welinkStorage['welink_' + sobjectName + '_layoutsMapping'] = JSON.stringify(layoutMappings);
                AjaxResponses.layoutsMapping = layoutMappings;
                retrieveListViews(sobjectName, callbackFunction);
            }, 
            function(response){
                retrieveListViews(sobjectName, callbackFunction);
            }
        );
    };
    
    var retrieveListViews = function(sobjectName, doFinish){
        Ajax.get(
            '/sobjects/' + sobjectName + '/listviews', 
            function(response){
                welinkStorage['welink_' + sobjectName + '_listviews'] = JSON.stringify(response);
                AjaxResponses.listviews = response;
                retrieveSobjectRelatedMetadata(sobjectName, doFinish);
            }
        );
    };
    
    var retrieveSobjectRelatedMetadata = function(sobjectName, callbackFunction){
        Ajax.remoting(
            'retrieveSobjectRelated',
            [sobjectName],
            function(result){
                if(result != null){
                    if(result.listviewsMetadata != null){
                        welinkStorage['welink_' + sobjectName + '_orderedlistviews'] = JSON.stringify(result.listviewsMetadata);
                        AjaxResponses.orderedListviews = result.listviewsMetadata;
                    } else {
                        sobject.ordered_listviews = sobject.listviews.listviews;
                    }
                    
                    if(result.businessprocessesMetadata != null){
                        welinkStorage['welink_' + sobjectName + '_recordtype'] = JSON.stringify(result.recordtypesMetadata);
                        AjaxResponses.recordtype = result.recordtypesMetadata;
                    };
                    if(result.recordtypesMetadata != null){
                        AjaxResponses.businessprocess = result.businessprocessesMetadata;
                        welinkStorage['welink_' + sobjectName + '_businessprocess'] = JSON.stringify(result.businessprocessesMetadata);
                    };
                    
                    if(result.recordtypeLayouts != null){
                        var welinkLayouts = {};
                        for(var property in result.recordtypeLayouts){
                            welinkLayouts[property] = JSON.parse(window.decodeURIComponent(window.atob(result.recordtypeLayouts[property]).replace(/spaceescaper/g,' ')));
                        };
                        AjaxResponses.welinklayouts = welinkLayouts;
                        welinkStorage['welink_' + sobjectName + '_welinklayouts'] = JSON.stringify(welinkLayouts);
                    };
                }
                
                welinkStorage['welink_' + sobjectName + '_hasRetrievedSobjectRelated'] = 'true';
                AjaxResponses.has_retrieved_sobject_related = true;
                callbackFunction();
            },
            function(result, event){
                console.log(result);
                console.log(event);
                sobject.ordered_listviews = sobject.listviews.listviews;
                welinkStorage['welink_' + sobjectName + '_hasRetrievedSobjectRelated'] = 'true';
                AjaxResponses.has_retrieved_sobject_related = true;
                callbackFunction();
            }
        );
    };
    
    /**
     * Record Related
     */
    var retrieveRecord = function(sobjectName, recordId, callbackFunction){
        var refSoql = getReferenceFields(sobjectName, recordId);
        var version_number = 'v' + context.api_version;
        var reqBody = {
            batchRequests:[
                {
                    "method":"GET",
                    "url":version_number + '/sobjects/' + sobjectName + '/' + record.id
                },
                {
                    "method":"GET",
                    "url":version_number + '/query/?q=' + window.encodeURIComponent(refSoql)
                }
            ]
        };
        
        Ajax.ajax(
            "POST", 
            "/composite/batch", 
            reqBody, 
            function(response){
                AjaxResponses.record = response.results[0].result;
                
                var recordTypeId = response.results[0].result.RecordTypeId;
                
                if(recordTypeId == null || recordTypeId == ''){
                    recordTypeId = 'norecordtype';
                }
                
                if(AjaxResponses.welinklayouts[recordTypeId] != null){
                    AjaxResponses.welinklayout = AjaxResponses.welinklayouts[recordTypeId];
                } else {
                    AjaxResponses.layout = AjaxResponses.layoutsMapping[recordTypeId];
                }
                
                AjaxResponses.references = response.results[1].result;
                AjaxResponses.has_retrieved_record_related = true;
                callbackFunction();
            }, 
            function(response){
                
            }
        );
    }
    
    var getReferenceFields = function(sobjectName, recordId){
        var sobjectsWithoutName = ['DelegatedApproverId','CallCenterId','ConnectionSentId','ConnectionReceivedId'];
        var soql_fields = 'Id';

        for (var i = 0; i < sobject.describe.fields.length; i++) {
            if(sobject.describe.fields[i].type == 'reference'){
                var field_name = sobject.describe.fields[i].name;
                
                if(sobjectsWithoutName.indexOf(field_name) > 0){
                    continue;
                }

                record.ref_fields.push(field_name);
                soql_fields += ',';
                soql_fields += field_name;
                if(field_name.indexOf('__c') > -1){
                    soql_fields += ',';
                    soql_fields += field_name.replace('__c','__r.Name');
                } else {
                    soql_fields += ',';
                    soql_fields += field_name.substring(0,field_name.length - 2) + '.Name';
                }
            }
        };

        return 'Select ' + soql_fields + ' From ' + sobjectName + ' Where Id = \'' + recordId + '\'';
    };
    
    /**
     * RecentlyViewed Related
     */
    var constructSoqlStatement = function(recentlyViewedIds){
        var fields = '';

        for (var i = 0; i < sobject.search_layout_fields.length; i++) {
            if(sobject.search_layout_fields[i].name != 'Name'){
                fields += ',';
                fields += sobject.search_layout_fields[i].name;
            }
        };

        if(sobject.name != 'Case' && sobject.name != 'Solution' && sobject.name != 'Contract' && sobject.name != 'Idea'){
            fields += ',Name';
        }

        var soql = 'Select Id' + fields + ' From ' + sobject.name + " Where ";
        if(recentlyViewedIds != ''){
            soql += "Id IN (";
            soql += recentlyViewedIds;
            soql += ") And (LastViewedDate != null Or LastReferencedDate != null)";
        } else {
            soql += "LastViewedDate != null Or LastReferencedDate != null";
        }
        soql += " Order By LastViewedDate asc,LastReferencedDate asc";

        return soql;
    };
    
    var retrieveRecentlyViewed = function(sobjectName, doFinish){
        Ajax.get(
            '/query?q=' + window.encodeURIComponent("Select Id From RecentlyViewed Where Type='" + sobjectName + "'"),
            function(response){
                var recentlyViewedIds = '';
                
                for (var i = response.records.length - 1; i >= 0; i--) {
                    recentlyViewedIds += "'" + response.records[i].Id + "',";
                };
    
                if(recentlyViewedIds != ''){
                    recentlyViewedIds = recentlyViewedIds.substring(0,recentlyViewedIds.length - 1);
                } 
        
                retrieveRecentlyViewedwithFields(recentlyViewedIds, doFinish);
            }
        );
    };

    var retrieveRecentlyViewedwithFields = function(recentlyViewedIds, doFinish){
        Ajax.get(
            '/query?q=' + window.encodeURIComponent(constructSoqlStatement(recentlyViewedIds)), 
            function(response){
                AjaxResponses.recentlyviewedwithfields = response;
                doFinish();
            }
        );
    };
    
    /**
     * ListView Related
     */
    var retrieveListViewDescribe = function(sobjectName, listviewId, callbackFunction){
        Ajax.get(
            '/sobjects/' + sobjectName + '/listviews/' + listviewId + '/describe', 
            function(response){
                AjaxResponses.listviews[listviewId] = {};
                AjaxResponses.listviews[listviewId].describe = response;

                retrieveListViewResultByQuery(sobjectName, listviewId, response.query, callbackFunction);
            }
        );
    };

    var retrieveListViewResultByQuery = function(sobjectName, listviewId, queryString, callbackFunction){
        Ajax.get(
            '/query/?q=' + window.encodeURIComponent(queryString), 
            function(response){
                AjaxResponses.listviews[listviewId].result = response;

                callbackFunction();
            }
        );
    };
    
    return {
        retrieveSobjectRelated:function(sobjectName, callbackFunction){
            if(welinkStorage['welink_' + sobjectName + '_hasRetrievedSobjectRelated'] == 'true'){
                AjaxResponses.sobjectdescribe = JSON.parse(welinkStorage['welink_' + sobjectName + '_sobjectdescribe']);
                AjaxResponses.listviews = JSON.parse(welinkStorage['welink_' + sobjectName + '_listviews']);
                AjaxResponses.layouts = JSON.parse(welinkStorage['welink_' + sobjectName + '_layouts']);
                
                var null_values = [undefined, null, 'null', 'undefined'];
                
                if(null_values.indexOf(welinkStorage['welink_' + sobjectName + '_layoutsMapping']) < 0){
                    AjaxResponses.layoutsMapping = JSON.parse(welinkStorage['welink_' + sobjectName + '_layoutsMapping']);
                }
                
                if(null_values.indexOf(welinkStorage['welink_' + sobjectName + '_layout']) < 0){
                    AjaxResponses.layout = JSON.parse(welinkStorage['welink_' + sobjectName + '_layout']);
                }
                
                if(null_values.indexOf(welinkStorage['welink_' + sobjectName + '_orderedlistviews']) < 0){
                    AjaxResponses.orderedListviews = JSON.parse(welinkStorage['welink_' + sobjectName + '_orderedlistviews']);
                }
                
                AjaxResponses.searchlayout = JSON.parse(welinkStorage['welink_' + sobjectName + '_searchlayout']);
                
                if(null_values.indexOf(welinkStorage['welink_' + sobjectName + '_recordtype']) < 0){
                    AjaxResponses.recordtype = JSON.parse(welinkStorage['welink_' + sobjectName + '_recordtype']);
                }
                
                if(null_values.indexOf(welinkStorage['welink_' + sobjectName + '_businessprocess']) < 0){
                    AjaxResponses.businessprocess = JSON.parse(welinkStorage['welink_' + sobjectName + '_businessprocess']);
                }
                
                if(null_values.indexOf(welinkStorage['welink_' + sobjectName + '_welinklayouts']) < 0){
                    AjaxResponses.welinklayouts = JSON.parse(welinkStorage['welink_' + sobjectName + '_welinklayouts']);
                }
                
                callbackFunction();
                
                retrieveSobjectRelatedByBatchRequest(sobjectName, function(){
                    console.log("has refreshed");
                });
            } else {
                retrieveSobjectRelatedByBatchRequest(sobjectName, callbackFunction);
            }
        },
        
        retrieveRecordRelated:function(sobjectName, recordId, callbackFunction){
            retrieveRecord(sobjectName, recordId, callbackFunction);
        },

        retrieveRecentlyViewed:function(sobjectName, callbackFunction){
            retrieveRecentlyViewed(sobjectName, callbackFunction);
        },

        retrieveSelectedListView:function(sobjectName, listviewId, callbackFunction){
            retrieveListViewDescribe(sobjectName, listviewId, callbackFunction);
        }
    };
})();

var AjaxHandlers = (function(){
    var handleDescribe = function(){
        sobject.describe = AjaxResponses.sobjectdescribe;
        for (var i = sobject.describe.fields.length - 1; i >= 0; i--) {
            sobject.fields[sobject.describe.fields[i].name] = sobject.fields[sobject.describe.fields[i].name] || {};
            sobject.fields[sobject.describe.fields[i].name].describe = sobject.describe.fields[i];
        };
    };
    
    var handleWelinkLayout = function(){
        var _welink_processed = [];
        if(sobject.welink_layout.layoutSections == undefined)
            return;
        for (var i = 0; i < sobject.welink_layout.layoutSections.length; i++) {
            if(sobject.welink_layout.layoutSections[i].style != 'CustomLinks'){
                var _layout_sections = {};
                var _layout_columns = sobject.welink_layout.layoutSections[i].layoutColumns;
                _layout_sections.editHeading = sobject.welink_layout.layoutSections[i].editHeading;
                _layout_sections.detailHeading = sobject.welink_layout.layoutSections[i].detailHeading;
                _layout_sections.label = sobject.welink_layout.layoutSections[i].label;

                var _layout_items = [];
                for (var j = 0; j < _layout_columns.length; j++) {
                    _layout_items = _layout_items.concat(_layout_columns[j].layoutItems);
                };

                var _filtered_layout_items = [];
                for (var k = 0; k < _layout_items.length; k++) {
                    if(_layout_items[k].field != null){
                        _filtered_layout_items.push(_layout_items[k]);

                        record.welink_required[_layout_items[k].field] = false;
                        record.welink_edit[_layout_items[k].field] = false;
                        record.welink_readonly[_layout_items[k].field] = false;

                        switch(_layout_items[k].behavior){
                            case 'Edit':
                                record.welink_edit[_layout_items[k].field] = true;
                                break;
                            case 'Required':
                                record.welink_required[_layout_items[k].field] = true;
                                break;
                            case 'Readonly':
                                record.welink_readonly[_layout_items[k].field] = true;
                                break;
                            default:
                                console.log(_layout_items[k]);
                        }
                    }
                };
                _layout_sections.fields = _filtered_layout_items;
                _welink_processed.push(_layout_sections);

            }
        };
        return _welink_processed;
    };
    
    var handleLayout = function(layoutSections){
        
        var processRows = function(rows){
            var processed = [];
            for(var i = 0; i < rows.length; i++){
                processed = processed.concat(processItems(rows[i].layoutItems));
            }
            return processed;
        };
        
        var processItems = function(items){
            var processed = [];
            for(var i = 0; i < items.length; i++){
                if(items[i].layoutComponents != null && items[i].layoutComponents.length > 0 && items[i].layoutComponents[0].type == 'Field'){
                    processed.push(items[i]);
                }
            }
            return processed;
        };
        
        var processedLayout = [];
        
        for(var i = 0; i < layoutSections.length; i++){
            var section = {};
            section.heading = layoutSections[i].heading;
            section.useHeading = layoutSections[i].useHeading;
            section.rows = processRows(layoutSections[i].layoutRows);
            processedLayout.push(section);
        }
        
        return processedLayout;
    };
    
    var handleRecordTypes = function(){
        var recordtypes = AjaxResponses.recordtype;//JSON.parse(window.atob(result));
        var bp_values = [];

        if(recordtypes != null){
            for (var i = 0; i < recordtypes.length; i++) {
                if(recordtypes[i].fullName != null && recordtypes[i].label == record.recordtypename){
                    bp_values = recordtypes[i].picklistValues;
                    record.selected_recordtype_detail = recordtypes[i];
                    break;
                }
            };
        }

        for (var i = 0; i < bp_values.length; i++) {
            var rt_values = [];
            for (var j = bp_values[i].values.length - 1; j >= 0; j--) {
                var bp_value = {
                    active: true,
                    defaultValue: bp_values[i].values[j].default_x,
                    label: window.decodeURIComponent(bp_values[i].values[j].fullName),
                    validFor:null,
                    value: window.decodeURIComponent(bp_values[i].values[j].fullName)
                };
                rt_values.push(bp_value);
            };
            
            if(sobject.fields[bp_values[i].picklist] != null)
            sobject.fields[bp_values[i].picklist].describe.picklistValues = rt_values;
        };
    };
    
    var handleBusinessProcesses = function(){
        if(sobject.name != 'Opportunity'){
            return;
        }

        var businessprocesses = AjaxResponses.businessprocess;

        var bp_values = [];
        var bp_processed_values = [];

        if(businessprocesses != null)
        for (var i = 0; i < businessprocesses.length; i++) {
            if(businessprocesses[i].fullName != null && businessprocesses[i].fullName == record.selected_recordtype_detail.businessProcess){
                bp_values = businessprocesses[i].values;
                break;
            }
        };

        for (var i = bp_values.length - 1; i >= 0; i--) {
            var bp_value = {
                active: true,
                defaultValue: false,
                label: window.decodeURIComponent(bp_values[i].fullName),
                validFor: null,
                value: window.decodeURIComponent(bp_values[i].fullName)
            };
            bp_processed_values.push(bp_value);
        };

        if(sobject.name == 'Opportunity'){
            sobject.fields['StageName']['describe'].picklistValues = bp_processed_values;
        }
    };
    
    var handleReferenceFields = function(sobjectName, recordId){
        var response = AjaxResponses.references;
        var ref_fields = record.ref_fields;

        record.references = {};

        for(var i = 0; i < ref_fields.length; i++){
            if(response.records[0][ref_fields[i]] != null){
                var relation_name = '';
                if(ref_fields[i].indexOf('__c') > -1){
                    relation_name = ref_fields[i].replace('__c','__r');
                } else {
                    relation_name = ref_fields[i].substring(0,ref_fields[i].length - 2);
                }
                var refvalue = {
                    Name:response.records[0][relation_name]['Name'],
                    Id:response.records[0][ref_fields[i]]
                };

                record.references[ref_fields[i]] = refvalue;
            }
        }
    };
    
    return {
        describe:handleDescribe,
        welinklayout:handleWelinkLayout,
        layout:handleLayout,
        recordTypes:handleRecordTypes,
        businessProcesses:handleBusinessProcesses,
        handleReferenceFields:handleReferenceFields
    };
})();
window.addEventListener('DOMContentLoaded', function(){
    getTemplates();
    
    if(window.location.search.indexOf('sobject') < 0){
        window.history.replaceState('ListView','ListView','DP?mode=list&sobject=Opportunity&listviewid=recentlyviewed');
        route();
    } else if(window.location.search.indexOf('sobject') > -1 && window.location.search.indexOf('mode') < 0){
        window.history.replaceState('DPListView','DPListView','DP' + window.location.search + '&mode=list');
        route();
    } else if(window.location.search.indexOf('mode=list') > -1 && window.location.search.indexOf('listviewid') < 0){
        window.history.replaceState('ListView','ListView','DP' + window.location.search + '&listviewid=recentlyviewed');
        route();
    } else {
        route();
    }
},false);
    
var welinkStorage = window.localStorage || {};

window.onpopstate = function(event){
    route();
    event.preventDefault();
};

var route = function(){
    getParams();

    switch(params.mode.toLowerCase()){
        case 'list':
            renderListView();
            break;
        case 'view':
            renderRecordView();
            break;
        case 'edit':
            renderRecordEdit();
            break;
        case 'new':
            renderRecordNew();
            break;
        default:
            console.log('test');
    }
};

var getParams = function(){
    var query_strings = window.location.search.substr(1).split('&');
    
    for(var i = 0; i < query_strings.length; i++){
        var keyvalue = query_strings[i].split('=');
        params[keyvalue[0].toLowerCase()] = keyvalue[1];
    }

    sobject.name = params.sobject;
    record.id = params.id;
    if(params.listviewid==''){
        params.listviewid='recentlyviewed';
    }

    if(/Android/i.test(navigator.userAgent)){
        context.device_type = 'Android';
    } else if(/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        context.device_type = 'iPhone';
    }
};

var getTemplates = function(){
    //alert(window.location.search);
    templates = {
        // ListView
        listview_page_structure:document.querySelector('#template-listview-page-structure').text,
        listview_select:document.querySelector('#template-listview-select').text,
        listview_option:document.querySelector('#template-listview-option').text,
        listview_resultlist:document.querySelector('#template-listview-resultlist').text,
        listview_resultitem:document.querySelector('#template-listview-resultitem').text,
        listview_result_noitem:document.querySelector('#template-listview-result-noitem').text,

        // RecordNew, RecordEdit
        record_page_structure:document.querySelector('#template-record-jqm-page').text,
        lookup_field:document.querySelector('#template-lookup-record').text,
        section:document.querySelector('#template-recordedit-section').text,
        section_without_heading:document.querySelector('#template-recordedit-section-without-heading').text,
        recordtype_select:document.querySelector('#template-recordtype-select').text,
        recordtype_option:document.querySelector('#template-recordtype-option').text,
        field_readonly:document.querySelector('#template-field-edit-readonly').text,
        field_lookup:document.querySelector('#template-field-edit-lookup').text,
        field_checkbox:document.querySelector('#template-field-edit-checkbox').text,
        field_currency:document.querySelector('#template-field-edit-currency').text,
        field_date:document.querySelector('#template-field-edit-date').text,
        field_datetime:document.querySelector('#template-field-edit-datetime').text,
        field_email:document.querySelector('#template-field-edit-email').text,
        field_geolocation:document.querySelector('#template-field-edit-geolocation').text,
        field_number:document.querySelector('#template-field-edit-number').text,
        field_percent:document.querySelector('#template-field-edit-percent').text,
        field_phone:document.querySelector('#template-field-edit-phone').text,
        field_picklist_select:document.querySelector('#template-field-edit-picklist-select').text,
        field_picklist_option:document.querySelector('#template-field-edit-picklist-option').text,
        field_multipicklist_select:document.querySelector('#template-field-edit-multipicklist-select').text,
        field_multipicklist_option:document.querySelector('#template-field-edit-multipicklist-option').text,
        field_text:document.querySelector('#template-field-edit-text').text,
        field_textarea:document.querySelector('#template-field-edit-textarea').text,
        field_text_encrypted:document.querySelector('#template-field-edit-text-encrypted').text,
        field_url:document.querySelector('#template-field-edit-url').text,
        field_address:document.querySelector('#template-field-edit-address').text,
        field_contactname:document.querySelector('#template-field-edit-contact-name').text,
        field_username:document.querySelector('#template-field-edit-user-name').text,
        page_lookup:document.querySelector('#template-lookup-jqm-page').text,
        
        field_contact_name:document.querySelector('#template-field-edit-contact-name').text,
        field_user_name:document.querySelector('#template-field-edit-user-name').text,

        // RecordView
        view_section:document.querySelector('#template-recordview-section').text,
        view_section_without_heading:document.querySelector('#template-recordview-section-without-heading').text,
        field_view_readonly:document.querySelector('#template-field-view-readonly').text
    };
};

var UserAction = {
    selectListView:function(){

    }, // loading

    newRecord:function(current_jqm_page_id){
        View.animateLoading(context.labels.loading,current_jqm_page_id);
        window.history.pushState('DPRecordNew','DPRecordNew','DP?mode=new&sobject=' + sobject.name);
        route();
    }, // no loading

    selectRecordType:function(){

    }, // loading

    viewRecord:function(current_jqm_page_id){
        View.animateLoading(context.labels.loading, current_jqm_page_id);
        window.history.pushState('DPRecordView','DPRecordView','DP?mode=view&sobject=' + sobject.name + '&id=' + record.id + '&listviewid=' + params.listviewid);
        route();
    }, // loading

    viewList:function(current_jqm_page_id){
        View.animateLoading(context.labels.loading, current_jqm_page_id);
        window.history.pushState('DPListView','DPListView','DP?mode=list&sobject=' + sobject.name + '&listviewid=' + params.listviewid);
        route();
    }, // loading

    editRecord:function(current_jqm_page_id){
        View.animateLoading(context.labels.loading, current_jqm_page_id);
        window.history.pushState('DPRecordEdit','DPRecordEdit','DP?mode=edit&sobject=' + sobject.name + '&id=' + record.id + '&listviewid=' + params.listviewid);
        route();
    }, // no loading

    saveRecord:function(){
        var form_dataset = RecordForm.construct();
        if(form_dataset != '')
        RecordForm.save(form_dataset);
    }, // loading

    cancel:function(){
        window.history.back();
    } // no loading
};

    var params = {
        mode:'',
        sobject:'',
        referer:'',
        id:'',
        listviewid:'',
        recordtypeid:'',
        retry:'',
        crossref:''
    };

        var sobject ={
            name: '', // sobject api name
            describe: {},// sobject describe
            fields: {},// field api name : describe infomation
            listviews: {},// sobject listviews
            listviewsmap: {},
            metadata: {},
            ordered_listviews:[],
            recentlyviewed: {},// sobject recentlyviewed (TODO: order)
            search_layout_fields:[],
            results: {},// results by listview
            recentlyviewed_ids: '',
            welink_layout: {},
            has_welink_layout: false,
            recordtype_mappings:{}
        };

        var record = {
            id:'',
            layout:{},
            detail:{},
            references:{},
            ref_fields:[],
            processed:[],
            welink_processed:[],
            welink_required:{},
            welink_readonly:{},
            welink_edit:{},
            recordtypeid:'', // user select
            recordtypename:'',
            recordtype_detail:{},
            selected_recordtype_detail:{},
            businessprocess_detail:{}
        };

        var listview = {
            recordType:{},
            recordLabel:{},
            queryresult:{}
        };

        var templates = {};

        var AjaxResponses = {
            has_retrieved_sobject_related:false,
            sobjectdescribe:null,
            layouts:null,
            layoutsMapping:null,
            metadata:null,
            searchlayout:null,
            recentlyviewed:null,
            recordtype:null,
            businessprocess:null,
            welinklayouts:null,

            has_retrieved_record_related:false,
            record:null,
            welinklayout:null,
            layout:null,
            references:null,

            has_retrieved_recentlyviewed:false,
            recentlyviewedwithfields:null,

            listviews:{
                //id:{
                //  describe:null,
                //  results:null
                //}
            }
        };
        
        var setup_objects = [
            'AccountTerritoryAssignmentRule','AccountTerritoryAssignmentRuleItem','ApexComponent','ApexPage','BusinessHours','BusinessProcess','CategoryNode','CurrencyType','DatedConversionRate','NetworkMember','ProcessInstance','Profile','RecordType','SelfServiceUser','StaticResource','Territory2','UserAccountTeamMember','UserTerritory','WebLink','FieldPermissions','Group','GroupMember','ObjectPermissions','PermissionSet','PermissionSetAssignment','QueueSObject','ObjectTerritory2AssignmentRule','ObjectTerritory2AssignmentRuleItem','RuleTerritory2Association','SetupEntityAccess','Territory2','Territory2Model','UserTerritory2Association','User','UserRole','UserTerritory','Territory'
            ];

        var processing = {
                page_scroll_y:0
            };

    var 
        Templates = {

        },

        context = Context,

        View = {
            fieldEdit:function(){

            },

            fieldView:function(){

            },

            animateLoading:function(loading_text, jqm_page_id){
                document.querySelector('#' + jqm_page_id).classList.add('ui-state-disabled');
                var loading_image_src = context.welink_logo_src;
                
                $j.mobile.loading( 'show', {
                    text: loading_text,
                    textVisible: true,
                    theme: 'a',
                    textonly: false,
                    html: '<div style="text-align:center;font-size:1em;font-weight:bold;" ><img src="' + loading_image_src + '" width="100px"/><br/><span>' + loading_text + '</span></div>'
                });
                
                document.querySelector('.ui-body-a').classList.remove('ui-body-a');
            },

            stopLoading:function(jqm_page_id){
                $j.mobile.loading( 'hide');
                document.querySelector('#' + jqm_page_id).classList.remove('ui-state-disabled');
            }
        };

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

    var Lookup = {
        popup:function(triggered_element, target_page_id){
            processing.page_scroll_y = window.scrollY;
            
            $j.mobile.pageContainer.pagecontainer('change','#lookup-search-page',{transition:'none',changeHash:false});
            View.animateLoading(context.labels.loading,'lookup-search-page');
            var field_name = triggered_element.id.substr(13);
            var ref_type = document.querySelector('#' + triggered_element.id + '-sobject-type').value;

            document.querySelector('#jqm-lookup-header-right-button')['href'] = 'javascript:Lookup.search("' + field_name + '","' + ref_type + '","' + target_page_id + '")';
            document.querySelector('#jqm-lookup-header-left-button')['href'] = 'javascript:Lookup.cancel("' + field_name + '","' + target_page_id + '")';

            document.querySelector('#jqm-lookup-header-right-button').innerHTML = context.labels.search;
            document.querySelector('#jqm-lookup-header-left-button').innerHTML = context.labels.cancel;

            document.querySelector('#lookup-record-list').innerHTML = '<div style="text-align:center;padding:10px;">' + context.labels.search_tip + '</div>';

            document.querySelector('#lookup-search-box').parentNode.style.marginTop = '3px';
            document.querySelector('#lookup-search-box').parentNode.style.marginBottom = '3px';
            document.querySelector('#lookup-search-box')['value'] = ''; // 清空 value

            document.querySelector('#lookup-search-box')['placeholder'] = sobject.fields[field_name].describe.label;

            Ajax.get(
                "/query?q=Select+Id,Name+From+RecentlyViewed+Where+Type='" + ref_type + "'+Order+By+LastViewedDate+desc", 
                function(response){
                    var lookup_recentlyviewed = response.records;

                    var record_items = '';
                    for(var i = 0; i < lookup_recentlyviewed.length; i++){
                        var record_item = templates.lookup_field;
                        record_item = record_item.replace(/{{jqm-page}}/g,target_page_id);
                        record_item = record_item.replace(/{{record-name}}/g,lookup_recentlyviewed[i].Name);
                        record_item = record_item.replace(/{{field-name}}/g,field_name);
                        record_item = record_item.replace(/{{record-id}}/g,lookup_recentlyviewed[i].Id);
                        
                        record_items += record_item;
                        
                    }

                    if(record_items == ''){
                        record_items = '<div style="text-align:center;padding:10px;">' + context.labels.search_tip + '</div>';
                    }
                    
                    document.querySelector('#lookup-record-list').innerHTML = record_items;
                    
                    $j('#lookup-record-list li a').addClass('ui-btn');
                    //$j('#lookup-record-list').listview();
                    View.stopLoading('lookup-search-page');
                }
            );
        },

        search:function(field_name, ref_type, target_page_id){
            View.animateLoading(context.labels.loading,'lookup-search-page');
            var keyword = document.querySelector('#lookup-search-box').value;
            
            Ajax.get(
                "/query?q=Select+Id,Name+From+" + ref_type + "+Where+Name+Like+'%25" + keyword + "%25'",
                function(response){
                    var _lookup_records = response.records;
                    
                    var _record_items = '';
                    var _lookup_records_length = _lookup_records.length;// > 10?10:_lookup_records.length;
                    for(var i = 0; i < _lookup_records_length; i++){
                        var _record_item = templates.lookup_field;
                        _record_item = _record_item.replace(/{{jqm-page}}/g,target_page_id);
                        _record_item = _record_item.replace(/{{record-name}}/g,_lookup_records[i].Name);
                        _record_item = _record_item.replace(/{{field-name}}/g,field_name);
                        _record_item = _record_item.replace(/{{record-id}}/g,_lookup_records[i].Id);
                        
                        _record_items += _record_item;
                        
                    }

                    if(_record_items == ''){
                        _record_items = '<div style="text-align:center;padding:10px;">' + context.labels.no_record + '</div>';
                    }
                    
                    document.querySelector('#lookup-record-list').innerHTML = _record_items;
                    
                    $j('#lookup-record-list li a').addClass('ui-btn');
                    //$j('#lookup-record-list').listview();
                    
                    View.stopLoading('lookup-search-page');
                }
            );
        },

        select:function(field_name, record_name, record_id, target_page_id){
            document.querySelector('#record-field-' + field_name).value = record_name;
            document.querySelector('#record-field-' + field_name + '-hidden').value = record_id;
            $j.mobile.pageContainer.pagecontainer({
                transition:function(event, ui){
                    document.body.scrollTop = processing.page_scroll_y;
                }
            });
            $j.mobile.pageContainer.pagecontainer('change','#' + target_page_id,{transition:'none',changeHash:false});
        },

        cancel:function(field_name, target_page_id){
            $j.mobile.pageContainer.pagecontainer({
                transition:function(event, ui){
                    document.body.scrollTop = processing.page_scroll_y;
                }
            });
            $j.mobile.pageContainer.pagecontainer('change','#' + target_page_id,{transition:'none',changeHash:false});
        }
    };

    var RecordForm = {
        validate:function(field_name, field_value){
            if(document.querySelector('label[for="record-field-' + field_name + '"] span') != null && (field_value == null || field_value == '')){
                document.querySelector('#record-field-' + field_name).focus();
                document.querySelector('#record-field-' + field_name).style.backgroundColor = 'pink';

                var errorNode = document.createElement('div');
                errorNode.id = 'error-message-' + field_name;
                errorNode.style.textAlign = 'center';
                errorNode.style.color = 'crimson';
                var errorNodeText = document.createTextNode('必填');
                errorNode.appendChild(errorNodeText);


                if(document.querySelector('#error-message-' + field_name) == null){
                    document.querySelector('#record-field-' + field_name).parentNode.parentNode.insertBefore(errorNode,document.querySelector('#record-field-' + field_name).parentNode);
                }
                

                document.querySelector('#record-field-' + field_name).addEventListener('change',function(){
                    document.querySelector('#record-field-' + field_name).style.backgroundColor = 'white';
                    document.querySelector('#error-message-' + field_name).parentNode.removeChild(document.querySelector('#error-message-' + field_name));
                });
                
                return false;
            } else {
                return true;
            }
        },

        construct:function(){
            var form_inputs = document.querySelectorAll('input[id*="record-field"]');
            var form_selects = document.querySelectorAll('select[id*="record-field"]');
            var form_textareas = document.querySelectorAll('textarea[id*="record-field"]');

            var form_dataset = {};

            if(params.mode == 'new' && record.recordtypeid != ''){
                form_dataset['RecordTypeId'] = record.recordtypeid;
            }

            for (var i = 0; i < form_inputs.length; i++) {
                var field_name = form_inputs[i].id.substring(13);
                var field_value;

                if(form_inputs[i].type == 'hidden'){
                    continue;
                }

                switch(form_inputs[i].type){
                    case 'datetime-local':
                        if(form_inputs[i].value == ''){
                            field_value = '';
                        } else {
                            field_value = TimezoneDatabase.formatDatetimeToUTC(form_inputs[i].value, context.timezone) + ':00';
                        }
                        break;
                    case 'date':
                        if(form_inputs[i].value == ''){
                            field_value = null;
                        } else {
                            field_value = TimezoneDatabase.formatDateToUTC(form_inputs[i].value, context.timezone);
                        }
                        break;
                    case '':
                        field_value = form_inputs[i].value;
                        break;
                    case 'checkbox':
                        field_value = form_inputs[i].checked;
                        break;
                    case 'search':
                        field_value = document.querySelector('#' + form_inputs[i].id + '-hidden').value || '';
                        break;
                    default:
                        field_value = form_inputs[i].value;
                }
                
                if(!RecordForm.validate(field_name,field_value)){
                    return '';
                }

                form_dataset[field_name] = field_value;
            };

            for (var i = 0; i < form_selects.length; i++) {
                var field_name = form_selects[i].id.substring(13);
                var field_value = '';

                var options = document.querySelectorAll('#' + form_selects[i].id + ' option');

                for (var j = 0; j < options.length; j++) {
                    if(options[j].selected){
                        field_value += options[j].value;
                        field_value += ';';
                    }
                };
                
                if(field_value.length > 0){
                    field_value = field_value.substring(0, field_value.length - 1);
                }

                if(field_value == '--None--'){
                    field_value = '';
                }
                
                if(!RecordForm.validate(field_name,field_value)){
                    return '';
                }

                form_dataset[field_name] = field_value;
            };

            for (var i = 0; i < form_textareas.length; i++) {
                var field_name = form_textareas[i].id.substring(13);
                var field_value = form_textareas[i].value;
                
                if(!RecordForm.validate(field_name,field_value)){
                    return '';
                }
                
                form_dataset[field_name] = field_value;
            };

            return form_dataset;
        },

        save:function(form_dataset){
            View.animateLoading(context.labels.saving,'jqm-record');

            // presume new
            var method = 'POST';
            var endpoint = '/sobjects/' + sobject.name;

            if(params.mode == 'edit'){
                method = 'PATCH';
                endpoint = '/sobjects/' + sobject.name + '/' + record.id;
            }

            Ajax.ajax(
                method,
                endpoint, 
                form_dataset,
                function(response){
                    var recordid = params.mode=='edit'?record.id:response.id;

                    window.history.replaceState('DPRecordView','DPRecordView','DP?mode=view&sobject=' + sobject.name + '&id=' + recordid + '&listviewid=' + params.listviewid);
                    route();
                },
                function(responseJSON){
                    RecordForm.showError(responseJSON);
                }
            );
        },

        showError:function(post_error_response){
            var error_info = post_error_response.length > 0?post_error_response[0]:{};
            if(error_info.message != null){
                if(error_info.fields.length > 0){
                    document.querySelector('#record-field-' + error_info.fields[0]).focus();
                    document.querySelector('#record-field-' + error_info.fields[0]).style.backgroundColor = 'pink';

                    var errorNode = document.createElement('div');
                    errorNode.id = 'error-message-' + error_info.fields[0];
                    errorNode.style.textAlign = 'center';
                    errorNode.style.color = 'crimson';
                    var errorNodeText = document.createTextNode(error_info.message);
                    errorNode.appendChild(errorNodeText);


                    if(document.querySelector('#error-message-' + error_info.fields[0]) == null){
                        document.querySelector('#record-field-' + error_info.fields[0]).parentNode.parentNode.insertBefore(errorNode,document.querySelector('#record-field-' + error_info.fields[0]).parentNode);
                    }
                    

                    document.querySelector('#record-field-' + error_info.fields[0]).addEventListener('change',function(){
                        document.querySelector('#record-field-' + error_info.fields[0]).style.backgroundColor = 'white';
                        document.querySelector('#error-message-' + error_info.fields[0]).parentNode.removeChild(document.querySelector('#error-message-' + error_info.fields[0]));
                    });

                } else {
                    alert(error_info.message);
                }
                
            }else {
                alert(JSON.stringify(responseJSON));
            }
            
            View.stopLoading('jqm-record');
        }
    };

    var Styles = {
        tunePageStyle:function(){
            $j('#jqm-list').page({theme:'b'});
            $j('#jqm-record').page({theme:'b'});
            $j('#lookup-search-page').page({theme:'b'});

            // fix header 
            document.querySelector('#jqm-header').style.position = 'fixed';
            document.querySelector('#jqm-header').classList.remove('slidedown');

            if(params.mode == 'edit' || params.mode == 'new'){
                document.querySelector('#lookup-search-page').style.position = 'fixed';
                document.querySelector('#lookup-search-page').classList.remove('slidedown');
            }
        },

        styleEdit:function(){

        },

        styleView:function(){

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
                        if(result.listviewMetadata != null){
                            welinkStorage['welink_' + sobjectName + '_metadata'] = JSON.stringify(result.listviewMetadata);
                            AjaxResponses.metadata = result.listviewMetadata;
                        } else {
                            sobject.ordered_listviews = sobject.listviews.listviews;
                        }
                        
                        if(result.businessprocessesMetadata != null){
                            welinkStorage['welink_' + sobjectName + '_recordtype'] = JSON.stringify(result.businessprocessesMetadata);
                            AjaxResponses.recordtype = result.businessprocessesMetadata;
                        };
                        if(result.recordtypesMetadata != null){
                            AjaxResponses.businessprocess = result.recordtypesMetadata;
                            welinkStorage['welink_' + sobjectName + '_businessprocess'] = JSON.stringify(result.recordtypesMetadata);
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
            retrieveRecordRelated:function(sobjectName, recordId, callbackFunction){
                retrieveRecord(sobjectName, recordId, callbackFunction);
            },

            retrieveSobjectRelated:function(sobjectName, callbackFunction){
                if(welinkStorage['welink_' + sobjectName + '_hasRetrievedSobjectRelated'] == 'true'){
                    AjaxResponses.sobjectdescribe = JSON.parse(welinkStorage['welink_' + sobjectName + '_sobjectdescribe']);
                    AjaxResponses.listviews = JSON.parse(welinkStorage['welink_' + sobjectName + '_listviews']);
                    AjaxResponses.layouts = JSON.parse(welinkStorage['welink_' + sobjectName + '_layouts']);
                    
                    if(welinkStorage['welink_' + sobjectName + '_layout'] != null){
                        AjaxResponses.layout = JSON.parse(welinkStorage['welink_' + sobjectName + '_layout']);
                    }
                    
                    AjaxResponses.metadata = JSON.parse(welinkStorage['welink_' + sobjectName + '_metadata']);
                    AjaxResponses.searchlayout = JSON.parse(welinkStorage['welink_' + sobjectName + '_searchlayout']);
                    
                    if(welinkStorage['welink_' + sobjectName + '_recordtype'] != null){
                        AjaxResponses.recordtype = JSON.parse(welinkStorage['welink_' + sobjectName + '_recordtype']);
                    }
                    
                    if(welinkStorage['welink_' + sobjectName + '_businessprocess'] != null){
                        AjaxResponses.businessprocess = JSON.parse(welinkStorage['welink_' + sobjectName + '_businessprocess']);
                    }
                    
                    if(welinkStorage['welink_' + sobjectName + '_welinklayouts'] != null){
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

            retrieveRecentlyViewed:function(sobjectName, callbackFunction){
                retrieveRecentlyViewed(sobjectName, callbackFunction);
            },

            retrieveSelectedListView:function(sobjectName, listviewId, callbackFunction){
                retrieveListViewDescribe(sobjectName, listviewId, callbackFunction);
            },
            /*
            retrieveLayoutByRecordType:function(sobjectName, recordTypeId, callbackFunction){
                if(recordTypeId == null || recordTypeId == ''){
                    recordTypeId = 'norecordtype';
                }
                if(AjaxResponses.welinklayouts[recordTypeId] != null){
                    AjaxResponses.welinklayout = AjaxResponses.welinklayouts[recordTypeId];
                } else {
                    AjaxResponses.layout = AjaxResponses.layoutsMapping[recordTypeId];
                }
                callbackFunction();
            },
            */
            retrieveSobjectRelatedMetadata:retrieveSobjectRelatedMetadata
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
        
        var handleViewLayout = function(layoutSections){
            
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
                        processed.push(items[i].layoutComponents[0].details);
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
            record.recordtype_detail = AjaxResponses.recordtype;//JSON.parse(window.atob(result));
            var bp_values = [];

            if(record.recordtype_detail != null){
                for (var i = 0; i < record.recordtype_detail.length; i++) {
                    if(record.recordtype_detail[i].fullName != null && record.recordtype_detail[i].label == record.recordtypename){
                        bp_values = record.recordtype_detail[i].picklistValues;
                        record.selected_recordtype_detail = record.recordtype_detail[i];
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

            var result = AjaxResponses.businessprocess;
            console.log('remoting business process');
            record.businessprocess_detail = result;//JSON.parse(window.atob(result));

            var bp_values = [];
            var bp_processed_values = [];

            if(record.businessprocess_detail != null)
            for (var i = 0; i < record.businessprocess_detail.length; i++) {
                if(record.businessprocess_detail[i].fullName != null && record.businessprocess_detail[i].fullName == record.selected_recordtype_detail.businessProcess){
                    bp_values = record.businessprocess_detail[i].values;
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
            viewlayout:handleViewLayout,
            recordTypes:handleRecordTypes,
            businessProcesses:handleBusinessProcesses,
            handleReferenceFields:handleReferenceFields
        };
    })();

if(window.location.search.indexOf('sobject') > -1 && window.location.search.indexOf('mode') < 0){
    window.history.replaceState('DPListView','DPListView','DP' + window.location.search + '&mode=list');
}

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
            RecordForm.save(form_dataset);
        }, // loading

        cancel:function(){
            window.history.back();
        } // no loading
    };

    window.onpopstate = function(event){
        route();
        console.log('test');
        event.preventDefault();
    };

    window.params = {
        mode:'',
        sobject:'',
        referer:'',
        id:'',
        listviewid:'',
        recordtypeid:'',
        retry:'',
        crossref:''
    };

        window.sobject ={
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

        window.record = {
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

        window.listview = {
            recordType:{},
            recordLabel:{},
            queryresult:{}
        };

        window.templates = {};

        window.AjaxResponses = {
            has_retrieved_sobject_related:false,
            sobjectdescribe:null,
            listviews:null,
            layouts:null,
            metadata:null,
            searchlayout:null,
            recentlyviewed:null,
            recordtype:null,
            businessprocess:null,

            has_retrieved_record_related:false,
            record:null,
            welinklayoutid:null,
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

        window.raw = {
            has_ajax_timeout:false,

            recentlyviewedwithfields:null,
            recentlyviewedwithfields_retrieved:false,
            listviewresult:{},
            listviewresult_retrieved:{},
            listviewdescribe:{},
            listviewdescribe_retrieved:{},
            listviewqueryresult:null,
            listviewqueryresult_retrieved:false,
            recorddetail:null,
            recorddetail_retrieved:false,
            sobjectlayouts:null,
            sobjectlayouts_retrieved:false,
            welinklayoutid:null,
            welinklayoutid_retrieved:false,
            welinklayoutdetail:null,
            welinklayoutdetail_retrieved:false,
            references:null
        };



        window.setup_objects = [
            'AccountTerritoryAssignmentRule','AccountTerritoryAssignmentRuleItem','ApexComponent','ApexPage','BusinessHours','BusinessProcess','CategoryNode','CurrencyType','DatedConversionRate','NetworkMember','ProcessInstance','Profile','RecordType','SelfServiceUser','StaticResource','Territory2','UserAccountTeamMember','UserTerritory','WebLink','FieldPermissions','Group','GroupMember','ObjectPermissions','PermissionSet','PermissionSetAssignment','QueueSObject','ObjectTerritory2AssignmentRule','ObjectTerritory2AssignmentRuleItem','RuleTerritory2Association','SetupEntityAccess','Territory2','Territory2Model','UserTerritory2Association','User','UserRole','UserTerritory','Territory'
            ];

        window.processing = {
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
                var loading_image_src = context.welink_logo_src;//"{!URLFOR($Resource.DPResource, '/DPResource/welinklogo.png')}";
                
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

    var retrieveByRecentlyViewed = function(doFinish){ // sobject name, search layouts, recentlyviewed ids
        if(raw.recentlyviewedwithfields_retrieved){
            doFinish();
            return;
        }
        retrieveRecentlyViewedwithFields(doFinish);
    };

    var retrieveByListViewId = function(doFinish){ // USER SELECT sobject name, listview id

    };

    var retrieveByWelinkLayoutId = function(doFinish){ // welink layout id

    };

    var constructSoqlStatement = function(){
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
        if(sobject.recentlyviewed_ids != ''){
            soql += "Id IN (";
            soql += sobject.recentlyviewed_ids;
            soql += ") And (LastViewedDate != null Or LastReferencedDate != null)";
        } else {
            soql += "LastViewedDate != null Or LastReferencedDate != null";
        }
        soql += " Order By LastViewedDate asc,LastReferencedDate asc";

        return soql;
    }

    var retrieveRecentlyViewedwithFields = function(doFinish){
        Ajax.get(
            '/query?q=' + window.encodeURIComponent(constructSoqlStatement()), 
            function(response){
                raw.recentlyviewedwithfields = response;
                raw.recentlyviewedwithfields_retrieved = true;
                doFinish();
            }
        );
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
            endpoint = context.rest_base_uri + endpoint + (endpoint.indexOf('?') > -1?'&':'?') + '_t=' + new Date().getTime();

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

    var ListViews = {
        select:function(){

        }
    };

    var RecordForm = {
        validate:function(){

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

                form_dataset[field_name] = field_value;
            };

            for (var i = 0; i < form_textareas.length; i++) {
                var field_name = form_textareas[i].id.substring(13);
                var field_value = form_textareas[i].value;

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

        var retrieveRecord = function(sobjectName, recordId, callbackFunction){
            Ajax.get(
                '/sobjects/' + sobjectName + '/' + record.id, 
                function(response){
                    AjaxResponses.record = response;
                    retrieveReferences(sobjectName, recordId, callbackFunction);
                    //retrieveWelinkLayoutId(sobjectName, recordId, callbackFunction);
                    /* if without welink layout, use this
                    if(response.RecordTypeId != null){
                        retrieveLayoutByRecordType(sobjectName, response.RecordTypeId, callbackFunction);
                    } else {
                        retrieveLayoutWithoutRecordType(sobjectName, callbackFunction);
                    }
                    */
                }
            );
        }

        var retrieveReferences = function(sobjectName, recordId, doFinish){
            var soql = getReferenceFields(sobjectName, recordId);
            if(soql != 'Id'){
                Ajax.get(
                    '/query/?q=' + window.encodeURIComponent(soql),
                    function(response){
                        AjaxResponses.references = response;
                        handleReferenceFields(sobjectName, recordId, doFinish);
                    }
                );
            } else {
                handleReferenceFields(sobjectName, recordId, doFinish);
            }
        };

        var getReferenceFields = function(sobjectName, recordId){
            var soql_fields = 'Id';

            for (var i = 0; i < sobject.describe.fields.length; i++) {
                if(sobject.describe.fields[i].type == 'reference'){
                    var field_name = sobject.describe.fields[i].name;
                    console.log(field_name);
                    if(field_name == 'DelegatedApproverId' || field_name == 'CallCenterId' || field_name == 'ConnectionSentId' || field_name == 'ConnectionReceivedId'){
                        console.log('===== in ');
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

            if(soql_fields != 'Id'){
                return 'Select ' + soql_fields + ' From ' + sobjectName + ' Where Id = \'' + recordId + '\'';
            } else {
                return soql_fields;
            }
        };

        var handleReferenceFields = function(sobjectName, recordId, doFinish){
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
            //doFinish();
            retrieveWelinkLayoutId(sobjectName, recordId, doFinish);
            //View.stopLoading('jqm-record');
        };

        var retrieveWelinkLayoutId = function(sobjectName, recordId, callbackFunction){
            Ajax.remoting(
                'retrieveSobjectWelinkLayoutId',
                [sobjectName || '',recordId || ''],
                function(result){
                    AjaxResponses.welinklayoutid = result;
                    
                    if(result != null && result != '' && result.indexOf('exception') < 0){
                        retrieveWelinkLayout(result, callbackFunction);
                    } else if(AjaxResponses.record.RecordTypeId != null){
                        retrieveLayoutByRecordType(sobjectName, AjaxResponses.record.RecordTypeId, callbackFunction);
                    } else {
                        retrieveLayoutWithoutRecordType(sobjectName, callbackFunction);
                    }
                },
                function(result, event){
                    if(AjaxResponses.record.RecordTypeId != null){
                        retrieveLayoutByRecordType(sobjectName, AjaxResponses.record.RecordTypeId, callbackFunction);
                    } else {
                        retrieveLayoutWithoutRecordType(sobjectName, callbackFunction);
                    }
                }
            );
        }

        var retrieveWelinkLayoutIdByRecordTypeId = function(sobjectName, recordTypeId, callbackFunction){
            Ajax.remoting(
                'retrieveSobjectWelinkLayoutIdByRecordTypeId',
                [sobjectName || '',recordTypeId || ''],
                function(result){
                    AjaxResponses.welinklayoutid = result;
                },
                function(result, event){
                    console.log(event);
                }
            );
        }

        var retrieveWelinkLayout = function(welinkLayoutId, callbackFunction){
            Ajax.get(
                '/tooling/sobjects/Layout/' + welinkLayoutId, 
                function(response){
                    AjaxResponses.welinklayout = response.Metadata;
                    AjaxResponses.has_retrieved_record_related = true;
                    callbackFunction();
                }
            );
        }

        var retrieveLayoutWithoutRecordType = function(sobjectName, callbackFunction){
            Ajax.get(
                '/sobjects/' + sobjectName + '/describe/layouts/', 
                function(response){
                    AjaxResponses.layout = response.layouts[0];
                    AjaxResponses.has_retrieved_record_related = true;
                    callbackFunction();
                }
            );
        }

        var retrieveLayoutByRecordType = function(sobjectName, recordTypeId, callbackFunction){
            Ajax.get(
                '/sobjects/' + sobjectName + '/describe/layouts/' + recordTypeId, 
                function(response){
                    AjaxResponses.layout = response;
                    AjaxResponses.has_retrieved_record_related = true;
                    callbackFunction();
                }
            );
        }

        var retrieveDescribe = function(sobjectName, doFinish){
            Ajax.get(
                '/sobjects/' + sobjectName + '/describe', 
                function(response){
                    AjaxResponses.sobjectdescribe = response;
                    retrieveListViews(sobject.name, doFinish);
                }
            );
        };

        var retrieveListViews = function(sobjectName, doFinish){
            Ajax.get(
                '/sobjects/' + sobjectName + '/listviews', 
                function(response){
                    AjaxResponses.listviews = response;
                    retrieveLayouts(sobjectName, doFinish);
                }
            );
        };

        var retrieveLayouts = function(sobjectName, doFinish){
            Ajax.get(
                '/sobjects/' + sobjectName + '/describe/layouts/', 
                function(response){
                    AjaxResponses.layouts = response;
                    retrieveMetadata(sobjectName, doFinish);
                }
            );
        };

        var retrieveMetadata = function(sobjectName, doFinish){
            Ajax.remoting(
                'retrieveSobjectMetadata',
                [sobjectName],
                function(result){
                    AjaxResponses.metadata = result;
                    retrieveSearchLayout(sobjectName, doFinish);
                },
                function(result){
                    sobject.ordered_listviews = sobject.listviews.listviews;
                    retrieveSearchLayout(sobjectName, doFinish);
                }
            );
        };

        var retrieveSearchLayout = function(sobjectName, doFinish){
            Ajax.get(
                '/search/layout/?q=' + sobjectName, 
                function(response){
                    AjaxResponses.searchlayout = response;
                    retrieveRecentlyViewed(sobjectName, doFinish);
                }
            );
        };

        var retrieveRecentlyViewed = function(sobjectName, doFinish){
            Ajax.get(
                '/query?q=' + window.encodeURIComponent("Select Id From RecentlyViewed Where Type='" + sobjectName + "'"),
                function(response){
                    AjaxResponses.recentlyviewed = response;
                    retrieveRecordTypes(sobjectName, doFinish);
                }
            );
        };

        var retrieveRecordTypes = function(sobjectName, doFinish){
            Ajax.remoting(
                'retrieveMetadataRecordType',
                [sobjectName],
                function(result){
                    AjaxResponses.recordtype = result;
                    retrieveBusinessProcess(sobjectName, doFinish);
                },
                function(){
                    console.log(result);
                    console.log(event);
                    retrieveBusinessProcess(sobjectName, doFinish);
                }
            );
        };

        var retrieveBusinessProcess = function(sobjectName, doFinish){
            if(sobjectName != 'Opportunity'){
                AjaxResponses.has_retrieved_sobject_related = true;
                doFinish();
                return;
            }

            Ajax.remoting(
                'retrieveMetadataBusinessProcess',
                [sobjectName],
                function(result){
                    AjaxResponses.businessprocess = result;
                    AjaxResponses.has_retrieved_sobject_related = true;
                    doFinish();
                },
                function(result,event){
                    console.log(result);
                    console.log(event);
                    AjaxResponses.has_retrieved_sobject_related = true;
                    doFinish();
                }
            );
        };

        var constructSoqlStatement = function(){
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
            if(sobject.recentlyviewed_ids != ''){
                soql += "Id IN (";
                soql += sobject.recentlyviewed_ids;
                soql += ") And (LastViewedDate != null Or LastReferencedDate != null)";
            } else {
                soql += "LastViewedDate != null Or LastReferencedDate != null";
            }
            soql += " Order By LastViewedDate asc,LastReferencedDate asc";

            return soql;
        };

        var retrieveRecentlyViewedwithFields = function(doFinish){
            Ajax.get(
                '/query?q=' + window.encodeURIComponent(constructSoqlStatement()), 
                function(response){
                    raw.recentlyviewedwithfields = response;
                    raw.recentlyviewedwithfields_retrieved = true;
                    doFinish();
                }
            );
        };

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
                if(AjaxResponses.has_retrieved_sobject_related){
                    callbackFunction();
                } else {
                    retrieveDescribe(sobjectName, callbackFunction);
                }
            },

            retrieveSelectedListView:function(sobjectName, listviewId, callbackFunction){
                retrieveListViewDescribe(sobjectName, listviewId, callbackFunction);
            }
        };
    })();

    var ListView;

    function renderListView(){
        ListView = initListView();

        document.querySelector('body').innerHTML = templates.listview_page_structure;

        document.querySelector('#jqm-header-left-button')['href'] = '';
        document.querySelector('#jqm-header-right-button')['href'] = "javascript:UserAction.newRecord('jqm-list')";

        document.querySelector('#jqm-header-left-button').innerHTML = '';
        document.querySelector('#jqm-header-right-button').innerHTML = '';

        $j.mobile.initializePage();
        Styles.tunePageStyle();

        View.animateLoading(context.labels.loading,'jqm-list');
        ListView.retrieveSobjectData();
    }
    
    var initListView = function(){

        function handleDescribe(){
            sobject.describe = AjaxResponses.sobjectdescribe;
            document.querySelector('#jqm-page-title').innerHTML = context.labels.listview;
            document.title = sobject.describe.label;
            document.querySelector('title').innerHTML = sobject.describe.label;
            
            var $body = $j('body');
            document.title = sobject.describe.label;

            var $iframe = $j('<iframe src="/favicon.ico"></iframe>').on('load', function() {
                setTimeout(function() {
                    $iframe.off('load').remove();
                }, 0)
            }).appendTo($body);

            var sobject_fields = sobject.describe.fields;

            for (var i = sobject_fields.length - 1; i >= 0; i--) {

                sobject.fields[sobject_fields[i].name] = sobject.fields[sobject_fields[i].name] || {};
                sobject.fields[sobject_fields[i].name].describe = sobject_fields[i];
            };
        }

        function handleListViews(){
            sobject.listviews = AjaxResponses.listviews;
            for (var i = 0; i < sobject.listviews.listviews.length; i++) {
                sobject.listviewsmap[sobject.listviews.listviews[i].id] = sobject.listviews.listviews[i];
            };
        }

        function handleSearchLayout(){
            sobject.search_layout_fields = AjaxResponses.searchlayout[0].searchColumns;
        }

        function handleMetadata(){
            var result = AjaxResponses.metadata;

            sobject.ordered_listviews = [];

            if(result == 'exception'){
                sobject.ordered_listviews = sobject.listviews.listviews;
                return;
            }

            var sobject_metadata = result.split('==');
            var _md = sobject.metadata;
            _md.filter_by_my_listview = sobject_metadata[0].split('=');
            _md.visible_to_me_listview = sobject_metadata[1].split('=');
            _md.created_by_me_listview = sobject_metadata[2].split('=');
            _md.tab_list_fields = sobject_metadata[3].split('=');

            var ordered_listview_ids = [];

            for (var i = 0; i < _md.filter_by_my_listview.length; i++) {
                if(_md.filter_by_my_listview[i] != ''){
                    ordered_listview_ids.push(_md.filter_by_my_listview[i]);
                }
            };

            for (var i = 0; i < _md.visible_to_me_listview.length; i++) {
                if(_md.visible_to_me_listview[i] != ''){
                    ordered_listview_ids.push(_md.visible_to_me_listview[i]);
                }
            };

            for (var i = 0; i < _md.created_by_me_listview.length; i++) {
                if(_md.created_by_me_listview[i] != ''){
                    ordered_listview_ids.push(_md.created_by_me_listview[i]);
                }
            };

            for (var i = 0; i < sobject.listviews.listviews.length; i++) {
                if(ordered_listview_ids.indexOf(sobject.listviews.listviews[i].id) < 0){
                    ordered_listview_ids.push(sobject.listviews.listviews[i].id);
                }
            };

            for (var i = 0; i < ordered_listview_ids.length; i++) {
                sobject.ordered_listviews.push(sobject.listviewsmap[ordered_listview_ids[i]]);
            };
        }

        function handleRecentlyViewed(){
            var response = AjaxResponses.recentlyviewed;
            for (var i = response.records.length - 1; i >= 0; i--) {
                sobject.recentlyviewed_ids += "'" + response.records[i].Id + "',";
            };

            if(sobject.recentlyviewed_ids != ''){
                sobject.recentlyviewed_ids = sobject.recentlyviewed_ids.substring(0,sobject.recentlyviewed_ids.length - 1);
            } 
        }

        function retrieveSobjectData(){
            AjaxPools.retrieveSobjectRelated(sobject.name, function(){

                handleDescribe();
                handleListViews();
                handleSearchLayout();
                handleMetadata();
                handleRecentlyViewed();

                if(params.listviewid != 'recentlyviewed'){
                    //View.animateLoading(context.labels.loading,'jqm-list');
                    renderListViewSelects();
                    //retrieveSelectListView(params.listviewid);
                    AjaxPools.retrieveSelectedListView(sobject.name, params.listviewid, function(){
                        var response = AjaxResponses.listviews[params.listviewid].describe;
                        for (var i = response.columns.length - 1; i >= 0; i--) {
                            listview.recordType[response.columns[i].fieldNameOrPath] = response.columns[i].type;
                            listview.recordLabel[response.columns[i].fieldNameOrPath] = response.columns[i].label;
                        };

                        listview.queryresult = AjaxResponses.listviews[params.listviewid].result;//raw.listviewqueryresult;
                        renderListViewResultList(25);
                        View.stopLoading('jqm-list');
                    });
                } else if(sobject.recentlyviewed_ids != ""){
                    window.retrieveByRecentlyViewed(function(){
                        sobject.recentlyviewed = raw.recentlyviewedwithfields;

                        renderListViewSelects();
                        renderRecentlyViewedList();
                        View.stopLoading('jqm-list');
                    });
                } else {
                    renderListViewSelects();
                    renderRecentlyViewedList();
                    View.stopLoading('jqm-list');
                }
            });
        }

        function viewRecord(record_id){
            View.animateLoading(context.labels.loading,'jqm-list');
            window.history.pushState('DPRecordView','DPRecordView','DP?mode=view&sobject=' + sobject.name + '&id=' + record_id + '&listviewid=' + params.listviewid);
            route();
        }

        function selectListView(){
            var selected_option_id;
            
            var all_options = document.querySelectorAll('#listviewlist option');
            
            for(var i = 0; i < all_options.length; i++){
                if(all_options[i].selected){
                    selected_option_id = all_options[i].value;
                    break;
                }
            }

            if(selected_option_id == 'chooselistview'){
                params.listviewid = 'recentlyviewed';
                window.history.replaceState('DPListView','DPListView','DP?mode=list&sobject=' + sobject.name + '&listviewid=recentlyviewed');

                if(raw.recentlyviewedwithfields != null){
                    renderRecentlyViewedList();
                } else {
                    window.retrieveByRecentlyViewed(function(){
                        sobject.recentlyviewed = raw.recentlyviewedwithfields;

                        //renderListViewSelects();
                        renderRecentlyViewedList();
                        View.stopLoading('jqm-list');
                    });
                }
            } else {
                selected_option_id = selected_option_id.substr(0,15);
                params.listviewid = selected_option_id;

                window.history.replaceState('DPListView','DPListView','DP?mode=list&sobject=' + sobject.name + '&listviewid=' + selected_option_id);
                
                View.animateLoading(context.labels.loading,'jqm-list');
                
                AjaxPools.retrieveSelectedListView(sobject.name, selected_option_id, function(){
                    
                    var response = AjaxResponses.listviews[selected_option_id].describe;
                    for (var i = response.columns.length - 1; i >= 0; i--) {
                        listview.recordType[response.columns[i].fieldNameOrPath] = response.columns[i].type;
                        listview.recordLabel[response.columns[i].fieldNameOrPath] = response.columns[i].label;
                    };

                    listview.queryresult = AjaxResponses.listviews[selected_option_id].result;//raw.listviewqueryresult;
                    renderListViewResultList(25);
                    View.stopLoading('jqm-list');
                });
                
                //retrieveSelectListView(selected_option_id);
            }
        }

        function retrieveSelectListView(listview_id){
            retrieveListViewDescribe(listview_id);
        }

        function processSelectListView(listview_id){
            if(raw.listviewdescribe_retrieved[listview_id]){
                handleListViewDescribe(listview_id);
                retrieveSelectListViewResultBySoql(listview_id);
            }
        }

        function retrieveSelectListViewResultBySoql(listview_id){
            retrieveListViewResultBySoql(raw.listviewdescribe[listview_id].query);
        }

        function processSelectListViewResultBySoql(){
            handleListViewResultBySoql();
            renderListViewResultList(25);
        }

        // listview results max 25
        // listview describe info
        function retrieveListViewDescribe(listview_id){
            Ajax.get(
                '/sobjects/' + sobject.name + '/listviews/' + listview_id + '/describe', 
                function(response){
                    raw.listviewdescribe[listview_id] = response;
                    raw.listviewdescribe_retrieved[listview_id] = true;
                    processSelectListView(listview_id);
                }
            );
        }

        function handleListViewDescribe(listview_id){
            var response = raw.listviewdescribe[listview_id];
            for (var i = response.columns.length - 1; i >= 0; i--) {
                listview.recordType[response.columns[i].fieldNameOrPath] = response.columns[i].type;
                listview.recordLabel[response.columns[i].fieldNameOrPath] = response.columns[i].label;
            };
        }

        // listview describe soql query result
        function retrieveListViewResultBySoql(soql){
            Ajax.get(
                '/query/?q=' + window.encodeURIComponent(soql), 
                function(response){
                    raw.listviewqueryresult = response;
                    raw.listviewqueryresult_retrieved = true;
                    processSelectListViewResultBySoql();
                }
            );
        }

        function handleListViewResultBySoql(){
            listview.queryresult = raw.listviewqueryresult;
            View.stopLoading('jqm-list');
        }

        function renderListViewSelects(){
            var options = '';
            var option_template = templates.listview_option;
            /*
            for(var i = 0; i < sobject.listviews.listviews.length;i++){
                options += option_template.replace('{{option-value}}',sobject.listviews.listviews[i].id).replace('{{option-label}}',sobject.listviews.listviews[i].label);
            }
            */

            for (var i = 0; i < sobject.ordered_listviews.length; i++) {
                var option = option_template.replace('{{option-value}}',sobject.ordered_listviews[i].id).replace('{{option-label}}',sobject.ordered_listviews[i].label);

                if(params.listviewid == sobject.ordered_listviews[i].id.substring(0,15)){
                    options += option.replace('{{selected}}','selected');
                } else {
                    options += option.replace('{{selected}}','');
                }

                //options += option_template.replace('{{option-value}}',sobject.ordered_listviews[i].id).replace('{{option-label}}',sobject.ordered_listviews[i].label);
            };

            var listview_select = templates.listview_select.replace('{{select-listview}}',context.labels.select_listview);
            options = listview_select.replace('{{options}}',options);
            document.querySelector('#listview-picklist').innerHTML = options;
            
            $j('select').selectmenu();
        }

        function renderRecentlyViewedList(){
            var listitems = '';
            var listitem_template = templates.listview_resultitem;
            
            var listview_results = sobject.recentlyviewed.records; 
            
            if(listview_results == undefined || listview_results.length == 0){
                document.querySelector('#listview-resultlist').innerHTML = templates.listview_result_noitem.replace('{{no-record}}',context.labels.no_record);
                return;
            }

            
            for (var i = listview_results.length - 1; i >= 0; i--) {
                var _fields = getRecentlyViewedItemContent(listview_results[i]);
                listitems += listitem_template.replace('{{itemname}}',listview_results[i].Name || '').replace('{{record-id}}',listview_results[i].Id).replace('{{itemfields}}',_fields);
            };
            
            listitems = templates.listview_resultlist.replace('{{items}}',listitems);
            document.querySelector('#listview-resultlist').innerHTML = listitems;

            $j('ul').listview();
        }

        function renderListViewResultList(display_number){
            var _res = listview.queryresult;
            var listitems = '';
            var listitem_template = templates.listview_resultitem;
            var recordType = listview.recordType;
            
            
            if(_res.records == undefined || _res.records.length == 0){
                document.querySelector('#listview-resultlist').innerHTML = templates.listview_result_noitem.replace('{{no-record}}',context.labels.no_record);
                
                return;
            }

            var actual_display_number = _res.records.length;
            var need_partial_loading = false;

            if(display_number < _res.records.length){
                need_partial_loading = true;
                actual_display_number = display_number;
            }

            for(var i = 0; i < actual_display_number; i++){
                var recordValue = _res.records[i];

                var __fields = '<table>';
                
                var _count = 0;
                for(var property in recordValue){
                    if(_count < 5 && property != 'Name' && property != 'attributes'){
                        
                        var _record_val = recordValue[property] || '';

                        if(_record_val != '')
                        switch(recordType[property]){
                            case 'currency':
                                if(sobject.fields.CurrencyIsoCode != undefined){
                                    _record_val = recordValue['CurrencyIsoCode'] + ' ' + _record_val;
                                }
                                break;
                            case 'date':
                                //console.log(_record_val + 'fadfafafda');
                                //_record_val = formatDatetimeString(_record_val, 'date');
                                //console.log(_record_val);
                                break;
                            case 'datetime': 
                                //console.log(_record_val + 'fdfadfasfadsfa');
                                //_record_val = formatDatetimeString(_record_val, 'datetime');
                                //console.log('&*&*&*&*&*&*&*&*&*&*&*&*&*&');
                                //console.log(_record_val);
                                _record_val = TimezoneDatabase.formatDatetimeToLocal(_record_val, context.timezone);
                                _record_val = _record_val.replace('T',' ');
                                break;
                            case undefined:
                                //_record_val = _record_val[property].Alias;
                                break;
                            default:
                                console.log(recordType[property]);
                        }


                        if(typeof _record_val == 'object'){
                            var _assigned = false;
                            for(var p in _record_val){
                                if(p != 'attributes' && !_assigned){
                                    property += '.';
                                    property += p;
                                    _record_val = _record_val[p];
                                    _assigned = true;
                                }
                            }
                        }

                        __fields += '<tr>';
                        __fields += '<td>';

                        var field_label = '';

                        if(listview.recordLabel[property] == null || listview.recordLabel[property] == ''){
                            property = property + '.Name';
                        }

                        __fields += listview.recordLabel[property] || field_label;
                        __fields += ': ';
                        __fields += '</td>';
                        __fields += '<td>';
                        __fields += _record_val;
                        __fields += '</td>';
                        __fields += '</tr>';
                        _count++;
                    }
                }

                __fields += '</table>';
                console.log(__fields);
                
                listitems += listitem_template.replace('{{itemname}}',recordValue.Name || '').replace('{{record-id}}',recordValue.Id).replace('{{itemfields}}',__fields);
                
            }

            if(need_partial_loading){
                listitems += '<li data-icon="false">';
                listitems += '<a href="javascript:ListView.renderListViewResultList(' + (display_number + 25) +');">';
                listitems += '<div style="font-weight:normal;"><h1 style="margin-top:0px;text-align:center;">';
                listitems += context.labels.more;
                listitems += '</h1></div></a></li>';
            }

            listitems = templates.listview_resultlist.replace('{{items}}',listitems);
            document.querySelector('#listview-resultlist').innerHTML = listitems;

            $j('ul').listview();
        }

        // 'Mon Jun 18 00:00:00 GMT 2012' to '2012-06-18' or '2012-06-18 00:00:00'
        function formatDatetimeString(origin_string, date_or_datetime){
            var months = {
                'Jan':'01',
                'Feb':'02',
                'Mar':'03',
                'Apr':'04',
                'May':'05',
                'Jun':'06',
                'Jul':'07',
                'Aug':'08',
                'Sep':'09',
                'Oct':'10',
                'Nov':'11',
                'Dec':'12'
            };

            var 
                _year = origin_string.substring(24,28),
                _month = months[origin_string.substring(4,7)],
                _date = origin_string.substring(8,10),
                _time = origin_string.substring(11,19);

            switch(date_or_datetime){
                case 'date':
                    return _year + '-' + _month + '-' + _date;
                    break;
                case 'datetime':
                    return _year + '-' + _month + '-' + _date + ' ' + _time;
                    break;
                default: 
                    console.log('test');
            }
        }

        function getRecentlyViewedItemContent(_item){
            var _counter = 0;
            var _fields = '<p style="font-size:1em;">';
            
            for (var i = 0; i < sobject.search_layout_fields.length; i++) {
                if(sobject.search_layout_fields[i].name != 'Name' && _counter < 4){
                    var _field_label = sobject.search_layout_fields[i].label;
                    var _field_value = '';

                    if(sobject.search_layout_fields[i].name.indexOf('.') > 0){
                        var _name = sobject.search_layout_fields[i].name.split('.');
                        
                        if(_item[_name[0]] != null)
                        _field_value = _item[_name[0]][_name[1]];
                    } else {
                        var _field_name = sobject.search_layout_fields[i].name;
                        if(_field_name.indexOf('toLabel') >= 0){
                            _field_name = _field_name.substring(8,_field_name.length - 1);
                        }
                        _field_value = _item[_field_name] || '';
                    }

                    var label_font = '';
                    var label_font_end = '';

                    if(_field_value != null && _field_value.length == 28 && _field_value.indexOf('000+0000') > 0){
                        _field_value = TimezoneDatabase.formatDatetimeToLocal(_field_value, context.timezone).replace('T',' ');
                    }

                    // 不显示字段标签，只显示字段值
                    switch(_counter){
                        case 0:
                            var cell0 = '';
                            //cell0 += label_font + _field_label + label_font_end;
                            //cell0 += ': ';
                            cell0 += _field_value || '';
                            _fields += cell0;
                            break;
                        case 1:
                            var cell1 = '';
                            if(_fields != '<p style="font-size:1em;">'){
                                cell1 = ' | ';
                            }

                            //cell1 += label_font + _field_label + label_font_end;
                            //cell1 += ': ';
                            cell1 += _field_value || '';
                            _fields += cell1 == ' | '?'':cell1;
                            break;
                        case 2:
                            var cell2 = '';
                            if(_fields != '<p style="font-size:1em;">'){
                                cell2 = '</p><p style="font-size:1em;">';
                            } 
                            //cell2 += label_font + _field_label + label_font_end;
                            //cell2 += ': ';
                            cell2 += _field_value || '';
                            _fields += cell2;
                            break;
                        case 3: 
                            var cell3 = ' | ';
                            //cell3 += label_font + _field_label + label_font_end;
                            //cell3 += ': ';
                            cell3 += _field_value || '';
                            _fields += cell3 == ' | '?'':cell3;
                            break;
                        default: console.log(_counter);
                    }

                    _counter++;
                }
            };

            _fields += '</p>';
            return _fields;
        }

        return {
            retrieveSobjectData:retrieveSobjectData,
            renderListViewResultList:renderListViewResultList,
            viewRecord:viewRecord,
            selectListView:selectListView
        }

    };

    var RecordNew;

    function renderRecordNew(){
        RecordNew = initRecordNew();

        var recordnew_page = templates.record_page_structure;

        document.querySelector('body').innerHTML = recordnew_page + templates.page_lookup;
        
        document.querySelector('#jqm-page-title').innerHTML = context.labels.new;
        document.title = sobject.describe.label;
        document.querySelector('#jqm-header-left-button')['href'] = 'javascript:UserAction.cancel()';
        document.querySelector('#jqm-header-right-button')['href'] = 'javascript:UserAction.saveRecord()';
        document.querySelector('#jqm-header-left-button').innerHTML = context.labels.cancel;
        document.querySelector('#jqm-header-right-button').innerHTML = context.labels.save;
        document.querySelector('#jqm-header-left-button').classList.add('ui-icon-back');
        document.querySelector('#jqm-header-right-button').classList.add('ui-icon-check');

        
        $j.mobile.initializePage();
        Styles.tunePageStyle();
        
        View.animateLoading(context.labels.loading,'jqm-record');
        RecordNew.retrieveSobjectData();
    }

    var initRecordNew = function(){
        function retrieveSobjectData(){
            AjaxPools.retrieveSobjectRelated(sobject.name, function(){
                handleDescribe();
                handleSobjectLayouts();
                checkRecordType();
            });
        }

        function handleDescribe(){
            sobject.describe = AjaxResponses.sobjectdescribe;

            for (var i = sobject.describe.fields.length - 1; i >= 0; i--) {
                sobject.fields[sobject.describe.fields[i].name] = sobject.fields[sobject.describe.fields[i].name] || {};
                sobject.fields[sobject.describe.fields[i].name].describe = sobject.describe.fields[i];
            };
        }

        function handleSobjectLayouts(){
            var response = AjaxResponses.layouts;
            var recordtype_mappings = response.recordTypeMappings;
            sobject.recordtype_mappings = response.recordTypeMappings;
            switch(true){
                case (response.layouts != null && response.layouts.length > 0):
                    console.log('no recordtype, no recordtype select needed');
                    sobject.layout = response.layouts[0];
                    //record.processed = 
                    processLayoutSection();
                    break;
                case (response.recordTypeSelectorRequired.length > 0 && !response.recordTypeSelectorRequired[0]):
                    console.log('use default recordtype, no recordtype select needed');
                    for(i = 0; i < recordtype_mappings.length; i++){
                        if(recordtype_mappings[i].defaultRecordTypeMapping){
                            record.recordtypeid = recordtype_mappings[i].recordTypeId;
                            record.recordtypename = recordtype_mappings[i].name;
                            break;
                        }
                    }
                    break;
                default:
                    console.log('has recordtypes, recordtype select needed');
                    record.recordtypeid = 'pending select';
            }
        }

        function checkRecordType(){
            switch(record.recordtypeid){
                case 'pending select':
                    renderRecordTypeSelect();
                    break;
                case '':
                    retrieveWelinkLayoutId2();
                    break;
                default:
                    retrieveRecordTypeData();
            }
        }

        function retrieveRecordTypeData(){
            retrieveSobjectLayoutByRecordTypeId();
            //retrieveRecordTypeDetail();
            /*
            if(sobject.name == 'Opportunity'){
                retrieveBusinessProcessDetail();
            } else {
                raw.businessprocess_retrieved = true;
            }
            */
        }

        function processRecordTypeData(){
            if(raw.sobjectlayout_retrieved ){
                handleSobjectLayoutByRecordTypeId();
                handleRecordTypeDetail();
                handleBusinessProcessDetail();

                retrieveWelinkLayoutId2();
            }
        }

        function retrieveWelinkLayoutId2(){
            retrieveWelinkLayoutId();
        }

        function processWelinkLayoutId(){
            checkWelinkLayoutId();
        }

        function checkWelinkLayoutId(){
            if(raw.welinklayoutid == '' || raw.welinklayoutid.indexOf('exception') >= 0){
                renderLayout();
            } else {
                retrieveWelinkLayoutData();
            }
        }

        function retrieveWelinkLayoutData(){
            retrieveWelinkLayoutDetail('/tooling/sobjects/Layout/' + raw.welinklayoutid);
        }

        function processWelinkLayoutData(){
            handleWelinkLayoutDetail();
            renderLayout();
        }

        function renderRecordTypeSelect(){
            //record.recordtypeid = '';
            var recordtype_mappings = sobject.recordtype_mappings;
            var recordtype_options = '';
            var has_default = false;
            for (var i = 0; i < recordtype_mappings.length - 1; i++) {
                var option = templates.recordtype_option.replace('{{option-label}}',recordtype_mappings[i].name).replace('{{option-value}}',recordtype_mappings[i].recordTypeId);
                if(record.recordtypeid != '' && record.recordtypeid != 'pending select'){
                    if(recordtype_mappings[i].recordTypeId == record.recordtypeid){

                    }
                } else if(recordtype_mappings[i].defaultRecordTypeMapping && !has_default){
                    option = option.replace('{{selected}}','selected');
                    has_default = true;
                } else {
                    option = option.replace('{{selected}}','');
                }

                recordtype_options += option;
            };

            if(!has_default){
                recordtype_options = '<option value="--None--">--' + context.labels.select_none + '--</option>' + recordtype_options;
            }

            var recordtype_select = templates.recordtype_select.replace('{{options}}',recordtype_options).replace('{{label}}',context.labels.select_recordtype);
            document.querySelector('#field-container').innerHTML = recordtype_select;

            $j('select').selectmenu();
            $j('input[type="button"]').button();

            document.querySelector('#jqm-header-left-button').href = 'javascript:UserAction.cancel()';
            View.stopLoading('jqm-record');
            document.querySelector('#jqm-header-right-button').href = 'javascript:RecordNew.selectRecordType()';
            //document.querySelector('#recordtype').addEventListener('change',selectRecordType);
        }

        function selectRecordType(){
            var recordtype_options = document.querySelectorAll('#recordtype option');
            for(var i = 0; i < recordtype_options.length; i++){
                if(recordtype_options[i].selected && recordtype_options[i].value != '--None--'){
                    View.animateLoading(context.labels.loading,'jqm-record');
                    document.querySelector('#jqm-header-left-button').href='javascript:RecordNew.renderRecordTypeSelect()';
                    document.querySelector('#jqm-header-right-button').href = 'javascript:UserAction.saveRecord()';
                    record.recordtypeid = recordtype_options[i].value;
                    record.recordtypename = recordtype_options[i].label;
                    retrieveRecordTypeData();
                }
            }
        }

        function retrieveSobjectLayoutByRecordTypeId(){
            Ajax.get(
                '/sobjects/' + sobject.name + '/describe/layouts/' + record.recordtypeid, 
                function(response){
                    raw.sobjectlayout = response;
                    raw.sobjectlayout_retrieved = true;
                    processRecordTypeData();
                }
            );
        }

        function handleSobjectLayoutByRecordTypeId(){
            var response = raw.sobjectlayout;

            sobject.layout = response;
            record.processed = processLayoutSection();
        }

        function handleRecordTypeDetail(){
            console.log('record type detail');
            record.recordtype_detail = AjaxResponses.recordtype;//JSON.parse(window.atob(result));
            var bp_values = [];
            var processed_rt_values = [];

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
                console.log(bp_values);
                console.log(i);
                if(sobject.fields[bp_values[i].picklist] != null)
                sobject.fields[bp_values[i].picklist].describe.picklistValues = rt_values;
            };
        }

        function handleBusinessProcessDetail(){
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
        }

        function retrieveWelinkLayoutId(){
            Ajax.remoting(
                'retrieveSobjectWelinkLayoutIdByRecordTypeId',
                [sobject.name || '',record.recordtypeid || ''],
                function(result){
                    raw.welinklayoutid = result;
                    raw.welinklayoutid_retrieved = true;
                    processWelinkLayoutId();
                },
                function(result, event){
                    console.log(event);
                }
            );
        }

        function retrieveWelinkLayoutDetail(layout_endpoint){
            Ajax.get(
                layout_endpoint, 
                function(response){
                    raw.welinklayoutdetail = response;
                    raw.welinklayoutdetail_retrieved = true;
                    processWelinkLayoutData();
                }
            );
        }

        function handleWelinkLayoutDetail(){
            var response = raw.welinklayoutdetail;
            sobject.has_welink_layout = true;
            sobject.welink_layout = response.Metadata;
            processWelinkRecordLayout();
        }


        // DATA RETRIEVAL END

        function processWelinkRecordLayout(){
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
            record.welink_processed = _welink_processed;
        }

        function processLayoutSection(){
            var edit_layout_sections = sobject.layout.editLayoutSections;
            var converted_layout = [];
            
            for(var i = 0; i < edit_layout_sections.length; i++){
                var converted_section = {};
                converted_section.heading = edit_layout_sections[i].heading;
                converted_section.useHeading = edit_layout_sections[i].useHeading;
                converted_section.rows = convertLayoutRows(edit_layout_sections[i].layoutRows);
                converted_layout.push(converted_section);
            }
            
            record.processed = converted_layout;
            //return converted;
        }
        
        function convertLayoutRows(layout_rows){
            var converted = [];
            for(var i = 0; i < layout_rows.length; i++){
                converted = converted.concat(convertLayoutRowItems(layout_rows[i].layoutItems));
            }
            return converted;
        }
        
        function convertLayoutRowItems(layout_items){
            var converted = [];
            for(var i = 0; i < layout_items.length; i++){
                if(layout_items[i].layoutComponents != null && layout_items[i].layoutComponents.length > 0 && layout_items[i].layoutComponents[0].type == 'Field'){
                    converted.push(layout_items[i]);
                }
            }
            return converted;
        }

        function processFieldsDisplay(_row, _is_welink_layout){
            var sobject_name = sobject.name;

            var _field_name = _is_welink_layout?_row:_row.layoutComponents[0].details.name;


            //var _details = _row.layoutComponents[0].details;
            if(sobject.fields[_field_name] == undefined)
                return '';

            var _details = sobject.fields[_field_name].describe;
            var _field;
            var _field_label = (_is_welink_layout?sobject.fields[_field_name].describe.label:_row.label) + ':';
            //_details.label + ':';
            var _sobject_name_lowercase = sobject.name.toLowerCase();

            var _field_required = _is_welink_layout?record.welink_required[_field_name]:_row.required;
            var _field_editable = _is_welink_layout?record.welink_edit[_field_name]:_details.createable;
            var _field_readonly = _is_welink_layout?record.welink_readonly[_field_name]:(!_details.createable);
            
            var field_templates = {};
            field_templates.boolean = templates.field_checkbox;
            field_templates.url = templates.field_url;
            field_templates.date = templates.field_date;
            field_templates.encryptedstring = templates.fields_text_encrypted;
            field_templates.textarea = templates.field_textarea;
            field_templates.string = templates.field_text;
            field_templates.currency = templates.field_currency;
            field_templates.reference = templates.field_lookup;
            field_templates.datetime = templates.field_datetime;
            field_templates.phone = templates.field_phone;
            field_templates.percent = templates.field_percent;
            field_templates.double = templates.field_number;
            field_templates.email = templates.field_email;
            field_templates.multipicklist = templates.field_multipicklist_select;
            field_templates.readonly = templates.field_readonly;
            
            if(_details.name == 'Name' && (sobject_name.toLowerCase() == 'user' || sobject_name.toLowerCase() == 'contact' || sobject_name.toLowerCase() == 'lead')){
                if(_is_welink_layout){
                    _field = processWelinkNameField();
                } else {
                    _field = processNameField(_row.layoutComponents[0].components);
                }
                
                return _field;// + '<br/>';
            }

            if((_field_readonly && _details.type != 'address')){
                var _field_template = field_templates.readonly;
                _field = _field_template.replace('{{field-label}}',_field_label);
                _field = _field.replace('{{field-value}}','<br/>');
                
                return _field;// + '<br/>';
            } 

            if(_details.name == 'RecordTypeId'){
                var _field_template = field_templates.readonly;
                _field = _field_template.replace('{{field-label}}',_field_label);
                _field = _field.replace('{{field-value}}',record.recordtypename);
                
                return _field;
            }

            if(_field_required){
                _field_label = '<span style="color:crimson">*</span>' + _field_label;
            } else {
                _field_label = '<span>&nbsp;</span>' + _field_label;
            }

            switch(_details.type){
                case 'multipicklist':
                    var _select_template = field_templates.multipicklist;
                    _field = _select_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
                    
                    var _option_template = templates.field_multipicklist_option;
                    var _options = '';
                    
                    for(var i = 0; i < _details.picklistValues.length; i++){
                        var _option = _option_template.replace('{{option-label}}',_details.picklistValues[i].label);
                        _option = _option.replace('{{option-value}}',_details.picklistValues[i].value);
                        
                        _option = _option.replace('{{option-selected}}','');
                        
                        _options += _option;
                    }
                    
                    _field = _field.replace('{{options}}',_options);
                    break;
                case 'encryptedstring':
                    _field = '';
                    /*
                    var _field_template = document.querySelector('#field-template').text;
                    _field = _field_template.replace('{{field-label}}',_field_label);
                    _field = _field.replace('{{field-value}}','');
                    */
                    break;
                case 'reference':
                    var _field_template = field_templates[_details.type] || field_templates['string'];

                    _field = _field_template.replace('{{input-label}}',_field_label);

                    if(_details.name == 'OwnerId'){
                        _field = _field.replace('{{input-value}}',context.user_fullname);
                        _field = _field.replace('{{input-value-hidden}}',context.user_id);
                    } else {
                        _field = _field.replace('{{input-value}}','');
                        _field = _field.replace('{{input-value-hidden}}','');
                    }

                    var field_ref_type = sobject.fields[_details.name].describe.referenceTo[0];
                    field_ref_type = field_ref_type == 'Group'?sobject.fields[_details.name].describe.referenceTo[1]:field_ref_type;

                    _field = _field.replace('{{reference-sobject-type}}',field_ref_type);

                    _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
                    break;
                case 'datetime':
                    var _field_template = field_templates[_details.type] || field_templates['datetime'];
                    _field = _field_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace('{{input-value}}','');
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
                    break;
                case 'picklist':
                    var _select_template = templates.field_picklist_select;
                    _field = _select_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
                    
                    var _option_template = templates.field_picklist_option;
                    var _options = '';
                    
                    var _noselect_option = _option_template.replace('{{option-label}}','--' + context.labels.select_none + '--');
                    _noselect_option = _noselect_option.replace('{{option-value}}','--None--');
                    _noselect_option = _noselect_option.replace('{{option-selected}}','');

                    if(!_field_required){
                        _options += _noselect_option;
                    }
                    
                    for(var i = 0; i < _details.picklistValues.length; i++){
                        if(!_details.picklistValues[i].active)
                            continue;
                        var _option = _option_template.replace('{{option-label}}',_details.picklistValues[i].label);
                        _option = _option.replace('{{option-value}}',_details.picklistValues[i].value);
                        
                        if(_details.picklistValues[i].defaultValue){
                            _option = _option.replace('{{option-selected}}','selected');
                        } else {
                            _option = _option.replace('{{option-selected}}','');
                        }
                        
                        _options += _option;
                    }
                    
                    _field = _field.replace('{{options}}',_options);
                    break;
                case 'boolean':
                    var _field_template = field_templates[_details.type] || field_templates['string'];
                    _field = _field_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace('{{input-value}}','');
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
                    
                    _field = _field.replace('{{input-checked}}','');
                    //_field += '<br/>';
                    break;
                case 'address':
                    if(_is_welink_layout){
                        _field = processWelinkAddressField(_details.name);
                    } else {
                        _field  = processAddressField(_row.layoutComponents[0].components);
                    }
                    break;
                case 'geolocation':
                    var _field_template = templates.field_readonly;//document.querySelector('#field-template').text;
                    _field = _field_template.replace('{{field-label}}',_field_label);
                    _field = _field.replace('{{field-value}}','');
                    break;
                case 'location':
                    var _field_template = templates.field_readonly;//document.querySelector('#field-template').text;
                    _field = _field_template.replace('{{field-label}}',_field_label);
                    _field = _field.replace('{{field-value}}','');
                    break;
                default:
                    var _field_template = field_templates[_details.type] || field_templates['string'];
                    _field = _field_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace('{{input-value}}','');
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
            }

            return _field;// + '<br/>';
        }

        function processWelinkNameField(){
            var name_labels = {
                firstname:sobject.fields['FirstName'].describe.label,
                lastname:sobject.fields['LastName'].describe.label
            }

            var _field = '';
            var _field_template = templates.field_user_name;//document.querySelector('#user-name').text;

            _field = _field_template.replace('{{lastname-value}}','');
            _field = _field.replace('{{lastname-label}}',name_labels.lastname);

            _field = _field.replace('{{firstname-value}}','');
            _field = _field.replace('{{firstname-label}}',name_labels.firstname);

            return _field;
        }

        function processWelinkAddressField(fullfieldname){
            var _address_prefix = fullfieldname.substring(0,fullfieldname.indexOf('Address'));
            var address_labels = {
                country:sobject.fields[_address_prefix + 'Country'].describe.label,
                state:sobject.fields[_address_prefix + 'State'].describe.label,
                city:sobject.fields[_address_prefix + 'City'].describe.label,
                postalCode:sobject.fields[_address_prefix + 'PostalCode'].describe.label,
                street:sobject.fields[_address_prefix + 'Street'].describe.label
            };

            var address_apinames = {
                country:_address_prefix + 'Country',
                state:_address_prefix + 'State',
                city:_address_prefix + 'City',
                postalCode:_address_prefix + 'PostalCode',
                street:_address_prefix + 'Street'
            }

            var _field = '';
            var _field_template = templates.field_address;//document.querySelector('#address').text;

            _field = _field_template.replace(/{{address-country-id}}/g,'record-field-' + address_apinames.country);
            _field = _field.replace('{{country-label}}',address_labels.country);
            _field = _field.replace('{{country-value}}','');

            _field = _field.replace(/{{address-state-id}}/g,'record-field-' + address_apinames.state);
            _field = _field.replace('{{state-label}}',address_labels.state);
            _field = _field.replace('{{state-value}}','');

            _field = _field.replace(/{{address-city-id}}/g,'record-field-' + address_apinames.city);
            _field = _field.replace('{{city-label}}',address_labels.city);
            _field = _field.replace('{{city-value}}','');

            _field = _field.replace(/{{address-postalCode-id}}/g,'record-field-' + address_apinames.postalCode);
            _field = _field.replace('{{postalCode-label}}',address_labels.postalCode);
            _field = _field.replace('{{postalCode-value}}','');

            _field = _field.replace(/{{address-street-id}}/g,'record-field-' + address_apinames.street);
            _field = _field.replace('{{street-label}}',address_labels.street);
            _field = _field.replace('{{street-value}}','');

            return _field;
        }

        function processNameField(name_components){
            var name_labels = {
                firstname:'',
                lastname:''
            }

            for (var i = name_components.length - 1; i >= 0; i--) {
                if(name_components[i].value.toLowerCase().match(/first/) != null){
                    name_labels.firstname = name_components[i].details.label;
                } else if(name_components[i].value.toLowerCase().match(/last/) != null){
                    name_labels.lastname = name_components[i].details.label;
                }
            }

            var _field = '';
            var _field_template = templates.field_user_name;//document.querySelector('#user-name').text;

            _field = _field_template.replace('{{lastname-value}}','');
            _field = _field.replace('{{lastname-label}}',name_labels.lastname);

            _field = _field.replace('{{firstname-value}}','');
            _field = _field.replace('{{firstname-label}}',name_labels.firstname);

            return _field;
        }

        function processAddressField(address_components){
            var address_labels = {
                country:'',
                state:'',
                city:'',
                postalCode:'',
                street:''
            };

            var address_apinames = {
                country:'',
                state:'',
                city:'',
                postalCode:'',
                street:''
            }

            for (var i = address_components.length - 1; i >= 0; i--) {
                if(address_components[i].value.toLowerCase().match(/street/) != null){
                    address_labels.street = address_components[i].details.label;
                    address_apinames.street = address_components[i].details.name;
                } else if(address_components[i].value.toLowerCase().match(/country/) != null){
                    address_labels.country = address_components[i].details.label;
                    address_apinames.country = address_components[i].details.name;
                } else if(address_components[i].value.toLowerCase().match(/city/) != null){
                    address_labels.city = address_components[i].details.label;
                    address_apinames.city = address_components[i].details.name;
                } else if(address_components[i].value.toLowerCase().match(/state/) != null){
                    address_labels.state = address_components[i].details.label;
                    address_apinames.state = address_components[i].details.name;
                } else if(address_components[i].value.toLowerCase().match(/postalcode/) != null){
                    address_labels.postalCode = address_components[i].details.label;
                    address_apinames.postalCode = address_components[i].details.name;
                }
            };

            var _field = '';
            var _field_template = templates.field_address;//document.querySelector('#address').text;

            _field = _field_template.replace(/{{address-country-id}}/g,'record-field-' + address_apinames.country);
            _field = _field.replace('{{country-label}}',address_labels.country);
            _field = _field.replace('{{country-value}}','');

            _field = _field.replace(/{{address-state-id}}/g,'record-field-' + address_apinames.state);
            _field = _field.replace('{{state-label}}',address_labels.state);
            _field = _field.replace('{{state-value}}','');

            _field = _field.replace(/{{address-city-id}}/g,'record-field-' + address_apinames.city);
            _field = _field.replace('{{city-label}}',address_labels.city);
            _field = _field.replace('{{city-value}}','');

            _field = _field.replace(/{{address-postalCode-id}}/g,'record-field-' + address_apinames.postalCode);
            _field = _field.replace('{{postalCode-label}}',address_labels.postalCode);
            _field = _field.replace('{{postalCode-value}}','');

            _field = _field.replace(/{{address-street-id}}/g,'record-field-' + address_apinames.street);
            _field = _field.replace('{{street-label}}',address_labels.street);
            _field = _field.replace('{{street-value}}','');

            return _field;
        }

        function renderLayout(){
            
            var section_template = templates.section;
            var section_template_without_heading = templates.section_without_heading;
            
            var record_display = '';

            var _processed;

            if(record.welink_processed.length > 0){
                _processed = record.welink_processed;
                for(var i = 0; i < _processed.length;i++){
                    var _fields = '';
                    for(var j = 0; j < _processed[i].fields.length; j++){
                        _fields += processFieldsDisplay(_processed[i].fields[j].field, true);
                    }
                    
                    if(_processed[i].editHeading && _processed[i].fields.length > 0){
                        var _section = section_template;
                        _section = _section.replace('{{fields}}',_fields);
                        _section = _section.replace('{{section-number}}','section-' + i);
                        _section = _section.replace('{{section-title}}', _processed[i].label);
                        record_display += _section;
                    } else {
                        var _section = section_template_without_heading;
                        _section = _section.replace('{{fields}}',_fields);
                        _section = _section.replace('{{section-number}}','section-' + i);
                        record_display += _section;
                    }
                }
            } else {
                _processed = record.processed;
                for(var i = 0; i < _processed.length;i++){
                    var _fields = '';
                    for(var j = 0; j < _processed[i].rows.length; j++){
                        _fields += processFieldsDisplay(_processed[i].rows[j], false);
                    }
                    
                    if(_processed[i].useHeading && _processed[i].rows.length > 0){
                        var _section = section_template;
                        _section = _section.replace('{{fields}}',_fields);
                        _section = _section.replace('{{section-number}}','section-' + i);
                        _section = _section.replace('{{section-title}}', _processed[i].heading);
                        record_display += _section;
                    } else {
                        var _section = section_template_without_heading;
                        _section = _section.replace('{{fields}}',_fields);
                        _section = _section.replace('{{section-number}}','section-' + i);
                        record_display += _section;
                    }
                }
            }
            
            document.querySelector('#field-container').innerHTML = record_display;
            
            $j('ul').listview();
            $j('input[type="text"]').textinput();
            $j('input[type="tel"]').textinput();
            $j('input[type="url"]').textinput();
            $j('input[type="number"]').textinput();
            $j('input[type="date"]').textinput();
            $j('input[type="email"]').textinput();
            $j('input[type="datetime"]').textinput();
            $j('input[type="datetime-local"]').textinput();
            $j('input[type="search"]').textinput();
            $j('textarea').textinput({
                autogrow: true
            });
            $j('textarea').css('resize','vertical');
            $j('select').selectmenu();
            $j('input[type="checkbox"]').flipswitch();
            
            $j('input[id!="lookup-search-box"]').css('height','44.375px');
            $j('label').css('font-weight','bold');

            $j('input[type="search"]').bind('click',function(){
                Lookup.popup(this,'jqm-record');
            });

            View.stopLoading('jqm-record');

            // 分割线改为点线
            $j('.ui-field-contain').css('border-bottom-style','dashed');
        }

        return {
            retrieveSobjectData:retrieveSobjectData,
            selectRecordType:selectRecordType,
            renderRecordTypeSelect:renderRecordTypeSelect
        };
    };

    var RecordEdit = {};

    function renderRecordEdit(){
        RecordEdit = initRecordEdit();

        //document.querySelector('body').innerHTML = templates.record_page_structure.replace(/{{page}}/g,'edit') + templates.page_lookup;
        document.querySelector('body').innerHTML = templates.record_page_structure + templates.page_lookup;

        document.querySelector('#jqm-header-left-button')['href'] = 'javascript:UserAction.cancel()';
        document.querySelector('#jqm-header-right-button')['href'] = 'javascript:UserAction.saveRecord()';
        document.querySelector('#jqm-header-left-button').innerHTML = context.labels.cancel;
        document.querySelector('#jqm-header-right-button').innerHTML = context.labels.save;
        document.querySelector('#jqm-header-left-button').classList.add('ui-icon-back');
        document.querySelector('#jqm-header-right-button').classList.add('ui-icon-check');

        $j.mobile.initializePage();
        Styles.tunePageStyle();

        View.animateLoading(context.labels.loading,'jqm-record');
        RecordEdit.retrieveSobjectData();
    }

    var initRecordEdit = function(){

        function retrieveSobjectData(){
            AjaxPools.retrieveSobjectRelated(sobject.name, function(){
                sobject.describe = AjaxResponses.sobjectdescribe;

                for (var i = sobject.describe.fields.length - 1; i >= 0; i--) {
                    sobject.fields[sobject.describe.fields[i].name] = sobject.fields[sobject.describe.fields[i].name] || {};
                    sobject.fields[sobject.describe.fields[i].name].describe = sobject.describe.fields[i];
                };

                if(AjaxResponses.has_retrieved_record_related){
                    processRecordRelated();
                } else {
                    AjaxPools.retrieveRecordRelated(sobject.name, record.id, function(){
                        processRecordRelated();
                    });
                }
            });
        }

        function processRecordRelated(){
            record.detail = AjaxResponses.record;

            document.querySelector('#jqm-page-title').innerHTML = record.detail.Name || '';
            document.title = sobject.describe.label;

            sobject.welink_layout = AjaxResponses.welinklayout;
            record.layout = AjaxResponses.layout;

            if(sobject.welink_layout != null){
                record.welink_processed = processWelinkRecordLayout();
            } else {
                record.processed = processRecordLayout();
            }

            displayLayout();
            View.stopLoading('jqm-record');
        }

        function handleRecordTypeDetail(){
            console.log('record type detail');
            record.recordtype_detail = AjaxResponses.recordtype;//JSON.parse(window.atob(result));
            var bp_values = [];
            var processed_rt_values = [];

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
                console.log(bp_values);
                console.log(i);

                if(sobject.fields[bp_values[i].picklist] != null)
                sobject.fields[bp_values[i].picklist].describe.picklistValues = rt_values;
            };
        }

        function handleBusinessProcessDetail(){
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
        }

        function processWelinkRecordLayout(){
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
        }

        function processRecordLayout(){
            var _processed = [];

            var _record_editLayoutSections = record.layout.editLayoutSections;
            
            for(var i = 0; i < _record_editLayoutSections.length; i++){
                var _section = {};
                _section.heading = _record_editLayoutSections[i].heading;
                _section.useHeading = _record_editLayoutSections[i].useHeading;
                _section.rows = processRecordLayoutRows(_record_editLayoutSections[i].layoutRows);
                _processed.push(_section);
            }
            
            return _processed;
        }

        function processRecordLayoutRows(layout_rows){
            var _rows = [];
            
            for(var i = 0; i < layout_rows.length; i++){
                _rows = _rows.concat(processRecordLayoutItems(layout_rows[i].layoutItems));
            }
            
            return _rows;
        }

        function processRecordLayoutItems(layout_items){
            var _items = [];
            for(var i = 0; i < layout_items.length; i++){
                if(layout_items[i].layoutComponents != null && layout_items[i].layoutComponents.length > 0 && layout_items[i].layoutComponents[0].type == 'Field'){
                    _items.push(layout_items[i]);
                }
            }
            
            return _items;
        }

        function processFieldsDisplay(_row, _is_welink_layout){
            var _timezone = context.timezone;
            var _field_name = _is_welink_layout?_row:_row.layoutComponents[0].details.name;
            if(sobject.fields[_field_name] == undefined){
                return '';
            }
            var _details = sobject.fields[_field_name].describe;
            //_row.layoutComponents[0].details;

            var _field;
            var _field_label = (_is_welink_layout?sobject.fields[_field_name].describe.label:_row.label) + ':';//_details.label + ':';
            var _sobject_name_lowercase = sobject.name.toLowerCase();
            var _record_detail = record.detail;
            var _ref_values = record.references;
            var _field_required = _is_welink_layout?record.welink_required[_field_name]:_row.required;
            var _field_editable = _is_welink_layout?(record.welink_edit[_field_name] && _details.updateable):_details.updateable;
            var _field_readonly = _is_welink_layout?(record.welink_readonly[_field_name] && !_details.updateable):(!_details.updateable);
            
            var field_templates = {};
            field_templates.url = templates.field_url;
            field_templates.textarea = templates.field_textarea;
            field_templates.string = templates.field_text;
            field_templates.currency = templates.field_currency;
            field_templates.phone = templates.field_phone;
            field_templates.percent = templates.field_percent;
            field_templates.double = templates.field_number;
            field_templates.email = templates.field_email;
            
            if(_details.type == 'address'){
                if(_is_welink_layout){
                    _field = processWelinkAddressField(_record_detail[_details.name],_details.name);
                } else {
                    _field = processAddressField(_record_detail[_details.name],_row.layoutComponents[0].components);
                }

                return _field;
            } 

            if(_details.name == 'Name' && (_sobject_name_lowercase == 'user' || _sobject_name_lowercase == 'contact')){
                if(_is_welink_layout){
                    _field = processWelinkNameField(_record_detail, 'Name');
                } else {
                    _field = processNameField(_record_detail, _row.layoutComponents[0].components);
                }

                return _field;
            }

            if(_details.name == 'RecordTypeId'){
                var recordtype_value = '';

                if(record.references != null && record.references['RecordTypeId'] != null){
                    recordtype_value = record.references['RecordTypeId'].Name;
                }

                var _field_template = templates.field_readonly;
                _field = _field_template.replace('{{field-label}}',_field_label);
                _field = _field.replace('{{field-value}}',recordtype_value);
                
                return _field;
            }

            // hard-coded for ForecastCategoryName
            if((_field_readonly && _details.type != 'address') || _details.name == 'ForecastCategoryName' || !sobject.fields[_field_name].describe.updateable){
                if(_details.type == 'reference' && _record_detail[_details.name] != '' && _record_detail[_details.name] != undefined){

                    var _ref_value = '<a data-role="none" data-ajax="false" href="/apex/DP?mode=view&sobject=' + _details.referenceTo[0] + '&id=' + _ref_values[_details.name].Id + '&crossref=true' + '&listviewid=' + params.listviewid + '">' + _ref_values[_details.name].Name + '</a>';

                    var _field_template = templates.field_readonly;
                    _field = _field_template.replace('{{field-label}}',_field_label);
                    _field = _field.replace('{{field-value}}',_ref_value);
                    return _field;// + '<br/>';
                    
                } else if(_details.type == 'datetime' && _record_detail[_details.name] != '' && _record_detail[_details.name] != undefined){
                    var _datetime_value = TimezoneDatabase.formatDatetimeToLocal(_record_detail[_details.name], _timezone);
                    _datetime_value = _datetime_value.replace('T',' ');

                    var _field_template = templates.field_readonly;
                    _field = _field_template.replace('{{field-label}}',_field_label);
                    _field = _field.replace('{{field-value}}', _datetime_value);
                    
                    return _field;
                } else {
                    var _field_template = templates.field_readonly;
                    _field = _field_template.replace('{{field-label}}',_field_label);
                    _field = _field.replace('{{field-value}}',_record_detail[_details.name] || '<br/>');
                    
                    return _field;// + '<br/>';
                }
            } 

            if((_is_welink_layout && _field_required) || (_field_editable && _field_required)){
                _field_label = '<span style="color:crimson">*</span>' + _field_label;
            } else {
                _field_label = '<span>&nbsp;</span>' + _field_label;
            }

            switch(_details.type){
                case 'reference':
                    var _field_template = templates.field_lookup;
                
                    _field = _field_template.replace('{{input-label}}',_field_label);
                    
                    if(_ref_values[_details.name] != undefined){
                        _field = _field.replace('{{input-value}}',_ref_values[_details.name].Name);
                        _field = _field.replace('{{input-value-hidden}}',_ref_values[_details.name].Id);
                    } else {
                        _field = _field.replace('{{input-value}}','');
                        _field = _field.replace('{{input-value-hidden}}','');
                    }

                    var field_ref_type = sobject.fields[_details.name].describe.referenceTo[0];
                    field_ref_type = field_ref_type == 'Group'?sobject.fields[_details.name].describe.referenceTo[1]:field_ref_type;

                    _field = _field.replace('{{reference-sobject-type}}',field_ref_type);
                    
                    _field = _field.replace('{{input-value}}','');
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
                    break;
                case 'multipicklist':
                    var _select_template = templates.field_multipicklist_select;
                    _field = _select_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
                    
                    var _option_template = templates.field_multipicklist_option;
                    var _options = '';
                    
                    console.log(_details);
                    console.log(_record_detail[_details.name]);
                    
                    var _multipicklist_value = [];
                    
                    if(_record_detail[_details.name] != null){
                        _multipicklist_value = _record_detail[_details.name].split(';');
                    }
                    
                    for(var i = 0; i < _details.picklistValues.length; i++){
                        var _option = _option_template.replace('{{option-label}}',_details.picklistValues[i].label);
                        _option = _option.replace('{{option-value}}',_details.picklistValues[i].value);
                        
                        for(var j = 0; j < _multipicklist_value.length;j++){
                            if(_multipicklist_value[j] == _details.picklistValues[i].value){
                                _option = _option.replace('{{option-selected}}','selected');
                                break;
                            } 
                        }
                        
                        _option = _option.replace('{{option-selected}}','');
                        
                        _options += _option;
                    }
                    
                    _field = _field.replace('{{options}}',_options);
                    break;
                case 'encryptedstring': // 加密字段不支持，页面中也不显示
                    _field = '';
                    break;
                case 'datetime':
                    var _field_template = templates.field_datetime;//field_templates[_details.type] || field_templates['string'];
                    _field = _field_template.replace('{{input-label}}',_field_label);
                    
                    var _dt_val = '';
                    
                    if(_record_detail[_details.name] != null){
                        _dt_val = TimezoneDatabase.formatDatetimeToLocal(_record_detail[_details.name], _timezone);
                        //_dt_val = _record_detail[_details.name].substr(0,16);
                    }
                    
                    _field = _field.replace('{{input-value}}',_dt_val);
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
                    break;
                case 'picklist':
                    var _select_template = templates.field_picklist_select;
                    _field = _select_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
                    
                    var _option_template = templates.field_picklist_option;
                    var _options = '';
                    
                    var _noselect_option = _option_template.replace('{{option-label}}','--' + context.labels.select_none + '--');
                    _noselect_option = _noselect_option.replace('{{option-value}}','--None--');
                    _noselect_option = _noselect_option.replace('{{option-selected}}','');

                    if(!_field_required){
                        _options += _noselect_option;
                    }
                    
                    console.log(_details);
                    for(var i = 0; i < _details.picklistValues.length; i++){
                        var _option = _option_template.replace('{{option-label}}',_details.picklistValues[i].label);
                        _option = _option.replace('{{option-value}}',_details.picklistValues[i].value);
                        
                        if(_record_detail[_details.name] == _details.picklistValues[i].value){
                            _option = _option.replace('{{option-selected}}','selected');
                        } else {
                            _option = _option.replace('{{option-selected}}','');
                        }
                        _options += _option;
                    }
                    
                    _field = _field.replace('{{options}}',_options);
                    break;
                case 'boolean':
                    var _field_template = templates.field_checkbox;
                    _field = _field_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace('{{input-value}}',_record_detail[_details.name] || '');
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
                    
                    if(_record_detail[_details.name]){
                        _field = _field.replace('{{input-checked}}','checked');
                    } else {
                        _field = _field.replace('{{input-checked}}','');
                    }
                    //_field += '<br/>';
                    break;
                case 'date':
                    var date_value = _record_detail[_details.name];
                    if(date_value != '' && date_value != null){
                        date_value = TimezoneDatabase.formatDateToLocal(date_value, _timezone);
                    }

                    var _field_template = templates.field_date;
                    _field = _field_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace('{{input-value}}',date_value || '');
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);

                    break;
                case 'address':
                    if(_is_welink_layout){
                        _field = processWelinkAddressField(_record_detail[_details.name],_details.name);
                    } else {
                        _field = processAddressField(_record_detail[_details.name],_row.layoutComponents[0].components);
                    }
                    
                    break;
                case 'geolocation':
                    var _field_template = templates.field_geolocation;
                    _field = _field_template.replace('{{field-label}}',_field_label);
                    _field = _field.replace('{{field-value}}',_record_detail[_details.name] || '');
                    break;
                case 'location':
                    var _field_template = templates.field_geolocation;
                    _field = _field_template.replace('{{field-label}}',_field_label);
                    _field = _field.replace('{{field-value}}',_record_detail[_details.name] || '');
                    break;
                default:
                    var _field_template = field_templates[_details.type] || field_templates['string'];
                    _field = _field_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace('{{input-value}}',_record_detail[_details.name] || '');
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
            }

            return _field;// + '<br/>';
        }

        function processWelinkNameField(allfields){
            var name_labels = {
                firstname:sobject.fields['FirstName'].describe.label,
                lastname:sobject.fields['LastName'].describe.label
            }

            var _field = '';
            var _field_template = templates.field_username;

            _field = _field_template.replace('{{lastname-value}}',allfields.LastName || '');
            _field = _field.replace('{{lastname-label}}',name_labels.lastname);

            _field = _field.replace('{{firstname-value}}',allfields.FirstName || '');
            _field = _field.replace('{{firstname-label}}',name_labels.firstname);

            return _field;
        }

        function processWelinkAddressField(address_field,fullfieldname){
            var _address_prefix = fullfieldname.substring(0,fullfieldname.indexOf('Address'));
            var address_labels = {
                country:sobject.fields[_address_prefix + 'Country'].describe.label,
                state:sobject.fields[_address_prefix + 'State'].describe.label,
                city:sobject.fields[_address_prefix + 'City'].describe.label,
                postalCode:sobject.fields[_address_prefix + 'PostalCode'].describe.label,
                street:sobject.fields[_address_prefix + 'Street'].describe.label
            };

            var address_apinames = {
                country:_address_prefix + 'Country',
                state:_address_prefix + 'State',
                city:_address_prefix + 'City',
                postalCode:_address_prefix + 'PostalCode',
                street:_address_prefix + 'Street'
            }

            var _field = '';
            var _field_template = templates.field_address;

            _field = _field_template.replace(/{{address-country-id}}/g,'record-field-' + address_apinames.country);
            _field = _field.replace('{{country-label}}',address_labels.country);
            _field = _field.replace('{{country-value}}',address_field != null?(address_field.country || ''):'');

            _field = _field.replace(/{{address-state-id}}/g,'record-field-' + address_apinames.state);
            _field = _field.replace('{{state-label}}',address_labels.state);
            _field = _field.replace('{{state-value}}',address_field != null?(address_field.state || ''):'');

            _field = _field.replace(/{{address-city-id}}/g,'record-field-' + address_apinames.city);
            _field = _field.replace('{{city-label}}',address_labels.city);
            _field = _field.replace('{{city-value}}',address_field != null?(address_field.city || ''):'');

            _field = _field.replace(/{{address-postalCode-id}}/g,'record-field-' + address_apinames.postalCode);
            _field = _field.replace('{{postalCode-label}}',address_labels.postalCode);
            _field = _field.replace('{{postalCode-value}}',address_field != null?(address_field.postalCode || ''):'');

            _field = _field.replace(/{{address-street-id}}/g,'record-field-' + address_apinames.street);
            _field = _field.replace('{{street-label}}',address_labels.street);
            _field = _field.replace('{{street-value}}',address_field != null?(address_field.street || ''):'');

            return _field;
        }

        function processNameField(allfields, name_components){
            var name_labels = {
                firstname:'',
                lastname:''
            }

            for (var i = name_components.length - 1; i >= 0; i--) {
                if(name_components[i].value.toLowerCase().match(/first/) != null){
                    name_labels.firstname = name_components[i].details.label;
                } else if(name_components[i].value.toLowerCase().match(/last/) != null){
                    name_labels.lastname = name_components[i].details.label;
                }
            }

            var _field = '';
            var _field_template = templates.field_username;

            _field = _field_template.replace('{{lastname-value}}',allfields.LastName);
            _field = _field.replace('{{lastname-label}}',name_labels.lastname);

            _field = _field.replace('{{firstname-value}}',allfields.FirstName);
            _field = _field.replace('{{firstname-label}}',name_labels.firstname);

            return _field;
        }

        function processAddressField(address_field, address_components){
            var address_labels = {
                country:'',
                state:'',
                city:'',
                postalCode:'',
                street:''
            };

            var address_apinames = {
                country:'',
                state:'',
                city:'',
                postalCode:'',
                street:''
            }

            for (var i = address_components.length - 1; i >= 0; i--) {
                if(address_components[i].value.toLowerCase().match(/street/) != null){
                    address_labels.street = address_components[i].details.label;
                    address_apinames.street = address_components[i].details.name;
                } else if(address_components[i].value.toLowerCase().match(/country/) != null){
                    address_labels.country = address_components[i].details.label;
                    address_apinames.country = address_components[i].details.name;
                } else if(address_components[i].value.toLowerCase().match(/city/) != null){
                    address_labels.city = address_components[i].details.label;
                    address_apinames.city = address_components[i].details.name;
                } else if(address_components[i].value.toLowerCase().match(/state/) != null){
                    address_labels.state = address_components[i].details.label;
                    address_apinames.state = address_components[i].details.name;
                } else if(address_components[i].value.toLowerCase().match(/postalcode/) != null){
                    address_labels.postalCode = address_components[i].details.label;
                    address_apinames.postalCode = address_components[i].details.name;
                }
            };

            var _field = '';
            var _field_template = templates.field_address;

            _field = _field_template.replace(/{{address-country-id}}/g,'record-field-' + address_apinames.country);
            _field = _field.replace('{{country-label}}',address_labels.country);
            _field = _field.replace('{{country-value}}',address_field != null?(address_field.country || ''):'');

            _field = _field.replace(/{{address-state-id}}/g,'record-field-' + address_apinames.state);
            _field = _field.replace('{{state-label}}',address_labels.state);
            _field = _field.replace('{{state-value}}',address_field != null?(address_field.state || ''):'');

            _field = _field.replace(/{{address-city-id}}/g,'record-field-' + address_apinames.city);
            _field = _field.replace('{{city-label}}',address_labels.city);
            _field = _field.replace('{{city-value}}',address_field != null?(address_field.city || ''):'');

            _field = _field.replace(/{{address-postalCode-id}}/g,'record-field-' + address_apinames.postalCode);
            _field = _field.replace('{{postalCode-label}}',address_labels.postalCode);
            _field = _field.replace('{{postalCode-value}}',address_field != null?(address_field.postalCode || ''):'');

            _field = _field.replace(/{{address-street-id}}/g,'record-field-' + address_apinames.street);
            _field = _field.replace('{{street-label}}',address_labels.street);
            _field = _field.replace('{{street-value}}',address_field != null?(address_field.street || ''):'');

            return _field;
        }
        
        function displayLayout(){
            var section_template = templates.section;
            var section_template_without_heading = templates.section_without_heading;
            var record_display = '';
            
            var _p_tmp;
            if(record.welink_processed.length > 0){
                _p_tmp = record.welink_processed;
                for (var i = 0; i < _p_tmp.length; i++) {
                    if(_p_tmp[i].fields.length > 0){
                        var _fields = '';
                        for (var j = 0; j < _p_tmp[i].fields.length; j++) {
                            _fields += processFieldsDisplay(_p_tmp[i].fields[j].field, true);
                        };

                        if(_p_tmp[i].editHeading){
                            var _section = section_template;
                            _section = _section.replace('{{fields}}',_fields);
                            _section = _section.replace('{{section-number}}','section-' + i);
                            _section = _section.replace('{{section-title}}', _p_tmp[i].label);
                            record_display += _section;
                        } else {
                            var _section = section_template_without_heading;
                            _section = _section.replace('{{fields}}',_fields);
                            _section = _section.replace('{{section-number}}','section-' + i);
                            record_display += _section;
                        }
                    }
                };
            } else {
                _p_tmp = record.processed;
                for (var i = 0; i < _p_tmp.length; i++) {
                    if(_p_tmp[i].rows.length > 0){
                        var _fields = '';
                        for(var j = 0; j < _p_tmp[i].rows.length; j++){
                            _fields += processFieldsDisplay(_p_tmp[i].rows[j], false);
                        }

                        if(_p_tmp[i].useHeading){
                            var _section = section_template;
                            _section = _section.replace('{{fields}}',_fields);
                            _section = _section.replace('{{section-number}}','section-' + i);
                            _section = _section.replace('{{section-title}}', _p_tmp[i].heading);
                            record_display += _section;
                        } else {
                            var _section = section_template_without_heading;
                            _section = _section.replace('{{fields}}',_fields);
                            _section = _section.replace('{{section-number}}','section-' + i);
                            record_display += _section;
                        }
                    }
                }
            }
            
            document.querySelector('#field-container').innerHTML = record_display;
            
            $j('ul').listview();
            $j('input[type="text"]').textinput();
            $j('input[type="tel"]').textinput();
            $j('input[type="url"]').textinput();
            $j('input[type="number"]').textinput();
            $j('input[type="date"]').textinput();
            $j('input[type="datetime-local"]').textinput();
            $j('input[type="email"]').textinput();
            $j('input[type="search"]').textinput();
            $j('textarea').textinput({
                autogrow: true
            });

            $j('textarea').css('resize','vertical');
            $j('select').selectmenu();
            $j('input[type="checkbox"]').flipswitch();

            $j('input[id!="lookup-search-box"]').css('height','44.375px');
            $j('label').css('font-weight','bold');

            $j('input[type="search"]').bind('click',function(){
                Lookup.popup(this,'jqm-record');
            });

            var lookup_anchors = document.querySelectorAll('input[type="search"] + a');
            for (var i = lookup_anchors.length - 1; i >= 0; i--) {
                lookup_anchors[i].addEventListener('click',function(){
                    console.log(this.parentNode.nextSibling);
                    this.parentNode.firstChild.value = '';
                    console.log(this.parentNode.firstChild.id);
                    document.querySelector('#' + this.parentNode.firstChild.id + '-hidden').value = '';
                },false);
            };

            // 分割线改为点线
            $j('.ui-field-contain').css('border-bottom-style','dashed');
        }

        return {
            retrieveSobjectData:retrieveSobjectData
        };
    };

    var RecordView = {};

    function renderRecordView(){
        RecordView = initRecordView();

        //document.querySelector('body').innerHTML = templates.record_page_structure.replace(/{{page}}/g,'view');
        document.querySelector('body').innerHTML = templates.record_page_structure;//.replace(/{{page}}/g,'view');

        document.querySelector('#jqm-header-left-button')['href'] = "javascript:UserAction.viewList('jqm-record')";
        document.querySelector('#jqm-header-right-button')['href'] = "javascript:UserAction.editRecord('jqm-record')";
        document.querySelector('#jqm-header-left-button').innerHTML = context.labels.list;
        document.querySelector('#jqm-header-right-button').innerHTML = context.labels.edit;
        document.querySelector('#jqm-header-left-button').classList.add('ui-icon-bars');
        document.querySelector('#jqm-header-right-button').classList.add('ui-icon-edit');

        if(params.crossref == 'true'){
            document.querySelector('#jqm-header-left-button').href = 'javascript:window.history.back()';
            document.querySelector('#jqm-header-left-button').innerHTML = context.labels.back;
            document.querySelector('#jqm-header-left-button').classList.remove('ui-icon-bars');
            document.querySelector('#jqm-header-left-button').classList.add('ui-icon-back');
        }

        if(setup_objects.indexOf(sobject.name) > 0){
            $j('#jqm-header-right-button').remove();
        }

        $j.mobile.initializePage();
        Styles.tunePageStyle();

        View.animateLoading(context.labels.loading,'jqm-record');

        RecordView.retrieveSobjectData();
    }

    var initRecordView = function(){
        function handleDescribe(){
            sobject.describe = AjaxResponses.sobjectdescribe;

            for (var i = sobject.describe.fields.length - 1; i >= 0; i--) {
                sobject.fields[sobject.describe.fields[i].name] = sobject.fields[sobject.describe.fields[i].name] || {};
                sobject.fields[sobject.describe.fields[i].name].describe = sobject.describe.fields[i];
            };
        }

        function retrieveSobjectData(){
            AjaxPools.retrieveSobjectRelated(sobject.name, function(){
                handleDescribe();
                AjaxPools.retrieveRecordRelated(sobject.name, record.id, function(){
                    record.detail = AjaxResponses.record;
                    document.querySelector('#jqm-page-title').innerHTML = record.detail.Name || '';
                    document.title = sobject.describe.label;

                    if(AjaxResponses.welinklayout != null){
                        sobject.welink_layout = AjaxResponses.welinklayout;
                        record.welink_processed = processWelinkRecordLayout();

                        displayWelinkLayout();
                    } else {
                        record.layout = AjaxResponses.layout;
                        record.processed = processRecordLayout();
                        
                        displayLayout();
                    }
                     View.stopLoading('jqm-record');
                });
            });
        }

        function processWelinkRecordLayout(){
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
        }

        function processRecordLayout(){
            var _processed = [];

            var _record_detailLayoutSections = record.layout.detailLayoutSections;
            
            for(var i = 0; i < _record_detailLayoutSections.length; i++){
                var _section = {};
                _section.heading = _record_detailLayoutSections[i].heading;
                _section.useHeading = _record_detailLayoutSections[i].useHeading;
                _section.rows = processRecordLayoutRows(_record_detailLayoutSections[i].layoutRows);
                _processed.push(_section);
            }
            
            return _processed;
        }

        function processRecordLayoutRows(layout_rows){
            var _rows = [];
            
            for(var i = 0; i < layout_rows.length; i++){
                _rows = _rows.concat(processRecordLayoutItems(layout_rows[i].layoutItems));
            }
            
            return _rows;
        }

        function processRecordLayoutItems(layout_items){
            var _items = [];
            for(var i = 0; i < layout_items.length; i++){
                if(layout_items[i].layoutComponents != null && layout_items[i].layoutComponents.length > 0 && layout_items[i].layoutComponents[0].type == 'Field'){
                    _items.push(layout_items[i].layoutComponents[0].details);
                }
            }
            
            return _items;
        }

        function displayLayout(){

            var _p_tmp = record.processed;
            var section_template = templates.view_section;
            var section_template_without_heading = templates.view_section_without_heading;
            var field_template = templates.field_view_readonly;

            var record_display = '';
            
            for(var i = 0; i < _p_tmp.length;i++){

                var _fields = '';
                for(var j = 0; j < _p_tmp[i].rows.length; j++){
                    var _field = field_template.replace('{{field-label}}',_p_tmp[i].rows[j].label);
                    
                    var _field_value = record.detail[_p_tmp[i].rows[j].name];

                    if(_field_value != null)
                    switch(_p_tmp[i].rows[j].type){
                        case 'reference':
                            if(record.references[_p_tmp[i].rows[j].name] != null){
                                    _field_value = record.references[_p_tmp[i].rows[j].name].Name || '';
                            } else {
                                    _field_value = '';
                            }
                            
                            if(setup_objects.indexOf(_p_tmp[i].rows[j].referenceTo[0]) < 0 || _p_tmp[i].rows[j].referenceTo[0] == 'User'){
                                _field_value = '<a data-role="none" data-ajax="false" href="/apex/DP?mode=view&sobject=' + _p_tmp[i].rows[j].referenceTo[0] + '&id=' + record.detail[_p_tmp[i].rows[j].name] + '&crossref=true' + '&listviewid=' + params.listviewid + '">' + _field_value + '</a>';
                            }
                            break;
                        case 'phone':
                            _field_value = '<a data-role="none" href="tel:' + _field_value + '">' + _field_value + '</a>';
                            break;
                        case 'url':
                            _field_value = '<a data-role="none" href="' + _field_value + '">' + _field_value + '</a>';
                            break;
                        case 'currency':
                            if(record.detail.CurrencyIsoCode != undefined){
                                _field_value = record.detail.CurrencyIsoCode + ' ' + _field_value;
                            } 
                            break;
                        case 'percent':
                            _field_value = _field_value + '%';
                            break;
                        case 'boolean':
                            if(_field_value){
                                _field_value = '<img src="/img/checkbox_checked.gif" alt="true"/>';
                            } else {
                                _field_value = '<img src="/img/checkbox_unchecked.gif" alt="false" />';
                            }
                            break;
                        case 'datetime':
                            if(_field_value != null){
                                //_field_value = _field_value.substring(0,10) + ' ' +  _field_value.substring(11,16);
                                //alert(_field_value);
                                //alert(context.timezone);

                                _field_value = TimezoneDatabase.formatDatetimeToLocal(_field_value, context.timezone);
                                _field_value = _field_value.replace('T',' ');
                                //alert(_field_value);
                            }
                            break;
                        case 'date':
                            if(_field_value != null){
                                _field_value = TimezoneDatabase.formatDateToLocal(_field_value, context.timezone);
                            }
                            break;
                        case 'address':
                            console.log(_field_value);
                            console.log('address..............');
                            if(_field_value != null){
                                _field_value = (_field_value.country || '') + ' ' + (_field_value.state || '') + ' ' + (_field_value.city || '') + ' ' + (_field_value.stateCode || '') + ' ' + (_field_value.street || '');
                            }
                            break;
                        default:
                            console.log(_field_value);
                    }
                    
                    _field = _field.replace('{{field-value}}', _field_value || '<br/>');
                    _fields += _field;
                }
                
                if(_p_tmp[i].useHeading){
                    var _section = section_template;
                    _section = _section.replace('{{fields}}',_fields);
                    _section = _section.replace('{{section-number}}','section-' + i);
                    _section = _section.replace('{{section-title}}', _p_tmp[i].heading);
                    record_display += _section;
                } else {
                    var _section = section_template_without_heading;
                    _section = _section.replace('{{fields}}',_fields);
                    _section = _section.replace('{{section-number}}','section-' + i);
                    record_display += _section;
                }
            }
            
            document.querySelector('#field-container').innerHTML = record_display;
            
            
            $j('ul').listview();

            var _li_a_array = document.querySelectorAll('li a');

            for (var i = _li_a_array.length - 1; i >= 0; i--) {
                _li_a_array[i].classList.remove('ui-btn');
                _li_a_array[i].classList.remove('ui-btn-icon-right');
                _li_a_array[i].classList.remove('ui-icon-carat-r');

                _li_a_array[i].parentNode.classList.add('ui-li-static');
                _li_a_array[i].parentNode.classList.add('ui-body-inherit');
            };

            var _li_img_array = document.querySelectorAll('li img');

            for (var i = _li_img_array.length - 1; i >= 0; i--) {
                _li_img_array[i].parentNode.classList.remove('ui-li-has-thumb');
            };

            // 换行，specifically for textarea
            $j('li').css('word-wrap','break-word').css('white-space','normal');

            // 将行分割线改为断点
            $j('li:not(.ui-first-child)').css('border-width','1px 0 0').css('border-style','dashed');
        }

        function displayWelinkLayout(){
            
            var section_template = templates.view_section;
            var section_template_without_heading = templates.view_section_without_heading;
            var field_template = templates.field_view_readonly;
            
            var record_display = '';
            var _p_tmp = record.welink_processed;
            
            for(var i = 0; i < _p_tmp.length;i++){

                var _fields = '';
                for(var j = 0; j < _p_tmp[i].fields.length; j++){
                    var _field_name = _p_tmp[i].fields[j].field;

                    if(sobject.fields[_field_name] == undefined)
                        continue;

                    console.log(_field_name);
                    var _field_label = sobject.fields[_field_name].describe.label;
                    var _field_type = sobject.fields[_field_name].describe.type;
                    var _field_value = record.detail[_field_name];

                    var _field = field_template.replace('{{field-label}}',_field_label);
                    
                    var _field_value = record.detail[_field_name];

                    if(_field_value != null)
                    switch(_field_type){
                        case 'reference':
                            if(record.references[_field_name] != null){
                                    _field_value = record.references[_field_name].Name || '';
                            } else {
                                    _field_value = '';
                            }

                            if(setup_objects.indexOf(sobject.fields[_field_name].describe.referenceTo[0]) < 0 || sobject.fields[_field_name].describe.referenceTo[0] == 'User'){
                                _field_value = '<a data-role="none" data-ajax="false" href="/apex/DP?mode=view&sobject=' + sobject.fields[_field_name].describe.referenceTo[0] + '&id=' + record.detail[_field_name] + '&crossref=true' + '&listviewid=' + params.listviewid + '">' + _field_value + '</a>';
                            }
                            break;
                        case 'phone':
                            _field_value = '<a data-role="none" href="tel:' + _field_value + '">' + _field_value + '</a>';
                            break;
                        case 'url':
                            _field_value = '<a data-role="none" href="' + _field_value + '">' + _field_value + '</a>';
                            break;
                        case 'currency':
                            if(record.detail.CurrencyIsoCode != undefined){
                                _field_value = record.detail.CurrencyIsoCode + ' ' + _field_value;
                            } 
                            break;
                        case 'percent':
                            _field_value = _field_value + '%';
                            break;
                        case 'boolean':
                            if(_field_value){
                                _field_value = '<img src="/img/checkbox_checked.gif" alt="true"/>';
                            } else {
                                _field_value = '<img src="/img/checkbox_unchecked.gif" alt="false" />';
                            }
                            break;
                        case 'datetime':
                            if(_field_value != null){
                                //_field_value = _field_value.substring(0,10) + ' ' +  _field_value.substring(11,16);
                                //alert(_field_value);
                                //alert(context.timezone);

                                _field_value = TimezoneDatabase.formatDatetimeToLocal(_field_value, context.timezone);
                                _field_value = _field_value.replace('T',' ');
                                //alert(_field_value);
                            }
                            break;
                        case 'date':
                            if(_field_value != null){
                                _field_value = TimezoneDatabase.formatDateToLocal(_field_value, context.timezone);
                            }
                            break;
                        case 'address':
                            console.log(_field_value);
                            console.log('address..............');
                            if(_field_value != null){
                                _field_value = (_field_value.country || '') + ' ' + (_field_value.state || '') + ' ' + (_field_value.city || '') + ' ' + (_field_value.stateCode || '') + ' ' + (_field_value.street || '');
                            }
                            break;
                        default:
                            console.log(_field_value);
                    }
                    
                    _field = _field.replace('{{field-value}}', _field_value || '<br/>');
                    _fields += _field;
                }
                
                if(_p_tmp[i].detailHeading && _p_tmp[i].fields.length > 0){
                    var _section = section_template;
                    _section = _section.replace('{{fields}}',_fields);
                    _section = _section.replace('{{section-number}}','section-' + i);
                    _section = _section.replace('{{section-title}}', _p_tmp[i].label);
                    record_display += _section;
                } else {
                    var _section = section_template_without_heading;
                    _section = _section.replace('{{fields}}',_fields);
                    _section = _section.replace('{{section-number}}','section-' + i);
                    record_display += _section;
                }
            }
            
            document.querySelector('#field-container').innerHTML = record_display;
            
            
            $j('ul').listview();

            var _li_a_array = document.querySelectorAll('li a');

            for (var i = _li_a_array.length - 1; i >= 0; i--) {
                _li_a_array[i].classList.remove('ui-btn');
                _li_a_array[i].classList.remove('ui-btn-icon-right');
                _li_a_array[i].classList.remove('ui-icon-carat-r');

                _li_a_array[i].parentNode.classList.add('ui-li-static');
                _li_a_array[i].parentNode.classList.add('ui-body-inherit');
            };

            var _li_img_array = document.querySelectorAll('li img');

            for (var i = _li_img_array.length - 1; i >= 0; i--) {
                _li_img_array[i].parentNode.classList.remove('ui-li-has-thumb');
            };

            // 换行，specifically for textarea
            $j('li').css('word-wrap','break-word').css('white-space','normal');

            // 将行分割线改为断点
            $j('li:not(.ui-first-child)').css('border-width','1px 0 0').css('border-style','dashed');
        }

        return {
            retrieveSobjectData:retrieveSobjectData
        };
    };

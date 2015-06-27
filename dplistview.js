var 
    sobject ={
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
        recentlyviewed_ids: ''
    },

    listview = {
        recordType:{},
        recordLabel:{},
        queryresult:{}
    },

    templates = {
        page_structure:'',
        listview_select:'',
        listview_option:'',
        listview_resultlist:'',
        listview_resultitem:'',
        listview_result_noitem:''
    },

    raw = {
        sobjectdescribe:null,
        sobjectdescribe_retrieved:false,
        listviews:null,
        listviews_retrieved:false,
        sobjectmetadata:null,
        sobjectmetadata_retrieved:false,
        searchlayout:null,
        searchlayout_retrieved:false,
        recentlyviewed:null,
        recentlyviewed_retrieved:false,
        recentlyviewedwithfields:null,
        recentlyviewedwithfields_retrieved:false,
        listviewresult:{},
        listviewresult_retrieved:{},
        listviewdescribe:{},
        listviewdescribe_retrieved:{},
        listviewqueryresult:null,
        listviewqueryresult_retrieved:false
    };

function ajax(method, endpoint, data, success, failure){
    endpoint = context.rest_base_uri + endpoint;

    var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

    var callbackNotExecuted = true;
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && callbackNotExecuted) {
            callbackNotExecuted = false;
            if(["200","201"].indexOf(xmlhttp.status + "") > -1 && success) {
                success(JSON.parse(xmlhttp.responseText));
            } else if(failure) {
                if(context.referer == 'retry'){
                    alert('页面错误，请联系管理员');
                } else {
                    window.location.replace(window.location.href + '&from=retry');
                }
            } else {
                console.log(xmlhttp);
            }
        }
    };

    xmlhttp.ontimeout = function(){
        if(context.referer == 'retry'){
            alert('页面超时，请关闭页面后重试');
        } else {
            alert('页面超时，请重试');
            window.location.replace(window.location.href + '&from=retry');
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
}

function remoting(action,params,success,failure){
    Visualforce.remoting.Manager.invokeAction(
        context.remote_action,
        action,
        params,
        function(result, event){
            if(event.status){
                success(result);
            } else {
                if(failure){
                    failure(result);
                }
            }
        },
        {escape:false}
    );
}

function getRequestRestAPI(endpoint, callback_function){
    ajax('GET',endpoint,null,callback_function,null);
}

function getParams(){
    var _query_strings = window.location.search.substr(1).split('&');
    
    for(var i = 0; i < _query_strings.length; i++){
        var _query_keyvalue = _query_strings[i].split('=');
        
        switch(_query_keyvalue[0].toLowerCase()){
            case 'sobject':
                sobject.name = _query_keyvalue[1];
                break;
            case 'from':
                context.referer = _query_keyvalue[1];
                break;
            default:
                console.log('test');
        }
    }
}

function getTemplates(){
    templates.page_structure = document.querySelector('#template-page-structure').text;
    templates.listview_select = document.querySelector('#template-listview-select').text;
    templates.listview_option = document.querySelector('#template-listview-option').text;
    templates.listview_resultlist = document.querySelector('#template-listview-resultlist').text;
    templates.listview_resultitem = document.querySelector('#template-listview-resultitem').text;
    templates.listview_result_noitem = document.querySelector('#template-listview-result-noitem').text;
}

function retrieveSobjectData(){
    retrieveSobjectDescribe();
    retrieveSobjectListViews();
    retrieveSobjectSearchLayout();
    retrieveSobjectMetadata();
    retrieveSobjectRecentlyViewed();
}

function processSobjectData(){
    if(raw.sobjectdescribe_retrieved && raw.listviews_retrieved && raw.sobjectmetadata_retrieved && raw.searchlayout_retrieved && raw.recentlyviewed_retrieved){
        handleSobjectDescribeResult();
        handleSobjectListViewsResult();
        handleSobjectSearchLayoutResult();
        handleSobjectMetadataResult();
        handleSobjectRecentlyViewed();

        if(sobject.recentlyviewed_ids != ""){
            retrieveRecentlyViewedBySoql();
        } else {
            renderListViewSelects();
            renderRecentlyViewedList();
            stopLoading('jqm-listview');
        }
    }
}

function retrieveRecentlyViewedBySoql(){
    retrieveSobjectRecentlyViewedwithFields();
}

function processRecentlyViewedBySoql(){
    handleSobjectRecentlyViewedwithFields();
}

function retrieveSelectListView(listview_id){
    retrieveListViewResults(listview_id);
    retrieveListViewDescribe(listview_id);
}

function processSelectListView(listview_id){
    if(raw.listviewresult_retrieved[listview_id] && raw.listviewdescribe_retrieved[listview_id]){
        handleListViewResults(listview_id);
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

function newRecord(){
    animateLoading('jqm-listview','加载中');
    window.location.href = '/apex/DPRecordEditorNew?sobject=' + sobject.name;
}

function viewRecord(record_id){
    animateLoading('jqm-listview','加载中');
    window.location.href = '/apex/DPRecordViewer?sobject=' + sobject.name + '&id=' + record_id;
}

function retrieveSobjectDescribe(){
    getRequestRestAPI(
        '/sobjects/' + sobject.name + '/describe', 
        function(response){
            raw.sobjectdescribe = response;
            raw.sobjectdescribe_retrieved = true;
            processSobjectData();
        }
    );
}

function retrieveSobjectListViews(){
    getRequestRestAPI(
        '/sobjects/' + sobject.name + '/listviews', 
        function(response){
            raw.listviews = response;
            raw.listviews_retrieved = true;
            processSobjectData();
        }
    );
}

function retrieveSobjectMetadata(){
    remoting(
        'retrieveSobjectMetadata',
        [sobject.name],
        function(result){
            raw.sobjectmetadata = result;
            raw.sobjectmetadata_retrieved = true;
            processSobjectData();
        },
        function(result){
            sobject.ordered_listviews = sobject.listviews.listviews;
            raw.sobjectmetadata_retrieved = true;
            processSobjectData();
        }
    );
}

function retrieveSobjectSearchLayout(){
    getRequestRestAPI(
        '/search/layout/?q=' + sobject.name, 
        function(response){
            raw.searchlayout = response;
            raw.searchlayout_retrieved = true;
            processSobjectData();
        }
    );
}

function retrieveSobjectRecentlyViewed(){
    getRequestRestAPI(
        '/query?q=' + window.encodeURIComponent("Select Id From RecentlyViewed Where Type='" + sobject.name + "'"),
        function(response){
            raw.recentlyviewed = response;
            raw.recentlyviewed_retrieved = true;
            processSobjectData();
        }
    );
}

function handleSobjectDescribeResult(){
    var response = raw.sobjectdescribe;
    sobject.describe = response;
    document.title = sobject.describe.label + ' - 列表视图';
    document.querySelector('#h1-record-name').innerHTML = sobject.describe.label;

    var sobject_fields = sobject.describe.fields;

    for (var i = sobject_fields.length - 1; i >= 0; i--) {
        sobject.fields[sobject_fields[i].name] = sobject_fields[i];
    };
}

function handleSobjectListViewsResult(){
    var response = raw.listviews;
    sobject.listviews = response;
    for (var i = 0; i < sobject.listviews.listviews.length; i++) {
        sobject.listviewsmap[sobject.listviews.listviews[i].id] = sobject.listviews.listviews[i];
    };
}

function handleSobjectMetadataResult(){
    var result = raw.sobjectmetadata;
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

function handleSobjectSearchLayoutResult(){
    var response = raw.searchlayout;
    sobject.search_layout_fields = response[0].searchColumns;
}

function handleSobjectRecentlyViewed(){
    var response = raw.recentlyviewed;
    for (var i = response.records.length - 1; i >= 0; i--) {
        sobject.recentlyviewed_ids += "'" + response.records[i].Id + "',";
    };

    if(sobject.recentlyviewed_ids != ''){
        sobject.recentlyviewed_ids = sobject.recentlyviewed_ids.substring(0,sobject.recentlyviewed_ids.length - 1);
    } 
}

function constructSoqlStatement(){
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

function retrieveSobjectRecentlyViewedwithFields(){
    getRequestRestAPI(
        '/query?q=' + window.encodeURIComponent(constructSoqlStatement()), 
        function(response){
            raw.recentlyviewedwithfields = response;
            raw.recentlyviewedwithfields_retrieved = true;
            processRecentlyViewedBySoql();
        }
    );
}

function handleSobjectRecentlyViewedwithFields(){
    var response = raw.recentlyviewedwithfields;
    sobject.recentlyviewed = response;

    renderListViewSelects();
    renderRecentlyViewedList();
    stopLoading('jqm-listview');
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
        renderRecentlyViewedList();
    } else {
        selected_option_id = selected_option_id.substr(0,15);
        
        animateLoading('jqm-listview','加载中');
        retrieveSelectListView(selected_option_id);
    }
}

// listview results max 25
function retrieveListViewResults(listview_id){
    getRequestRestAPI(
        '/sobjects/' + sobject.name + '/listviews/' + listview_id + '/results', 
        function(response){
            raw.listviewresult[listview_id] = response;
            raw.listviewresult_retrieved[listview_id] = true;
            processSelectListView(listview_id);
        }
    );
}

// listview describe info
function retrieveListViewDescribe(listview_id){
    getRequestRestAPI(
        '/sobjects/' + sobject.name + '/listviews/' + listview_id + '/describe', 
        function(response){
            raw.listviewdescribe[listview_id] = response;
            raw.listviewdescribe_retrieved[listview_id] = true;
            processSelectListView(listview_id);
        }
    );
}

function handleListViewResults(listview_id){
    var response = raw.listviewresult[listview_id];
    sobject.results['id_' + response.id] = response;
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
    getRequestRestAPI(
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
    stopLoading('jqm-listview');
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
        options += option_template.replace('{{option-value}}',sobject.ordered_listviews[i].id).replace('{{option-label}}',sobject.ordered_listviews[i].label);
    };

    options = templates.listview_select.replace('{{options}}',options);
    document.querySelector('#listview-picklist').innerHTML = options;
    
    $j('select').selectmenu({
        shadow:false
    });
}

function renderRecentlyViewedList(){
    var listitems = '';
    var listitem_template = templates.listview_resultitem;
    
    var listview_results = sobject.recentlyviewed.records; 
    
    if(listview_results == undefined || listview_results.length == 0){
        document.querySelector('#listview-resultlist').innerHTML = templates.listview_result_noitem;
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
        document.querySelector('#listview-resultlist').innerHTML = templates.listview_result_noitem;
        
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
        listitems += '<a href="javascript:renderListViewResultList(' + (display_number + 25) +');">';
        listitems += '<div style="font-weight:normal;"><h1 style="margin-top:0px;text-align:center;">更多</h1></div></a></li>';
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

function animateLoading(jqm_page_id, loading_text){
    document.querySelector('#' + jqm_page_id).classList.add('ui-state-disabled');
    var loading_image_src = "{!URLFOR($Resource.DPResource, '/DPResource/welinklogo.png')}";
    
    $j.mobile.loading( 'show', {
        text: loading_text,
        textVisible: true,
        theme: 'a',
        textonly: false,
        html: '<div style="text-align:center;font-size:1em;font-weight:bold;" ><img src="' + loading_image_src + '" width="100px"/><br/><span>' + loading_text + '</span></div>'
    });
    
    document.querySelector('.ui-body-a').classList.remove('ui-body-a');
}
        
function stopLoading(jqm_page_id){
    $j.mobile.loading( 'hide');
    document.querySelector('#' + jqm_page_id).classList.remove('ui-state-disabled');
}
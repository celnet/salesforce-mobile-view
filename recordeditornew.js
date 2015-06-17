var 
    sobject = {
        name: '',
        describe: {},
        layout_tableEnumOrId: '',
        welink_layout: {},
        fields: {},
        has_welink_layout:false
    },

    record = {
        layout:{},
        recordtypeid:'', // user select
        references:{
            fields:[],
            sobjtype:{},
            counter:0,
            processing:{},
            values:{}
        },
        processed:[],
        welink_processed:[],
        welink_required:{},
        welink_readonly:{},
        welink_edit:{}
    },

    templates = {
        recordtype_select:'',
        recordtype_option:''
    };

/**
 * On Load executing function chain:
 *  retrieveSobjectDescribe()
 *  retrieveSobjectLayouts()
 *   or user select record type // not implemented yet
 *  processReferenceFields()
 *  displayLayout()
 *   processLayoutSection() <- processLayoutRows() <- processLayoutItems()
 *   processFieldsDisplay()
 *  
 * User Action save record:
 *  processSaveRecord()
 *  saveRecord()
 **/

function fixStyles(){
    // style 'pageone' and 'lookup-search-page' jquery mobile pages to theme b(celnet green theme)
    $j('#pageone').page({theme:'b'});
    $j('#lookup-search-page').page({theme:'b'});

    // fix header 
    document.querySelector('#pageone-header').style.position = 'fixed';
    document.querySelector('#pageone-header').classList.remove('slidedown');
    document.querySelector('#lookup-search-page').style.position = 'fixed';
    document.querySelector('#lookup-search-page').classList.remove('slidedown');
}

function getRequestRestAPI(endpoint, callback_function){
    /*
    var xhr = window.XMLHttpRequest? new XMLHttpRequest(): new ActiveXObject("Microsoft.XMLHTTP");

    xhr.onreadystatechange = function(){
        console.log('xxxxxxxhhhhhhhhrrrrrrr');
        console.log(xhr);
    }

    xhr.open("GET",endpoint,true);
    xhr.setRequestHeader('Authorization', 'Bearer ');
    xhr.send();
    */

    endpoint = context.rest_base_uri + endpoint;

    $j.ajax(endpoint,{
        beforeSend: function(xhr){
            xhr.setRequestHeader('Authorization', 'Bearer ' + context.session_id);
        },
        cache:false,
        timeout:context.timeout_amount,
        success: function(response){
            callback_function(response);
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log(jqXHR);
            console.log(errorThrown);
            if(textStatus == 'timeout'){
                alert('页面超时，请重试');
                window.location.reload();
            } else {
                if(textStatus == 'error'){
                    alert('系统错误，请联系管理员');
                }
                //window.location.reload();
            }
        }
    });
}

function postRequestRestAPI(endpoint, data_body, callback_function, failure_function){
    endpoint = context.rest_base_uri + endpoint;
    $j.ajax(endpoint,{
        beforeSend: function(xhr){
            xhr.setRequestHeader('Authorization', 'Bearer ' + context.session_id);
        },
        method: 'POST',
        'contentType':'application/json',
        processData: false,
        data: data_body,
        timeout: context.timeout_amount,
        success: function(response){
            callback_function(response);
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log(jqXHR);
            console.log(errorThrown);
            if(textStatus == 'timeout'){
                alert('页面超时，请重试');
                hideAjaxLoading('pageone');
            } else {
                failure_function(jqXHR);
            }
        }
    });
}

function retrieveQueryParams(){
    var query_params = window.location.search.substr(1).split('&');
    for(var i = 0; i < query_params.length; i++){
        var param_value = query_params[i].split('=')[1];
        if(query_params[i].split('=')[0].toLowerCase() == 'sobject'){
            sobject.name = param_value;
        }
    }
}

function retrieveTemplates(){
    templates = {
        recordtype_select:document.querySelector('#template-recordtype-select').text,
        recordtype_option:document.querySelector('#template-recordtype-option').text
    };
}

function retrieveLayoutTableEnumOrId(){
    var _sobject_name = sobject.name;

    if(_sobject_name.indexOf('__') < 0){
        sobject.layout_tableEnumOrId = _sobject_name;
        retrieveSobjectDescribe();
        //retrieveWelinkLayoutId();
        //retrieveSobjectDescribe();
    } else {
        var devname;
        var devname_firstindex = 0;
        var devname_lastindex = _sobject_name.length - 1;
        if(_sobject_name.indexOf('__') != _sobject_name.lastIndexOf('__')){
            devname_firstindex = _sobject_name.indexOf('__') + 2;
            devname_lastindex = _sobject_name.lastIndexOf('__');

            devname = _sobject_name.substring(devname_firstindex,devname_lastindex);
        } else if(_sobject_name.indexOf('__c') > 0){
            devname = _sobject_name.substring(0,_sobject_name.indexOf('__c'));
        } else {
            devname = _sobject_name.substring(_sobject_name.indexOf('__') + 2, devname_lastindex);
        }

        var endpoint = "/tooling/query/?q=";

        var soql = "Select Id,DeveloperName From CustomObject Where DeveloperName = '";
        soql += devname;
        soql += "'";

        endpoint += window.encodeURIComponent(soql);

        getRequestRestAPI(endpoint, function(response){
            console.log(response);

            if(response.records.length > 0){
                sobject.layout_tableEnumOrId = response.records[0].Id;
                retrieveSobjectDescribe();
            } else {
                retrieveSobjectDescribe();
            }
        });
    }
}

function retrieveSobjectDescribe(){
    var endpoint = '/sobjects/' + sobject.name + '/describe';

    getRequestRestAPI(endpoint, function(response){
        sobject.describe = response;

        for (var i = sobject.describe.fields.length - 1; i >= 0; i--) {
            sobject.fields[sobject.describe.fields[i].name] = sobject.fields[sobject.describe.fields[i].name] || {};
            sobject.fields[sobject.describe.fields[i].name].describe = sobject.describe.fields[i];
        };

        retrieveSobjectLayouts();
    });
}

function retrieveSobjectLayouts(){
    var endpoint = '/sobjects/' + sobject.name + '/describe/layouts/';

    getRequestRestAPI(endpoint, function(response){
        console.log(response);

        if(response.layouts != null && response.layouts.length > 0){
            sobject.layout = response.layouts[0];
            record.processed = processLayoutSection();
            processReferenceFields();
            displayLayout();
        } else {
            displayRecordTypeSelector(response.recordTypeMappings);
        }
    });
}

function displayRecordTypeSelector(recordtype_mappings){
    var recordtype_options = '<option value="--None--">--None--</option>';
    for (var i = 0; i < recordtype_mappings.length - 1; i++) {
        var option = templates.recordtype_option.replace('{{option-label}}',recordtype_mappings[i].name).replace('{{option-value}}',recordtype_mappings[i].recordTypeId);
        recordtype_options += option;
    };
    var recordtype_select = templates.recordtype_select.replace('{{options}}',recordtype_options).replace('{{sobject-label}}',sobject.describe.label);
    document.querySelector('#field-container').innerHTML = recordtype_select;
    $j('select').selectmenu();
    hideAjaxLoading('pageone');
    document.querySelector('#recordtype').addEventListener('change',selectRecordType);
}

function selectRecordType(){
    var recordtype_options = document.querySelectorAll('#recordtype option');
    for(var i = 0; i < recordtype_options.length; i++){
        if(recordtype_options[i].selected && recordtype_options[i].value != '--None--'){
            record.recordtypeid = recordtype_options[i].value;
            retrieveWelinkLayoutId();
        }
    }
}

function retrieveWelinkLayoutId(){
    Wlink.DPController.retrieveSobjectWelinkLayoutIdByRecordTypeId(
        sobject.name || '',record.recordtypeid || '', 
        function(result, event){
            if (event.status) {
                console.log(result);

                if(result == '' || result.indexOf('exception') >= 0){
                    retrieveSobjectLayoutByRecordTypeId();
                } else {
                    var layoutsoql = '/tooling/sobjects/Layout/' + result;
                    retrieveWelinkLayoutDetail(layoutsoql);
                }
            } else if (event.type === 'exception') {

            } else {
                
            }
        }, 
        {escape: true}
    );
}

function retrieveWelinkLayoutDetail(layout_endpoint){
    getRequestRestAPI(layout_endpoint, function(response){
        console.log(response);
        sobject.has_welink_layout = true;
        sobject.welink_layout = response.Metadata;
        processWelinkRecordLayout();
        processReferenceFields();
        displayLayout();
    });
}

function retrieveSobjectLayoutByRecordTypeId(){
    var endpoint = '/sobjects/' + sobject.name + '/describe/layouts/';
    endpoint += record.recordtypeid;

    getRequestRestAPI(endpoint, function(response){
        sobject.layout = response;
        record.processed = processLayoutSection();
        processReferenceFields();
        displayLayout();
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
            for (var k = _layout_items.length - 1; k >= 0; k--) {
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
    var _original_layout = sobject.layout.editLayoutSections;
    var _layout = [];
    
    for(var i = 0; i < _original_layout.length; i++){
        var _section = {};
        _section.heading = _original_layout[i].heading;
        _section.useHeading = _original_layout[i].useHeading;
        _section.rows = processLayoutRow(_original_layout[i].layoutRows);
        _layout.push(_section);
    }
    
    return _layout;
}

function processLayoutRow(layout_rows){
    var _rows = [];
    
    for(var i = 0; i < layout_rows.length; i++){
        _rows = _rows.concat(processLayoutRowItem(layout_rows[i].layoutItems));
    }
    
    return _rows;
}

function processLayoutRowItem(layout_items){
    var _items = [];
    for(var i = 0; i < layout_items.length; i++){
        if(layout_items[i].layoutComponents != null && layout_items[i].layoutComponents.length > 0 && layout_items[i].layoutComponents[0].type == 'Field'){
            var _item = layout_items[i];
            _items.push(_item);
        }
    }
    
    return _items;
}

function processReferenceFields(){
    var _p_tmp = record.processed;

    console.log(_p_tmp);
    
    for(var i = 0; i < _p_tmp.length; i++){
        for(var j = 0; j < _p_tmp[i].rows.length; j++){
            if(_p_tmp[i].rows[j].layoutComponents[0].details.type == 'reference'){

                record.references.sobjtype[_p_tmp[i].rows[j].layoutComponents[0].details.name] = {};

                var _ref_to = _p_tmp[i].rows[j].layoutComponents[0].details.referenceTo[0];
                if(_ref_to == 'Group'){
                    _ref_to = _p_tmp[i].rows[j].layoutComponents[0].details.referenceTo[1];
                }

                record.references.sobjtype[_p_tmp[i].rows[j].layoutComponents[0].details.name]['sobjtype'] = _ref_to;

            }
        }
    }
}

function processSaveRecord(){
    var _field_input_elements = document.querySelectorAll('input[id*="record-field"]');
    _field_select_elements = document.querySelectorAll('select[id*="record-field"]');
    _field_textarea_elements = document.querySelectorAll('textarea[id*="record-field"]');
    
    var new_record = {};
    
    for(var i = 0; i < _field_input_elements.length;i++){
        var _field_api_name = _field_input_elements[i].id.substring(13);
        
        switch(_field_input_elements[i].type){
            case 'hidden':
                // do nothing
                break;
            case 'datetime-local':
                _field_value = _field_input_elements[i].value;
                if(_field_value != ''){
                    _field_value = TimezoneDatabase.formatDatetimeToUTC(_field_input_elements[i].value, context.timezone);
                    _field_value = _field_value + ':00';
                }

                new_record[_field_api_name] = _field_value;
                break;
            case 'date':
                _field_value = _field_input_elements[i].value;
                if(_field_value != ''){
                    _field_value = TimezoneDatabase.formatDateToUTC(_field_value, context.timezone);
                }
                new_record[_field_api_name] = _field_value;

                if(_field_value == ''){
                    new_record[_field_api_name] = null;
                }
                break;
            case 'checkbox':
                _field_value = _field_input_elements[i].checked;
                new_record[_field_api_name] = _field_value;
                break;
            case '':
                _field_value = _field_input_elements[i].value;
                new_record[_field_api_name] = _field_value;
                break;
            case 'search':
                _field_value = document.querySelector('#' + _field_input_elements[i].id + '-hidden').value;
                if(_field_value != '' && _field_value != undefined){
                    new_record[_field_api_name] = _field_value;
                }
                break;
            default:
                _field_value = _field_input_elements[i].value;
                new_record[_field_api_name] = _field_value;
        }
    }
    
    for(var i = 0; i < _field_select_elements.length;i++){
        var _field_api_name = _field_select_elements[i].id.substring(13);
        var _field_value = '';
        var _options = document.querySelectorAll('#' + _field_select_elements[i].id + ' option');
        
        for(var j = 0; j < _options.length; j++){
            if(_options[j].selected){
                _field_value += _options[j].value;
                _field_value += ';';
            }
        }
        
        if(_field_value.length > 0){
            _field_value = _field_value.substring(0, _field_value.length - 1);
        }
        
        if(_field_value == '--None--'){
            _field_value = '';
        }
        
        new_record[_field_api_name] = _field_value;
    }
    
    for(var i = 0; i < _field_textarea_elements.length;i++){
        var _field_api_name = _field_textarea_elements[i].id.substring(13);
        var _field_value = _field_textarea_elements[i].value;
        new_record[_field_api_name] = _field_value;
    }
    
    return JSON.stringify(new_record);
}

function processFieldsDisplay(_row, _is_welink_layout){
    console.log(_row);
    var sobject_name = sobject.name;

    var _field_name = _is_welink_layout?_row:_row.layoutComponents[0].details.name;;

    //var _details = _row.layoutComponents[0].details;
    if(sobject.fields[_field_name] == undefined)
        return '';

    var _details = sobject.fields[_field_name].describe;
    var _field;
    var _field_label = (_is_welink_layout?sobject.fields[_field_name].describe.name:_row.label) + ':';//_details.label + ':';
    var _sobject_name_lowercase = sobject.name.toLowerCase();

    var _field_required = _is_welink_layout?record.welink_required[_field_name]:_row.required;
    var _field_editable = _is_welink_layout?record.welink_edit[_field_name]:_details.createable;
    var _field_readonly = _is_welink_layout?record.welink_readonly[_field_name]:(!_details.createable);
    
    var field_templates = {};
    field_templates.boolean = document.querySelector('#checkbox-field-template').text;
    field_templates.url = document.querySelector('#url-field-template').text;
    field_templates.date = document.querySelector('#date-field-template').text;
    field_templates.encryptedstring = document.querySelector('#text-encrypted-field-template').text;
    field_templates.textarea = document.querySelector('#textarea-field-template').text;
    field_templates.string = document.querySelector('#text-field-template').text;
    field_templates.currency = document.querySelector('#currency-field-template').text;
    field_templates.reference = document.querySelector('#lookup-field-template').text;
    field_templates.datetime = document.querySelector('#datetime-field-template').text; 
    field_templates.phone = document.querySelector('#phone-field-template').text;
    field_templates.percent = document.querySelector('#percent-field-template').text;
    field_templates.double = document.querySelector('#number-field-template').text;
    field_templates.email = document.querySelector('#email-field-template').text;
    //field_templates.picklist = document.querySelector('#text-field-template').text;//document.querySelector('#picklist-field-template').text;
    field_templates.multipicklist = document.querySelector('#multi-picklist-field-template').text;
    
    if(_details.name == 'Name' && (sobject_name.toLowerCase() == 'user' || sobject_name.toLowerCase() == 'contact' || sobject_name.toLowerCase() == 'lead')){
        if(_is_welink_layout){
            _field = processWelinkNameField();
        } else {
            _field = processNameField(_row.layoutComponents[0].components);
        }
        
        return _field;// + '<br/>';
    }

    if(_field_readonly && _details.type != 'address'){
        var _field_template = document.querySelector('#field-template').text;
        _field = _field_template.replace('{{field-label}}',_field_label);
        _field = _field.replace('{{field-value}}','<br/>');
        
        return _field;// + '<br/>';
    } 

    if(_field_required){
        _field_label = '<span style="color:crimson">*</span>' + _field_label;
    } else {
        _field_label = '<span>&nbsp;</span>' + _field_label;
    }

    switch(_details.type){
        case 'multipicklist':
            var _select_template = document.querySelector('#multi-picklist-field-template').text;
            _field = _select_template.replace('{{input-label}}',_field_label);
            _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
            
            var _option_template = document.querySelector('#multi-picklist-field-template-option').text;
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

            _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
            break;
        case 'datetime':
            var _field_template = field_templates[_details.type] || field_templates['datetime'];
            _field = _field_template.replace('{{input-label}}',_field_label);
            _field = _field.replace('{{input-value}}','');
            _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
            break;
        case 'picklist':
            var _select_template = document.querySelector('#picklist-field-template-select').text;
            _field = _select_template.replace('{{input-label}}',_field_label);
            _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
            
            var _option_template = document.querySelector('#picklist-field-template-option').text;
            var _options = '';
            
            var _noselect_option = _option_template.replace('{{option-label}}','--None--');
            _noselect_option = _noselect_option.replace('{{option-value}}','--None--');
            _noselect_option = _noselect_option.replace('{{option-selected}}','');

            if(!_field_required){
                _options += _noselect_option;
            }
            
            console.log(_details);
            for(var i = 0; i < _details.picklistValues.length; i++){
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
            var _field_template = document.querySelector('#field-template').text;
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
    var _field_template = document.querySelector('#user-name-field-template').text;

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
    var _field_template = document.querySelector('#address-field-template').text;

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
    var _field_template = document.querySelector('#user-name-field-template').text;

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
    var _field_template = document.querySelector('#address-field-template').text;

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

function displayLayout(){
    
    var section_template = document.querySelector('#section-template').text;
    var section_template_without_heading = document.querySelector('#section-template-without-heading').text;
    
    var record_display = '';

    var _processed;

    if(record.welink_processed.length > 0){
        _processed = record.welink_processed;
        for(var i = 0; i < _processed.length;i++){
            var _fields = '';
            for(var j = 0; j < _processed[i].fields.length; j++){
                _fields += processFieldsDisplay(_processed[i].fields[j].field, true);
                console.log(_fields);
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
    $j('textarea').textinput();
    $j('select').selectmenu();
    $j('input[type="checkbox"]').flipswitch();
    
    $j('input[id!="lookup-search-box"]').css('height','44.375px');
    $j('label').css('font-weight','bold');

    hideAjaxLoading('pageone');

    // 分割线改为点线
    $j('.ui-field-contain').css('border-bottom-style','dashed');
}

function saveRecord(){
    var sobject_name = sobject.name;

    showAjaxLoading('加载中','pageone');
    var _data_body = processSaveRecord();

    postRequestRestAPI('/sobjects/' + sobject_name,_data_body,
        function(response){
            console.log(response);
            window.location.href = '/apex/DPRecordViewer?sobject=' + sobject_name + '&id=' + response.id;
        },
        function(jqXHR){
            var error_info = jqXHR.responseJSON;
            error_info = error_info.length > 0?error_info[0]:{};
            if(error_info.message != null){
                console.log(error_info);
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

                    document.querySelector('#record-field-' + error_info.fields[0]).addEventListener('click',function(){
                        document.querySelector('#record-field-' + error_info.fields[0]).style.backgroundColor = 'white';
                        document.querySelector('#error-message-' + error_info.fields[0]).parentNode.removeChild(document.querySelector('#error-message-' + error_info.fields[0]));
                    });
                } else {
                    alert(error_info.message);
                }
                
            }else {
                alert(jqXHR.responseText);
            }
            
            hideAjaxLoading('pageone');
        }
    );
}

function cancelEdit(){
    showAjaxLoading('加载中','pageone');
    window.location.href = '/apex/DPListViewViewer?sobject=' + sobject.name;
}

function showAjaxLoading(loading_text, jqm_page_id){
    document.getElementById(jqm_page_id).classList.add('ui-state-disabled');
    
    $j.mobile.loading( 'show', {
        text: loading_text,
        textVisible: true,
        theme: 'a',
        textonly: false,
        html: '<div style="text-align:center;font-size:1em;font-weight:bold;" ><img src="' + context.welink_logo_src + '" width="100px"/><br/><span>' + loading_text + '</span></div>'
    });
    
    document.querySelector('.ui-body-a').classList.remove('ui-body-a');
}
        
function hideAjaxLoading(jqm_page_id){
    $j.mobile.loading( 'hide');
    document.getElementById(jqm_page_id).classList.remove('ui-state-disabled');
}

function lookup_popup(_trigger_element){
    window.location.hash = 'lookup-search-page';

    var _field_name = _trigger_element.id.substr(13);
    var _lookup_items = '<div style="text-align:center;padding:10px;">输入关键字搜索</div>';
    var _field_type = record.references.sobjtype[_field_name].sobjtype;

    var _lookup_button_href = 'javascript:lookup_search("' + _field_name + '")';

    document.querySelector('#lookup-search-button')['href'] = _lookup_button_href;
    document.querySelector('#lookup-record-list').innerHTML = _lookup_items;

    document.querySelector('#lookup-search-box').parentNode.style.marginTop = '3px';
    document.querySelector('#lookup-search-box').parentNode.style.marginBottom = '3px';
    document.querySelector('#lookup-search-box')['value'] = ''; // 清空 value

    //showAjaxLoading('加载中','lookup-search-page');
    lookup_retrieveRecentlyViewed(_field_name,_field_type);

    lookup_retrieveReferenceSobjectLabel(_field_type,function(response){
        document.querySelector('#lookup-search-box')['placeholder'] = response.label;
    });
}

function lookup_select(_field_name, _record_name, _record_id){
    document.querySelector('#record-field-' + _field_name).value = _record_name;
    document.querySelector('#record-field-' + _field_name + '-hidden').value = _record_id;
    
    window.location.hash = '';
}

function lookup_cancel(){
    window.location.hash = '';
}

function lookup_search(_fieldname){
    showAjaxLoading('加载中','lookup-search-page');
    var keyword = document.querySelector('#lookup-search-box').value;
    var _sobjtype = record.references.sobjtype[_fieldname].sobjtype;

    getRequestRestAPI("/query?q=Select+Id,Name+From+" + _sobjtype + "+Where+Name+Like+'%25" + keyword + "%25'",function(response){
        console.log(response);
        
        var _lookup_records = response.records;
        
        var _record_items = '';
        var _lookup_records_length = _lookup_records.length;// > 10?10:_lookup_records.length;
        for(var i = 0; i < _lookup_records_length; i++){
            var _record_item = document.querySelector('#lookup-field-record-item').text;
            _record_item = _record_item.replace(/{{record-name}}/g,_lookup_records[i].Name);
            _record_item = _record_item.replace(/{{field-name}}/g,_fieldname);
            _record_item = _record_item.replace(/{{record-id}}/g,_lookup_records[i].Id);
            
            _record_items += _record_item;
            
        }

        if(_record_items == ''){
            _record_items = '<div style="text-align:center;padding:10px;">未找到记录</div>';
        }
        
        document.querySelector('#lookup-record-list').innerHTML = _record_items;
        
        $j('#lookup-record-list li a').addClass('ui-btn');
        //$j('#lookup-record-list').listview();
        
        hideAjaxLoading('lookup-search-page');
    });
}

function lookup_retrieveRecentlyViewed(_fieldname,reference_sobject){
    var endpoint = "/query?q=Select+Id,Name+From+RecentlyViewed+Where+Type='" + reference_sobject + "'+Order+By+LastViewedDate+desc";

    getRequestRestAPI(endpoint, function(response){
        console.log(response);
        var _lookup_recentlyviewed = response.records;

        var _lookup_records = response.records;
        
        var _record_items = '';
        for(var i = 0; i < _lookup_recentlyviewed.length; i++){
            var _record_item = document.querySelector('#lookup-field-record-item').text;
            _record_item = _record_item.replace(/{{record-name}}/g,_lookup_recentlyviewed[i].Name);
            _record_item = _record_item.replace(/{{field-name}}/g,_fieldname);
            _record_item = _record_item.replace(/{{record-id}}/g,_lookup_recentlyviewed[i].Id);
            
            _record_items += _record_item;
            
        }

        if(_record_items == ''){
            _record_items = '<div style="text-align:center;padding:10px;">输入关键字搜索</div>';
        }
        
        document.querySelector('#lookup-record-list').innerHTML = _record_items;
        
        $j('#lookup-record-list li a').addClass('ui-btn');
        //$j('#lookup-record-list').listview();
        
        //hideAjaxLoading('lookup-search-page');

    });
}

function lookup_retrieveReferenceSobjectLabel(ref_sobj,callback_function){
    var endpoint = '/sobjects/' + ref_sobj + '/describe';
    getRequestRestAPI(endpoint, callback_function);
}
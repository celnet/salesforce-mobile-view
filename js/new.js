var RecordNew;

    var renderRecordNew = function(){
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
        AjaxPools.retrieveSobjectRelated(sobject.name, function(){
            AjaxHandlers.describe();
            RecordNew.retrieveSobjectData();
        });
    }

    var initRecordNew = function(){
        function retrieveSobjectData(){
            handleSobjectLayouts();
            checkRecordType();
        }
        
        function handleSobjectLayouts(){
            var response = AjaxResponses.layouts;
            var recordtype_mappings = response.recordTypeMappings;
            sobject.recordtype_mappings = response.recordTypeMappings;
            switch(true){
                case (response.layouts != null && response.layouts.length > 0):
                    console.log('no recordtype, no recordtype select needed');
                    sobject.layout = response.layouts[0];
                    record.processed = AjaxHandlers.layout(sobject.layout.editLayoutSections);//processLayoutSection();
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
        
        function getLayoutByRecordType(recordTypeId){
            if(recordTypeId == null || recordTypeId == ''){
                recordTypeId = 'norecordtype';
            }
            if(AjaxResponses.welinklayouts[recordTypeId] != null){
                AjaxResponses.welinklayout = AjaxResponses.welinklayouts[recordTypeId];
                sobject.welink_layout = AjaxResponses.welinklayout.Metadata;
                record.welink_processed = AjaxHandlers.welinklayout();
            } else {
                AjaxResponses.layout = AjaxResponses.layoutsMapping[recordTypeId];
                sobject.layout = AjaxResponses.layout;
                record.processed = AjaxHandlers.layout(sobject.layout.editLayoutSections);
            }
        }

        function checkRecordType(){
            switch(record.recordtypeid){
                case 'pending select': // has record types pending selection
                    renderRecordTypeSelect();
                    break;
                case '': // has no record type, direct to next step
                    getLayoutByRecordType('');
                    renderLayout();
                    break;
                default: // has given record type, direct to next step
                    AjaxHandlers.recordTypes();
                    AjaxHandlers.businessProcesses();
                    getLayoutByRecordType(record.recordtypeid);
                    renderLayout();
            }
        }

        function renderRecordTypeSelect(){
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
                    
                    AjaxHandlers.recordTypes();
                    AjaxHandlers.businessProcesses();
                    getLayoutByRecordType(record.recordtypeid);
                    renderLayout();
                }
            }
        }
        
        function processFieldsDisplay(_row, _is_welink_layout){
            var sobjectsWithCompoundNames = ['user','contact','lead'];
            var isCompoundName = sobjectsWithCompoundNames.indexOf(sobject.name.toLowerCase()) > 0;
            
            var fieldName;
            var fieldLabel;
            var fieldType;
            var fieldPicklistValues;
            var isFieldRequired;
            var isFieldEditable;
            var isFieldReadOnly;
            
            if(_is_welink_layout){
                fieldName = _row;
                fieldLabel = sobject.fields[fieldName].describe.label;
                isFieldRequired = record.welink_required[fieldName];
                isFieldEditable = record.welink_edit[fieldName];
                isFieldReadOnly = record.welink_readonly[fieldName];
            } else {
                fieldName = _row.layoutComponents[0].details.name;
                fieldLabel = _row.label;
                isFieldRequired = _row.required;
                isFieldEditable = _row.createable;
                isFieldReadOnly = !_row.createable;
            }
            
            fieldLabel += ':';
            
            if(sobject.fields[fieldName] == undefined){
                return '';
            }
            
            fieldType = sobject.fields[fieldName].describe.type;
            fieldPicklistValues = sobject.fields[fieldName].describe.picklistValues;
            
            var _field;
            var _field_label = fieldLabel;
            
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
            
            if(fieldName == 'Name' && isCompoundName){
                if(_is_welink_layout){
                    _field = processWelinkNameField();
                } else {
                    _field = processNameField(_row.layoutComponents[0].components);
                }
                
                return _field;// + '<br/>';
            }

            if((isFieldReadOnly && fieldType != 'address')){
                var _field_template = field_templates.readonly;
                _field = _field_template.replace('{{field-label}}',_field_label);
                _field = _field.replace('{{field-value}}','<br/>');
                
                return _field;// + '<br/>';
            } 

            if(fieldName == 'RecordTypeId'){
                var _field_template = field_templates.readonly;
                _field = _field_template.replace('{{field-label}}',_field_label);
                _field = _field.replace('{{field-value}}',record.recordtypename);
                
                return _field;
            }

            if(isFieldRequired || fieldName == 'OwnerId'){
                _field_label = '<span style="color:crimson">*</span>' + _field_label;
            } else {
                _field_label = '<span>&nbsp;</span>' + _field_label;
            }

            switch(fieldType){
                case 'multipicklist':
                    var _select_template = field_templates.multipicklist;
                    _field = _select_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + fieldName);
                    
                    var _option_template = templates.field_multipicklist_option;
                    var _options = '';
                    
                    for(var i = 0; i < fieldPicklistValues.length; i++){
                        var _option = _option_template.replace('{{option-label}}',fieldPicklistValues[i].label);
                        _option = _option.replace('{{option-value}}',fieldPicklistValues[i].value);
                        
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
                    var _field_template = field_templates[fieldType] || field_templates['string'];

                    _field = _field_template.replace('{{input-label}}',_field_label);

                    if(fieldName == 'OwnerId'){
                        _field = _field.replace('{{input-value}}',context.user_fullname);
                        _field = _field.replace('{{input-value-hidden}}',context.user_id);
                    } else {
                        _field = _field.replace('{{input-value}}','');
                        _field = _field.replace('{{input-value-hidden}}','');
                    }

                    var field_ref_type = sobject.fields[fieldName].describe.referenceTo[0];
                    field_ref_type = field_ref_type == 'Group'?sobject.fields[fieldName].describe.referenceTo[1]:field_ref_type;

                    _field = _field.replace('{{reference-sobject-type}}',field_ref_type);

                    _field = _field.replace(/{{input-id}}/g,'record-field-' + fieldName);
                    break;
                case 'datetime':
                    var _field_template = field_templates[fieldType] || field_templates['datetime'];
                    _field = _field_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace('{{input-value}}','');
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + fieldName);
                    break;
                case 'picklist':
                    var _select_template = templates.field_picklist_select;
                    _field = _select_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + fieldName);
                    
                    var _option_template = templates.field_picklist_option;
                    var _options = '';
                    
                    var _noselect_option = _option_template.replace('{{option-label}}','--' + context.labels.select_none + '--');
                    _noselect_option = _noselect_option.replace('{{option-value}}','--None--');
                    _noselect_option = _noselect_option.replace('{{option-selected}}','');

                    if(!isFieldRequired){
                        _options += _noselect_option;
                    }
                    
                    for(var i = 0; i < fieldPicklistValues.length; i++){
                        if(!fieldPicklistValues[i].active)
                            continue;
                        var _option = _option_template.replace('{{option-label}}',fieldPicklistValues[i].label);
                        _option = _option.replace('{{option-value}}',fieldPicklistValues[i].value);
                        
                        if(fieldPicklistValues[i].defaultValue){
                            _option = _option.replace('{{option-selected}}','selected');
                        } else {
                            _option = _option.replace('{{option-selected}}','');
                        }
                        
                        _options += _option;
                    }
                    
                    _field = _field.replace('{{options}}',_options);
                    break;
                case 'boolean':
                    var _field_template = field_templates[fieldType] || field_templates['string'];
                    _field = _field_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace('{{input-value}}','');
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + fieldName);
                    
                    _field = _field.replace('{{input-checked}}','');
                    //_field += '<br/>';
                    break;
                case 'address':
                    if(_is_welink_layout){
                        _field = processWelinkAddressField(fieldName);
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
                    var _field_template = field_templates[fieldType] || field_templates['string'];
                    _field = _field_template.replace('{{input-label}}',_field_label);
                    _field = _field.replace('{{input-value}}','');
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + fieldName);
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
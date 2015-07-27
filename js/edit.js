var renderRecordEdit = function(){
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
    AjaxPools.retrieveSobjectRelated(sobject.name, function(){
        AjaxHandlers.describe();
        RecordEdit.retrieveSobjectData();
    });
}

var initRecordEdit = function(){

    function retrieveSobjectData(){
        if(AjaxResponses.has_retrieved_record_related){
            processRecordRelated();
        } else {
            AjaxPools.retrieveRecordRelated(sobject.name, record.id, function(){
                AjaxHandlers.handleReferenceFields(sobject.name, record.id);
                processRecordRelated();
            });
        }
    }

    function processRecordRelated(){
        record.detail = AjaxResponses.record;

        document.querySelector('#jqm-page-title').innerHTML = record.detail.Name || '';
        document.title = sobject.describe.label;

        if(AjaxResponses.welinklayout != null){
            sobject.welink_layout = AjaxResponses.welinklayout.Metadata;
        }
        
        record.layout = AjaxResponses.layout;

        if(sobject.welink_layout != null){
            record.welink_processed = AjaxHandlers.welinklayout();
        } else {
            record.processed = AjaxHandlers.layout(record.layout.editLayoutSections);
        }

        displayLayout();
        View.stopLoading('jqm-record');
    }
    
    function processFieldsDisplay(fieldName, layoutItem, isWelinkLayout){
        var sobjectsWithCompoundNames = ['user','contact','lead'];
        var isCompoundName = sobjectsWithCompoundNames.indexOf(sobject.name.toLowerCase()) > 0;
        
        var fieldLabel;
        var fieldType;
        var fieldPicklistValues;
        var fieldReferenceTos;
        var fieldComponents;
        var isFieldRequired;
        var isFieldEditable;
        var isFieldReadOnly;
        var _timezone = context.timezone;
        
        if(isWelinkLayout){
            fieldLabel = sobject.fields[fieldName].describe.label;
            fieldType = sobject.fields[fieldName].describe.type;
            fieldPicklistValues = sobject.fields[fieldName].describe.picklistValues;
            fieldReferenceTos = sobject.fields[fieldName].describe.referenceTo;
            isFieldRequired = record.welink_required[fieldName];
            isFieldEditable = record.welink_edit[fieldName] && sobject.fields[fieldName].describe.updateable;
            isFieldReadOnly = record.welink_readonly[fieldName] && !sobject.fields[fieldName].describe.updateable;
        } else {
            fieldName = layoutItem.layoutComponents[0].details.name;
            fieldLabel = layoutItem.label;
            fieldType = layoutItem.layoutComponents[0].details.type;
            fieldPicklistValues = layoutItem.layoutComponents[0].details.picklistValues;
            fieldReferenceTos = layoutItem.layoutComponents[0].details.referenceTo;
            fieldComponents = layoutItem.layoutComponents[0].components;
            isFieldRequired = layoutItem.required;
            isFieldEditable = layoutItem.layoutComponents[0].details.updateable;
            isFieldReadOnly = !isFieldEditable;
        }
        
        fieldLabel += ':';
        
        if(sobject.fields[fieldName] == undefined){
            return '';
        }
        
        var _field;
        var _record_detail = record.detail;
        var _ref_values = record.references;
        
        var field_templates = {};
        field_templates.url = templates.jqm_textinput.replace(/{{input-type}}/g,'url');
        field_templates.textarea = templates.jqm_textarea;
        field_templates.string = templates.jqm_textinput.replace(/{{input-type}}/g,'text');
        field_templates.currency = templates.jqm_textinput.replace(/{{input-type}}/g,'text');
        field_templates.phone = templates.jqm_textinput.replace(/{{input-type}}/g,'tel');
        field_templates.percent = templates.jqm_textinput.replace(/{{input-type}}/g,'text');
        field_templates.double = templates.jqm_textinput.replace(/{{input-type}}/g,'text');
        field_templates.email = templates.jqm_textinput.replace(/{{input-type}}/g,'email');
        
        if(fieldName == 'Name' && isCompoundName){
            return FieldRenderer.processNameField(_record_detail, fieldComponents || []);
        }
        
        if(fieldType == 'address'){
            return FieldRenderer.processAddressField(_record_detail[fieldName], fieldComponents || [], fieldName);
        } 
        
        if(fieldName == 'RecordTypeId'){
            var recordtype_value = '';

            if(record.references != null && record.references['RecordTypeId'] != null){
                recordtype_value = record.references['RecordTypeId'].Name;
            }

            var _field_template = templates.field_readonly;
            _field = _field_template.replace('{{field-label}}',fieldLabel);
            _field = _field.replace('{{field-value}}',recordtype_value);
            
            return _field;
        }

        // hard-coded for ForecastCategoryName
        if((isFieldReadOnly && fieldType != 'address') || fieldName == 'ForecastCategoryName' || !sobject.fields[fieldName].describe.updateable){
            if(fieldType == 'reference' && _record_detail[fieldName] != '' && _record_detail[fieldName] != undefined){

                var _ref_value = '<a data-role="none" data-ajax="false" href="/apex/DP?mode=view&sobject=' + fieldReferenceTos[0] + '&id=' + _ref_values[fieldName].Id + '&crossref=true' + '&listviewid=' + params.listviewid + '">' + _ref_values[fieldName].Name + '</a>';

                var _field_template = templates.field_readonly;
                _field = _field_template.replace('{{field-label}}',fieldLabel);
                _field = _field.replace('{{field-value}}',_ref_value);
                return _field;// + '<br/>';
                
            } else if(fieldType == 'datetime' && _record_detail[fieldName] != '' && _record_detail[fieldName] != undefined){
                var _datetime_value = TimezoneDatabase.formatDatetimeToLocal(_record_detail[fieldName], _timezone);
                _datetime_value = _datetime_value.replace('T',' ');

                var _field_template = templates.field_readonly;
                _field = _field_template.replace('{{field-label}}',fieldLabel);
                _field = _field.replace('{{field-value}}', _datetime_value);
                
                return _field;
            } else {
                var _field_template = templates.field_readonly;
                _field = _field_template.replace('{{field-label}}',fieldLabel);
                _field = _field.replace('{{field-value}}',_record_detail[fieldName] || '<br/>');
                
                return _field;// + '<br/>';
            }
        } 

        if((isWelinkLayout && isFieldRequired) || (isFieldEditable && isFieldRequired) || fieldName == 'OwnerId'){
            fieldLabel = '<span style="color:crimson">*</span>' + fieldLabel;
        } else {
            fieldLabel = '<span>&nbsp;</span>' + fieldLabel;
        }

        switch(fieldType){
            case 'reference':
                var _field_template = templates.field_lookup;
            
                _field = _field_template.replace('{{input-label}}',fieldLabel);
                
                if(_ref_values[fieldName] != undefined){
                    _field = _field.replace('{{input-value}}',_ref_values[fieldName].Name);
                    _field = _field.replace('{{input-value-hidden}}',_ref_values[fieldName].Id);
                } else {
                    _field = _field.replace('{{input-value}}','');
                    _field = _field.replace('{{input-value-hidden}}','');
                }

                var field_ref_type = fieldReferenceTos[0];
                field_ref_type = field_ref_type == 'Group'?fieldReferenceTos[1]:field_ref_type;

                _field = _field.replace('{{reference-sobject-type}}',field_ref_type);
                
                //_field = _field.replace('{{input-value}}','');
                _field = _field.replace(/{{input-id}}/g,'record-field-' + fieldName);
                break;
            case 'multipicklist':
                var _select_template = templates.field_multipicklist_select;
                _field = _select_template.replace('{{input-label}}',fieldLabel);
                _field = _field.replace(/{{input-id}}/g,'record-field-' + fieldName);
                
                var _option_template = templates.option;
                var _options = '';
                
                var _multipicklist_value = [];
                
                if(_record_detail[fieldName] != null){
                    _multipicklist_value = _record_detail[fieldName].split(';');
                }
                
                for(var i = 0; i < fieldPicklistValues.length; i++){
                    var _option = _option_template.replace('{{option-label}}',fieldPicklistValues[i].label);
                    _option = _option.replace('{{option-value}}',fieldPicklistValues[i].value);
                    
                    for(var j = 0; j < _multipicklist_value.length;j++){
                        if(_multipicklist_value[j] == fieldPicklistValues[i].value){
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
                var _field_template = templates.jqm_textinput.replace(/{{input-type}}/g,'datetime-local');
                _field = _field_template.replace('{{input-label}}',fieldLabel);
                
                var _dt_val = '';
                if(_record_detail[fieldName] != null){
                    _dt_val = TimezoneDatabase.formatDatetimeToLocal(_record_detail[fieldName], _timezone);
                }
                
                _field = _field.replace('{{input-value}}',_dt_val);
                _field = _field.replace(/{{input-id}}/g,'record-field-' + fieldName);
                break;
            case 'picklist':
                var _select_template = templates.field_picklist_select;
                _field = _select_template.replace('{{input-label}}',fieldLabel);
                _field = _field.replace(/{{input-id}}/g,'record-field-' + fieldName);
                
                var _option_template = templates.option;
                var _options = '';
                
                var _noselect_option = _option_template.replace('{{option-label}}','--' + context.labels.select_none + '--');
                _noselect_option = _noselect_option.replace('{{option-value}}','--None--');
                _noselect_option = _noselect_option.replace('{{option-selected}}','');

                if(!isFieldRequired){
                    _options += _noselect_option;
                }
                
                for(var i = 0; i < fieldPicklistValues.length; i++){
                    var _option = _option_template.replace('{{option-label}}',fieldPicklistValues[i].label);
                    _option = _option.replace('{{option-value}}',fieldPicklistValues[i].value);
                    
                    if(_record_detail[fieldName] == fieldPicklistValues[i].value){
                        _option = _option.replace('{{option-selected}}','selected');
                    } else {
                        _option = _option.replace('{{option-selected}}','');
                    }
                    _options += _option;
                }
                
                _field = _field.replace('{{options}}',_options);
                break;
            case 'boolean':
                var _field_template = templates.jqm_checkboxradio;
                _field = _field_template.replace('{{input-label}}',fieldLabel);
                _field = _field.replace('{{input-value}}',_record_detail[fieldName] || '');
                _field = _field.replace(/{{input-id}}/g,'record-field-' + fieldName);
                
                if(_record_detail[fieldName]){
                    _field = _field.replace('{{input-checked}}','checked');
                } else {
                    _field = _field.replace('{{input-checked}}','');
                }
                //_field += '<br/>';
                break;
            case 'date':
                var date_value = _record_detail[fieldName];
                if(date_value != '' && date_value != null){
                    date_value = TimezoneDatabase.formatDateToLocal(date_value, _timezone);
                }

                var _field_template = templates.jqm_textinput.replace(/{{input-type}}/g,'date');
                _field = _field_template.replace('{{input-label}}',fieldLabel);
                _field = _field.replace('{{input-value}}',date_value || '');
                _field = _field.replace(/{{input-id}}/g,'record-field-' + fieldName);

                break;
            case 'address':
                _field = FieldRenderer.processAddressField(_record_detail[fieldName], fieldComponents || [], fieldName);
                
                break;
            case 'geolocation':
                var _field_template = templates.field_geolocation;
                _field = _field_template.replace('{{field-label}}',fieldLabel);
                _field = _field.replace('{{field-value}}',_record_detail[fieldName] || '');
                break;
            case 'location':
                var _field_template = templates.field_geolocation;
                _field = _field_template.replace('{{field-label}}',fieldLabel);
                _field = _field.replace('{{field-value}}',_record_detail[fieldName] || '');
                break;
            default:
                var _field_template = field_templates[fieldType] || templates.jqm_textinput.replace(/{{input-type}}/g,'text');
                _field = _field_template.replace('{{input-label}}',fieldLabel);
                
                var fieldValue = _record_detail[fieldName];
                
                if(fieldValue == null || fieldValue == undefined){
                    fieldValue = '';
                }
                
                _field = _field.replace('{{input-value}}',fieldValue);
                _field = _field.replace(/{{input-id}}/g,'record-field-' + fieldName);
        }

        return _field;// + '<br/>';
    }
    
    function displayLayout(){
        var section_template = templates.section;
        var section_template_without_heading = templates.section_without_heading;
        var record_display = '';
        
        var _p_tmp;
        if(record.welink_processed != null && record.welink_processed.length > 0){
            _p_tmp = record.welink_processed;
            for (var i = 0; i < _p_tmp.length; i++) {
                if(_p_tmp[i].fields.length > 0){
                    var _fields = '';
                    for (var j = 0; j < _p_tmp[i].fields.length; j++) {
                        _fields += processFieldsDisplay(_p_tmp[i].fields[j].field, null, true);
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
                        _fields += processFieldsDisplay(null, _p_tmp[i].rows[j], false);
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
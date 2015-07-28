var renderRecordEdit = function(){
    RecordEdit = initRecordEdit();

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
 /*
    function processFieldsDisplay(fieldName, layoutItem, isWelinkLayout){
        var sobjectsWithCompoundNames = ['user','contact','lead'],
            isCompoundName = sobjectsWithCompoundNames.indexOf(sobject.name.toLowerCase()) > 0,
            
            fieldHTML,
            
            fieldTemplate,
            fieldLabel,
            fieldType,
            fieldValue,
            refValue,
            fieldPicklistValues,
            fieldReferenceTos,
            fieldComponents,
        
            isFieldRequired,
            isFieldEditable,
            isFieldReadOnly,
            timezone = context.timezone;
        
        if(isWelinkLayout){
            fieldLabel = sobject.fields[fieldName].describe.label;
            fieldType = sobject.fields[fieldName].describe.type;
            fieldPicklistValues = sobject.fields[fieldName].describe.picklistValues;
            fieldReferenceTos = sobject.fields[fieldName].describe.referenceTo;
            isFieldRequired = record.welink_required[fieldName];
            isFieldEditable = record.welink_edit[fieldName] && sobject.fields[fieldName].describe.updateable;
            isFieldReadOnly = record.welink_readonly[fieldName] || !sobject.fields[fieldName].describe.updateable;
        } else {
            fieldName = layoutItem.layoutComponents[0].details.name;
            fieldLabel = layoutItem.label;
            fieldType = layoutItem.layoutComponents[0].details.type;
            fieldPicklistValues = layoutItem.layoutComponents[0].details.picklistValues;
            fieldReferenceTos = layoutItem.layoutComponents[0].details.referenceTo;
            fieldComponents = layoutItem.layoutComponents[0].components;
            isFieldRequired = layoutItem.required;
            isFieldEditable = layoutItem.editableForUpdate;
            isFieldReadOnly = !isFieldEditable;
        }
        
        fieldLabel += ':';
        
        if(sobject.fields[fieldName] == undefined){
            return '';
        }
        
        var recordDetail = record.detail;
        var recordReferences = record.references;
        fieldValue = recordDetail[fieldName];
        refValue = recordReferences[fieldName];
        
        if(fieldName == 'Name' && isCompoundName){
            return FieldRenderer.processNameField(recordDetail, fieldComponents || []);
        }
        
        if(fieldType == 'address'){
            return FieldRenderer.processAddressField(fieldValue, fieldComponents || [], fieldName);
        } 
        
        if(fieldName == 'RecordTypeId'){
            var recordTypeName = refValue.Name || '';
            
            fieldTemplate = templates.field_readonly;
            fieldHTML = fieldTemplate.replace('{{field-label}}',fieldLabel);
            fieldHTML = fieldHTML.replace('{{field-value}}',recordTypeName);
            
            return fieldHTML;
        }

        if((isFieldReadOnly && fieldType != 'address') || fieldName == 'ForecastCategoryName'){
            if(fieldValue != '' && fieldValue != undefined){
                if(fieldType == 'reference'){
                     var _ref_value = '<a data-role="none" data-ajax="false" href="/apex/DP?mode=view&sobject=' + fieldReferenceTos[0] + '&id=' + refValue.Id + '&crossref=true' + '&listviewid=' + params.listviewid + '">' + refValue.Name + '</a>';

                    fieldTemplate = templates.field_readonly;
                    fieldHTML = fieldTemplate.replace('{{field-label}}',fieldLabel);
                    fieldHTML = fieldHTML.replace('{{field-value}}',_ref_value);
                    return fieldHTML;
                } else if(fieldType == 'datetime'){
                    var _datetime_value = TimezoneDatabase.formatDatetimeToLocal(fieldValue, timezone);
                    _datetime_value = _datetime_value.replace('T',' ');
    
                    fieldTemplate = templates.field_readonly;
                    fieldHTML = fieldTemplate.replace('{{field-label}}',fieldLabel);
                    fieldHTML = fieldHTML.replace('{{field-value}}', _datetime_value);
                    
                    return fieldHTML;
                }
            } else {
                fieldTemplate = templates.field_readonly;
                fieldHTML = fieldTemplate.replace('{{field-label}}',fieldLabel);
                fieldHTML = fieldHTML.replace('{{field-value}}',fieldValue || '<br/>');
                
                return fieldHTML;
            }
        } 
        
        var requiredLabel = '<span>&nbsp;</span>';
        if((isFieldRequired && (isWelinkLayout || isFieldEditable)) || fieldName == 'OwnerId'){
            requiredLabel = '<span style="color:crimson">*</span>';
        }
        fieldLabel = requiredLabel + fieldLabel;

        switch(fieldType){
            case 'reference':
                fieldTemplate = templates.field_lookup;
                
                var field_ref_type = fieldReferenceTos[0];
                field_ref_type = field_ref_type == 'Group'?fieldReferenceTos[1]:field_ref_type;
                fieldHTML = fieldTemplate.replace('{{reference-sobject-type}}',field_ref_type);
                
                if(refValue != undefined){
                    fieldHTML = fieldHTML.replace('{{input-value}}',refValue.Name);
                    fieldHTML = fieldHTML.replace('{{input-value-hidden}}',refValue.Id);
                } else {
                    fieldHTML = fieldHTML.replace('{{input-value}}','');
                    fieldHTML = fieldHTML.replace('{{input-value-hidden}}','');
                }
                break;
            case 'multipicklist':
                var _select_template = templates.field_multipicklist_select;
                fieldHTML = _select_template;
                
                var _option_template = templates.option;
                var _options = '';
                
                var _multipicklist_value = [];
                
                if(fieldValue != null){
                    _multipicklist_value = fieldValue.split(';');
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
                fieldHTML = fieldHTML.replace('{{options}}',_options);
                break;
            case 'encryptedstring': // 加密字段不支持，页面中也不显示
                fieldHTML = '';
                break;
            case 'datetime':
                fieldTemplate = templates.jqm_textinput.replace(/{{input-type}}/g,'datetime-local');
                
                if(fieldValue != null){
                    fieldValue = TimezoneDatabase.formatDatetimeToLocal(fieldValue, timezone);
                } else {
                    fieldValue = '';
                }
                
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue);
                break;
            case 'picklist':
                var _select_template = templates.field_picklist_select;
                fieldHTML = _select_template;
                
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
                    
                    if(fieldValue == fieldPicklistValues[i].value){
                        _option = _option.replace('{{option-selected}}','selected');
                    } else {
                        _option = _option.replace('{{option-selected}}','');
                    }
                    _options += _option;
                }
                
                fieldHTML = fieldHTML.replace('{{options}}',_options);
                break;
            case 'boolean':
                fieldTemplate = templates.jqm_checkboxradio;
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                
                if(fieldValue){
                    fieldHTML = fieldHTML.replace('{{input-checked}}','checked');
                } else {
                    fieldHTML = fieldHTML.replace('{{input-checked}}','');
                }
                break;
            case 'date':
                var date_value = fieldValue;
                if(date_value != '' && date_value != null){
                    date_value = TimezoneDatabase.formatDateToLocal(date_value, timezone);
                }

                fieldTemplate = templates.jqm_textinput.replace(/{{input-type}}/g,'date');
                fieldHTML = fieldTemplate.replace('{{input-value}}',date_value || '');
                break;
            case 'address':
                fieldHTML = FieldRenderer.processAddressField(fieldValue, fieldComponents || [], fieldName);
                break;
            case 'geolocation':
                fieldTemplate = templates.field_geolocation;
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                break;
            case 'location':
                fieldTemplate = templates.field_geolocation;
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                break;
            case 'email':
            case 'url':
                fieldTemplate = templates.jqm_textinput.replace(/{{input-type}}/g,fieldType);
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                break;
            case 'percent':
            case 'currency':
            case 'double':
                fieldTemplate = templates.jqm_textinput.replace(/{{input-type}}/g,'text');
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                break;
            case 'string':
                fieldTemplate = templates.jqm_textinput.replace(/{{input-type}}/g,'text');
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                break;
            case 'phone':
                fieldTemplate = templates.jqm_textinput.replace(/{{input-type}}/g,'tel');
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                break;
            case 'textarea':
                fieldTemplate = templates.jqm_textarea;
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                break;
            default:
                if(fieldValue == null || fieldValue == undefined){
                    fieldValue = '';
                }
                
                fieldTemplate = templates.jqm_textinput.replace(/{{input-type}}/g,'text');
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue);
        }
        
        fieldHTML = fieldHTML.replace('{{input-label}}',fieldLabel);
        fieldHTML = fieldHTML.replace(/{{input-id}}/g,'record-field-' + fieldName);
        return fieldHTML;// + '<br/>';
    }
*/
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
                        _fields += FieldRenderer.processFieldDisplay(_p_tmp[i].fields[j].field, null, 'update', true);
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
                        _fields += FieldRenderer.processFieldDisplay(null, _p_tmp[i].rows[j], 'update', false);
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
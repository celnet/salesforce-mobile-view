var renderRecordNew = function(){
    RecordNew = initRecordNew();
    
    document.querySelector('body').innerHTML = templates.record_page_structure + templates.page_lookup;
    
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
        var recordtype_mappings = AjaxResponses.layouts.recordTypeMappings;
        var recordtype_options = '';
        var has_default = false;
        for (var i = 0; i < recordtype_mappings.length - 1; i++) {
            var option = templates.option.replace('{{option-label}}',recordtype_mappings[i].name).replace('{{option-value}}',recordtype_mappings[i].recordTypeId);
            if(record.recordtypeid != '' && record.recordtypeid != 'pending select'){
                if(recordtype_mappings[i].recordTypeId == record.recordtypeid){

                }
            } else if(recordtype_mappings[i].defaultRecordTypeMapping && !has_default){
                option = option.replace('{{option-selected}}','selected');
                has_default = true;
            } else {
                option = option.replace('{{option-selected}}','');
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
    
    function processFieldsDisplay(fieldName, layoutItem, newOrUpdate, isWelinkLayout){
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
            
            isNew = (newOrUpdate == 'new'),
            isUpdate = (newOrUpdate == 'update'),
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
            isFieldEditable = layoutItem.editableForNew;
            isFieldReadOnly = !isFieldEditable;
        }
        
        fieldLabel += ':';
        
        if(sobject.fields[fieldName] == undefined){
            return '';
        }
        
        var recordDetail;
        var recordReferences;
        
        if(isNew){
            recordDetail = {};
            recordReferences = {};
        } else {
            recordDetail = record.detail;
            recordReferences = record.references;
        }
        
        fieldValue = recordDetail[fieldName];
        refValue = recordReferences[fieldName];
        
        if(fieldName == 'Name' && isCompoundName){
            return FieldRenderer.processNameField(recordDetail, fieldComponents || []);
        }
        
        if(fieldType == 'address'){
            return FieldRenderer.processAddressField(fieldValue, fieldComponents || [], fieldName);
        } 
        
        if(fieldName == 'RecordTypeId'){
            var recordTypeName;
            
            if(isNew){
                recordTypeName = record.recordtypename;
            } else {
                recordTypeName = refValue.Name || '';
            }
            
            fieldTemplate = templates.field_readonly;
            fieldHTML = fieldTemplate.replace('{{field-label}}',fieldLabel);
            fieldHTML = fieldHTML.replace('{{field-value}}',recordTypeName);
            
            return fieldHTML;
        }
        
        if((isFieldReadOnly && fieldType != 'address') || fieldName == 'ForecastCategoryName'){
            fieldTemplate = templates.field_readonly;
            if(fieldValue != '' && fieldValue != undefined){
                if(fieldType == 'reference'){
                     var _ref_value = '<a data-role="none" data-ajax="false" href="/apex/DP?mode=view&sobject=' + fieldReferenceTos[0] + '&id=' + refValue.Id + '&crossref=true' + '&listviewid=' + params.listviewid + '">' + refValue.Name + '</a>';

                    fieldHTML = fieldTemplate.replace('{{field-label}}',fieldLabel);
                    fieldHTML = fieldHTML.replace('{{field-value}}',_ref_value);
                    return fieldHTML;
                } else if(fieldType == 'datetime'){
                    var _datetime_value = TimezoneDatabase.formatDatetimeToLocal(fieldValue, timezone);
                    _datetime_value = _datetime_value.replace('T',' ');
                    
                    fieldHTML = fieldTemplate.replace('{{field-label}}',fieldLabel);
                    fieldHTML = fieldHTML.replace('{{field-value}}', _datetime_value);
                    
                    return fieldHTML;
                }
            } else {
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
                } else if(fieldName == 'OwnerId'){
                    fieldHTML = fieldHTML.replace('{{input-value}}',context.user_fullname);
                    fieldHTML = fieldHTML.replace('{{input-value-hidden}}',context.user_id);
                } else{
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
                    
                    for(var j = 0; j < _multipicklist_value.length; j++){
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
            case 'encryptedstring':
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
                    var isSelected = (isNew && fieldPicklistValues[i].defaultValue) || (isUpdate && fieldValue == fieldPicklistValues[i].value);
                    
                    if(!fieldPicklistValues[i].active){
                        continue;
                    }
                    
                    var _option = _option_template.replace('{{option-label}}',fieldPicklistValues[i].label);
                    _option = _option.replace('{{option-value}}',fieldPicklistValues[i].value);
                    
                    if(isSelected){
                        _option = _option.replace('{{option-selected}}','selected');
                    } else {
                        _option = _option.replace('{{option-selected}}','');
                    }
                    
                    _options += _option;
                }
                
                fieldHTML = fieldHTML.replace('{{options}}',_options);
                break;
            case 'boolean':
                fieldTemplate = templates.checkboxradio;
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
                fieldHTML = FieldRenderer.processAddressField(fieldValue || {}, fieldComponents || [], fieldName);
                break;
            case 'geolocation':
                fieldTemplate = templates.field_readonly;
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                break;
            case 'location':
                fieldTemplate = templates.field_readonly;
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
                    _fields += processFieldsDisplay(_processed[i].fields[j].field, null, 'new', true);
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
                    _fields += processFieldsDisplay(null, _processed[i].rows[j], 'new', false);
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
var FieldRenderer = {
    processNameField:function(allfields, name_components){
        var name_labels = {
            firstname:sobject.fields['FirstName'].describe.label,
            lastname:sobject.fields['LastName'].describe.label
        }

        for (var i = name_components.length - 1; i >= 0; i--) {
            if(name_components[i].value.toLowerCase().match(/first/) != null){
                name_labels.firstname = name_components[i].details.label;
            } else if(name_components[i].value.toLowerCase().match(/last/) != null){
                name_labels.lastname = name_components[i].details.label;
            }
        }

        var _field = '';
        var _field_template = Templates.field_username;

        _field = _field_template.replace('{{lastname-value}}',allfields.LastName || '');
        _field = _field.replace('{{lastname-label}}',name_labels.lastname);

        _field = _field.replace('{{firstname-value}}',allfields.FirstName || '');
        _field = _field.replace('{{firstname-label}}',name_labels.firstname);

        return _field;
    },

    processAddressField:function(address_field, address_components, fullfieldname){
        if(fullfieldname != null){
            var address_prefix = fullfieldname.substring(0,fullfieldname.indexOf('Address'));
            var address_labels = {
                country:sobject.fields[address_prefix + 'Country'].describe.label,
                state:sobject.fields[address_prefix + 'State'].describe.label,
                city:sobject.fields[address_prefix + 'City'].describe.label,
                postalCode:sobject.fields[address_prefix + 'PostalCode'].describe.label,
                street:sobject.fields[address_prefix + 'Street'].describe.label
            };
    
            var address_apinames = {
                country:address_prefix + 'Country',
                state:address_prefix + 'State',
                city:address_prefix + 'City',
                postalCode:address_prefix + 'PostalCode',
                street:address_prefix + 'Street'
            };
        } else {
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
            };
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
        var _field_template = Templates.field_address;

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
    },
    
    processFieldDisplay:function(fieldName, layoutItem, newOrUpdate, isWelinkLayout){
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
            timezone = Context.timezone;
        
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
            isFieldEditable = (isNew && layoutItem.editableForNew) || (isUpdate && layoutItem.editableForUpdate);
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
                if(refValue != null){
                    recordTypeName = refValue.Name;
                } else {
                    recordTypeName = '';
                }
            }
            
            fieldTemplate = Templates.field_readonly;
            fieldHTML = fieldTemplate.replace('{{field-label}}',fieldLabel);
            fieldHTML = fieldHTML.replace('{{field-value}}',recordTypeName);
            
            return fieldHTML;
        }
        
        if((isFieldReadOnly && fieldType != 'address') || fieldName == 'ForecastCategoryName'){
            fieldTemplate = Templates.field_readonly;
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
                
                if(fieldValue == null || fieldValue == ''){
                    fieldValue = '<br/>';
                }
                
                fieldHTML = fieldHTML.replace('{{field-value}}',fieldValue);
                
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
                fieldTemplate = Templates.field_lookup;
                
                var field_ref_type = fieldReferenceTos[0];
                field_ref_type = field_ref_type == 'Group'?fieldReferenceTos[1]:field_ref_type;
                fieldHTML = fieldTemplate.replace('{{reference-sobject-type}}',field_ref_type);
                
                if(refValue != undefined){
                    fieldHTML = fieldHTML.replace('{{input-value}}',refValue.Name);
                    fieldHTML = fieldHTML.replace('{{input-value-hidden}}',refValue.Id);
                } else if(fieldName == 'OwnerId'){
                    fieldHTML = fieldHTML.replace('{{input-value}}',Context.user_fullname);
                    fieldHTML = fieldHTML.replace('{{input-value-hidden}}',Context.user_id);
                } else{
                    fieldHTML = fieldHTML.replace('{{input-value}}','');
                    fieldHTML = fieldHTML.replace('{{input-value-hidden}}','');
                }
                break;
            case 'multipicklist':
                var _select_template = Templates.field_multipicklist_select;
                fieldHTML = _select_template;
                
                var _option_template = Templates.option;
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
                fieldTemplate = Templates.jqm_textinput.replace(/{{input-type}}/g,'datetime-local');
                
                if(fieldValue != null){
                    fieldValue = TimezoneDatabase.formatDatetimeToLocal(fieldValue, timezone);
                } else {
                    fieldValue = '';
                }
                
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue);
                break;
            case 'picklist':
                var _select_template = Templates.field_picklist_select;
                fieldHTML = _select_template;
                
                var _option_template = Templates.option;
                var _options = '';
                
                var _noselect_option = _option_template.replace('{{option-label}}','--' + Context.labels.select_none + '--');
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
                fieldTemplate = Templates.jqm_checkboxradio;
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
                
                fieldTemplate = Templates.jqm_textinput.replace(/{{input-type}}/g,'date');
                fieldHTML = fieldTemplate.replace('{{input-value}}',date_value || '');
                break;
            case 'address':
                fieldHTML = FieldRenderer.processAddressField(fieldValue || {}, fieldComponents || [], fieldName);
                break;
            case 'geolocation':
            case 'location':
                fieldTemplate = Templates.field_geolocation;
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                break;
            case 'email':
            case 'url':
                fieldTemplate = Templates.jqm_textinput.replace(/{{input-type}}/g,fieldType);
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                break;
            case 'percent':
            case 'currency':
            case 'double':
                fieldTemplate = Templates.jqm_textinput.replace(/{{input-type}}/g,'text');
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                break;
                break;
            case 'string':
                fieldTemplate = Templates.jqm_textinput.replace(/{{input-type}}/g,'text');
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                break;
            case 'phone':
                fieldTemplate = Templates.jqm_textinput.replace(/{{input-type}}/g,'tel');
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                break;
            case 'textarea':
                fieldTemplate = Templates.jqm_textarea;
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue || '');
                break;
            default:
                if(fieldValue == null || fieldValue == undefined){
                    fieldValue = '';
                }
                
                fieldTemplate = Templates.jqm_textinput.replace(/{{input-type}}/g,'text');
                fieldHTML = fieldTemplate.replace('{{input-value}}',fieldValue);
        }
        
        fieldHTML = fieldHTML.replace('{{input-label}}',fieldLabel);
        fieldHTML = fieldHTML.replace(/{{input-id}}/g,'record-field-' + fieldName);
        return fieldHTML;
    },
    
    processLayoutDisplay:function(processedLayout, welinkProcessedLayout, newOrUpdate, isWelinkLayout){
        var section_template = Templates.section;
        var section_template_without_heading = Templates.section_without_heading;
        var layoutDisplay = '';
        
        if(isWelinkLayout){
            var wpl = welinkProcessedLayout;
            for (var i = 0; i < wpl.length; i++) {
                if(wpl[i].fields.length > 0){
                    var fields = '';
                    for (var j = 0; j < wpl[i].fields.length; j++) {
                        fields += FieldRenderer.processFieldDisplay(wpl[i].fields[j].field, null, newOrUpdate, true);
                    };
                    
                    var section;
                    if(wpl[i].editHeading && wpl[i].fields.length > 0){
                        section = section_template.replace('{{section-title}}', wpl[i].label);
                    } else {
                        section = section_template_without_heading;
                    }
                    
                    section = section.replace('{{fields}}',fields);
                    section = section.replace('{{section-number}}','section-' + i);
                    layoutDisplay += section;
                }
            };
        } else {
            var pl = processedLayout;
            for (var i = 0; i < pl.length; i++) {
                if(pl[i].rows.length > 0){
                    var fields = '';
                    for(var j = 0; j < pl[i].rows.length; j++){
                        fields += FieldRenderer.processFieldDisplay(null, pl[i].rows[j], newOrUpdate, false);
                    }
                    
                    var section;
                    if(pl[i].useHeading && pl[i].rows.length > 0){
                        section = section_template.replace('{{fields}}',fields);
                    } else {
                        section = section_template_without_heading;
                    }
                    
                    section = section.replace('{{section-number}}','section-' + i);
                    section = section.replace('{{section-title}}', pl[i].heading);
                    layoutDisplay += section;
                }
            }
        }
        
        document.querySelector('#field-container').innerHTML = layoutDisplay;
        
        $j('input[type="search"]').bind('click',function(){
            Lookup.popup(this,'jqm-record');
        });

        var lookup_anchors = document.querySelectorAll('input[type="search"] + a');
        for (var i = lookup_anchors.length - 1; i >= 0; i--) {
            lookup_anchors[i].addEventListener('click',function(){
                this.parentNode.firstChild.value = '';
                document.querySelector('#' + this.parentNode.firstChild.id + '-hidden').value = '';
            },false);
        };
        
        Styles.styleEdit();
    },
    
    processViewLayoutDisplay:function(processedLayout, welinkProcessedLayout, isWelinkLayout){
        var section_template = Templates.view_section;
        var section_template_without_heading = Templates.view_section_without_heading;
        var record_display = '';
        
        if(isWelinkLayout){
            var wpl = record.welink_processed;
            
            for(var i = 0; i < wpl.length;i++){
                var fields = '';
                for(var j = 0; j < wpl[i].fields.length; j++){
                    fields += FieldRenderer.processViewFieldDisplay(wpl[i].fields[j].field, null, true);
                }
                
                var section;
                if(wpl[i].detailHeading && wpl[i].fields.length > 0){
                    section = section_template.replace('{{section-title}}', wpl[i].label);
                } else {
                    section = section_template_without_heading;
                }
                
                section = section.replace('{{fields}}',fields);
                section = section.replace('{{section-number}}','section-' + i);
                record_display += section;
            } 
        } else {
            var pl = processedLayout;
            for(var i = 0; i < pl.length;i++){
                var fields = '';
                for(var j = 0; j < pl[i].rows.length; j++){
                    fields += FieldRenderer.processViewFieldDisplay(pl[i].rows[j].layoutComponents[0].details.name,pl[i].rows[j].layoutComponents[0],false);
                }
                
                var section;
                if(pl[i].useHeading){
                    section = section_template.replace('{{section-title}}', pl[i].heading);
                } else {
                    section = section_template_without_heading;
                }
                
                section = section.replace('{{fields}}',fields);
                section = section.replace('{{section-number}}','section-' + i);
                record_display += section;
            }
        }
        
        document.querySelector('#field-container').innerHTML = record_display;
        Styles.styleView();
    },
    
    processViewFieldDisplay:function(fieldName, fieldComponent, isWelinkLayout){
        var fieldDescribe;
        
        if(isWelinkLayout){
            fieldDescribe = sobject.fields[fieldName].describe;
        } else {
            fieldDescribe = fieldComponent.details;
        }
        
        var fieldLabel = fieldDescribe.label;
        var fieldType = fieldDescribe.type;
        var fieldValue = record.detail[fieldName];
        var fieldReferenceTos = fieldDescribe.referenceTo;
        var refValue = record.references[fieldName];
        var currencyIsoCode = record.detail.CurrencyIsoCode || '';
        var field_template = Templates.field_view_readonly;
        
        var _field = field_template.replace('{{field-label}}',fieldLabel);
        
        if(fieldValue != null)
        switch(fieldType){
            case 'reference':
                var refName;
                var refId;
                if(refValue != null){
                    refName = refValue.Name;
                    refId = refValue.Id;
                }
                
                if(setup_objects.indexOf(fieldReferenceTos[0]) < 0 || fieldReferenceTos[0] == 'User'){
                    fieldValue = '<a data-role="none" data-ajax="false" href="/apex/DP?mode=view&sobject=' + fieldReferenceTos[0] + '&id=' + refId + '&crossref=true' + '&listviewid=' + params.listviewid + '">' + refName + '</a>';
                } else {
                    fieldValue = refName;
                }
                break;
            case 'phone':
                fieldValue = '<a data-role="none" href="tel:' + fieldValue + '">' + fieldValue + '</a>';
                break;
            case 'url':
                fieldValue = '<a data-role="none" href="' + fieldValue + '">' + fieldValue + '</a>';
                break;
            case 'currency':
                fieldValue = currencyIsoCode + fieldValue;
                break;
            case 'percent':
                fieldValue = fieldValue + '%';
                break;
            case 'boolean':
                if(fieldValue){
                    fieldValue = '<img src="' + Context.images.checkbox_checked + '" alt="true"/>';
                } else {
                    fieldValue = '<img src="' + Context.images.checkbox_unchecked + '" alt="false" />';
                }
                break;
            case 'datetime':
                if(fieldValue != null){
                    fieldValue = TimezoneDatabase.formatDatetimeToLocal(fieldValue, Context.timezone);
                    fieldValue = fieldValue.replace('T',' ');
                }
                break;
            case 'date':
                if(fieldValue != null){
                    fieldValue = TimezoneDatabase.formatDateToLocal(fieldValue, Context.timezone);
                }
                break;
            case 'address':
                if(fieldValue != null){
                    fieldValue = (fieldValue.country || '') + ' ' + (fieldValue.state || '') + ' ' + (fieldValue.city || '') + ' ' + (fieldValue.stateCode || '') + ' ' + (fieldValue.street || '');
                }
                break;
            default:
                console.log(fieldValue);
        }
        
        if(fieldValue == null || fieldValue == undefined){
            fieldValue = '<br/>';
        }
        
        _field = _field.replace('{{field-value}}', fieldValue);
        return _field;
    }
};
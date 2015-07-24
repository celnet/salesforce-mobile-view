    var RecordEdit = {};

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

            sobject.welink_layout = AjaxResponses.welinklayout.Metadata;
            record.layout = AjaxResponses.layout;

            if(sobject.welink_layout != null){
                record.welink_processed = AjaxHandlers.welinklayout();
            } else {
                record.processed = AjaxHandlers.layout(record.layout.editLayoutSections);
            }

            displayLayout();
            View.stopLoading('jqm-record');
        }
        
        function processFieldsDisplay(_row, _is_welink_layout){
            var sobjectsWithCompoundNames = ['user','contact','lead'];
            var isCompoundName = sobjectsWithCompoundNames.indexOf(sobject.name.toLowerCase()) > 0;
            
            var _timezone = context.timezone;
            var fieldName;
            var fieldLabel;
            var fieldPicklistValues;
            var isFieldRequired;
            var isFieldEditable;
            var isFieldReadOnly;
            
            if(_is_welink_layout){
                fieldName = _row;
                fieldLabel = sobject.fields[fieldName].describe.label;
                isFieldRequired = record.welink_required[fieldName];
                isFieldEditable = record.welink_edit[fieldName] && sobject.fields[fieldName].describe.updateable;
                isFieldReadOnly = record.welink_readonly[fieldName] && !sobject.fields[fieldName].describe.updateable;
            } else {
                fieldName = _row.layoutComponents[0].details.name;
                fieldLabel = _row.label;
                isFieldRequired = _row.required;
                isFieldEditable = sobject.fields[fieldName].describe.updateable;
                isFieldReadOnly = !sobject.fields[fieldName].describe.updateable;
            }
            
            fieldLabel += ':';
            
            if(sobject.fields[fieldName] == undefined){
                return '';
            }
            
            var _details = sobject.fields[fieldName].describe;
            //_row.layoutComponents[0].details;

            var _field;
            var _field_label = fieldLabel;
            var _record_detail = record.detail;
            var _ref_values = record.references;
            
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

            if(_details.name == 'Name' && isCompoundName){
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
            if((isFieldReadOnly && _details.type != 'address') || _details.name == 'ForecastCategoryName' || !sobject.fields[fieldName].describe.updateable){
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

            if((_is_welink_layout && isFieldRequired) || (isFieldEditable && isFieldRequired) || _details.name == 'OwnerId'){
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

                    if(!isFieldRequired){
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
                    
                    var fieldValue = _record_detail[_details.name];
                    
                    if(fieldValue == null || fieldValue == undefined){
                        fieldValue = '';
                    }
                    
                    _field = _field.replace('{{input-value}}',fieldValue);
                    _field = _field.replace(/{{input-id}}/g,'record-field-' + _details.name);
            }

            return _field;// + '<br/>';
        }

        function processWelinkNameField(allfields){
            return FieldRenderer.processNameField(allfields, []);
        }

        function processWelinkAddressField(address_field,fullfieldname){
            return FieldRenderer.processAddressField(address_field,[],fullfieldname);
        }

        function processNameField(allfields, name_components){
            return FieldRenderer.processNameField(allfields, name_components);
        }

        function processAddressField(address_field, address_components){
            return FieldRenderer.processAddressField(address_field, address_components, null);
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
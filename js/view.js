var RecordView = {};

    function renderRecordView(){
        RecordView = initRecordView();
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

        AjaxPools.retrieveSobjectRelated(sobject.name, function(){
            AjaxHandlers.describe();
            RecordView.retrieveSobjectData();
        });
    }

    var initRecordView = function(){
        function retrieveSobjectData(){
            AjaxPools.retrieveRecordRelated(sobject.name, record.id, function(){
                AjaxHandlers.handleReferenceFields(sobject.name, record.id);
                
                record.detail = AjaxResponses.record;
                document.querySelector('#jqm-page-title').innerHTML = record.detail.Name || '';
                document.title = sobject.describe.label;

                if(AjaxResponses.welinklayout != null){
                    sobject.welink_layout = AjaxResponses.welinklayout;
                    record.welink_processed = AjaxHandlers.welinklayout();

                    displayWelinkLayout();
                } else {
                    record.layout = AjaxResponses.layout;
                    record.processed = AjaxHandlers.viewlayout(record.layout.detailLayoutSections);
                    
                    displayLayout();
                }
                 View.stopLoading('jqm-record');
            });
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
                    var fieldName = _p_tmp[i].rows[j].name;
                    var fieldLabel = _p_tmp[i].rows[j].label;
                    var fieldType = _p_tmp[i].rows[j].type;
                    var fieldValue = record.detail[fieldName];
                    
                    var _field = field_template.replace('{{field-label}}',fieldLabel);
                    
                    if(fieldValue != null)
                    switch(fieldType){
                        case 'reference':
                            if(record.references[fieldName] != null){
                                    fieldValue = record.references[fieldName].Name || '';
                            } else {
                                    fieldValue = '';
                            }
                            
                            if(setup_objects.indexOf(_p_tmp[i].rows[j].referenceTo[0]) < 0 || _p_tmp[i].rows[j].referenceTo[0] == 'User'){
                                fieldValue = '<a data-role="none" data-ajax="false" href="/apex/DP?mode=view&sobject=' + _p_tmp[i].rows[j].referenceTo[0] + '&id=' + fieldValue + '&crossref=true' + '&listviewid=' + params.listviewid + '">' + fieldValue + '</a>';
                            }
                            break;
                        case 'phone':
                            fieldValue = '<a data-role="none" href="tel:' + fieldValue + '">' + fieldValue + '</a>';
                            break;
                        case 'url':
                            fieldValue = '<a data-role="none" href="' + fieldValue + '">' + fieldValue + '</a>';
                            break;
                        case 'currency':
                            if(record.detail.CurrencyIsoCode != undefined){
                                fieldValue = record.detail.CurrencyIsoCode + ' ' + fieldValue;
                            } 
                            break;
                        case 'percent':
                            fieldValue = fieldValue + '%';
                            break;
                        case 'boolean':
                            if(fieldValue){
                                fieldValue = '<img src="/img/checkbox_checked.gif" alt="true"/>';
                            } else {
                                fieldValue = '<img src="/img/checkbox_unchecked.gif" alt="false" />';
                            }
                            break;
                        case 'datetime':
                            if(fieldValue != null){
                                //fieldValue = fieldValue.substring(0,10) + ' ' +  fieldValue.substring(11,16);
                                //alert(fieldValue);
                                //alert(context.timezone);

                                fieldValue = TimezoneDatabase.formatDatetimeToLocal(fieldValue, context.timezone);
                                fieldValue = fieldValue.replace('T',' ');
                                //alert(fieldValue);
                            }
                            break;
                        case 'date':
                            if(fieldValue != null){
                                fieldValue = TimezoneDatabase.formatDateToLocal(fieldValue, context.timezone);
                            }
                            break;
                        case 'address':
                            console.log(fieldValue);
                            console.log('address..............');
                            if(fieldValue != null){
                                fieldValue = (fieldValue.country || '') + ' ' + (fieldValue.state || '') + ' ' + (fieldValue.city || '') + ' ' + (fieldValue.stateCode || '') + ' ' + (fieldValue.street || '');
                            }
                            break;
                        default:
                            console.log(fieldValue);
                    }
                    
                    _field = _field.replace('{{field-value}}', fieldValue || '<br/>');
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
                    var fieldName = _p_tmp[i].fields[j].field;
                    var fieldLabel = sobject.fields[fieldName].describe.label;
                    var fieldType = sobject.fields[fieldName].describe.type;
                    var fieldValue = record.detail[fieldName];
                    
                    if(sobject.fields[fieldName] == undefined)
                        continue;

                    var _field = field_template.replace('{{field-label}}',fieldLabel);
                    
                    if(fieldValue != null)
                    switch(fieldType){
                        case 'reference':
                            if(record.references[fieldName] != null){
                                    fieldValue = record.references[fieldName].Name || '';
                            } else {
                                    fieldValue = '';
                            }

                            if(setup_objects.indexOf(sobject.fields[fieldName].describe.referenceTo[0]) < 0 || sobject.fields[fieldName].describe.referenceTo[0] == 'User'){
                                fieldValue = '<a data-role="none" data-ajax="false" href="/apex/DP?mode=view&sobject=' + sobject.fields[fieldName].describe.referenceTo[0] + '&id=' + fieldValue + '&crossref=true' + '&listviewid=' + params.listviewid + '">' + fieldValue + '</a>';
                            }
                            break;
                        case 'phone':
                            fieldValue = '<a data-role="none" href="tel:' + fieldValue + '">' + fieldValue + '</a>';
                            break;
                        case 'url':
                            fieldValue = '<a data-role="none" href="' + fieldValue + '">' + fieldValue + '</a>';
                            break;
                        case 'currency':
                            if(record.detail.CurrencyIsoCode != undefined){
                                fieldValue = record.detail.CurrencyIsoCode + ' ' + fieldValue;
                            } 
                            break;
                        case 'percent':
                            fieldValue = fieldValue + '%';
                            break;
                        case 'boolean':
                            if(fieldValue){
                                fieldValue = '<img src="/img/checkbox_checked.gif" alt="true"/>';
                            } else {
                                fieldValue = '<img src="/img/checkbox_unchecked.gif" alt="false" />';
                            }
                            break;
                        case 'datetime':
                            if(fieldValue != null){
                                //fieldValue = fieldValue.substring(0,10) + ' ' +  fieldValue.substring(11,16);
                                //alert(fieldValue);
                                //alert(context.timezone);

                                fieldValue = TimezoneDatabase.formatDatetimeToLocal(fieldValue, context.timezone);
                                fieldValue = fieldValue.replace('T',' ');
                                //alert(fieldValue);
                            }
                            break;
                        case 'date':
                            if(fieldValue != null){
                                fieldValue = TimezoneDatabase.formatDateToLocal(fieldValue, context.timezone);
                            }
                            break;
                        case 'address':
                            console.log(fieldValue);
                            console.log('address..............');
                            if(fieldValue != null){
                                fieldValue = (fieldValue.country || '') + ' ' + (fieldValue.state || '') + ' ' + (fieldValue.city || '') + ' ' + (fieldValue.stateCode || '') + ' ' + (fieldValue.street || '');
                            }
                            break;
                        default:
                            console.log(fieldValue);
                    }
                    
                    _field = _field.replace('{{field-value}}', fieldValue || '<br/>');
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
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
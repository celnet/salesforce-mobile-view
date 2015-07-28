var initRecordView = function(){
    function retrieveSobjectData(){
        AjaxPools.retrieveRecordRelated(sobject.name, record.id, function(){
            AjaxHandlers.handleReferenceFields(sobject.name, record.id);
            
            record.detail = AjaxResponses.record;
            document.querySelector('#jqm-page-title').innerHTML = record.detail.Name || '';
            document.title = sobject.describe.label;

            if(AjaxResponses.welinklayout != null){
                sobject.welink_layout = AjaxResponses.welinklayout.Metadata;
                record.welink_processed = AjaxHandlers.welinklayout();

                displayWelinkLayout();
            } else {
                record.layout = AjaxResponses.layout;
                record.processed = AjaxHandlers.layout(record.layout.detailLayoutSections);
                
                displayLayout();
            }
             View.stopLoading('jqm-record');
        });
    }
    
    function displayLayout(processedLayout, welinkProcessedLayout, isWelinkLayout){

        var _p_tmp = record.processed;
        var section_template = Templates.view_section;
        var section_template_without_heading = Templates.view_section_without_heading;
        var field_template = Templates.field_view_readonly;

        var record_display = '';
        
        for(var i = 0; i < _p_tmp.length;i++){

            var _fields = '';
            for(var j = 0; j < _p_tmp[i].rows.length; j++){
                var fieldDescribe = _p_tmp[i].rows[j].layoutComponents[0].details;
                var fieldName = fieldDescribe.name;
                var fieldLabel = fieldDescribe.label;
                var fieldType = fieldDescribe.type;
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
                        
                        if(setup_objects.indexOf(fieldDescribe.referenceTo[0]) < 0 || fieldDescribe.referenceTo[0] == 'User'){
                            fieldValue = '<a data-role="none" data-ajax="false" href="/apex/DP?mode=view&sobject=' + fieldDescribe.referenceTo[0] + '&id=' + fieldValue + '&crossref=true' + '&listviewid=' + params.listviewid + '">' + fieldValue + '</a>';
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
                _fields += _field;
            }
            
            var section;
            if(_p_tmp[i].useHeading){
                section = section_template.replace('{{section-title}}', _p_tmp[i].heading);
            } else {
                section = section_template_without_heading;
            }
            
            section = section.replace('{{fields}}',_fields);
            section = section.replace('{{section-number}}','section-' + i);
            record_display += section;
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
        
        var section_template = Templates.view_section;
        var section_template_without_heading = Templates.view_section_without_heading;
        var field_template = Templates.field_view_readonly;
        
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
                            //alert(Context.timezone);

                            fieldValue = TimezoneDatabase.formatDatetimeToLocal(fieldValue, Context.timezone);
                            fieldValue = fieldValue.replace('T',' ');
                            //alert(fieldValue);
                        }
                        break;
                    case 'date':
                        if(fieldValue != null){
                            fieldValue = TimezoneDatabase.formatDateToLocal(fieldValue, Context.timezone);
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
                
                if(fieldValue == null || fieldValue == undefined){
                    fieldValue = '<br/>';
                }
                
                _field = _field.replace('{{field-value}}', fieldValue);
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
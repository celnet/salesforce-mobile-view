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
            } else {
                record.layout = AjaxResponses.layout;
                record.processed = AjaxHandlers.layout(record.layout.detailLayoutSections);
            }
            
            processLayoutDisplay(record.processed, record.welink_processed, (AjaxResponses.welinklayout != null));
            View.stopLoading('jqm-record');
        });
    }
    
    function processFieldDisplay(fieldName, fieldComponent, isWelinkLayout){
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
        var currencyIsoCode = fieldValue.CurrencyIsoCode || '';
        var field_template = Templates.field_view_readonly;
        
        var _field = field_template.replace('{{field-label}}',fieldLabel);
        
        if(fieldValue != null)
        switch(fieldType){
            case 'reference':
                if(refValue[fieldName] != null){
                    fieldValue = refValue[fieldName].Name || '';
                } else {
                    fieldValue = '';
                }
                
                if(setup_objects.indexOf(fieldReferenceTos[0]) < 0 || fieldReferenceTos[0] == 'User'){
                    fieldValue = '<a data-role="none" data-ajax="false" href="/apex/DP?mode=view&sobject=' + fieldReferenceTos[0] + '&id=' + fieldValue + '&crossref=true' + '&listviewid=' + params.listviewid + '">' + fieldValue + '</a>';
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
    
    function processLayoutDisplay(processedLayout, welinkProcessedLayout, isWelinkLayout){
        var section_template = Templates.view_section;
        var section_template_without_heading = Templates.view_section_without_heading;
        var record_display;
        
        if(isWelinkLayout){
            var wpl = record.welink_processed;
            
            for(var i = 0; i < wpl.length;i++){
                var fields = '';
                for(var j = 0; j < wpl[i].fields.length; j++){
                    fields += processFieldDisplay(wpl[i].fields[j].field, null, true);
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
                    fields += processFieldDisplay(pl[i].rows[j].layoutComponents[0].details.Name,pl[i].rows[j].layoutComponents[0],false);
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
    }
 /*
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
        Styles.styleView();
    }
*/
/*
    function displayWelinkLayout(){
        
        var section_template = Templates.view_section;
        var section_template_without_heading = Templates.view_section_without_heading;
        //var field_template = Templates.field_view_readonly;
        
        var record_display = '';
        var _p_tmp = record.welink_processed;
        
        for(var i = 0; i < _p_tmp.length;i++){

            var _fields = '';
            for(var j = 0; j < _p_tmp[i].fields.length; j++){
                var fieldDescribe = sobject.fields[fieldName].describe;
                var fieldName = _p_tmp[i].fields[j].field;
                var fieldLabel = sobject.fields[fieldName].describe.label;
                var fieldType = sobject.fields[fieldName].describe.type;
                var fieldValue = record.detail[fieldName];
                var fieldReferenceTos = fieldDescribe.referenceTo[0];
                var refValue = record.references[fieldName];
                var currencyIsoCode = fieldValue.CurrencyIsoCode;
                var field_template = Templates.field_view_readonly;
                
                
                if(sobject.fields[fieldName] == undefined)
                    continue;

                var _field = field_template.replace('{{field-label}}',fieldLabel);
                
                if(fieldValue != null)
                switch(fieldType){
                    case 'reference':
                        if(refValue != null){
                            fieldValue = refValue.Name || '';
                        } else {
                            fieldValue = '';
                        }

                        if(setup_objects.indexOf(fieldReferenceTos[0]) < 0 || fieldReferenceTos[0] == 'User'){
                            fieldValue = '<a data-role="none" data-ajax="false" href="/apex/DP?mode=view&sobject=' + fieldReferenceTos[0] + '&id=' + fieldValue + '&crossref=true' + '&listviewid=' + params.listviewid + '">' + fieldValue + '</a>';
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
                            fieldValue = '<img src="/img/checkbox_checked.gif" alt="true"/>';
                        } else {
                            fieldValue = '<img src="/img/checkbox_unchecked.gif" alt="false" />';
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
            if(_p_tmp[i].detailHeading && _p_tmp[i].fields.length > 0){
                section = section_template.replace('{{section-title}}', _p_tmp[i].label);
            } else {
                section = section_template_without_heading;
            }
            
            section = section.replace('{{fields}}',_fields);
            section = section.replace('{{section-number}}','section-' + i);
            record_display += section;
        }
        
        document.querySelector('#field-container').innerHTML = record_display;
        Styles.styleView();
    }
*/
    return {
        retrieveSobjectData:retrieveSobjectData
    };
};
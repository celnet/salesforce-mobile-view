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
                renderLayout(record.processed, record.welink_processed, 'new', (record.welink_processed != null && record.welink_processed.length > 0));
                break;
            default: // has given record type, direct to next step
                AjaxHandlers.recordTypes();
                AjaxHandlers.businessProcesses();
                getLayoutByRecordType(record.recordtypeid);
                renderLayout(record.processed, record.welink_processed, 'new', (record.welink_processed != null && record.welink_processed.length > 0));
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
                renderLayout(record.processed, record.welink_processed, 'new', (record.welink_processed != null && record.welink_processed.length > 0));
                View.stopLoading('jqm-record');
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

    function renderLayout(processedLayout, welinkProcessedLayout, newOrUpdate, isWelinkLayout){
        /*
        var section_template = templates.section;
        var section_template_without_heading = templates.section_without_heading;
        var record_display = '';

        var _processed;
        if(record.welink_processed != null && record.welink_processed.length > 0){
            _processed = record.welink_processed;
            for(var i = 0; i < _processed.length;i++){
                if(_processed[i].fields.length > 0){
                    var _fields = '';
                    for(var j = 0; j < _processed[i].fields.length; j++){
                        _fields += FieldRenderer.processFieldDisplay(_processed[i].fields[j].field, null, 'new', true);
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
            }
        } else {
            _processed = record.processed;
            for(var i = 0; i < _processed.length;i++){
                var _fields = '';
                for(var j = 0; j < _processed[i].rows.length; j++){
                    _fields += FieldRenderer.processFieldDisplay(null, _processed[i].rows[j], 'new', false);
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
        */
        var record_display = FieldRenderer.processLayoutDisplay(processedLayout, welinkProcessedLayout, newOrUpdate, isWelinkLayout);
        
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

        // 分割线改为点线
        $j('.ui-field-contain').css('border-bottom-style','dashed');
    }

    return {
        retrieveSobjectData:retrieveSobjectData,
        selectRecordType:selectRecordType,
        renderRecordTypeSelect:renderRecordTypeSelect
    };
};
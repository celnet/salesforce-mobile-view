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
        var record_display = FieldRenderer.processLayoutDisplay(processedLayout, welinkProcessedLayout, newOrUpdate, isWelinkLayout);
        document.querySelector('#field-container').innerHTML = record_display;
        
        $j('input[type="search"]').bind('click',function(){
            Lookup.popup(this,'jqm-record');
        });
        
        Styles.styleEdit();
    }

    return {
        retrieveSobjectData:retrieveSobjectData,
        selectRecordType:selectRecordType,
        renderRecordTypeSelect:renderRecordTypeSelect
    };
};
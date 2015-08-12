var initRecordNew = function(){
    function retrieveSobjectData(){
        handleSobjectLayouts();
        //checkRecordType();
    }
    
    function handleSobjectLayouts(){
        var layoutsResponse = AjaxResponses.layouts;
        
        if(layoutsResponse.layouts != null && layoutsResponse.layouts.length > 0){
            // 判断条件没有文档参考，凭感觉认为 layouts 为空，则有 Record Type
            sobject.hasRecordType = false;
        } else {
            sobject.hasRecordType = true;
            for(var i = 0; i < layoutsResponse.recordTypeMappings.length; i++){
                if(layoutsResponse.recordTypeMappings[i].defaultRecordTypeMapping){
                    sobject.defaultRecordType = layoutsResponse.recordTypeMappings[i];
                    break;
                }
            }
        }
        
        if(sobject.hasRecordType){
            if(params.recordtypeid === '' && layoutsResponse.recordTypeSelectorRequired.length > 0 && layoutsResponse.recordTypeSelectorRequired[0]){
                renderRecordTypeSelect();
            } else {
                record.recordtypeid = params.recordtypeid || sobject.defaultRecordType.recordTypeId;
                AjaxHandlers.recordTypes();
                AjaxHandlers.businessProcesses();
                getLayoutByRecordType(record.recordtypeid);
                FieldRenderer.processLayoutDisplay(record.edit_processed, record.welink_processed, 'new', (record.welink_processed != null && record.welink_processed.length > 0));
            }
        } else {
            sobject.layout = layoutsResponse.layouts[0];
            record.edit_processed = AjaxHandlers.layout(sobject.layout.editLayoutSections);
            
            getLayoutByRecordType('');
            FieldRenderer.processLayoutDisplay(record.edit_processed, record.welink_processed, 'new', (record.welink_processed != null && record.welink_processed.length > 0));
            View.stopLoading('jqm-record');
        }
        /*
        switch(true){
            case (layoutsResponse.layouts != null && layoutsResponse.layouts.length > 0):
                console.log('no recordtype, no recordtype select needed');
                sobject.layout = layoutsResponse.layouts[0];
                record.processed = AjaxHandlers.layout(sobject.layout.editLayoutSections);//processLayoutSection();
                
                getLayoutByRecordType('');
                FieldRenderer.processLayoutDisplay(record.processed, record.welink_processed, 'new', (record.welink_processed != null && record.welink_processed.length > 0));
                View.stopLoading('jqm-record');
                
                break;
            case (layoutsResponse.recordTypeSelectorRequired.length > 0 && !layoutsResponse.recordTypeSelectorRequired[0]):
                console.log('use default recordtype, no recordtype select needed');
                for(i = 0; i < layoutsResponse.recordTypeMappings.length; i++){
                    if(layoutsResponse.recordTypeMappings[i].defaultRecordTypeMapping){
                        record.recordtypeid = layoutsResponse.recordTypeMappings[i].recordTypeId;
                        record.recordtypename = layoutsResponse.recordTypeMappings[i].name;
                        break;
                    }
                }
                
                AjaxHandlers.recordTypes();
                AjaxHandlers.businessProcesses();
                getLayoutByRecordType(record.recordtypeid);
                FieldRenderer.processLayoutDisplay(record.processed, record.welink_processed, 'new', (record.welink_processed != null && record.welink_processed.length > 0));
                
                break;
            default:
                console.log('has recordtypes, recordtype select needed');
                record.recordtypeid = 'pending select';
                renderRecordTypeSelect();
        }
        */
    }
    /*
    function checkRecordType(){
        
        if(sobject.hasRecordType){
            
        } else {
            getLayoutByRecordType('');
            FieldRenderer.processLayoutDisplay(record.processed, record.welink_processed, 'new', (record.welink_processed != null && record.welink_processed.length > 0));
            View.stopLoading('jqm-record');
        }
        
        switch(record.recordtypeid){
            case 'pending select': // has record types pending selection
                renderRecordTypeSelect();
                break;
            case '': // has no record type, direct to next step
                getLayoutByRecordType('');
                FieldRenderer.processLayoutDisplay(record.processed, record.welink_processed, 'new', (record.welink_processed != null && record.welink_processed.length > 0));
                View.stopLoading('jqm-record');
                break;
            default: // has given record type, direct to next step
                AjaxHandlers.recordTypes();
                AjaxHandlers.businessProcesses();
                getLayoutByRecordType(record.recordtypeid);
                FieldRenderer.processLayoutDisplay(record.processed, record.welink_processed, 'new', (record.welink_processed != null && record.welink_processed.length > 0));
        }
    }
*/
    function renderRecordTypeSelect(){
        var recordtype_mappings = AjaxResponses.layouts.recordTypeMappings;
        var recordtype_options = '';
        var has_default = false;
        for (var i = 0; i < recordtype_mappings.length - 1; i++) {
            var option = Templates.option.replace('{{option-label}}',recordtype_mappings[i].name).replace('{{option-value}}',recordtype_mappings[i].recordTypeId);
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
            recordtype_options = '<option value="--None--">--' + Context.labels.select_none + '--</option>' + recordtype_options;
        }

        var recordtype_select = Templates.recordtype_select.replace('{{options}}',recordtype_options).replace('{{label}}',Context.labels.select_recordtype);
        document.querySelector('#field-container').innerHTML = recordtype_select;

        $j('select').selectmenu();
        $j('input[type="button"]').button();

        document.querySelector('#jqm-header-left-button').href = 'javascript:UserAction.cancel()';
        View.stopLoading('jqm-record');
        document.querySelector('#jqm-header-right-button').href = 'javascript:RecordNew.selectRecordType()';
    }

    function selectRecordType(){
        var recordtype_options = document.querySelectorAll('#recordtype option');
        for(var i = 0; i < recordtype_options.length; i++){
            if(recordtype_options[i].selected && recordtype_options[i].value != '--None--'){
                View.animateLoading(Context.labels.loading,'jqm-record');
                document.querySelector('#jqm-header-left-button').href='javascript:RecordNew.renderRecordTypeSelect()';
                document.querySelector('#jqm-header-right-button').href = 'javascript:UserAction.saveRecord()';
                record.recordtypeid = recordtype_options[i].value;
                record.recordtypename = recordtype_options[i].label;
                
                AjaxHandlers.recordTypes();
                AjaxHandlers.businessProcesses();
                getLayoutByRecordType(record.recordtypeid);
                FieldRenderer.processLayoutDisplay(record.processed, record.welink_processed, 'new', (record.welink_processed != null && record.welink_processed.length > 0));
                View.stopLoading('jqm-record');
            }
        }
    }
    
    function getLayoutByRecordType(recordTypeId){
        if(recordTypeId == null || recordTypeId == ''){
            recordTypeId = 'norecordtype';
        }
        if(AjaxResponses.welinklayouts != null && AjaxResponses.welinklayouts[recordTypeId] != null){
            AjaxResponses.welinklayout = AjaxResponses.welinklayouts[recordTypeId];
            sobject.welink_layout = AjaxResponses.welinklayout.Metadata;
            record.welink_processed = AjaxHandlers.welinklayout();
        } else {
            AjaxResponses.layout = AjaxResponses.layoutsMapping[recordTypeId];
            sobject.layout = AjaxResponses.layout;
            record.processed = AjaxHandlers.layout(sobject.layout.editLayoutSections);
        }
    }
    
    return {
        retrieveSobjectData:retrieveSobjectData,
        selectRecordType:selectRecordType,
        renderRecordTypeSelect:renderRecordTypeSelect
    };
};
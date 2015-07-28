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

        if(AjaxResponses.welinklayout != null){
            sobject.welink_layout = AjaxResponses.welinklayout.Metadata;
        }
        
        record.layout = AjaxResponses.layout;

        if(sobject.welink_layout != null){
            record.welink_processed = AjaxHandlers.welinklayout();
        } else {
            record.processed = AjaxHandlers.layout(record.layout.editLayoutSections);
        }

        displayLayout(record.processed, record.welink_processed, 'update', (sobject.welink_layout != null));
        View.stopLoading('jqm-record');
    }
    
    function displayLayout(processedLayout, welinkProcessedLayout, newOrUpdate, isWelinkLayout){
        var record_display = FieldRenderer.processLayoutDisplay(processedLayout, welinkProcessedLayout, newOrUpdate, isWelinkLayout);
        
        document.querySelector('#field-container').innerHTML = record_display;
        
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
    }

    return {
        retrieveSobjectData:retrieveSobjectData
    };
};
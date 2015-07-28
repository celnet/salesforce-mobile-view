var renderRecordEdit = function(){
    RecordEdit = initRecordEdit();

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
        /*
        var section_template = templates.section;
        var section_template_without_heading = templates.section_without_heading;
        var record_display = '';
        
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
                    record_display += section;
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
                    record_display += section;
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
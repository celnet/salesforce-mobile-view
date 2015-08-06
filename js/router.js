var route = function(){
    getParams();

    switch(params.mode.toLowerCase()){
        case 'list':
            renderListView();
            break;
        case 'view':
            renderRecordView();
            break;
        case 'edit':
            renderRecordEdit();
            break;
        case 'new':
            renderRecordNew();
            break;
        default:
            console.log('test');
    }
};

var renderRecordEdit = function(){
    document.querySelector('body').innerHTML = Templates.record_page_structure + Templates.page_lookup;

    document.querySelector('#jqm-header-left-button')['href'] = 'javascript:UserAction.cancel()';
    document.querySelector('#jqm-header-right-button')['href'] = 'javascript:UserAction.saveRecord()';
    document.querySelector('#jqm-header-left-button').innerHTML = Context.labels.cancel;
    document.querySelector('#jqm-header-right-button').innerHTML = Context.labels.save;
    document.querySelector('#jqm-header-left-button').classList.add('ui-icon-back');
    document.querySelector('#jqm-header-right-button').classList.add('ui-icon-check');

    $j.mobile.initializePage();
    Styles.tunePageStyle();

    View.animateLoading(Context.labels.loading,'jqm-record');
    AjaxPools.retrieveSobjectRelated(sobject.name, function(){
        AjaxHandlers.describe();
        
        if(AjaxResponses.has_retrieved_record_related){
            AjaxHandlers.processRecordRelated();
        
            FieldRenderer.processLayoutDisplay(record.processed, record.welink_processed, 'update', (sobject.welink_layout != null));
            View.stopLoading('jqm-record');
        } else {
            AjaxPools.retrieveRecordRelated(sobject.name, record.id, function(){
                AjaxHandlers.handleReferenceFields(sobject.name, record.id);
                AjaxHandlers.processRecordRelated();
        
                FieldRenderer.processLayoutDisplay(record.processed, record.welink_processed, 'update', (sobject.welink_layout != null));
                View.stopLoading('jqm-record');
            });
        }
    });
};

var renderListView = function(){
    ListView = initListView();

    document.querySelector('body').innerHTML = Templates.listview_page_structure;

    document.querySelector('#jqm-header-left-button')['href'] = '';
    document.querySelector('#jqm-header-right-button')['href'] = "javascript:UserAction.newRecord('jqm-list')";

    document.querySelector('#jqm-header-left-button').innerHTML = '';
    document.querySelector('#jqm-header-right-button').innerHTML = '';
    
    document.querySelector('#jqm-header-right-button').classList.add('ui-icon-plus');

    $j.mobile.initializePage();
    Styles.tunePageStyle();

    View.animateLoading(Context.labels.loading,'jqm-list');
    AjaxPools.retrieveSobjectRelated(sobject.name, function(){
        AjaxHandlers.describe();
        ListView.retrieveSobjectData();
    });
};

var renderRecordNew = function(){
    RecordNew = initRecordNew();
    
    document.querySelector('body').innerHTML = Templates.record_page_structure + Templates.page_lookup;
    
    document.querySelector('#jqm-page-title').innerHTML = Context.labels.new;
    document.title = sobject.describe.label;
    document.querySelector('#jqm-header-left-button')['href'] = 'javascript:UserAction.cancel()';
    document.querySelector('#jqm-header-right-button')['href'] = 'javascript:UserAction.saveRecord()';
    document.querySelector('#jqm-header-left-button').innerHTML = Context.labels.cancel;
    document.querySelector('#jqm-header-right-button').innerHTML = Context.labels.save;
    document.querySelector('#jqm-header-left-button').classList.add('ui-icon-back');
    document.querySelector('#jqm-header-right-button').classList.add('ui-icon-check');

    
    $j.mobile.initializePage();
    Styles.tunePageStyle();
    
    View.animateLoading(Context.labels.loading,'jqm-record');
    AjaxPools.retrieveSobjectRelated(sobject.name, function(){
        AjaxHandlers.describe();
        RecordNew.retrieveSobjectData();
    });
};

var renderRecordView = function(){
    document.querySelector('body').innerHTML = Templates.record_page_structure;

    document.querySelector('#jqm-header-left-button')['href'] = "javascript:UserAction.viewList('jqm-record')";
    document.querySelector('#jqm-header-right-button')['href'] = "javascript:UserAction.editRecord('jqm-record')";
    document.querySelector('#jqm-header-left-button').innerHTML = Context.labels.list;
    document.querySelector('#jqm-header-right-button').innerHTML = Context.labels.edit;
    document.querySelector('#jqm-header-left-button').classList.add('ui-icon-bars');
    document.querySelector('#jqm-header-right-button').classList.add('ui-icon-edit');

    if(params.crossref == 'true'){
        document.querySelector('#jqm-header-left-button').href = 'javascript:window.history.back()';
        document.querySelector('#jqm-header-left-button').innerHTML = Context.labels.back;
        document.querySelector('#jqm-header-left-button').classList.remove('ui-icon-bars');
        document.querySelector('#jqm-header-left-button').classList.add('ui-icon-back');
    }

    if(setup_objects.indexOf(sobject.name) > 0){
        $j('#jqm-header-right-button').remove();
    }

    $j.mobile.initializePage();
    Styles.tunePageStyle();

    View.animateLoading(Context.labels.loading,'jqm-record');

    AjaxPools.retrieveSobjectRelated(sobject.name, function(){
        AjaxHandlers.describe();
        AjaxPools.retrieveRecordRelated(sobject.name, record.id, function(){
            AjaxHandlers.handleReferenceFields(sobject.name, record.id);
            AjaxHandlers.processRecordRelated();
            
            FieldRenderer.processViewLayoutDisplay(record.processed, record.welink_processed, (AjaxResponses.welinklayout != null));
            View.stopLoading('jqm-record');
        });
    });
};
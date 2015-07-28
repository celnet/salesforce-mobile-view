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
};

var renderListView = function(){
    ListView = initListView();

    document.querySelector('body').innerHTML = templates.listview_page_structure;

    document.querySelector('#jqm-header-left-button')['href'] = '';
    document.querySelector('#jqm-header-right-button')['href'] = "javascript:UserAction.newRecord('jqm-list')";

    document.querySelector('#jqm-header-left-button').innerHTML = '';
    document.querySelector('#jqm-header-right-button').innerHTML = '';

    $j.mobile.initializePage();
    Styles.tunePageStyle();

    View.animateLoading(context.labels.loading,'jqm-list');
    AjaxPools.retrieveSobjectRelated(sobject.name, function(){
        AjaxHandlers.describe();
        ListView.retrieveSobjectData();
    });
};

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
};

var renderRecordView = function(){
    RecordView = initRecordView();
    document.querySelector('body').innerHTML = templates.record_page_structure;

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
};
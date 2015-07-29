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
    
    var headerConfig = {
        left:{
            href:'javascript:UserAction.cancel()',
            text:Context.labels.cancel,
            iconClass:'ui-icon-back'
        },
        right:{
            href:'javascript:UserAction.saveRecord()',
            text:Context.labels.save,
            iconClass:'ui-icon-check'
        }
    };

    $j.mobile.initializePage();
    Styles.styleJQMPage(headerConfig);

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
    
    var headerConfig = {
        left:{
            href:'',
            text:'',
            iconClass:''
        },
        right:{
            href:"javascript:UserAction.newRecord('jqm-list')",
            text:'',
            iconClass:'ui-icon-plus'
        }
    };

    $j.mobile.initializePage();
    Styles.styleJQMPage(headerConfig);

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
    
    var headerConfig = {
        left:{
            href:'javascript:UserAction.cancel()',
            text:Context.labels.cancel,
            iconClass:'ui-icon-back'
        },
        right:{
            href:"javascript:UserAction.saveRecord()",
            text:Context.labels.save,
            iconClass:'ui-icon-check'
        }
    };
    
    $j.mobile.initializePage();
    Styles.styleJQMPage(headerConfig);
    
    View.animateLoading(Context.labels.loading,'jqm-record');
    AjaxPools.retrieveSobjectRelated(sobject.name, function(){
        AjaxHandlers.describe();
        RecordNew.retrieveSobjectData();
    });
};

var renderRecordView = function(){
    document.querySelector('body').innerHTML = Templates.record_page_structure;
    
    var headerConfig = {
        left:{
            href:"javascript:UserAction.viewList('jqm-record')",
            text:Context.labels.list,
            iconClass:'ui-icon-bars'
        },
        right:{
            href:"javascript:UserAction.editRecord('jqm-record')",
            text:Context.labels.edit,
            iconClass:'ui-icon-edit'
        }
    };
    
    if(params.crossref == 'true'){
        headerConfig.left = {
            href:"javascript:window.history.back()",
            text:Context.labels.back,
            iconClass:'ui-icon-back'
        };
    }

    if(setup_objects.indexOf(sobject.name) > 0){
        //$j('#jqm-header-right-button').remove();
        headerConfig.right = {
            href:"",
            text:'',
            iconClass:''
        };
    }

    $j.mobile.initializePage();
    Styles.styleJQMPage(headerConfig);

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
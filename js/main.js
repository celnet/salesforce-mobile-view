window.addEventListener('DOMContentLoaded', function(){
    getTemplates();
    
    if(window.location.search.indexOf('sobject') < 0){
        window.history.replaceState('ListView','ListView','DP?mode=list&sobject=Opportunity&listviewid=recentlyviewed');
        route();
    } else if(window.location.search.indexOf('sobject') > -1 && window.location.search.indexOf('mode') < 0){
        window.history.replaceState('DPListView','DPListView','DP' + window.location.search + '&mode=list');
        route();
    } else if(window.location.search.indexOf('mode=list') > -1 && window.location.search.indexOf('listviewid') < 0){
        window.history.replaceState('ListView','ListView','DP' + window.location.search + '&listviewid=recentlyviewed');
        route();
    } else {
        route();
    }
},false);
    
var welinkStorage = window.localStorage || {};
var RecordNew,RecordEdit,RecordView,ListView;

window.onpopstate = function(event){
    route();
    event.preventDefault();
};

var getParams = function(){
    var query_strings = window.location.search.substr(1).split('&');
    
    for(var i = 0; i < query_strings.length; i++){
        var keyvalue = query_strings[i].split('=');
        params[keyvalue[0].toLowerCase()] = keyvalue[1];
    }

    sobject.name = params.sobject;
    record.id = params.id;
    if(params.listviewid==''){
        params.listviewid='recentlyviewed';
    }

    if(/Android/i.test(navigator.userAgent)){
        Context.device_type = 'Android';
    } else if(/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        Context.device_type = 'iPhone';
    }
};

var UserAction = {
    selectListView:function(){

    }, // loading

    newRecord:function(current_jqm_page_id){
        View.animateLoading(Context.labels.loading,current_jqm_page_id);
        window.history.pushState('DPRecordNew','DPRecordNew','DP?mode=new&sobject=' + sobject.name);
        route();
    }, // no loading

    selectRecordType:function(){

    }, // loading
    
    viewRecord:function(jqmPageId, sobjectName, recordId){
        View.animateLoading(Context.labels.loading, jqmPageId);
        window.history.pushState('DPRecordView','DPRecordView','DP?mode=view&sobject=' + sobjectName + '&id=' + recordId + '&listviewid=' + params.listviewid);
        route();
    }, // loading
    
    viewList:function(current_jqm_page_id){
        View.animateLoading(Context.labels.loading, current_jqm_page_id);
        window.history.pushState('DPListView','DPListView','DP?mode=list&sobject=' + sobject.name + '&listviewid=' + params.listviewid);
        route();
    }, // loading

    editRecord:function(current_jqm_page_id){
        View.animateLoading(Context.labels.loading, current_jqm_page_id);
        window.history.pushState('DPRecordEdit','DPRecordEdit','DP?mode=edit&sobject=' + sobject.name + '&id=' + record.id + '&listviewid=' + params.listviewid);
        route();
    }, // no loading

    saveRecord:function(){
        var form_dataset = RecordForm.construct();
        if(form_dataset != '')
        RecordForm.save(form_dataset);
    }, // loading

    cancel:function(){
        window.history.back();
    } // no loading
};

    var 
        View = {
            fieldEdit:function(){

            },

            fieldView:function(){

            },
            
            setTitle:function(jqmTitle, docTitle){
                document.querySelector('#jqm-page-title').innerHTML = jqmTitle;
                
                var $body = $j('body');
                document.title = docTitle;
        
                var $iframe = $j('<iframe src="/favicon.ico" style="border-width:0;"></iframe>').on('load', function() {
                    setTimeout(function() {
                        $iframe.off('load').remove();
                    }, 0)
                }).appendTo($body);
            },

            animateLoading:function(loading_text, jqm_page_id){
                document.querySelector('#' + jqm_page_id).classList.add('ui-state-disabled');
                var loading_image_src = Context.images.welink_logo;
                
                $j.mobile.loading( 'show', {
                    text: loading_text,
                    textVisible: true,
                    theme: 'a',
                    textonly: false,
                    html: '<div style="text-align:center;font-size:1em;font-weight:bold;" ><img src="' + loading_image_src + '" width="100px"/><br/><span>' + loading_text + '</span></div>'
                });
                
                document.querySelector('.ui-body-a').classList.remove('ui-body-a');
            },

            stopLoading:function(jqm_page_id){
                $j.mobile.loading( 'hide');
                document.querySelector('#' + jqm_page_id).classList.remove('ui-state-disabled');
            }
        };
var Lookup = {
    popup:function(triggered_element, target_page_id){
        processing.page_scroll_y = window.scrollY;
        
        $j.mobile.pageContainer.pagecontainer('change','#lookup-search-page',{transition:'none',changeHash:false});
        View.animateLoading(context.labels.loading,'lookup-search-page');
        var field_name = triggered_element.id.substr(13);
        var ref_type = document.querySelector('#' + triggered_element.id + '-sobject-type').value;

        document.querySelector('#jqm-lookup-header-right-button')['href'] = 'javascript:Lookup.search("' + field_name + '","' + ref_type + '","' + target_page_id + '")';
        document.querySelector('#jqm-lookup-header-left-button')['href'] = 'javascript:Lookup.cancel("' + field_name + '","' + target_page_id + '")';

        document.querySelector('#jqm-lookup-header-right-button').innerHTML = context.labels.search;
        document.querySelector('#jqm-lookup-header-left-button').innerHTML = context.labels.cancel;

        document.querySelector('#lookup-record-list').innerHTML = '<div style="text-align:center;padding:10px;">' + context.labels.search_tip + '</div>';

        document.querySelector('#lookup-search-box').parentNode.style.marginTop = '3px';
        document.querySelector('#lookup-search-box').parentNode.style.marginBottom = '3px';
        document.querySelector('#lookup-search-box')['value'] = ''; // 清空 value

        document.querySelector('#lookup-search-box')['placeholder'] = sobject.fields[field_name].describe.label;

        Ajax.get(
            "/query?q=Select+Id,Name+From+RecentlyViewed+Where+Type='" + ref_type + "'+Order+By+LastViewedDate+desc", 
            function(response){
                var lookup_recentlyviewed = response.records;

                var record_items = '';
                for(var i = 0; i < lookup_recentlyviewed.length; i++){
                    var record_item = templates.lookup_field;
                    record_item = record_item.replace(/{{jqm-page}}/g,target_page_id);
                    record_item = record_item.replace(/{{record-name}}/g,lookup_recentlyviewed[i].Name);
                    record_item = record_item.replace(/{{field-name}}/g,field_name);
                    record_item = record_item.replace(/{{record-id}}/g,lookup_recentlyviewed[i].Id);
                    
                    record_items += record_item;
                    
                }

                if(record_items == ''){
                    record_items = '<div style="text-align:center;padding:10px;">' + context.labels.search_tip + '</div>';
                }
                
                document.querySelector('#lookup-record-list').innerHTML = record_items;
                
                $j('#lookup-record-list li a').addClass('ui-btn');
                //$j('#lookup-record-list').listview();
                View.stopLoading('lookup-search-page');
            }
        );
    },

    search:function(field_name, ref_type, target_page_id){
        View.animateLoading(context.labels.loading,'lookup-search-page');
        var keyword = document.querySelector('#lookup-search-box').value;
        
        Ajax.get(
            "/query?q=Select+Id,Name+From+" + ref_type + "+Where+Name+Like+'%25" + keyword + "%25'",
            function(response){
                var _lookup_records = response.records;
                
                var _record_items = '';
                var _lookup_records_length = _lookup_records.length;// > 10?10:_lookup_records.length;
                for(var i = 0; i < _lookup_records_length; i++){
                    var _record_item = templates.lookup_field;
                    _record_item = _record_item.replace(/{{jqm-page}}/g,target_page_id);
                    _record_item = _record_item.replace(/{{record-name}}/g,_lookup_records[i].Name);
                    _record_item = _record_item.replace(/{{field-name}}/g,field_name);
                    _record_item = _record_item.replace(/{{record-id}}/g,_lookup_records[i].Id);
                    
                    _record_items += _record_item;
                    
                }

                if(_record_items == ''){
                    _record_items = '<div style="text-align:center;padding:10px;">' + context.labels.no_record + '</div>';
                }
                
                document.querySelector('#lookup-record-list').innerHTML = _record_items;
                
                $j('#lookup-record-list li a').addClass('ui-btn');
                //$j('#lookup-record-list').listview();
                
                View.stopLoading('lookup-search-page');
            }
        );
    },

    select:function(field_name, record_name, record_id, target_page_id){
        document.querySelector('#record-field-' + field_name).value = record_name;
        document.querySelector('#record-field-' + field_name + '-hidden').value = record_id;
        $j.mobile.pageContainer.pagecontainer({
            transition:function(event, ui){
                document.body.scrollTop = processing.page_scroll_y;
            }
        });
        $j.mobile.pageContainer.pagecontainer('change','#' + target_page_id,{transition:'none',changeHash:false});
    },

    cancel:function(field_name, target_page_id){
        $j.mobile.pageContainer.pagecontainer({
            transition:function(event, ui){
                document.body.scrollTop = processing.page_scroll_y;
            }
        });
        $j.mobile.pageContainer.pagecontainer('change','#' + target_page_id,{transition:'none',changeHash:false});
    }
};
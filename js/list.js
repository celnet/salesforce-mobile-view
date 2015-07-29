var initListView = function(){

    function retrieveSobjectData(){
        View.setTitle(Context.labels.listview, sobject.describe.label);
        var searchLayoutFields = AjaxResponses.searchlayout[0].searchColumns;
        handleOrderedListViews();

        if(params.listviewid != 'recentlyviewed'){
            AjaxPools.retrieveSelectedListView(sobject.name, params.listviewid, function(){
                var response = AjaxResponses.listviews[params.listviewid].describe;
                for (var i = response.columns.length - 1; i >= 0; i--) {
                    listview.recordType[response.columns[i].fieldNameOrPath] = response.columns[i].type;
                    listview.recordLabel[response.columns[i].fieldNameOrPath] = response.columns[i].label;
                };

                listview.queryresult = AjaxResponses.listviews[params.listviewid].result;
                renderListViewSelects();
                renderListViewResultList(25);
                View.stopLoading('jqm-list');
            });
        } else {
            AjaxPools.retrieveRecentlyViewed(searchLayoutFields, sobject.name, function(){
                sobject.recentlyviewed = AjaxResponses.recentlyviewedwithfields;

                renderListViewSelects();
                renderRecentlyViewedList();
                View.stopLoading('jqm-list');
            });
        } 
    }

    function handleOrderedListViews(){
        var listviewsMap = {};
        for (var i = 0; i < AjaxResponses.listviews.listviews.length; i++) {
            listviewsMap[AjaxResponses.listviews.listviews[i].id] = AjaxResponses.listviews.listviews[i];
        };
        
        var orderedListviews = AjaxResponses.orderedListviews;

        sobject.ordered_listviews = [];
        
        if(orderedListviews == null){
            sobject.ordered_listviews = AjaxResponses.listviews.listviews;
            return;
        }
        
        var ordered_listview_ids = [];

        for (var i = 0; i < orderedListviews.filteredByMy.length; i++) {
            if(orderedListviews.filteredByMy[i] != ''){
                ordered_listview_ids.push(orderedListviews.filteredByMy[i]);
            }
        };

        for (var i = 0; i < orderedListviews.visibleToMe.length; i++) {
            if(orderedListviews.visibleToMe[i] != ''){
                ordered_listview_ids.push(orderedListviews.visibleToMe[i]);
            }
        };

        for (var i = 0; i < orderedListviews.createdByMe.length; i++) {
            if(orderedListviews.createdByMe[i] != ''){
                ordered_listview_ids.push(orderedListviews.createdByMe[i]);
            }
        };

        for (var i = 0; i < AjaxResponses.listviews.listviews.length; i++) {
            if(ordered_listview_ids.indexOf(AjaxResponses.listviews.listviews[i].id) < 0){
                ordered_listview_ids.push(AjaxResponses.listviews.listviews[i].id);
            }
        };

        for (var i = 0; i < ordered_listview_ids.length; i++) {
            sobject.ordered_listviews.push(listviewsMap[ordered_listview_ids[i]]);
        };
    }

    function selectListView(){
        var selected_option_id;
        
        var all_options = document.querySelectorAll('#listviewlist option');
        
        for(var i = 0; i < all_options.length; i++){
            if(all_options[i].selected){
                selected_option_id = all_options[i].value;
                break;
            }
        }

        if(selected_option_id == 'chooselistview'){
            params.listviewid = 'recentlyviewed';
            window.history.replaceState('DPListView','DPListView','DP?mode=list&sobject=' + sobject.name + '&listviewid=recentlyviewed');
            
            if(AjaxResponses.recentlyviewedwithfields != null){
                renderRecentlyViewedList();
            } else {
                View.animateLoading(Context.labels.loading, 'jqm-list');
                AjaxPools.retrieveRecentlyViewed(sobject.name, function(){
                    sobject.recentlyviewed = AjaxResponses.recentlyviewedwithfields;
                    
                    renderRecentlyViewedList();
                    View.stopLoading('jqm-list');
                });
            }
        } else {
            selected_option_id = selected_option_id.substr(0,15);
            params.listviewid = selected_option_id;

            window.history.replaceState('DPListView','DPListView','DP?mode=list&sobject=' + sobject.name + '&listviewid=' + selected_option_id);
            
            View.animateLoading(Context.labels.loading,'jqm-list');
            
            AjaxPools.retrieveSelectedListView(sobject.name, selected_option_id, function(){
                
                var response = AjaxResponses.listviews[selected_option_id].describe;
                for (var i = response.columns.length - 1; i >= 0; i--) {
                    listview.recordType[response.columns[i].fieldNameOrPath] = response.columns[i].type;
                    listview.recordLabel[response.columns[i].fieldNameOrPath] = response.columns[i].label;
                };

                listview.queryresult = AjaxResponses.listviews[selected_option_id].result;
                renderListViewResultList(25);
                View.stopLoading('jqm-list');
            });
        }
    }

    function renderListViewSelects(){
        var options = '';
        var option_template = Templates.option;

        for (var i = 0; i < sobject.ordered_listviews.length; i++) {
            var option = option_template.replace('{{option-value}}',sobject.ordered_listviews[i].id).replace('{{option-label}}',sobject.ordered_listviews[i].label);

            if(params.listviewid == sobject.ordered_listviews[i].id.substring(0,15)){
                options += option.replace('{{option-selected}}','selected');
            } else {
                options += option.replace('{{option-selected}}','');
            }
        };

        var listview_select = Templates.listview_select.replace('{{select-listview}}',Context.labels.select_listview);
        options = listview_select.replace('{{options}}',options);
        document.querySelector('#listview-picklist').innerHTML = options;
        
        $j('select').selectmenu();
    }

    function renderRecentlyViewedList(){
        var listitems = '';
        var listitem_template = Templates.listview_resultitem;
        
        var listview_results = sobject.recentlyviewed.records; 
        
        if(listview_results == undefined || listview_results.length == 0){
            document.querySelector('#listview-resultlist').innerHTML = Templates.listview_result_noitem.replace('{{no-record}}',Context.labels.no_record);
            return;
        }

        
        for (var i = listview_results.length - 1; i >= 0; i--) {
            var _fields = getRecentlyViewedItemContent(listview_results[i]);
            listitems += listitem_template.replace('{{itemname}}',listview_results[i].Name || '').replace('{{record-id}}',listview_results[i].Id).replace('{{itemfields}}',_fields).replace('{{sobject-name}}',sobject.name).replace('{{jqm-page-id}}','jqm-list');
        };
        
        listitems = Templates.listview_resultlist.replace('{{items}}',listitems);
        document.querySelector('#listview-resultlist').innerHTML = listitems;

        $j('ul').listview();
    }

    function renderListViewResultList(display_number){
        var _res = listview.queryresult;
        var listitems = '';
        var listitem_template = Templates.listview_resultitem;
        var recordType = listview.recordType;
        
        
        if(_res.records == undefined || _res.records.length == 0){
            document.querySelector('#listview-resultlist').innerHTML = Templates.listview_result_noitem.replace('{{no-record}}',Context.labels.no_record);
            
            return;
        }

        var actual_display_number = _res.records.length;
        var need_partial_loading = false;

        if(display_number < _res.records.length){
            need_partial_loading = true;
            actual_display_number = display_number;
        }

        for(var i = 0; i < actual_display_number; i++){
            var recordValue = _res.records[i];

            var __fields = '<table>';
            
            var _count = 0;
            for(var property in recordValue){
                if(_count < 5 && property != 'Name' && property != 'attributes'){
                    
                    var _record_val = recordValue[property] || '';

                    if(_record_val != '')
                    switch(recordType[property]){
                        case 'currency':
                            if(sobject.fields.CurrencyIsoCode != undefined){
                                _record_val = recordValue['CurrencyIsoCode'] + ' ' + _record_val;
                            }
                            break;
                        case 'date': // date 暂不转换时区
                            break;
                        case 'datetime':  // datetime 转换时区
                            _record_val = TimezoneDatabase.formatDatetimeToLocal(_record_val, Context.timezone);
                            _record_val = _record_val.replace('T',' ');
                            break;
                        case undefined:
                            //_record_val = _record_val[property].Alias;
                            break;
                        default:
                            console.log(recordType[property]);
                    }


                    if(typeof _record_val == 'object'){
                        var _assigned = false;
                        for(var p in _record_val){
                            if(p != 'attributes' && !_assigned){
                                property += '.';
                                property += p;
                                _record_val = _record_val[p];
                                _assigned = true;
                            }
                        }
                    }

                    __fields += '<tr>';
                    __fields += '<td>';

                    var field_label = '';

                    if(listview.recordLabel[property] == null || listview.recordLabel[property] == ''){
                        property = property + '.Name';
                    }

                    __fields += listview.recordLabel[property] || field_label;
                    __fields += ': ';
                    __fields += '</td>';
                    __fields += '<td>';
                    __fields += _record_val;
                    __fields += '</td>';
                    __fields += '</tr>';
                    _count++;
                }
            }

            __fields += '</table>';
            console.log(__fields);
            
            listitems += listitem_template.replace('{{itemname}}',recordValue.Name || '').replace('{{record-id}}',recordValue.Id).replace('{{itemfields}}',__fields).replace('{{sobject-name}}',sobject.name).replace('{{jqm-page-id}}','jqm-list');
            
        }

        if(need_partial_loading){
            listitems += '<li data-icon="false">';
            listitems += '<a href="javascript:ListView.renderListViewResultList(' + (display_number + 25) +');">';
            listitems += '<div style="font-weight:normal;"><h1 style="margin-top:0px;text-align:center;">';
            listitems += Context.labels.more;
            listitems += '</h1></div></a></li>';
        }

        listitems = Templates.listview_resultlist.replace('{{items}}',listitems);
        document.querySelector('#listview-resultlist').innerHTML = listitems;

        $j('ul').listview();
    }
    
    function getRecentlyViewedItemContent(_item){
        var searchLayoutFields = AjaxResponses.searchlayout[0].searchColumns;
        var _counter = 0;
        var _fields = '<p style="font-size:1em;">';
        
        for (var i = 0; i < searchLayoutFields.length; i++) {
            if(searchLayoutFields[i].name != 'Name' && _counter < 4){
                var fieldLabel = searchLayoutFields[i].label; // 暂不用，只显示字段值不显示标签
                var fieldValue = '';

                if(searchLayoutFields[i].name.indexOf('.') > 0){ // lookup field
                    var _name = searchLayoutFields[i].name.split('.');
                    
                    if(_item[_name[0]] != null)
                    fieldValue = _item[_name[0]][_name[1]];
                } else {
                    var _field_name = searchLayoutFields[i].name;
                    if(_field_name.indexOf('toLabel') >= 0){
                        _field_name = _field_name.substring(8,_field_name.length - 1);
                    }
                    fieldValue = _item[_field_name] || '';
                }

                var label_font = '';
                var label_font_end = '';
                
                if(fieldValue != null && fieldValue.length == 28 && fieldValue.indexOf('000+0000') > 0){
                    fieldValue = TimezoneDatabase.formatDatetimeToLocal(fieldValue, Context.timezone).replace('T',' ');
                }

                // 不显示字段标签，只显示字段值
                switch(_counter){
                    case 0:
                        var cell0 = '';
                        cell0 += fieldValue || '';
                        _fields += cell0;
                        break;
                    case 1:
                        var cell1 = '';
                        if(_fields != '<p style="font-size:1em;">'){
                            cell1 = ' | ';
                        }
                        
                        cell1 += fieldValue || '';
                        _fields += cell1 == ' | '?'':cell1;
                        break;
                    case 2:
                        var cell2 = '';
                        if(_fields != '<p style="font-size:1em;">'){
                            cell2 = '</p><p style="font-size:1em;">';
                        } 
                        cell2 += fieldValue || '';
                        _fields += cell2;
                        break;
                    case 3: 
                        var cell3 = ' | ';
                        cell3 += fieldValue || '';
                        _fields += cell3 == ' | '?'':cell3;
                        break;
                    default: console.log(_counter);
                }

                _counter++;
            }
        };

        _fields += '</p>';
        return _fields;
    }

    return {
        retrieveSobjectData:retrieveSobjectData,
        renderListViewResultList:renderListViewResultList,
        selectListView:selectListView
    }

};
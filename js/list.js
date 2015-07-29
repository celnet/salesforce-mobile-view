var initListView = function(){

    function retrieveSobjectData(){
        handleDescribe();
        handleListViews();
        sobject.search_layout_fields = AjaxResponses.searchlayout[0].searchColumns;
        handleMetadata();

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
            AjaxPools.retrieveRecentlyViewed(sobject.name, function(){
                sobject.recentlyviewed = AjaxResponses.recentlyviewedwithfields;

                renderListViewSelects();
                renderRecentlyViewedList();
                View.stopLoading('jqm-list');
            });
        } 
    }

    function handleDescribe(){
        document.querySelector('#jqm-page-title').innerHTML = Context.labels.listview;
        document.title = sobject.describe.label;
        document.querySelector('title').innerHTML = sobject.describe.label;
        
        var $body = $j('body');
        document.title = sobject.describe.label;

        var $iframe = $j('<iframe src="/favicon.ico"></iframe>').on('load', function() {
            setTimeout(function() {
                $iframe.off('load').remove();
            }, 0)
        }).appendTo($body);
    }

    function handleListViews(){
        sobject.listviews = AjaxResponses.listviews;
        for (var i = 0; i < sobject.listviews.listviews.length; i++) {
            sobject.listviewsmap[sobject.listviews.listviews[i].id] = sobject.listviews.listviews[i];
        };
    }

    function handleMetadata(){
        var orderedListviews = AjaxResponses.orderedListviews;

        sobject.ordered_listviews = [];
        
        if(orderedListviews == null){
            sobject.ordered_listviews = sobject.listviews.listviews;
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

        for (var i = 0; i < sobject.listviews.listviews.length; i++) {
            if(ordered_listview_ids.indexOf(sobject.listviews.listviews[i].id) < 0){
                ordered_listview_ids.push(sobject.listviews.listviews[i].id);
            }
        };

        for (var i = 0; i < ordered_listview_ids.length; i++) {
            sobject.ordered_listviews.push(sobject.listviewsmap[ordered_listview_ids[i]]);
        };
    }

    function viewRecord(record_id){
        View.animateLoading(Context.labels.loading,'jqm-list');
        window.history.pushState('DPRecordView','DPRecordView','DP?mode=view&sobject=' + sobject.name + '&id=' + record_id + '&listviewid=' + params.listviewid);
        route();
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

                    //renderListViewSelects();
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
            
            //retrieveSelectListView(selected_option_id);
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
                        case 'date':
                            //console.log(_record_val + 'fadfafafda');
                            //_record_val = formatDatetimeString(_record_val, 'date');
                            //console.log(_record_val);
                            break;
                        case 'datetime': 
                            //console.log(_record_val + 'fdfadfasfadsfa');
                            //_record_val = formatDatetimeString(_record_val, 'datetime');
                            //console.log('&*&*&*&*&*&*&*&*&*&*&*&*&*&');
                            //console.log(_record_val);
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

    // 'Mon Jun 18 00:00:00 GMT 2012' to '2012-06-18' or '2012-06-18 00:00:00'
    function formatDatetimeString(origin_string, date_or_datetime){
        var months = {
            'Jan':'01',
            'Feb':'02',
            'Mar':'03',
            'Apr':'04',
            'May':'05',
            'Jun':'06',
            'Jul':'07',
            'Aug':'08',
            'Sep':'09',
            'Oct':'10',
            'Nov':'11',
            'Dec':'12'
        };

        var 
            _year = origin_string.substring(24,28),
            _month = months[origin_string.substring(4,7)],
            _date = origin_string.substring(8,10),
            _time = origin_string.substring(11,19);

        switch(date_or_datetime){
            case 'date':
                return _year + '-' + _month + '-' + _date;
                break;
            case 'datetime':
                return _year + '-' + _month + '-' + _date + ' ' + _time;
                break;
            default: 
                console.log('test');
        }
    }

    function getRecentlyViewedItemContent(_item){
        var _counter = 0;
        var _fields = '<p style="font-size:1em;">';
        
        for (var i = 0; i < sobject.search_layout_fields.length; i++) {
            if(sobject.search_layout_fields[i].name != 'Name' && _counter < 4){
                var _field_label = sobject.search_layout_fields[i].label;
                var _field_value = '';

                if(sobject.search_layout_fields[i].name.indexOf('.') > 0){
                    var _name = sobject.search_layout_fields[i].name.split('.');
                    
                    if(_item[_name[0]] != null)
                    _field_value = _item[_name[0]][_name[1]];
                } else {
                    var _field_name = sobject.search_layout_fields[i].name;
                    if(_field_name.indexOf('toLabel') >= 0){
                        _field_name = _field_name.substring(8,_field_name.length - 1);
                    }
                    _field_value = _item[_field_name] || '';
                }

                var label_font = '';
                var label_font_end = '';

                if(_field_value != null && _field_value.length == 28 && _field_value.indexOf('000+0000') > 0){
                    _field_value = TimezoneDatabase.formatDatetimeToLocal(_field_value, Context.timezone).replace('T',' ');
                }

                // 不显示字段标签，只显示字段值
                switch(_counter){
                    case 0:
                        var cell0 = '';
                        //cell0 += label_font + _field_label + label_font_end;
                        //cell0 += ': ';
                        cell0 += _field_value || '';
                        _fields += cell0;
                        break;
                    case 1:
                        var cell1 = '';
                        if(_fields != '<p style="font-size:1em;">'){
                            cell1 = ' | ';
                        }

                        //cell1 += label_font + _field_label + label_font_end;
                        //cell1 += ': ';
                        cell1 += _field_value || '';
                        _fields += cell1 == ' | '?'':cell1;
                        break;
                    case 2:
                        var cell2 = '';
                        if(_fields != '<p style="font-size:1em;">'){
                            cell2 = '</p><p style="font-size:1em;">';
                        } 
                        //cell2 += label_font + _field_label + label_font_end;
                        //cell2 += ': ';
                        cell2 += _field_value || '';
                        _fields += cell2;
                        break;
                    case 3: 
                        var cell3 = ' | ';
                        //cell3 += label_font + _field_label + label_font_end;
                        //cell3 += ': ';
                        cell3 += _field_value || '';
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
        viewRecord:viewRecord,
        selectListView:selectListView
    }

};
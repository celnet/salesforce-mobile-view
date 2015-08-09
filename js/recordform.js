var RecordForm = {
    validate:function(field_name, field_value){
        var isFieldRequired = document.querySelector('label[for="record-field-' + field_name + '"] span') != null && document.querySelector('label[for="record-field-' + field_name + '"] span').innerHTML.indexOf('*') >= 0;
        if(isFieldRequired && (field_value == null || field_value == '')){
            document.querySelector('#record-field-' + field_name).focus();
            document.querySelector('#record-field-' + field_name).style.backgroundColor = 'pink';

            var errorNode = document.createElement('div');
            errorNode.id = 'error-message-' + field_name;
            errorNode.style.textAlign = 'center';
            errorNode.style.color = 'crimson';
            var errorNodeText = document.createTextNode('必填');
            errorNode.appendChild(errorNodeText);


            if(document.querySelector('#error-message-' + field_name) == null){
                document.querySelector('#record-field-' + field_name).parentNode.parentNode.insertBefore(errorNode,document.querySelector('#record-field-' + field_name).parentNode);
            }
            

            document.querySelector('#record-field-' + field_name).addEventListener('change',function(){
                document.querySelector('#record-field-' + field_name).style.backgroundColor = 'white';
                document.querySelector('#error-message-' + field_name).parentNode.removeChild(document.querySelector('#error-message-' + field_name));
            });
            
            return false;
        } else {
            return true;
        }
    },

    construct:function(){
        var form_inputs = document.querySelectorAll('input[id*="record-field"]');
        var form_selects = document.querySelectorAll('select[id*="record-field"]');
        var form_textareas = document.querySelectorAll('textarea[id*="record-field"]');

        var form_dataset = {};

        if(params.mode == 'new' && record.recordtypeid != ''){
            form_dataset['RecordTypeId'] = record.recordtypeid;
        }

        for (var i = 0; i < form_inputs.length; i++) {
            var field_name = form_inputs[i].id.substring(13);
            var field_value;

            if(form_inputs[i].type == 'hidden'){
                continue;
            }

            switch(form_inputs[i].type){
                case 'datetime-local':
                    if(form_inputs[i].value == ''){
                        field_value = '';
                    } else {
                        field_value = TimezoneDatabase.formatDatetimeToUTC(form_inputs[i].value, Context.timezone) + ':00';
                    }
                    break;
                case 'date':
                    if(form_inputs[i].value == ''){
                        field_value = null;
                    } else {
                        field_value = TimezoneDatabase.formatDateToUTC(form_inputs[i].value, Context.timezone);
                    }
                    break;
                case '':
                    field_value = form_inputs[i].value;
                    break;
                case 'checkbox':
                    field_value = form_inputs[i].checked;
                    break;
                case 'search':
                    field_value = document.querySelector('#' + form_inputs[i].id + '-hidden').value || '';
                    break;
                default:
                    field_value = form_inputs[i].value;
            }
            
            if(!RecordForm.validate(field_name,field_value)){
                return '';
            }

            form_dataset[field_name] = field_value;
        };

        for (var i = 0; i < form_selects.length; i++) {
            var field_name = form_selects[i].id.substring(13);
            var field_value = '';

            var options = document.querySelectorAll('#' + form_selects[i].id + ' option');

            for (var j = 0; j < options.length; j++) {
                if(options[j].selected){
                    field_value += options[j].value;
                    field_value += ';';
                }
            };
            
            if(field_value.length > 0){
                field_value = field_value.substring(0, field_value.length - 1);
            }

            if(field_value == '--None--'){
                field_value = '';
            }
            
            if(!RecordForm.validate(field_name,field_value)){
                return '';
            }

            form_dataset[field_name] = field_value;
        };

        for (var i = 0; i < form_textareas.length; i++) {
            var field_name = form_textareas[i].id.substring(13);
            var field_value = form_textareas[i].value;
            
            if(!RecordForm.validate(field_name,field_value)){
                return '';
            }
            
            form_dataset[field_name] = field_value;
        };

        return form_dataset;
    },

    save:function(form_dataset){
        View.animateLoading(Context.labels.saving,'jqm-record');

        // presume new
        var method = 'POST';
        var endpoint = '/sobjects/' + sobject.name;

        if(params.mode == 'edit'){
            method = 'PATCH';
            endpoint = '/sobjects/' + sobject.name + '/' + record.id;
        }

        Ajax.ajax(
            method,
            endpoint, 
            form_dataset,
            function(response){
                var recordid = params.mode=='edit'?record.id:response.id;

                window.history.replaceState('DPRecordView','DPRecordView',Context.baseState + '?mode=view&sobject=' + sobject.name + '&id=' + recordid + '&listviewid=' + params.listviewid);
                route();
            },
            function(responseJSON){
                RecordForm.showError(responseJSON);
            }
        );
    },

    showError:function(post_error_response){
        var error_info = post_error_response.length > 0?post_error_response[0]:{};
        if(error_info.message != null){
            if(error_info.fields.length > 0){
                document.querySelector('#record-field-' + error_info.fields[0]).focus();
                document.querySelector('#record-field-' + error_info.fields[0]).style.backgroundColor = 'pink';

                var errorNode = document.createElement('div');
                errorNode.id = 'error-message-' + error_info.fields[0];
                errorNode.style.textAlign = 'center';
                errorNode.style.color = 'crimson';
                var errorNodeText = document.createTextNode(error_info.message);
                errorNode.appendChild(errorNodeText);


                if(document.querySelector('#error-message-' + error_info.fields[0]) == null){
                    document.querySelector('#record-field-' + error_info.fields[0]).parentNode.parentNode.insertBefore(errorNode,document.querySelector('#record-field-' + error_info.fields[0]).parentNode);
                }
                

                document.querySelector('#record-field-' + error_info.fields[0]).addEventListener('change',function(){
                    document.querySelector('#record-field-' + error_info.fields[0]).style.backgroundColor = 'white';
                    document.querySelector('#error-message-' + error_info.fields[0]).parentNode.removeChild(document.querySelector('#error-message-' + error_info.fields[0]));
                });

            } else {
                alert(error_info.message);
            }
            
        }else {
            console.log(post_error_response);
        }
        
        View.stopLoading('jqm-record');
    }
};
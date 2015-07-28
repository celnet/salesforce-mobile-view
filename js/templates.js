var getTemplates = function(){
    //alert(window.location.search);
    templates = {
        // ListView
        listview_page_structure:document.querySelector('#template-listview-page-structure').text,
        listview_select:document.querySelector('#template-listview-select').text,
        listview_resultlist:document.querySelector('#template-listview-resultlist').text,
        listview_resultitem:document.querySelector('#template-listview-resultitem').text,
        listview_result_noitem:document.querySelector('#template-listview-result-noitem').text,

        // RecordNew, RecordEdit
        record_page_structure:document.querySelector('#template-record-jqm-page').text,
        lookup_field:document.querySelector('#template-lookup-record').text,
        section:document.querySelector('#template-recordedit-section').text,
        section_without_heading:document.querySelector('#template-recordedit-section-without-heading').text,
        recordtype_select:document.querySelector('#template-recordtype-select').text,
        
        jqm_textinput:document.querySelector('#template-jqm-textinput').text,
        jqm_textarea:document.querySelector('#template-jqm-textarea').text,
        jqm_checkboxradio:document.querySelector('#template-jqm-checkboxradio').text,
        option:document.querySelector('#template-option').text,
        
        field_readonly:document.querySelector('#template-field-edit-readonly').text,
        field_lookup:document.querySelector('#template-field-edit-lookup').text,
        field_geolocation:document.querySelector('#template-field-edit-geolocation').text,
        field_picklist_select:document.querySelector('#template-field-edit-picklist-select').text,
        field_multipicklist_select:document.querySelector('#template-field-edit-multipicklist-select').text,
        field_address:document.querySelector('#template-field-edit-address').text,
        field_contactname:document.querySelector('#template-field-edit-contact-name').text,
        field_username:document.querySelector('#template-field-edit-user-name').text,
        page_lookup:document.querySelector('#template-lookup-jqm-page').text,

        // RecordView
        view_section:document.querySelector('#template-recordview-section').text,
        view_section_without_heading:document.querySelector('#template-recordview-section-without-heading').text,
        field_view_readonly:document.querySelector('#template-field-view-readonly').text
    };
};
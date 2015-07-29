var params = {
    mode:'',
    sobject:'',
    referer:'',
    id:'',
    listviewid:'',
    recordtypeid:'',
    retry:'',
    crossref:''
},

sobject ={
    name: '', // sobject api name
    describe: {},// sobject describe
    fields: {},// field api name : describe infomation
    ordered_listviews:[],
    recentlyviewed: {},// sobject recentlyviewed (TODO: order)
    welink_layout: {},
    has_welink_layout: false
},

record = {
    id:'',
    layout:{},
    detail:{},
    references:{},
    ref_fields:[],
    processed:[],
    welink_processed:[],
    welink_required:{},
    welink_readonly:{},
    welink_edit:{},
    recordtypeid:'', // user select
    recordtypename:'',
    selected_recordtype_detail:{},
    isWelinkLayout:false
},

listview = {
    recordType:{},
    recordLabel:{},
    queryresult:{}
},

Templates = {},

AjaxResponses = {
    has_retrieved_sobject_related:false,
    sobjectdescribe:null,
    layouts:null,
    layoutsMapping:null,
    orderedListviews:null,
    searchlayout:null,
    recentlyviewed:null,
    recordtype:null,
    businessprocess:null,
    welinklayouts:null,

    has_retrieved_record_related:false,
    record:null,
    welinklayout:null,
    layout:null,
    references:null,

    has_retrieved_recentlyviewed:false,
    recentlyviewedwithfields:null,

    listviews:{
        //id:{
        //  describe:null,
        //  results:null
        //}
    }
},
    
setup_objects = [
    'AccountTerritoryAssignmentRule','AccountTerritoryAssignmentRuleItem','ApexComponent','ApexPage','BusinessHours','BusinessProcess','CategoryNode','CurrencyType','DatedConversionRate','NetworkMember','ProcessInstance','Profile','RecordType','SelfServiceUser','StaticResource','Territory2','UserAccountTeamMember','UserTerritory','WebLink','FieldPermissions','Group','GroupMember','ObjectPermissions','PermissionSet','PermissionSetAssignment','QueueSObject','ObjectTerritory2AssignmentRule','ObjectTerritory2AssignmentRuleItem','RuleTerritory2Association','SetupEntityAccess','Territory2','Territory2Model','UserTerritory2Association','User','UserRole','UserTerritory','Territory'
],

processing = {
    page_scroll_y:0
};
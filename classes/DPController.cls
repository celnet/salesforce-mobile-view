/**
 * Author: Steven Ke
 * Date: 2015-5-18
 * Description: 动态页面控制类，用于从 Custom Setting 里获取 show dev error 和 timeout
 */
public with sharing class DPController{
    public String showDevError{get;set;}
    public String timeoutAmount{get;set;}
    public String userTimezone{get;set;}
    public String sobjectLabel{get;set;}
    public static final String apiVersion{get;set;}

    static{
        List<ApexClass> classes = [Select Name, ApiVersion, NamespacePrefix 
            From ApexClass Where Name = 'DPController' And NamespacePrefix = 'Wlink'];
        if(classes.size() > 0){
            DPController.apiVersion = String.valueOf(classes[0].ApiVersion);
        } else {
            DPController.apiVersion = '34.0';
        }
    }
    
    public DPController(){
        // 动态页面 show dev error
        showDevError = 'False';
        timeoutAmount = '3000';
        if(Wlink__App_Setting__c.getValues('ShowDevError') != null){
            showDevError = Wlink__App_Setting__c.getValues('ShowDevError').Wlink__Value__c;
        } 
        
        // 动态页面 timeout
        if(Wlink__App_Setting__c.getValues('SFDCRequestTimeout') != null){
            timeoutAmount = Wlink__App_Setting__c.getValues('SFDCRequestTimeout').Wlink__Value__c;
        } 

        userTimezone = UserInfo.getTimeZone().getId();

        String sobjectApiName = ApexPages.currentPage().getParameters().get('sobject');
        sobjectLabel = retrieveSobjectLabel(sobjectApiName);
    }

    public String retrieveSobjectLabel(String sobjectApiName){
        if(sobjectApiName != null){
            String[] types = new String[]{sobjectApiName};
            Schema.DescribeSobjectResult[] results = Schema.describeSObjects(types);
            return results[0].getLabel();
        } else {
            return '';
        }
    }

    public class DPSobjectRelatedMetadataWrapper{
        public Map<String, List<String>> listviewsMetadata{get;set;}
        public String tabLayoutFields{get;set;}
        public MetadataService.RecordType[] recordtypesMetadata{get;set;}
        public MetadataService.BusinessProcess[] businessprocessesMetadata{get;set;}
        public Map<String, String> recordtypeLayouts{get;set;}
    }

    @RemoteAction
    public static Object remote(String actionName, List<String> params){
        Object returnValue;
        try{
            if(actionName == 'retrieveSobjectRelated'){
                returnValue = DPController.retrieveSobjectRelated(params[0]);
            } 
        } catch(Exception e){
            return 'exception';
        }
        return returnValue;
    }

    public static DPSobjectRelatedMetadataWrapper retrieveSobjectRelated(String sobjectName){
        DPSobjectRelatedMetadataWrapper srmw = new DPSobjectRelatedMetadataWrapper();
        srmw.listviewsMetadata = DPController.retrieveOrderedListviews(sobjectName);
        srmw.recordtypesMetadata = DPController.retrieveMetadataRecordType(sobjectName);
        if(sobjectName == 'Opportunity'){
            srmw.businessprocessesMetadata = DPController.retrieveMetadataBusinessProcess(sobjectName);
        }
        srmw.recordtypeLayouts = DPController.WelinkLayout_retrieveLayouts(sobjectName);
        return srmw;
    }

    public static Map<String, String> WelinkLayout_retrieveLayouts(String sobjectName){
        List<RecordType> recordTypes = [select Id,Name,BusinessProcessId, DeveloperName, SobjectType from RecordType Where SobjectType =: sobjectName];
        Map<String, String> recordTypeLayouts = new Map<String, String>();

        for(RecordType rt : recordTypes){
            String layoutId = DPController.WelinkLayout_retrieveLayoutIdByRecordTypeId(sobjectName, rt.Id);
            if(layoutId.startsWith('00h')){ // layout id prefix
                String layout = DPController.retrieveLayoutByLayoutId(layoutId);
                recordTypeLayouts.put(rt.Id, layout);
            }
        }

        String layoutId_noRT = DPController.WelinkLayout_retrieveLayoutIdByRecordTypeId(sobjectName, '');
        if(layoutId_noRT.startsWith('00h')){ // layout id prefix
            String layout_noRT = DPController.retrieveLayoutByLayoutId(layoutId_noRT);
            recordTypeLayouts.put('norecordtype',layout_noRT);
        }

        return recordTypeLayouts;
    }

    public static String retrieveLayoutByLayoutId(String layoutId){
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setMethod('GET');
        req.setEndpoint('https://' + System.URL.getSalesforceBaseURL().getHost() + '/services/data/v' + DPController.apiVersion + '/tooling/sobjects/Layout/' + layoutId);
        req.setHeader('Authorization','Bearer ' + UserInfo.getSessionId());

        HttpResponse res = h.send(req);
        return EncodingUtil.base64Encode(Blob.valueOf(EncodingUtil.urlEncode(res.getBody().replaceAll(' ','spaceescaper'), 'UTF-8')));
    }

    public static String WelinkLayout_retrieveLayoutIdByRecordTypeId(String sobjectName, String recordtypeId){
        try{
            String layoutId = '';
            String profileId = UserInfo.getProfileId();

            List<Wlink__Layout_Assignment__c> layoutAssignments;

            if(recordTypeId != ''){
                layoutAssignments = [Select Id, Name, 
                        Wlink__Layout__c, Wlink__Object__c, Wlink__Profile__c, Wlink__Record_Type__c 
                    From Wlink__Layout_Assignment__c
                    Where Wlink__Object__c =: sobjectName
                    And Wlink__Profile__c =: profileId
                    And Wlink__Record_Type__c =: recordTypeId];
            } else {
                layoutAssignments = [Select Id, Name, 
                        Wlink__Layout__c, Wlink__Object__c, Wlink__Profile__c, Wlink__Record_Type__c 
                    From Wlink__Layout_Assignment__c
                    Where Wlink__Object__c =: sobjectName
                    And Wlink__Profile__c =: profileId];
            }

            if(layoutAssignments.size() > 0){
                layoutId = layoutAssignments[0].Wlink__Layout__c;
            } 

            return layoutId;
        } catch(Exception ex){
            return 'exception: ' + ex.getTypeName() + ' ' + ex.getLineNumber() + ' ' + ex.getMessage();
        }
    }

    public static MetadataService.MetadataPort getMetadataPort(){
        MetadataService.MetadataPort mp = new MetadataService.MetadataPort();
        mp.SessionHeader = new MetadataService.SessionHeader_element();        
        mp.SessionHeader.sessionId = UserInfo.getSessionId();

        return mp;
    }

    public static MetadataService.FileProperties[] listMetadata(String metadataType){
        MetadataService.MetadataPort mp = DPController.getMetadataPort();
        MetadataService.ListMetadataQuery mdQuery = new MetadataService.ListMetadataQuery();
        mdQuery.type_x = metadataType;

        List<MetadataService.ListMetadataQuery> lmqList = new List<MetadataService.ListMetadataQuery>();
        lmqList.add(mdQuery);
        Double asOfVersion = 34.0;

        MetadataService.FileProperties[] fileProperties = mp.listMetaData(lmqList,asOfVersion);

        if(System.Test.isRunningTest()){
            fileProperties = new MetadataService.FileProperties[1];
            fileProperties[0] = new MetadataService.FileProperties();
        }

        return fileProperties;
    }

    public static MetadataService.ReadCustomObjectResult retrieveMetadataReadCustomObjectResult(String sobjectName){
        if(sobjectName.contains('Wlink__')){
            sobjectName = sobjectName.substring(7);
        }

        MetadataService.MetadataPort mp = DPController.getMetadataPort();

        MetadataService.FileProperties[] fileProperties = DPController.listMetadata('CustomObject');
        
        List<String> customObjectFullnames = new List<String>();

        for(MetadataService.FileProperties fp : fileProperties){
            if(fp.fullname == sobjectName){
                customObjectFullnames.add(fp.fullname);
                break;
            }
        }

        MetadataService.ReadCustomObjectResult result;

        if(System.Test.isRunningTest()){
            result = new MetadataService.ReadCustomObjectResult();
            result.records = new MetadataService.CustomObject[1];
            result.records[0] = new MetadataService.CustomObject();
            result.records[0].listviews = new MetadataService.ListView[1];
            result.records[0].listviews[0] = new MetadataService.ListView();
            result.records[0].searchLayouts = new MetadataService.SearchLayouts();
            result.records[0].searchLayouts.customTabListAdditionalFields = new String[1];
            result.records[0].searchLayouts.customTabListAdditionalFields[0] = 'Name';
        } else {
            result = (MetadataService.ReadCustomObjectResult)mp.readMetadata('CustomObject',customObjectFullnames);
        }

        return result;
    }

    public static MetadataService.RecordType[] retrieveMetadataRecordType(String sobjectName){
        MetadataService.ReadCustomObjectResult result = DPController.retrieveMetadataReadCustomObjectResult(sobjectName);
        if(result.records.size() > 0 && result.records[0].recordTypes != null && result.records[0].recordTypes.size() > 0){
            return result.records[0].recordTypes;
        } else {
            return null;
        }
    }

    public static MetadataService.BusinessProcess[] retrieveMetadataBusinessProcess(String sobjectName){
        MetadataService.ReadCustomObjectResult result = DPController.retrieveMetadataReadCustomObjectResult(sobjectName);
        if(result.records.size() > 0 && result.records[0].businessProcesses != null && result.records[0].businessProcesses.size() > 0){
            return result.records[0].businessProcesses;
        } else {
            return null;
        }
    }

    public static Map<String,List<String>> retrieveOrderedListviews(String sobjectName){
        MetadataService.ReadCustomObjectResult result = DPController.retrieveMetadataReadCustomObjectResult(sobjectName);
        
        List<String> filteredByMyList = new List<String>();
        List<String> visibleToMeList = new List<String>();
        List<String> createdByMeList = new List<String>();

        Set<String> filterByMyListviewFullNames = new Set<String>();
        Set<String> filterByMyListviewIds = new Set<String>();
        Set<String> visibleToMeListviewIds = new Set<String>();
        Set<String> createdByMeListviewIds = new Set<String>();

        Set<String> allListviewsFromMetadatas = new Set<String>();
        Map<String, String> fullNameIdMap = new Map<String, String>();

        if(result.records[0].listviews != null){

            for(MetadataService.ListView mslv : result.records[0].listviews){
                allListviewsFromMetadatas.add(mslv.fullName);

                if(mslv.filterScope == 'Mine'){
                    filterByMyListviewFullNames.add(mslv.fullName);
                }
            }

            List<ListView> viewLists = [select CreatedById, CreatedDate, DeveloperName, Id, 
                IsSoqlCompatible, LastModifiedById, LastModifiedDate, LastReferencedDate, LastViewedDate, 
                Name, NamespacePrefix, SobjectType, SystemModstamp from ListView Where SobjectType =: sobjectName];

            for(ListView lv : viewLists){
                fullNameIdMap.put(lv.DeveloperName, lv.Id);
                if(filterByMyListviewFullNames.contains(lv.DeveloperName) || filterByMyListviewFullNames.contains('Wlink__' + lv.DeveloperName)){
                    continue;
                }

                if(!(allListviewsFromMetadatas.contains(lv.DeveloperName) || allListviewsFromMetadatas.contains('Wlink__' + lv.DeveloperName))&& lv.CreatedById != UserInfo.getUserId()){
                    visibleToMeListviewIds.add(lv.Id);
                } else if(lv.CreatedById == UserInfo.getUserId()){
                    createdByMeListviewIds.add(lv.Id);
                } 

                
            }

            for(String flFullName : filterByMyListviewFullNames){
                if(flFullName.contains('Wlink__')){
                    flFullName = flFullName.substring(7);
                }
                filterByMyListviewIds.add(fullNameIdMap.get(flFullName));
            }

            for(String flId : filterByMyListviewIds){
                filteredByMyList.add(flId);
            }

            for(String vlId : visibleToMeListviewIds){
                visibleToMeList.add(vlId);
            }

            for(String clId : createdByMeListviewIds){
                createdByMeList.add(clId);
            }
        }
        Map<String,List<String>> orderedListViews = new Map<String,List<String>>{
            'filteredByMy'=>filteredByMyList,
            'visibleToMe'=>visibleToMeList,
            'createdByMe'=>createdByMeList
        };

        return orderedListViews;
    }
}
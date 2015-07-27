$j = jQuery.noConflict();
        
$j( document ).on( "mobileinit", function() {
    $j.mobile.autoInitializePage = false;
    $j.mobile.ajaxEnabled = false;
    //$j.mobile.linkBindingEnabled = false;
    $j.mobile.hashListeningEnabled = false;
    $j.mobile.pushStateEnabled = false;
});
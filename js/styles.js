var Styles = {
    tunePageStyle:function(){
        $j('#jqm-list').page({theme:'b'});
        $j('#jqm-record').page({theme:'b'});
        $j('#lookup-search-page').page({theme:'b'});

        // fix header 
        document.querySelector('#jqm-header').style.position = 'fixed';
        document.querySelector('#jqm-header').classList.remove('slidedown');

        if(params.mode == 'edit' || params.mode == 'new'){
            document.querySelector('#lookup-search-page').style.position = 'fixed';
            document.querySelector('#lookup-search-page').classList.remove('slidedown');
        }
    },

    styleEdit:function(){
		$j('ul').listview();
        $j('input[type="text"]').textinput();
        $j('input[type="tel"]').textinput();
        $j('input[type="url"]').textinput();
        $j('input[type="number"]').textinput();
        $j('input[type="date"]').textinput();
        $j('input[type="datetime-local"]').textinput();
        $j('input[type="email"]').textinput();
        $j('input[type="search"]').textinput();
        $j('textarea').textinput({
            autogrow: true
        });

        $j('textarea').css('resize','vertical');
        $j('select').selectmenu();
        $j('input[type="checkbox"]').flipswitch();

        $j('input[id!="lookup-search-box"]').css('height','44.375px');
        $j('label').css('font-weight','bold');
		
		// 分割线改为点线
        $j('.ui-field-contain').css('border-bottom-style','dashed');
    },

    styleView:function(){

    }
};
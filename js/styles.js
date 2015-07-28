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
        $j('ul').listview();
        var li_a_array = document.querySelectorAll('li a');

        for (var i = li_a_array.length - 1; i >= 0; i--) {
            li_a_array[i].classList.remove('ui-btn');
            li_a_array[i].classList.remove('ui-btn-icon-right');
            li_a_array[i].classList.remove('ui-icon-carat-r');

            li_a_array[i].parentNode.classList.add('ui-li-static');
            li_a_array[i].parentNode.classList.add('ui-body-inherit');
        };

        var li_img_array = document.querySelectorAll('li img');

        for (var i = li_img_array.length - 1; i >= 0; i--) {
            li_img_array[i].parentNode.classList.remove('ui-li-has-thumb');
        };

        // textarea wrap word
        $j('li').css('word-wrap','break-word').css('white-space','normal');

        // 将行分割线改为断点
        $j('li:not(.ui-first-child)').css('border-width','1px 0 0').css('border-style','dashed');
    }
};
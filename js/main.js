function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
$.get('https://api.i2p.pub/upload/data.json', function (result) {
    for (var key in result) {
        var date = new Date(result[key].create_at);
        var htmlContent = '<figure style="position: relative;">' +
            '<div style="position: relative;text-align: center" id="img-1">' +
            '<img src="' + result[key].url + '" class="photohit-img">' +
            '</div>' + '<figcaption style="font-size: small">' + formatDate(result[key].create_at) + '</figcaption>'
        '</figure>';
        $('#columns').append(htmlContent);
        console.log(result[key]);
    }
    initListener();
})

function getPath(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.pathname + a.search;
}

function initListener() {

    var instance = null;

    vex.dialog.isEnabled = false;


    $('figure').click(function (e) {
        instance = e.target;
        var node = getPath(instance.getAttribute('src'));
        console.log(node);

        var fatherDiv = $('img[src$="' + instance.getAttribute('src') + '"]').parent();
        vex.dialog.open({
            message: 'Let\'s Hit It !',
            input: "<input name=\"danmu\" type=\"text\" placeholder=\"弹幕\" required />\n",
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {
                    text: 'Hit !'
                })
            ],
            callback: function (data) {
                var ref = new Wilddog("https://photohit.wilddogio.com/" + node + "/" + new Date().getTime());
                ref.set({
                    'user': 'guest',
                    'comment': data.danmu
                })
                HitPhoto(fatherDiv, [data.danmu]);
                return console.log(data.danmu);
            }
        });
    });


    $('.photohit-img').mouseover(function (e) {
        if (window.isEnable) {
            return false;
        }
        window.isEnable = true;
        instance = e.target;
        var node = getPath(instance.getAttribute('src'));
        console.log(node);

        var fatherDiv = $('img[src$="' + instance.getAttribute('src') + '"]').parent();
        var ref = new Wilddog("https://photohit.wilddogio.com/");
        ref.child(node).orderByKey().once("value", function (datasnapshot) {
            var list = datasnapshot.val();
            var comments = []
            for (var i in list) {
                comments.push(list[i]['comment']);
            }
            HitPhoto(fatherDiv, comments);
        });

    });

    $('.photohit-img').mouseleave(function (e) {
        if (window.isEnable == false) {
            return false;
        }
        window.isEnable = false;

        instance = e.target;
        var fatherDiv = $('img[src$="' + instance.getAttribute('src') + '"]').parent();
        // fatherDiv.attr('id', '');
        clearInterval(window.inter);
    });

}
function upload() {
    var htmlContent = '<form id="upload-form" method="post" action="https://up.qbox.me" enctype="multipart/form-data">' +
        '<input id="token" name="token" class="ipt" value="" hidden>' +
        '<input id="key" name="key" value="" hidden>' +
        '<input id="file" name="file" class="ipt" type="file" accept="image/jpeg,image/png" />' +
        '</form>';

    vex.dialog.open({
        message: 'Upload Image',
        input: htmlContent,
        buttons: [
            $.extend({}, vex.dialog.buttons.YES, {
                text: 'Hit !'
            }),
            $.extend({}, vex.dialog.buttons.NO, {
                text: 'Cancel !'
            })
        ],
        callback: function (data) {
            if (data == false) {
                return;
            }
            $.post('https://api.i2p.pub/upload/token/', function (result) {
                $("#token").val(result.token);
                var filename = new Date().getTime();
                console.log(filename);
                $('#key').val(filename);
                $("#upload-form").ajaxSubmit(function (message) {
                    alert('上传成功');
                    location.reload(location.href);
                });

            });
        }
    });
}

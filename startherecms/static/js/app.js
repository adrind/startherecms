$(document).ready(function() {
    var $inputField = $('#q');
    var $body = $('body');
    var template = Hogan.compile($('#autocomplete').text());
    var algoliaAppId = $body.data('alg-app');
    var algoliaPublicKey = $body.data('alg-pub-key');

    if(algoliaAppId && algoliaPublicKey) {
        $('#q').show();
        var client = algoliasearch(algoliaAppId, algoliaPublicKey);
        var stepIndex = client.initIndex('step_index');

        //Required to make sure all links in a rich text field open in a new tab
        $('.rich-text a').attr('target', '_blank');

        var registerIndex = function (index, name, data) {
            return {
                source: function (query, cb) {
                    index.search({query: query, filters: 'live:true'}, function (err, content) {
                        if (err) {
                            cb(err);
                            return;
                        }
                        cb(content.hits);
                    });

                },
                displayKey: name,
                templates: {
                    suggestion: function (hit) {
                        return template.render({
                            url: hit[data.url],
                            title: hit._highlightResult[data.title].value
                        })
                    }
                }
            }
        };

        $inputField.typeahead(
            { hint: true },
            registerIndex(stepIndex, 'step', {url: 'url', title: 'title'})
        );

        $('.twitter-typeahead').on('typeahead:selected', function(event, selection) {
            document.location.pathname = selection.url;
        });
    }

    function addToCheckList(pageId, pageTitle) {
        $('#checklist .list').append('<li data-id="'+pageId+'">'+pageTitle+'</li>')
    }

    function isAlreadyChecked(id, items) {
        var isChecked = false;

        $.each(items, function (i, page) {
            if(page.id === id) {
                isChecked = true;
            }
        });

        return isChecked;
    }

    if (typeof(Storage) !== "undefined") {
        var checkList = JSON.parse(sessionStorage.getItem('checklist')),
            $checkListDiv = $('#checklist'),
            $checkList = $('#checklist .list'),
            $saveToChecklist = $('#checklist .save-to-checklist'),
            $checkListButtons = $('#checklist .checklist-btns');

        if(!checkList) {
            checkList = {
                items: []
            };
        }

        if(checkList.items.length > 0) {
            $checkListDiv.show();
            $checkList.show();
            $checkListButtons.addClass('show');
        } else if(!$checkListDiv.hasClass('track-list')) {
            $checkListDiv.show();
            $checkList.show();
            $saveToChecklist.show();
        }

        $.each(checkList.items, function (i, page) {
            addToCheckList(page.id, page.title);
        });

        $('.add-to-check-list').click(function(evt){
            var $target = $(evt.target),
                id = $target.data('id');

            $checkList.show();
            $checkListButtons.addClass('show');
            $saveToChecklist.hide();
            if (!isAlreadyChecked(id, checkList.items)) {
                addToCheckList(id, $target.data('title'));
                checkList.items.push({id: id, title: $target.data('title')});
                sessionStorage.setItem('checklist', JSON.stringify(checkList));
            }
        }).hover(function (evt) {
            var $target = $(evt.target);

            $target.find('span').toggle();
            $target.find('i').toggle();
        });

        $('.print-checklist').click(function (evt) {
            var url = '/print?ids=';
            var ids = [];
            $('#checklist .list li').each(function (i, el) {
                ids.push($(el).data('id'))
            });

            window.location.href = url + ids.join(',');
        });

        $('.clear-checklist').click(function (evt) {
            sessionStorage.clear();
            $checkList.remove('li');
            $checkList.hide();
            $checkListButtons.removeClass('show');
            $saveToChecklist.show();
        });
    }

});

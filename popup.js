/**
 * function to handle the result of the injection of the content script.
 */
function HandleNotSupported() {
    if (chrome.runtime.lastError !== undefined) {
        $('body').addClass('not-supported');
    } else {
        $('body').removeClass('not-supported');
    }
}

//programmatically inject the content script.
chrome.tabs.executeScript({file: 'libs/jquery-3.5.1.min.js'}, HandleNotSupported);
chrome.tabs.executeScript({file: 'scripts/head.js'}, HandleNotSupported);
chrome.tabs.executeScript({file: 'scripts/image.js'}, HandleNotSupported);
chrome.tabs.executeScript({file: 'scripts/heading.js'}, HandleNotSupported);
chrome.tabs.executeScript({file: 'scripts/links.js'}, HandleNotSupported);
chrome.tabs.executeScript({file: 'content.js'}, HandleNotSupported);

function GetAdditionalInfoHTML(objMetaElement) {
    if (objMetaElement.count_chars > 0) {
        var htmlBadgeCountChars = '<span class="new badge blue" data-badge-caption="chars">' + objMetaElement.count_chars + '</span>';
        var htmlBadgeCountWords = '<span class="new badge blue" data-badge-caption="words">' + objMetaElement.count_words + '</span>';
        return '<br>' + htmlBadgeCountChars + htmlBadgeCountWords;
    } else {
        return '';
    }
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

$(document).ready(function() {

    //initialize the materialize tabs.
    $('.tabs').tabs();

    //init
    if ($('body').hasClass('not-supported') === false) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {from: 'popup', subject: 'initialization'},
                data
            );
        });

        const data = info => {
            let head = info['head'];

            //define the required information (also if not available).
            let required = ['title', 'description'];

            for (let infoItem of required) {
                var objMeta = head[infoItem]; 
                $('table#meta-head > tbody').append('<tr><td>' + escapeHtml(objMeta.name) + GetAdditionalInfoHTML(objMeta) + '</td><td>' + objMeta.value + '</td>');
            }

            //iterate through all properties of the head information.
            for (let infoItem in head) {
                var objMeta = head[infoItem];
                
                //exclude all the empty properties (except required properties).
                if ($.inArray(objMeta.name, required) === -1 && objMeta.value !== '') {
                    $('table#meta-head > tbody').append('<tr><td>' + escapeHtml(objMeta.name) + '</td><td>' + objMeta.value + GetAdditionalInfoHTML(objMeta) + '</td>');
                }
            }
        }

        $('a[href="#headings"]').on('click', function() {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {from: 'popup', subject: 'headings'},
                    data
                );
            });

            const data = info => {

                //headInfo
                let heading = info['heading'];

                $('*[data-seo-info="meta-heading-h1-count"]').text(heading.counts.h1);
                $('*[data-seo-info="meta-heading-h2-count"]').text(heading.counts.h2);
                $('*[data-seo-info="meta-heading-h3-count"]').text(heading.counts.h3);
                $('*[data-seo-info="meta-heading-h4-count"]').text(heading.counts.h4);
                $('*[data-seo-info="meta-heading-h5-count"]').text(heading.counts.h5);
                $('*[data-seo-info="meta-heading-h6-count"]').text(heading.counts.h6);
                $('*[data-seo-info="meta-heading-total-count"]').text(heading.counts.all);

                for (let infoHeading of heading.headings) {
                    $('div#meta-heading-list').append('<div class="level-' + infoHeading.tag + '"><span>' + infoHeading.tag + '</span>' + infoHeading.title + '<br><span class="new badge blue" data-badge-caption="chars">' + infoHeading.count_chars + '</span><span class="new badge blue" data-badge-caption="words">' + infoHeading.count_words + '</span></div>');
                }
            }
        });

        $('a[href="#images"]').on('click', function() {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {from: 'popup', subject: 'images'},
                    data
                );
            });

            const data = info => {
                $('*[data-seo-info="meta-images-count-all"]').text(info.images.count.all);

                for (let image of info.images.images) {
                    $('table#meta-images > tbody').append('<tr><td>' + image.src + '</td></tr>');
                }
            }
        });

        $('a[href="#links"]').on('click', function() {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {from: 'popup', subject: 'links'},
                    data
                );
            });

            const data = info => {
                for (let link of info.links.links) {
                    var badgeLevel = '';

                    if (link.level !== 0 && (['script', 'anchor']).includes(link.type) === false) {
                        badgeLevel = '<span class="new badge blue" data-badge-caption="levels">' + link.level + '</span>';
                    }

                    var badgeCount = '<span class="new badge blue" data-badge-caption="x">' + link.count + '</span>';

                    $('table#meta-links > tbody').append('<tr><td>' + link.href + '<br><span class="new badge blue" data-seo-info="meta-links-type" data-badge-caption="">' + link.type + '</span>' + badgeLevel + badgeCount + '</td></tr>');
                }
            }
        });
    }
});
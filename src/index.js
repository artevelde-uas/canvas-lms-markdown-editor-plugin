import unified from 'unified';
import remarkParse from 'remark-parse';
import remark2rehype  from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeParse from 'rehype-parse';
import rehype2remark  from 'rehype-remark';
import remarkStringify from 'remark-stringify';

import styles from './index.module.css';


export default function (app, options) {
    function routeHandler (params, routeName) {
        Promise.all([
            app.addReadyListener('.ic-RichContentEditor'),
            app.addReadyListener('.mce-tinymce')
        ]).then(([editor, richContentEditor]) => {
            var htmlEditor = editor.querySelector('textarea');
            var buttons, switchViewsLink;

            // Pages tool has different mark-up
            if (/^courses\.pages(\.edit)?$/.test(routeName)) {
                buttons = editor.parentNode.querySelector('.switch_views_container');
                switchViewsLink = buttons.querySelector('a.switch_views');
            } else {
                buttons = editor.parentNode.firstElementChild;
                switchViewsLink = buttons.querySelector('a.rte_switch_views_link');
            }

            buttons.classList.add(styles.buttons);

            // Create the Markdown editor
            editor.insertAdjacentHTML('afterend', `
                <textarea id="${styles.markdownEditor}" style="display: none"></textarea>
            `);

            let markdownEditor = editor.parentNode.querySelector(`#${styles.markdownEditor}`);

            // Create the tabs
            editor.insertAdjacentHTML('beforebegin', `
                <div class="ui-tabs-minimal ui-tabs ui-widget ui-widget-content ui-corner-all">
                    <ul id="${styles.tabs}" class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all" role="tablist">
                        <li id="${styles.richContentEditorTab}" class="ui-state-default ui-corner-top ui-tabs-active ui-state-active" role="tab">
                            <a class="ui-tabs-anchor" role="presentation">Rich Content Editor</a>
                        </li>
                        <li id="${styles.htmlEditorTab}" class="ui-state-default ui-corner-top" role="tab">
                            <a class="ui-tabs-anchor" role="presentation">HTML Editor</a>
                        </li>
                        <li id="${styles.markdownEditorTab}" class="ui-state-default ui-corner-top" role="tab">
                            <a class="ui-tabs-anchor" role="presentation">MarkDown Editor</a>
                        </li>
                    </ul>
                <div>
            `);

            let tabs = editor.parentNode.querySelector(`#${styles.tabs}`);
            let richContentEditorTab = tabs.querySelector(`#${styles.richContentEditorTab}`);
            let htmlEditorTab = tabs.querySelector(`#${styles.htmlEditorTab}`);
            let markdownEditorTab = tabs.querySelector(`#${styles.markdownEditorTab}`);

            // Handle clicks on tabs
            tabs.addEventListener('click', event => {
                var currentTab = tabs.querySelector('.ui-tabs-active');
                var selectedTab = event.target.closest('li');

                if (selectedTab === null || selectedTab === currentTab) return;

                currentTab.classList.remove('ui-tabs-active', 'ui-state-active');
                selectedTab.classList.add('ui-tabs-active', 'ui-state-active');

                if (selectedTab === richContentEditorTab || selectedTab === htmlEditorTab) {
                    editor.style.display = 'unset';

                    if ((selectedTab === richContentEditorTab && richContentEditor.style.display === 'none') ||
                        (selectedTab === htmlEditorTab && htmlEditor.style.display === 'none')) {
                        switchViewsLink.click();
                    }
                } else {
                    editor.style.display = 'none';
                }

                if (currentTab === markdownEditorTab) {
                    markdownEditor.style.display = 'none';
                }

                if (selectedTab === markdownEditorTab) {
                    // Set focus to rich content editor to sanitize HTML
                    if (richContentEditor.style.display === 'none') {
                        switchViewsLink.click();
                    }

                    // Set focus to HTML editor to update HTML
                    switchViewsLink.click();

                    // Show the Markdown editor
                    markdownEditor.style.display = 'unset';
                    markdownEditor.focus();

                    // Process the HTML and convert it to MarkDown
                    unified()
                        .use(rehypeParse)
                        .use(rehype2remark)
                        .use(remarkStringify)
                        .process(htmlEditor.value, function(err, file) {
                            markdownEditor.value = String(file);
                            markdownEditor.style.display = 'unset';
                            markdownEditor.focus();
                        });
                }

            });

            // Handle changes to Markdown editor content
            markdownEditor.addEventListener('change', event => {
                console.log('event');

                if (htmlEditor.style.display === 'none') {
                    switchViewsLink.click();
                }

                // Process the MarkDown and convert it to HTML
                unified()
                    .use(remarkParse)
                    .use(remark2rehype)
                    .use(rehypeStringify)
                    .process(markdownEditor.value, function(err, file) {
                        htmlEditor.value = String(file);

                        if (selectedTab === richContentEditorTab) {
                            switchViewsLink.click();
                        }
                    });
            });
        });
    }

    app.addRouteListener('courses.pages', routeHandler);
    app.addRouteListener('courses.pages.edit', routeHandler);
    app.addRouteListener('courses.announcements.new', routeHandler);
    app.addRouteListener('courses.assignments.new', routeHandler);
    app.addRouteListener('courses.assignments.edit', routeHandler);
    app.addRouteListener('courses.discussions.new', routeHandler);
    app.addRouteListener('courses.discussions.edit', routeHandler);
}

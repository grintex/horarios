var gridster = null;
$(document).ready(function () {
    gridster = $(".gridster ul").gridster({
        widget_base_dimensions: ['auto', 140],
        autogenerate_stylesheet: true,
        min_cols: 1,
        max_cols: 6,
        widget_margins: [5, 5],
        resize: {
            enabled: true
        }
    }).data('gridster');
    $('.gridster  ul').css({'padding': '0'});
});
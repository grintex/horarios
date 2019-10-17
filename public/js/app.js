var gridster = [];

$(function () {
    gridster[0] = $("#demo-1 ul").gridster({
        namespace: '#demo-1',
        widget_base_dimensions: [400, 100],
        widget_margins: [5, 5],
        max_cols: 6,
        min_rows: 6
    }).data('gridster');

    gridster[1] = $("#demo-2 ul").gridster({
        namespace: '#demo-2',
        widget_base_dimensions: [200, 110],
        widget_margins: [10, 10]
    }).data('gridster');
});
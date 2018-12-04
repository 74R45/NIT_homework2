var category_ids = [];
var category_items = {};

function getCategoryIds(callback) {
	$.getJSON("http://nit.tron.net.ua/api/category/list", function(data, status) {
		$.each(data, function(key, value){
			category_ids.push(value.id);
		});
		callback();
	});
}

function getCategoryItems() {
	category_ids.forEach(function(i) {
		$.getJSON("http://nit.tron.net.ua/api/product/list/category/"+i, function(data, status) {
			category_items[i] = [];
			$.each(data, function(key, value) {
				category_items[i].push(value);
			});
		});
	});
}

getCategoryIds(getCategoryItems);

function changeView(category_id) {
	if (category_id == "all")
		$("[id^='productbox']").show();
	else {
		$("[id^='productbox']").hide();
		category_items[category_id].forEach(function(item) {
			$("#productbox"+item.id).show();
		});
	}
}

function setImageStyle() {
// Setting each image's margin so that the whole height is 200px.
	$(".card-image").each(function() {
		var m = (200 - parseInt($(this).css("height"))) / 2;
		$(this).css("margin-top", "" + m + "px");
		$(this).css("margin-bottom", "" + m + "px");
	});
}


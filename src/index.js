import './scss/main.scss';
import 'bootstrap';
import Popper from 'popper.js/dist/umd/popper.js';
console.log(`The time is ${new Date()}`);

var categories = [];
$.getJSON("http://nit.tron.net.ua/api/category/list", function(data, status){
	$.each(data, function(key, value){
		categories.push(value);
	});
	var counter = 2;
	categories.forEach(function(obj) {
		$("#category-list").append('<a class="nav-link" id="category' + counter + '" data-toggle="pill" onclick="changeView(' + obj.id + ')" aria-selected="false">' + obj.name + ' - ' + obj.description + '</a>');
		counter++;
	});
});

var all_products = [];
var descriptions = {};
$.getJSON("http://nit.tron.net.ua/api/product/list", function(data, status){
	$.each(data, function(key, value){
		all_products.push(value);
	});
	all_products.forEach(function(obj) {
		var crossed = "";
		var price = obj.price;
		if (obj.special_price != null) {
			crossed = "<h4 class='old-price'>" + obj.price + "</h4>";
			price = obj.special_price;
		}
		$("#product-list").append("<div class='col-lg-4 col-sm-6' id='productbox" + obj.id + "'>" +
									"<div id='description" + obj.id + "' style='display: none;'>" +
										"Text, whatever, just a test here. Lorem ipsum, idek anymore." +
									"</div>" +
									"<div class='product card bg-light'>" +
										"<img src='" + obj.image_url +"' onload='setImageStyle()' class='card-image'>" +
										"<div class='card-body' id='product-info'>" +
											"<h5 class='card-title'>" + obj.name + "</h5>" +
											"<p class='card-text'>" +
												crossed +
												"<h4 class='price'>" + price + "</h4>" +
												"<a href='#' class='btn btn-primary'>Order</a>"+
											"</p>" +
								  "</div></div></div>");
		$("#description"+obj.id).each(function() {;
			descriptions[obj.id] = new Popper($("productbox"+obj.id), $(this), {
				placement: 'top'
			});
		});
	});
});

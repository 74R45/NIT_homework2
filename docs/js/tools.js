var categories = {};
var category_items = {};

function getCategoryIds(callback) {
	$.getJSON("https://nit.tron.net.ua/api/category/list", function(data, status) {
		$.each(data, function(key, value){
			categories[value.id] = value;
		});
		for (var category_id in categories) {
			var category = categories[category_id];
			$("#category-list").append(`<a class="nav-link" id="category${category_id}" data-toggle="pill" onclick="changeView(${category_id})" aria-selected="false">${category.name} - ${category.description}</a>`);
		};
		callback();
	});
}

function getCategoryItems() {
	for (var i in categories) {
		// That's my solution to the "last value" problem. Try/catch block has its own scope, therefore category_id will not change.
		try {throw i}
		catch(category_id) {
			$.getJSON("https://nit.tron.net.ua/api/product/list/category/"+category_id, function(data, status) {
				category_items[category_id] = {};
				$.each(data, function(key, value) {
					category_items[category_id][value.id] = value;
				});
			});	
		}
	}
}

getCategoryIds(getCategoryItems);

$.getJSON("https://nit.tron.net.ua/api/product/list", function(data, status){
	category_items["all"] = {};
	$.each(data, function(key, value){
		category_items["all"][value.id] = value;
	});
	for (var obj_id in category_items["all"]) {
		var obj = category_items["all"][obj_id];
		var crossed = "";
		var price = obj.price;
		if (obj.special_price != null) {
			crossed = `<h4 class='old-price'>${obj.price}</h4>`;
			price = obj.special_price;
		}
		$("#product-list").append(`
			<div class="col-lg-4 col-sm-6" id="productbox${obj.id}">
				<div class="product card bg-light">
					<div class="d-flex align-items-center card-image">
						<img class="card-img" src="${obj.image_url}" onclick="openDescription(${obj.id})">
					</div>
					<div class="card-body" id="product-info">
						<h5 class="card-title" onclick="openDescription(${obj.id})">${obj.name}</h5>
						${crossed}
						<h4 class="price">${price}</h4>
						<button type="button" class="btn btn-primary" id="addtocartbtn${obj.id}" onclick="addToCart(${obj.id})">
							<div class="d-flex align-items-center row cartrow">
								<div id="cartaddimg"></div>
								<h6>Add to cart</h6>
							</div>
						</button>
					</div>
				</div>
			</div>
		`);
	}
});

function changeView(category_id) {
	if (category_id == "all")
		$("[id^='productbox']").show();
	else {
		$("[id^='productbox']").hide();
		for (var item_id in category_items[category_id]) {
			$("#productbox"+item_id).show();
		};
	}
}

function openDescription(item_id) {
	var active_category = $("[id^='category'].active");
	var active_category_id = parseInt(active_category[0].id.substr(8));
	var item;
	$("#productview").hide();
	$("#descriptionview").show();
	$("#descriptionview").append(`
		<div class="btn-group btn-group-lg flex-wrap" role="group" id="descrbtns">
			<button type="button" class="btn btn-primary" id="btncategoryall" onclick="closeDescription('all')">All products</button>
		</div>
	`);
	if (!isNaN(active_category_id)) {
		item = category_items[active_category_id][item_id];
		$("#descrbtns").append(`<button type="button" class="btn btn-primary" id="btncategory${active_category_id}" onclick="closeDescription(${active_category_id})">${active_category[0].innerText}</button>`);
	} else
		item = category_items["all"][item_id];
	var crossed = "";
	var price = item.price;
	if (item.special_price != null) {
		crossed = `<h4 class="old-price2">${item.price}</h4>`;
		price = item.special_price;
	}
	$("#descrbtns").append(`<button type="button" class="btn btn-primary" id="btnitemname" disabled>${item.name}</button>`);
	$("#descriptionview").append(`
		<div class="row" id="descriptioncontent">
			<div class="col-md-4 dscr-img-container">
				<div class="d-flex align-items-center dscr-img-wrapper">
					<img class="dscr-img" src="${item.image_url}">
				</div>
			</div>
			<div class="col-md-8">
				<h4>${item.name}</h4>
				<p id="descriptiontext">${item.description.replace(/\r\n/g, "<br>")}</p>
				${crossed}
				<h4 class="price">${price}</h4>
				<button type="button" class="btn btn-primary" id="addtocartbtn${item.id}" onclick="addToCart(${item.id})">
					<div class="d-flex align-items-center row cartrow">
						<div id="cartaddimg"></div>
						<h6>Add to cart</h6>
					</div>
				</button>
			</div>
		</div>
	`);
}

function closeDescription(category_id) {
	var description = $("#descriptionview");
	description.empty();
	description.hide();
	$("#productview").show();
	$(`#category${category_id}`).trigger("click");
};

var productview_visible;
var cart_items = {};
$("#cartbutton").click(function() {
	if ($("#cartview").is(":visible")) return;
	if ($("#productview").is(":visible")) {
		$("#productview").hide();
		productview_visible = true;
	} else {
		$("#descriptionview").hide();
		productview_visible = false;
	}
	$("#cartview").show();
});

$("#backbutton").click(function() {
	$("#cartview").hide();
	if (productview_visible)
		$("#productview").show();
	else
		$("#descriptionview").show();
});

function addToCart(item_id) {
	var item = category_items["all"][item_id];
	var price = item.price;
	if (item.special_price != null)
		price = item.special_price;
	if ($.isEmptyObject(cart_items)) {
		$("#cartisempty").hide();
		$("#formwrapper").show();
	}
	if (!(item_id in cart_items)) {
		cart_items[item_id] = 0;
		$("#itemsincart").append(`
			<div class="row" id="cartitem${item_id}">
				<div class="col-1 d-flex align-items-center justify-content-center">
					<button type="button" class="btn btn-sm btn-primary" id="cartbtnclose${item_id}" onclick="closeItem(${item_id})">✕</button>
				</div>
				<div class="col-3 cart-img-container">
					<div class="d-flex align-items-center cart-img-wrapper">
						<img class="cart-img" src="${item.image_url}">
					</div>
				</div>
				<div class="col-5 cart-item-descr">
					<h5>${item.name}</h5>
					<h4 class="price">${price}</h4>
				</div>
				<div class="col-3 cart-item-amount">
					<div class="row justify-content-center">
						<button type="button" class="btn btn-sm btn-primary" id="cartbtnminus${item_id}" onclick="changeQuantity(${item_id}, -1)">–</button>
						<input type="text" id="cartinput${item_id}" oninput="inputboxChanged(${item_id})" value="0" />
						<button type="button" class="btn btn-sm btn-primary" id="cartbtnplus${item_id}" onclick="changeQuantity(${item_id}, 1)">+</button>
					</div>
					<h4 class="price" id="totalprice${item_id}">${price}</h4>
				</div>
			</div>
			</div>
		`);
	}
	$(`#cartbtnplus${item_id}`).trigger("click");
}

function inputboxChanged(item_id) {
	var inputbox = $(`#cartinput${item_id}`)[0];
	if (isNaN(inputbox.value) || inputbox.value.includes('.')) {
		inputbox.value = cart_items[item_id];
	} else {
		var amount = parseInt(inputbox.value);
		if (inputbox.value == "")
			amount = 0;
		var total = $(`#totalprice${item_id}`)[0];
		var item = category_items["all"][item_id];
		var price = item.price;
		if (item.special_price != null)
			price = item.special_price;
		total.innerText = parseInt(price) * amount + ".00";
		cart_items[item_id] = amount;
		inputbox.value = amount;
	}
}

function changeQuantity(item_id, change) {
	var inputbox = $(`#cartinput${item_id}`)[0];
	if (change == 1 || parseInt(inputbox.value) > 0) {
		inputbox.value = parseInt(inputbox.value) + change;
		inputboxChanged(item_id);
		setSum();
	}
}

function closeItem(item_id) {
	delete cart_items[item_id];
	$(`#cartitem${item_id}`).remove();
	if ($.isEmptyObject(cart_items)) {
		$("#cartisempty").show();
		$("#inputForm").hide();
	}
}

function setSum() {
	var sum = $("#sum")[0];
	var s = 0;
	for (var item_id in cart_items) {
		var item = category_items["all"][item_id];
		var price = item.price;
		if (item.special_price != null)
			price = item.special_price;
		s += cart_items[item_id] * parseInt(price);
	}
	sum.innerText = s;
}

$("#inputForm").on("submit", function(event) {
	event.preventDefault();
	var name = $("#inputName").val();
	var email = $("#inputEmail").val();
	var phone = $("#inputPhone").val();
	var data = `name=${name}&email=${email}&phone=${phone}`;
	for (var item_id in cart_items) {
		data += `&products[${item_id}]=${cart_items[item_id]}`;
	}
	data += "&token=tmv-QNEpdCgozT_bMLus";
	$.ajax({
		url: 'https://nit.tron.net.ua/api/order/add',
		method: 'post',
		data: data,
		dataType: 'json',
		success: function(json) {
			console.log(json);
		}
	});
});
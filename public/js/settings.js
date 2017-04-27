$().ready(function() {
	if (localStorage.name) {
		$("#name").val(localStorage.name);
		$("#header-title").text("Hello " + localStorage.name + " !")
	}
	else {
		$("#header-title").text("Hello stranger !")
	}

	if (localStorage.email)
		$("#email").val(localStorage.email);

	$('#news input').each(function(i, obj) {
		if (localStorage.news) {
			var newsValue = localStorage.news[obj.id];
			if (typeof newsValue !== 'undefined' && newsValue)
				obj.checked = true;
		}
	});

	$.post("/api/userInfo", {id: localStorage.id}, function( data ) {
		if (data.count > 0) {
			$("#beverage-count").text(data.count);
			$("#last-beverage").text(data.latest);
			$("#user-info").show();
		}
	});

	$.post("/api/setCurrentUser", {id: localStorage.id,
		name: localStorage.name,
		email: localStorage.email,
		news: localStorage.news});	

	$("#settings-form").on('submit', function(e) {
		e.preventDefault(e);

		var nameField = $("#name");
		if (nameField.val() !== "")
			localStorage.name = nameField.val();

		var emailField = $("#email");
		if (emailField.val() !== "")
			localStorage.email = emailField.val();

		if (!localStorage.news)
			localStorage.news = {};
		$('#news input').each(function(i, obj) {
			if (obj.checked)
				localStorage.news[obj.id] = true;
			else
				localStorage.news[obj.id] = null;
		});

		$.post("/api/updateUser", {id: localStorage.id,
			name: localStorage.name,
			email: localStorage.email,
			news: localStorage.news});	
	});
});



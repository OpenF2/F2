$(function(){

	// setup modal
	var $modal = $('#languageSelect').modal({
		backdrop: 'static',
		keyboard: false
	});

	// bind select apps
	$('#btnSelectApps').on('click', function() {
		$modal.modal('show');
	});

	// bind checkbox events
	$modal.on('change', 'input:checkbox', function() {
		if ($('input:checkbox:checked', $modal).length) {
			$('button.btn-primary', $modal).removeClass('disabled');
		} else {
			$('button.btn-primary', $modal).addClass('disabled');
		}
	});

	// bind save button
	$modal.on('click', 'button.btn-primary:not(.disabled)', function() {
		var apps = [];
		$('input:checked', $modal).map(function(i, el) {
			apps.push($(el).data('f2-app'));
		});

		$modal.modal('hide');
		F2.removeAllApps();
		F2.registerApps(apps);
	});

	// load apps
	var scriptsLoaded = 0;
	var scriptCount = f2_example_apps.length;

	// show a mask while loading app json
	F2.UI.showMask('', $('#languageSelect'), true);

	// load in app json
	$.each(f2_example_apps, function(i, c) {
		$.getJSON(c.script, function(apps) {
			if (!!apps && apps.length) {
				$('[data-language="' + c.language + '"]', $modal).append(
					$.map(apps, function(app, i) {
						return $('<label class="checkbox"></label>').append(
							$('<input type="checkbox">').data('f2-app', app),
							' ' + app.name + (app.isSecure ? ' (Secure)' : '')
						);
					})
				);
			}

			if (++scriptsLoaded == scriptCount) {
				F2.UI.hideMask('', $modal);
			}
		});
	});

});
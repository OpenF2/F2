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

	// show a mask while loading app json
	F2.UI.showMask('', $('#languageSelect'), true);

	// load in app json
	$.getJSON('./js/sampleApps.js', function(allApps) {
		$.each(allApps, function(language, apps) {
			$('[data-language="' + language + '"]', $modal).append(
				$.map(apps, function(app, i) {
					return $('<label class="checkbox"></label>').append(
						$('<input type="checkbox">').data('f2-app', app),
						' ' + app.name + (app.isSecure ? ' (Secure)' : '')
					);
				})
			);
		})

		F2.UI.hideMask('', $modal);
	});

});
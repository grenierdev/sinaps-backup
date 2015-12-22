(function () {
	var uid = 0;
	$('[role="dictionary"] > input:not([data-field-discovered])').attr('data-field-discovered', '').each(function () {
		var $dictionary = $(this),
			$keys = $('<ul class="keys"></ul>').insertAfter($dictionary),
			name = $dictionary.attr('name'),
			value = $dictionary.val(),
			uid = 0;

		$dictionary.removeAttr('name');

		try {
			value = JSON.parse(value);
		} catch (e) {
			value = [];
		}

		_.each(value, function (key) {
			key.__uid = uid++;
		});

		var $add = $('<a href="#add" class="btn btn-sm btn-primary center-block"><i class="fa fa-plus"></i> Key</a>').insertAfter($keys);

		var getKey = function (id) {
			for (var a = 0, b = value.length; a < b; ++a) {
				if (value[a].__uid == id) {
					return value[a];
				}
			}
			return null;
		};

		var updateKeys = function () {
			$dictionary.val(JSON.stringify(_.map(value, function (key) { return _.omit(key, '__uid'); })));
			$keys.empty();

			_.each(value, function (key, i) {
				$keys.append(nunjucks.renderString('\
					<li class="key" data-id="{{ __uid }}">\
						<div class="handle"><i class="fa fa-sort"></i></div>\
						<div class="inputs">\
							<input type="text" name="{{ name }}[value]" value="{{ value|e }}" placeholder="{{ "Value" }}" />\
						</div>\
						<div class="inputs">\
							<input type="text" name="{{ name }}[label]" value="{{ label|e }}" placeholder="{{ "Label" }}" />\
						</div>\
						<div class="actions">\
							<a href="#remove"><i class="fa fa-trash-o"></i></a>\
						</div>\
					</li>', {
					name: name + '[' + i + ']',
					__uid: key.__uid,
					value: key.value,
					label: key.label
				}));
			});

			// Reorder keys
			$keys.sortable({
				tolerance: 'pointer',
				axis: 'y',
				items: 'li',
				handle: '.handle',

				stop: function (e, ui) {
					var ids = $(this).sortable('toArray', { attribute: 'data-id' });
					value = _.map(ids, function (id) { return getKey(id); });
					updateKeys();
				}
			});
		};
		updateKeys();

		$add.on('click', function (e) {
			e.preventDefault();

			value.push({
				__uid: uid++,
				value: '',
				label: ''
			});
			updateKeys();
		});

		$keys.on('change', '.inputs input', function (e) {
			var $input = $(this),
				$key = $input.closest('[data-id]'),
				id = $key.data('id'),
				key = getKey(id);
			key.label = $key.find('input[name$="[label]"]').val();
			key.value = $key.find('input[name$="[value]"]').val();
		});

		$keys.on('click', '[href="#remove"]', function (e) {
			e.preventDefault();
			var id = $(this).closest('[data-id]').data('id'),
				key = getKey(id);

			sinaps.modal.confirm('Are you sure you want to remove this item?', 'Dictionary', function (result) {
				if (result) {
					var i = value.indexOf(key);
					if (i > -1) {
						value.splice(i, 1);
					}
					updateKeys();
				}
			}, ['Remove', 'Cancel']);
		});
	});
})();

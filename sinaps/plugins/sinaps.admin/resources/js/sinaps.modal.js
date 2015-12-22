$(function () {
	var sinaps = window.sinaps = {};

	var $modalContainer = $('body > main', window.top.document);

	function Modal (options) {
		options = _.merge({
			size: 'full', // full, small
			modal: false,
			suicide: false
		}, options);

		this.$container = $('<div class="modal-overlay" style="animation-duration: 0s"></div>').appendTo($modalContainer);
		this.$container.data('modal', this);

		this.$modal = $('<div class="modal"><a class="close">&times;</a><header></header><main></main><footer></footer></div>').appendTo(this.$container);

		var $close = this.$modal.children('.close:first');
		this.$header = this.$modal.children('header:first');
		this.$main = this.$modal.children('main:first');
		this.$footer = this.$modal.children('footer:first');

		if (options.size == 'small') {
			this.$modal.addClass('small');
		}

		if (options.title) {
			this.$header.text(options.title);
		}

		var onClose = function (e) {
			e.preventDefault();
			this.close();
		}.bind(this);

		if (options.modal) {
			$close.remove();
		} else {
			$close.on('click', onClose);
			this.$container.on('click', function (e) {
				if (e.target == this.$container.get(0)) {
					onClose(e);
				}
			}.bind(this));
		}
		this.$container.on('click', '.close-modal', onClose);

		this.$container.on('animationend webkitAnimationEnd oanimationend MSAnimationEnd', function (e) {
			this.$container.trigger(this.$container.hasClass('open') ? 'modal-opened' : 'modal-closed');
		}.bind(this));

		if (typeof options.onOpen === 'function') {
			this.$container.on('modal-opened', function (e) {
				options.onOpen.apply(this, [e]);
			}.bind(this));
		}

		if (typeof options.onClose === 'function') {
			this.$container.on('modal-closed', function (e) {
				options.onClose.apply(this, [e]);
			}.bind(this));
		}

		if (options.suicide) {
			this.$container.on('modal-closed', function (e) {
				this.destroy();
			}.bind(this));
		}
	}

	Modal.prototype.open = function (callback) {
		if (!this.$container) {
			return;
		}

		this.$container.one('modal-opened', function (e) {
			if (typeof callback === 'function') {
				callback.apply(this, [e]);
			}
		}.bind(this));

		this.$container.attr('style', this.$container.attr('style').replace(/animation-duration: 0s;?/i, ''));
		this.$container.addClass('open');
		return this;
	};

	Modal.prototype.close = function (callback) {
		if (!this.$container) {
			return;
		}

		this.$container.one('modal-closed', function (e) {
			if (typeof callback === 'function') {
				callback.apply(this, [e]);
			}
		}.bind(this));

		if (this.$container.hasClass('open')) {
			this.$container.removeClass('open');
		}

		else {
			if (typeof callback === 'function') {
				callback.apply(this, [e]);
			}
		}

		return this;
	};

	Modal.prototype.destroy = function (callback) {
		if (!this.$container) {
			return;
		}

		var destroy = function () {
			this.$container.remove();
			this.$container = this.$modal = this.$footer = this.$header = this.$main = this.$close = null;
		}.bind(this);

		if (this.$container.hasClass('open')) {
			this.$container.one('modal-closed', function (e) {
				if (typeof callback === 'function') {
					callback(e);
				}
				destroy();
			}.bind(this));
			this.close();
		}

		else {
			if (typeof callback === 'function') {
				callback(e);
			}
			destroy();
		}

		return this;
	};

	sinaps.modal = {
		create: function (options) {
			return new Modal(options);
		},

		closeAll: function () {
			$modalContainer.children('.modal-overlay.open').each(function () {
				var $overlay = $(this),
					modal = $overlay.data('modal');
				modal.close();
			});
		},

		alert: function (message, title, callback, ok) {
			var modal = this.create({
				modal: true,
				suicide: true,
				size: 'small',
				title: title || 'Alert',

				onClose: function (e) {
					if (typeof callback === 'function') {
						callback();
					}
				}
			});
			modal.$main.append('<p>' + message + '</p>');
			modal.$footer.append('<button class="btn btn-primary center-block close-modal">' + (ok || 'Ok') + '</button>');

			return modal.open();
		},

		confirm: function (message, title, callback, buttons) {
			var ret = false;

			var modal = this.create({
				modal: true,
				suicide: true,
				size: 'small',
				title: title || 'Cofirm',

				onClose: function (e) {
					if (typeof callback === 'function') {
						callback(ret);
					}
				}
			});
			modal.$main.append('<p>' + message + '</p>');
			var $ok = $('<button class="btn btn-primary pull-right close-modal"></button>');
			$ok.text(buttons && buttons.length > 0 ? buttons[0] : 'Ok');
			var $cancel = $('<button class="btn btn-secondary close-modal"></button>');
			$cancel.text(buttons && buttons.length > 1 ? buttons[1] : 'Cancel');

			$ok.on('click', function (e) {
				ret = true;
			});

			modal.$footer.append($ok);
			modal.$footer.append($cancel);

			return modal.open();
		}
	}
});

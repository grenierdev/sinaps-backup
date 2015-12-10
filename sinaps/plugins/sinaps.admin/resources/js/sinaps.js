

$(function () {

	var sinaps = window.sinaps = {};


	modal();
	sidebar();

	sinaps.modal.alert('Boooyha 1', 'Alert WTF', console.info.bind(console, 'Alert ?'), ['Fock Ya', 'Nop']);
	sinaps.modal.create({title: 'Full screen 1 !'}).open();

	function sidebar () {
		var $sidebar = $('body > aside[role="left"]'),
			$toggler = $('body > main [role="sidebar-toggle"]'),
			speed = 200;

		$sidebar.find('a').each(function () {
			var $a = $(this),
				$li = $a.parent(),
				$ul = $a.siblings('ul');

			if ($a.attr('href').replace(/\/+$/, '') == window.location.pathname.replace(/\/+$/, '')) {
				$li.add($li.parents('li')).addClass('current active');
			}

			if ($ul.length == 0) {
				return;
			}

			$a.on('click', function (e) {
				e.preventDefault();

				if ($li.hasClass('active')) {
					$li.removeClass('active');
					$ul.stop(true, false).slideUp(speed);
				} else {
					$li.siblings().removeClass('active').children('ul').stop(true, false).slideUp(speed);
					$li.addClass('active');
					$ul.stop(true, false).slideDown(speed);
				}
			});
		});

		$sidebar.find('li.active > ul').show(speed);

		$toggler.on('click', function (e) {
			e.preventDefault();

			$sidebar.toggleClass('open');
		})
	}

	function modal () {
		var $modalOverlay = $('body > main > .modal-overlay', window.top.document);

		function Modal (options) {
			this.options = _.merge({
				size: 'full', // full, small
			}, options);

			this.$container = $('<div class="modal"><a class="close">&times;</a><header></header><main></main><footer></footer></div>').appendTo($modalOverlay);
			this.$container.data('modal', this);

			var $close = this.$container.find('.close:first');
			this.$header = this.$container.find('header:first');
			this.$main = this.$container.find('main:first');
			this.$footer = this.$container.find('footer:first');

			if (this.options.size == 'small') {
				this.$container.addClass('small');
			}

			if (this.options.title) {
				this.$header.text(this.options.title);
			}

			var onClose = function (e) {

				e.preventDefault();
				this.close();

			}.bind(this);

			$close.on('click', onClose);
			this.$container.on('click', '.close-modal', onClose);

			this.$container.on('animationend webkitAnimationEnd oanimationend MSAnimationEnd', function (e) {
				this.$container.trigger(this.$container.hasClass('open') ? 'modal-opened' : 'modal-closed');
			}.bind(this));

			if (typeof this.options.onOpen === 'function') {
				this.$container.on('modal-opened', function (e) {
					this.options.onOpen.apply(this, [e]);
				}.bind(this));
			}

			if (typeof this.options.onClose === 'function') {
				this.$container.on('modal-closed', function (e) {
					this.options.onClose.apply(this, [e]);
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
				this.$container = this.$footer = this.$header = this.$main = this.$close = null;
			}.bind(this);

			if (this.$container.hasClass('open')) {
				this.$container.one('modal-closed', function (e) {
					if (typeof callback === 'function') {
						callback(e);
					}
					this.$container.remove();
					destroy();
				}.bind(this));
				this.close();
			}

			else {
				if (typeof callback === 'function') {
					callback(e);
				}
				this.$container.remove();
			}

			return this;
		};

		sinaps.modal = {
			create: function (options) {
				return new Modal(options);
			},

			closeAll: function () {
				$modalOverlay.children('.open').each(function () {
					var $modal = $(this),
						modal = $modal.data('modal');
					modal.close();
				});
			},

			alert: function (message, title, callback, buttons) {
				var ret = false;

				var modal = this.create({
					size: 'small',
					title: title || 'Alert',

					onClose: function (e) {
						if (typeof callback === 'function') {
							callback(ret);
						}
						this.destroy();
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
			},

			confirm: function (message, title, callback, buttons) {
				return this.alert(message, title, callback, buttons);
			}
		}
	}
});

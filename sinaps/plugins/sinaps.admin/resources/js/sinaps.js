

$(function () {

	var sinaps = window.sinaps = {};

	sidebar();
	modal();
	table();

	//sinaps.modal.alert('Boooyha 1', 'Alert WTF', console.info.bind(console, 'Alert'), 'Fock Ya');
	//sinaps.modal.confirm('Boooyha 2', 'Confirm WTF', console.info.bind(console, 'Confirm ?'), ['Boom Ya', 'Nop']);
	//window.t = sinaps.modal.create({title: 'Full screen 1 !'}).open();

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
	}

	function table () {

		// TODO collapse state save to localStorage + URL

		sinaps.Table = {};

		sinaps.Table.Structure = function (elem, options) {

			this.options = _.merge({
				spacerWidth: 2,
				spacerUnit: 'rem',
				handleColumn: 1,
				onChange: null
			}, options);

			this.struct = [];
			this.rows = {};
			this.$tbody = $('> tbody', elem);

			this.reimportRows();
			this.sortRows();
			this.updateRows();

			this.$tbody.on('click', '[data-struct-collapse]', function (e) {
				e.preventDefault();
				var $a = $(e.currentTarget);
				var $tr = $a.closest('[data-struct-id]');
				var id = $tr.data('struct-id');

				this.rows[id].state = !this.rows[id].state;
				this.updateRows();
			}.bind(this));

			this.$tbody.on('click', '[data-struct-sorthandle]', function (e) {
				e.preventDefault();
			});
			
			this.$tbody.on('mousedown', '[data-struct-sorthandle]', function (e) {
				e.preventDefault();
				var $a = $(e.currentTarget);
				var $tr = $a.closest('[data-struct-id]');
				var id = $tr.data('struct-id');
				this.rows[id].state = false;
				this.updateRows();
			}.bind(this));



			var table = this;
			var dragOffsetLeft = 0, dragItem = null, pusherWidth = 0, unitWidth = 0, dragResult = null;

			// Compute spacer width in pixel
			(function () {
				var $w = $('<div></div>').css({ position: 'absolute', display: 'block', width: table.options.spacerWidth + table.options.spacerUnit }).appendTo(this.$tbody);
				unitWidth = $w.outerWidth();
				$w.remove();
			}.bind(this))();

			// Compute drag struct position
			var sortableComputeStructPosition = function (e, ui) {
				var offsetLeft = e.clientX - dragOffsetLeft;
				var originalDepth = table.rows[dragItem.id].depth;
				var newDepth = originalDepth + ((offsetLeft / unitWidth) >> 0);

				var $prev = ui.placeholder.prevAll('[data-struct-id]:not([data-struct-id="'+ dragItem.id +'"])').first();
				var minDepth = 0;
				var maxDepth = 0;
				var parents = [];


				// Build min/max depth + parents tree north of placeholder
				if ($prev.length) {
					var topId = $prev.data('struct-id');
					var topItem = table.rows[topId];
					maxDepth = topItem.depth + 1;

					var $next = ui.placeholder.nextAll('[data-struct-id]:not([data-struct-id="'+ dragItem.id +'"])').first();
					if ($next.length) {
						var bottomId = $next.data('struct-id');
						var bottomItem = table.rows[bottomId];
						minDepth = bottomItem.depth;

						if (minDepth == maxDepth) {
							parents[topItem.depth + 1] = {
								id: bottomItem.parent ? bottomItem.parent.id : 0,
								pos: bottomItem.parent ? bottomItem.parent.children.indexOf(bottomItem) : table.struct.indexOf(bottomItem),
								t: 0
							};
						}
					}

					if (typeof parents[topItem.depth + 1] === 'undefined') {
						parents[topItem.depth + 1] = {
							id: topItem.id,
							pos: topItem.children.length,
							t: 1
						};
					}

					var i = topItem, p = topItem.parent;
					while (p != null) {
						parents[p.depth + 1] = {
							id: p.id,
							pos: p.children.indexOf(i) + 1,
							t: 2
						};
						i = p;
						p = p.parent;
					}

					if (typeof parents[0] === 'undefined') {
						parents[0] = {
							id: 0,
							pos: table.struct.indexOf(table.rows[parents[1].id]) + 1,
							t: 3
						};
					}

				} else {
					parents[0] = {
						id: 0,
						pos: 0
					};
				}

				// Clamp newDepth to min/max
				newDepth = Math.max(minDepth, Math.min(maxDepth, newDepth));

				return {
					depth: newDepth,
					tree: parents
				};
			}

			// Drag & Drop rows
			this.$tbody.sortable({
				tolerance: 'pointer',
				axis: 'y',
				handle: '[data-struct-sorthandle]',
				containment: this.$tbody,
				start: function (e, ui) {
					dragOffsetLeft = e.clientX;
					dragItem = table.rows[ui.item.data('struct-id')];
					pusherWidth = ui.item.children(table.options.handleColumn).children('[data-struct-pusher]').outerWidth();

					table.walkStructure(function (item, state) {
						if (!state) {
							item.$element.detach();
						}
					});
				},
				sort: function (e, ui) {
					dragResult = sortableComputeStructPosition(e, ui);

					ui.helper.find('[data-struct-pusher]').css('width', (dragResult.depth * table.options.spacerWidth) + table.options.spacerUnit);
				},
				stop: function (e, ui) {
					if (!dragResult) {
						return;
					}

					var oldParentId = dragItem.parent ? dragItem.parent.id : 0;
					var oldParentTable = dragItem.parent ? false : true;
					var oldParent = dragItem.parent ? dragItem.parent : table;
					var oldPos = oldParentTable ? oldParent.struct.indexOf(dragItem) : oldParent.children.indexOf(dragItem);

					var newParentId = dragResult.tree[dragResult.depth].id;
					var newParentTable = newParentId ? false : true;
					var newParent = newParentId ? table.rows[newParentId] : table;
					var newPos = dragResult.tree[dragResult.depth].pos;

					newParentTable ? newParent.struct.splice(newPos, 0, dragItem) : newParent.children.splice(newPos, 0, dragItem);
					dragItem.parent = newParentTable ? null : newParent;
					dragItem.depth = newParentTable ? 0 : newParent.depth + 1;

					if (oldParentId == newParentId && newPos < oldPos) {
						oldPos += 1;
					}

					oldParentTable ? oldParent.struct.splice(oldPos, 1) : oldParent.children.splice(oldPos, 1);

					if (newParentTable == false) {
						dragItem.parent.state = true;
					}

					table.updateRows();
					table.sortRows();
					table.rowsChanged(e);
				},
				helper: function (e, $tr) {
					var widths = $tr.children('td').map(function () { return $(this).outerWidth(); }).get(),
						$clone = $tr.clone(false, false);
					$clone.children('td').each(function (i) {
						$(this).outerWidth(widths[i]);
					});
					return $clone;
				}
			});
		}

		sinaps.Table.Structure.prototype = {

			/**
			 * Reimport rows to the structure
			 */
			reimportRows: function () {

				this.rows = {};
				var struct = {};

				// Get & remove rows
				this.$tbody.children('[data-struct-id][data-struct-parentid]').each(function (i, row) {
					var $row = $(row);
					$row.detach();

					$row.attr('data-struct-depth', 0);

					var id = parseInt($row.data('struct-id'), 10) || 0;
					var parentid = parseInt($row.data('struct-parentid'), 10) || 0;
					var order = parseInt($row.data('struct-order'), 10) || 0;
					var opened = $row.hasClass('open');

					if (typeof struct[parentid] === 'undefined') {
						struct[parentid] = [];
					}

					var item = {
						id: id,
						parentid: parentid,
						order: order,
						$element: $row,
						depth: 0,
						parent: null,
						children: [],
						state: opened
					};

					this.rows[item.id] = item;
					struct[parentid].push(item);

					var $handleColumn = $row.children().eq(this.options.handleColumn);
					$handleColumn.children('[data-struct-sorthandle], [data-struct-collapse], [data-struct-pusher]').remove();
					$handleColumn.prepend('<a data-struct-sorthandle href="#"><i class="fa fa-sort text-muted"></i></a>');
					$handleColumn.prepend('<a data-struct-collapse href="#"><i class="fa fa-angle-right"></i></a>');
					$handleColumn.prepend('<span data-struct-pusher></span>');

				}.bind(this));

				// Build structure & add back to table
				var buildStruct = function (parentid, depth, parent) {
					depth = depth || 0;
					if (typeof struct[parentid] === 'undefined') {
						return [];
					}

					var level = [];
					for (var a = 0, b = struct[parentid].length; a < b; ++a) {
						struct[parentid][a].depth = depth;
						struct[parentid][a].parent = parent;
						struct[parentid][a].children = buildStruct(struct[parentid][a].id, depth + 1, struct[parentid][a]);
						level.push(struct[parentid][a]);
					}

					return level;
				}.bind(this);

				// Build structure from level 0
				this.struct = buildStruct(0, 0, null);
			},

			/**
			 * Sort rows
			 */
			sortRows: function () {

				// Remove all rows
				this.$tbody.children().detach();

				// Sort children recursively
				var sortChildren = function (children, depth) {
					children.sort(function (a, b) {
						return a.order - b.order;
					});
					for (var a = 0, b = children.length; a < b; ++a) {
						children[a].$element.appendTo(this.$tbody);
						children[a].depth = depth;
						children[a].children = sortChildren(children[a].children, depth + 1);
					}
					return children;
				}.bind(this);

				// Sort children
				this.struct = sortChildren(this.struct, 0);
			},

			/**
			 * Walk structure recursively
			 * @param	callback	function	Execute function on each item
			 */
			walkStructure: function (callback) {
				if (typeof callback !== 'function') {
					return;
				}

				var recurse = function (level, state) {
					for (var a = 0, b = level.length; a < b; ++a) {
						callback(level[a], state, a);
						recurse(level[a].children, state && level[a].state);
					}
				};

				recurse(this.struct, true);
			},

			/**
			 * Update controls
			 */
			updateRows: function () {

				this.walkStructure(function (item, state, order) {
					item.order = order;
					item.$element.toggleClass('open', item.state);
					item.$element.toggle(state);
					item.$element.attr('data-struct-depth', item.depth);
					item.$element.attr('data-struct-order', item.order);
					item.$element.find('[data-struct-collapse]').css('visibility', item.children.length > 0 ? 'visible' : 'hidden');
					item.$element.find('[data-struct-pusher]').css('width', (item.depth * this.options.spacerWidth) + this.options.spacerUnit);
				}.bind(this));
			},

			/**
			 * Trigger change event
			 */
			rowsChanged: function (e) {

				var data = [];
				_.each(this.rows, function (row) {
					data.push({
						id: row.id,
						parentid: row.parentid,
						order: row.order
					});
				});

				if (typeof this.options.onChange === 'function') {
					this.options.onChange(e, data);
				}
			}
		}

		$.fn.tableStructure = function () {
			if (!this.data('table-structure')) {
				this.data('table-structure', new sinaps.Table.Structure(this, {

				}));
			}
			return this.data('table-structure');
		}

		$('.table-structure').tableStructure();

	}
});

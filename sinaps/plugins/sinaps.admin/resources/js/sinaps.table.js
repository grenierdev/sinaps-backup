window.sinaps = typeof window.sinaps !== 'undefined' ? window.sinaps : {};

$(function () {

	// TODO collapse state save to localStorage + URL

	sinaps.Table = {};

	sinaps.Table.Structure = function (elem, options) {

		this.options = _.merge({
			spacerWidth: 2,
			spacerUnit: 'rem',
			handleColumn: 1,
			onChange: null,
			maxDepth: -1
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

				if (table.options.maxDepth > -1) {
					maxDepth = Math.min(maxDepth, table.options.maxDepth);
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

				if (table.options.maxDepth > -1) {
					dragResult.depth = Math.min(dragResult.depth, table.options.maxDepth);
				}

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

	$.fn.tableStructure = function (options) {
		if (!this.data('table-structure')) {
			this.data('table-structure', new sinaps.Table.Structure(this, options));
		}
		return this.data('table-structure');
	}

	$('.table-structure').tableStructure();
});

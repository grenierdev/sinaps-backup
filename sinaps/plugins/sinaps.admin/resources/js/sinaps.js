

$(function () {

	sidebar();


	function sidebar () {
		var $sidebar = $('body > aside[role="left"]'),
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
	}
});
